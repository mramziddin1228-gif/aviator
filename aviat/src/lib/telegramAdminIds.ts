import { promises as fs } from 'fs';
import path from 'path';

const TELEGRAM_ADMINS_FILE_PATH = path.join(process.cwd(), 'data', 'telegram-admins.json');

export interface TelegramAdminIdsSettings {
    telegramAdminIds: string[];
    telegramAdminIdsUpdatedAt: string | null;
    /** Hardcoded admin IDs from .env (ADMIN_ID). Always allowed, can never be removed via UI. */
    hardcodedAdminIds: string[];
}

interface TelegramAdminIdsFilePayload {
    telegramAdminIds?: unknown;
    telegramAdminIdsUpdatedAt?: unknown;
    updatedBy?: unknown;
}

export const isValidTelegramAdminId = (value: string): boolean => /^\d+$/.test(value.trim());

export function parseTelegramAdminIds(value: unknown): string[] {
    const rawValues: string[] = [];

    if (Array.isArray(value)) {
        for (const item of value) {
            if (typeof item === 'string') {
                rawValues.push(item);
            }
        }
    } else if (typeof value === 'string') {
        rawValues.push(...value.split(/[\n,;]+/));
    }

    const unique = new Set<string>();
    for (const raw of rawValues) {
        const trimmed = raw.trim();
        if (trimmed) {
            unique.add(trimmed);
        }
    }

    return Array.from(unique);
}

function normalizeValidAdminIds(adminIds: string[]): string[] {
    const unique = new Set<string>();

    for (const id of adminIds) {
        const trimmed = id.trim();
        if (trimmed && isValidTelegramAdminId(trimmed)) {
            unique.add(trimmed);
        }
    }

    return Array.from(unique);
}

/**
 * Hardcoded Telegram admin IDs from .env (ADMIN_ID).
 * These admins can NEVER be removed via the admin panel, only by editing .env.
 * Supports comma/semicolon/newline-separated values, e.g. "6316063517,1207001217".
 */
export function getHardcodedAdminIds(): string[] {
    return normalizeValidAdminIds(parseTelegramAdminIds(process.env.ADMIN_ID || ''));
}

function mergeWithHardcoded(ids: string[]): string[] {
    return normalizeValidAdminIds([...getHardcodedAdminIds(), ...ids]);
}

export async function getTelegramAdminIdsSettings(): Promise<TelegramAdminIdsSettings> {
    const hardcoded = getHardcodedAdminIds();

    try {
        const fileContent = await fs.readFile(TELEGRAM_ADMINS_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent) as TelegramAdminIdsFilePayload;
        const parsedIds = Array.isArray(parsed?.telegramAdminIds)
            ? parseTelegramAdminIds(parsed.telegramAdminIds)
            : [];

        return {
            telegramAdminIds: mergeWithHardcoded(parsedIds),
            telegramAdminIdsUpdatedAt: typeof parsed?.telegramAdminIdsUpdatedAt === 'string'
                ? parsed.telegramAdminIdsUpdatedAt
                : null,
            hardcodedAdminIds: hardcoded
        };
    } catch (error) {
        const err = error as NodeJS.ErrnoException;
        if (err?.code !== 'ENOENT') {
            console.error('Failed to read telegram admin ids settings:', error);
        }

        return {
            telegramAdminIds: hardcoded,
            telegramAdminIdsUpdatedAt: null,
            hardcodedAdminIds: hardcoded
        };
    }
}

export async function saveTelegramAdminIdsSettings(input: {
    telegramAdminIds: string[];
    updatedBy?: string | null;
}): Promise<TelegramAdminIdsSettings | null> {
    try {
        const hardcoded = getHardcodedAdminIds();
        // Strip hardcoded IDs from the persisted list so we never duplicate them on disk.
        const userManagedIds = normalizeValidAdminIds(input.telegramAdminIds)
            .filter(id => !hardcoded.includes(id));
        const updatedAt = new Date().toISOString();

        const payload = {
            telegramAdminIds: userManagedIds,
            telegramAdminIdsUpdatedAt: updatedAt,
            updatedBy: input.updatedBy || null
        };

        await fs.mkdir(path.dirname(TELEGRAM_ADMINS_FILE_PATH), { recursive: true });
        await fs.writeFile(TELEGRAM_ADMINS_FILE_PATH, JSON.stringify(payload, null, 2), 'utf-8');

        return {
            telegramAdminIds: mergeWithHardcoded(userManagedIds),
            telegramAdminIdsUpdatedAt: updatedAt,
            hardcodedAdminIds: hardcoded
        };
    } catch (error) {
        console.error('Failed to save telegram admin ids settings:', error);
        return null;
    }
}

export async function isAllowedTelegramAdmin(telegramUserId: string | undefined): Promise<boolean> {
    if (!telegramUserId) {
        return false;
    }

    const trimmed = telegramUserId.trim();

    // Hardcoded .env admins are ALWAYS allowed, regardless of file state.
    if (getHardcodedAdminIds().includes(trimmed)) {
        return true;
    }

    const settings = await getTelegramAdminIdsSettings();
    return settings.telegramAdminIds.includes(trimmed);
}

