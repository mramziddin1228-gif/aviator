import { NextRequest, NextResponse } from "next/server";
import { checkAdminByAuthId, checkAdminByUserId } from "@/lib/adminCheck";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { authId, userId, adminUserId } = body;

        // Try multiple ways to verify admin
        let isAdmin = false;

        // Check by Supabase auth UUID (used by admin pages)
        if (authId) {
            isAdmin = await checkAdminByAuthId(authId);
        }

        // Check by 6-digit game user ID (used by game page)
        if (!isAdmin && userId) {
            isAdmin = await checkAdminByUserId(userId);
        }

        // Check by adminUserId (backward compat)
        if (!isAdmin && adminUserId) {
            isAdmin = await checkAdminByUserId(adminUserId);
        }

        return NextResponse.json({ isAdmin });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, isAdmin: false }, { status: 500 });
    }
}
