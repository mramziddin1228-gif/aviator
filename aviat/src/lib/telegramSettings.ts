import { promises as fs } from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SETTINGS_ROW_ID = 1;

// payments_chat_id is now stored in a JSON file (managed by the admin Telegram bot
// `/setchatid` and the web admin panel). The DB column is kept only as a legacy fallback.
const PAYMENTS_CHAT_FILE = process.env.PAYMENTS_CHAT_FILE
    || path.join(process.cwd(), 'data', 'payments-chat.json');

type TelegramChannel = 'payments' | 'analysis';

export interface TelegramSettings {
    paymentsChatId: string;
    analysisChatId: string;
    /** When `paymentsChatId` was last updated (file-based). */
    paymentsChatIdUpdatedAt: string | null;
    /** When `analysisChatId` (DB-based) was last updated. */
    updatedAt: string | null;
}

interface PaymentsChatFilePayload {
    paymentsChatId?: unknown;
    paymentsChatIdUpdatedAt?: unknown;
    updatedBy?: unknown;
}

const normalizeChatId = (value: string) => value.trim();

export const isValidTelegramChatId = (value: string) => /^-?\d+$/.test(value);

// ============================================================
// payments_chat_id — file-based
// ============================================================

export async function getPaymentsChatIdFromFile(): Promise<{ chatId: string; updatedAt: string | null }> {
    try {
        const content = await fs.readFile(PAYMENTS_CHAT_FILE, 'utf-8');
        const parsed = JSON.parse(content) as PaymentsChatFilePayload;
        const chatId = typeof parsed?.paymentsChatId === 'string' ? parsed.paymentsChatId.trim() : '';
        const updatedAt = typeof parsed?.paymentsChatIdUpdatedAt === 'string' ? parsed.paymentsChatIdUpdatedAt : null;
        return { chatId, updatedAt };
    } catch (err) {
        const e = err as NodeJS.ErrnoException;
        if (e?.code !== 'ENOENT') {
            console.error('Failed to read payments chat file:', err);
        }
        return { chatId: '', updatedAt: null };
    }
}

export async function savePaymentsChatIdToFile(input: {
    paymentsChatId: string;
    updatedBy?: string | null;
}): Promise<{ chatId: string; updatedAt: string } | null> {
    try {
        const chatId = normalizeChatId(input.paymentsChatId);
        const updatedAt = new Date().toISOString();

        const payload = {
            paymentsChatId: chatId,
            paymentsChatIdUpdatedAt: updatedAt,
            updatedBy: input.updatedBy || null
        };

        await fs.mkdir(path.dirname(PAYMENTS_CHAT_FILE), { recursive: true });
        await fs.writeFile(PAYMENTS_CHAT_FILE, JSON.stringify(payload, null, 2), 'utf-8');
        return { chatId, updatedAt };
    } catch (err) {
        console.error('Failed to save payments chat file:', err);
        return null;
    }
}

// ============================================================
// analysis_chat_id — DB-based (без изменений)
// ============================================================

async function getAnalysisChatIdFromDb(): Promise<{ chatId: string; updatedAt: string | null; legacyPaymentsChatId: string }> {
    const { data, error } = await supabase
        .from('telegram_settings')
        .select('payments_chat_id, analysis_chat_id, updated_at')
        .eq('id', SETTINGS_ROW_ID)
        .maybeSingle();

    if (error) {
        console.error('Error fetching telegram settings from DB:', error);
        return { chatId: '', updatedAt: null, legacyPaymentsChatId: '' };
    }

    return {
        chatId: data?.analysis_chat_id?.trim() || '',
        updatedAt: data?.updated_at || null,
        legacyPaymentsChatId: data?.payments_chat_id?.trim() || ''
    };
}

async function saveAnalysisChatIdToDb(input: {
    analysisChatId: string;
    updatedBy?: string | null;
}): Promise<{ chatId: string; updatedAt: string | null } | null> {
    const { data, error } = await supabase
        .from('telegram_settings')
        .upsert(
            {
                id: SETTINGS_ROW_ID,
                analysis_chat_id: normalizeChatId(input.analysisChatId),
                updated_by: input.updatedBy || null,
                updated_at: new Date().toISOString()
            },
            { onConflict: 'id' }
        )
        .select('analysis_chat_id, updated_at')
        .single();

    if (error) {
        console.error('Error saving analysis chat id to DB:', error);
        return null;
    }

    return {
        chatId: data?.analysis_chat_id?.trim() || '',
        updatedAt: data?.updated_at || null
    };
}

// ============================================================
// Public API
// ============================================================

export async function getTelegramSettings(): Promise<TelegramSettings | null> {
    const [fileChat, dbChat] = await Promise.all([
        getPaymentsChatIdFromFile(),
        getAnalysisChatIdFromDb()
    ]);

    // Fallback: если файла ещё нет, но в БД лежит старое значение — используем его.
    const paymentsChatId = fileChat.chatId || dbChat.legacyPaymentsChatId;

    return {
        paymentsChatId,
        analysisChatId: dbChat.chatId,
        paymentsChatIdUpdatedAt: fileChat.updatedAt,
        updatedAt: dbChat.updatedAt
    };
}

export async function saveTelegramSettings(input: {
    paymentsChatId: string;
    analysisChatId: string;
    updatedBy?: string | null;
}): Promise<TelegramSettings | null> {
    // Параллельно: payments → файл, analysis → БД
    const [fileResult, dbResult] = await Promise.all([
        savePaymentsChatIdToFile({
            paymentsChatId: input.paymentsChatId,
            updatedBy: input.updatedBy
        }),
        saveAnalysisChatIdToDb({
            analysisChatId: input.analysisChatId,
            updatedBy: input.updatedBy
        })
    ]);

    if (!fileResult || !dbResult) {
        return null;
    }

    return {
        paymentsChatId: fileResult.chatId,
        analysisChatId: dbResult.chatId,
        paymentsChatIdUpdatedAt: fileResult.updatedAt,
        updatedAt: dbResult.updatedAt
    };
}

export async function getTelegramChatId(channel: TelegramChannel): Promise<string | null> {
    if (channel === 'analysis') {
        const dbChat = await getAnalysisChatIdFromDb();
        return dbChat.chatId || null;
    }

    // payments — сначала из файла; если пусто, fallback на БД (для миграции).
    const fileChat = await getPaymentsChatIdFromFile();
    if (fileChat.chatId) return fileChat.chatId;

    const dbChat = await getAnalysisChatIdFromDb();
    return dbChat.legacyPaymentsChatId || null;
}
