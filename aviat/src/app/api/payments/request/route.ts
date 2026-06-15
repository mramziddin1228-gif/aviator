import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { paymentMethods } from '@/app/games/aviator/constants';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const authSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
});

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
});

const activeStatuses = ['pending', 'awaiting_review', 'awaiting_confirmation'];

const readBearerToken = (request: NextRequest) => {
    const header = request.headers.get('authorization') || '';
    const match = header.match(/^Bearer\s+(.+)$/i);
    return match?.[1]?.trim() || '';
};

const normalizePaymentRequest = (row: any) => ({
    ...row,
    amount: Number(row.amount || 0)
});

const readString = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const isSixDigitUserId = (value: string) => /^\d{6}$/.test(value);

async function generateProfileUserId(preferred: string) {
    const candidates: string[] = [];
    if (isSixDigitUserId(preferred)) candidates.push(preferred);

    for (let i = 0; i < 20; i++) {
        candidates.push(Math.floor(100000 + Math.random() * 900000).toString());
    }

    for (const candidate of candidates) {
        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', candidate)
            .maybeSingle();

        if (!error && !data) return candidate;
    }

    return Date.now().toString().slice(-6).padStart(6, '0');
}

async function ensureProfile(user: NonNullable<Awaited<ReturnType<typeof authSupabase.auth.getUser>>['data']['user']>) {
    const { data: existingProfile, error: existingError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

    if (!existingError && existingProfile) return existingProfile;

    const metadata = user.user_metadata || {};
    const profileUserId = await generateProfileUserId(readString(metadata.user_id));
    const email = readString(metadata.email) || user.email || null;
    const phone = readString(metadata.phone) || null;

    const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
            id: user.id,
            user_id: profileUserId,
            phone,
            email,
            balance: 0,
            created_at: new Date().toISOString()
        })
        .select('id')
        .single();

    if (!createError && createdProfile) return createdProfile;

    console.error('Payment request profile create failed:', createError || existingError);

    const { data: retryProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

    return retryProfile || null;
}

export async function POST(request: NextRequest) {
    try {
        const token = readBearerToken(request);
        if (!token) {
            return NextResponse.json({ error: 'Sessiya topilmadi. Iltimos, sahifani qayta ochib ko\'ring.' }, { status: 401 });
        }

        const { data: authData, error: authError } = await authSupabase.auth.getUser(token);
        const authUserId = authData?.user?.id || '';
        if (authError || !authUserId) {
            return NextResponse.json({ error: 'Sessiya muddati tugagan. Iltimos, qayta kiring.' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const requestedUserId = typeof body.userId === 'string' ? body.userId.trim() : '';
        if (requestedUserId && requestedUserId !== authUserId) {
            return NextResponse.json({ error: 'Foydalanuvchi sessiyasi mos emas.' }, { status: 403 });
        }

        const methodId = typeof body.method === 'string' ? body.method.trim().toLowerCase() : '';
        const method = paymentMethods.find(item => item.id === methodId);
        if (!method) {
            return NextResponse.json({ error: "To'lov usuli noto'g'ri." }, { status: 400 });
        }

        const amount = Number(body.amount);
        if (!Number.isFinite(amount) || amount < method.minAmount || amount > method.maxAmount) {
            return NextResponse.json({
                error: `Miqdor ${method.minAmount} dan ${method.maxAmount} gacha bo'lishi kerak`
            }, { status: 400 });
        }

        const cardNumber = method.cardNumber.replace(/\D/g, '');
        if (!/^\d{16}$/.test(cardNumber)) {
            return NextResponse.json({ error: "To'lov kartasi noto'g'ri sozlangan." }, { status: 500 });
        }

        const profile = await ensureProfile(authData.user);
        if (!profile) {
            return NextResponse.json({ error: 'Foydalanuvchi profilini yaratishda xatolik.' }, { status: 500 });
        }

        const nowIso = new Date().toISOString();
        const { data: existingRequests, error: existingError } = await supabase
            .from('payment_requests')
            .select('*')
            .eq('user_id', authUserId)
            .in('status', activeStatuses)
            .gt('expires_at', nowIso)
            .order('created_at', { ascending: false })
            .limit(1);

        if (existingError) {
            console.error('Payment request lookup failed:', existingError);
            return NextResponse.json({ error: "To'lov so'rovini tekshirishda xatolik." }, { status: 500 });
        }

        if (existingRequests && existingRequests.length > 0) {
            return NextResponse.json({
                success: true,
                resumed: true,
                paymentRequest: normalizePaymentRequest(existingRequests[0])
            });
        }

        const { data: paymentRequest, error: insertError } = await supabase
            .from('payment_requests')
            .insert({
                user_id: authUserId,
                method: method.id,
                amount,
                card_number: cardNumber,
                status: 'pending',
                expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
            })
            .select('*')
            .single();

        if (insertError || !paymentRequest) {
            console.error('Payment request insert failed:', insertError);
            return NextResponse.json({ error: "To'lov so'rovini yaratishda xatolik." }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            resumed: false,
            paymentRequest: normalizePaymentRequest(paymentRequest)
        });
    } catch (error) {
        console.error('Payment request API error:', error);
        return NextResponse.json({ error: 'Server xatosi.' }, { status: 500 });
    }
}
