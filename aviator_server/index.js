/**
 * Aviator Admin Bot — Telegram admin ID larini boshqaradi.
 *
 * To'lov tasdiqlash kim tomonidan amalga oshiriladi degani Telegram ID bilan
 * aniqlanadi (Telegram inline tugmalardagi callback qaytaradigan from.id).
 * Shu sababli, bot endi `admins` jadvali (6 xonali o'yin ID) bilan emas,
 * balki bevosita Telegram ID lar fayli bilan ishlaydi:
 *
 *     /opt/aviator/aviat/data/telegram-admins.json
 *
 * Bu fayl Next.js webapp tarafidan ham o'qiladi (lib/telegramAdminIds.ts).
 *
 * `.env` ning ADMIN_ID o'zgaruvchisidagi ID lar — "asosiy" (hardcoded) adminlar.
 * Ular har doim ruxsat olishadi va bot orqali o'chirilmaydi (faqat .env ni
 * tahrirlash + bot qayta yuklash bilan o'zgaradi).
 *
 * Buyruqlar:
 *   /admins                  — Adminlar ro'yxati (asosiy admin uchun)
 *   /addadmin {telegram_id}  — Telegram ID bo'yicha admin qo'shish
 *   /readmin  {telegram_id}  — Telegram ID bo'yicha adminni o'chirish
 *   /setchatid {chat_id}     — Depozit so'rovlari yuboriladigan chat ID ni o'rnatish
 *   /getchatid               — Joriy depozit chat ID ni ko'rsatish
 *   /status                  — Bot holati (asosiy admin uchun)
 *   /help                    — Yordam (asosiy admin uchun)
 *   /me                      — O'z Telegram ID si (HAMMAGA ochiq)
 *   /chid                    — Joriy chat ID si (HAMMAGA ochiq)
 *
 * Depozit chat ID JSON faylda saqlanadi (default: <repo>/aviat/data/payments-chat.json),
 * Next.js webapp ham shu fayldan o'qiydi (lib/telegramSettings.ts).
 */

require('dotenv').config();

const fs = require('fs').promises;
const path = require('path');

const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');

// ============================================================
// Konfiguratsiya
// ============================================================

const BOT_TOKEN = process.env.ADMIN_BOT_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// `ADMIN_ID` ni vergul/nuqta-vergul/yangi qator bilan ajratib qo'llab-quvvatlaymiz
// (masalan, "6316063517,1207001217").
const HARDCODED_ADMIN_IDS = String(process.env.ADMIN_ID || '')
    .split(/[\n,;]+/)
    .map(id => id.trim())
    .filter(id => /^\d{5,15}$/.test(id))
    .map(id => Number(id));

// Webapp bilan bir xil faylga yozamiz (Next.js lib/telegramAdminIds.ts shu fayldan o'qiydi).
const TELEGRAM_ADMINS_FILE = process.env.TELEGRAM_ADMINS_FILE
    || path.resolve(__dirname, '..', 'aviat', 'data', 'telegram-admins.json');

// To'lovlar (depozitlar) yuboriladigan Telegram chat ID — JSON faylda saqlanadi
// (ilgari Supabase `telegram_settings` jadvalida edi). Webapp ham shu fayldan o'qiydi
// (Next.js lib/telegramSettings.ts → getPaymentsChatIdFromFile).
const PAYMENTS_CHAT_FILE = process.env.PAYMENTS_CHAT_FILE
    || path.resolve(__dirname, '..', 'aviat', 'data', 'payments-chat.json');

if (!BOT_TOKEN || HARDCODED_ADMIN_IDS.length === 0 || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Konfiguratsiya topilmadi! ADMIN_BOT_TOKEN, ADMIN_ID, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ni .env da tekshiring.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const startTime = Date.now();

console.log('🤖 Bot ishga tushdi!');
console.log(`👑 Asosiy adminlar (.env ADMIN_ID): ${HARDCODED_ADMIN_IDS.join(', ')}`);
console.log(`📁 Telegram admins fayli: ${TELEGRAM_ADMINS_FILE}`);
console.log(`📁 Payments chat fayli: ${PAYMENTS_CHAT_FILE}`);

bot.setMyCommands([
    { command: 'me', description: "Telegram ID ni ko'rsatish" },
    { command: 'chid', description: "Joriy chat ID ni ko'rsatish" },
    { command: 'admins', description: "Adminlar ro'yxati" },
    { command: 'addadmin', description: "Telegram admin qo'shish" },
    { command: 'readmin', description: "Telegram adminni o'chirish" },
    { command: 'setchatid', description: "Depozit chat ID ni o'rnatish" },
    { command: 'getchatid', description: "Depozit chat ID ni ko'rsatish" },
    { command: 'status', description: 'Bot holati' },
    { command: 'help', description: 'Yordam' },
    { command: 'addgmadmin', description: "O'yin admin qo'shish (6 xonali ID)" },
    { command: 'readgmadmin', description: "O'yin admin o'chirish" },
]).catch(err => console.error('Bot commands menu xatosi:', err.message));

// ============================================================
// /addgmadmin <6_xonali_id> — o'yin admin qo'shish (admins jadvaliga)
// ============================================================
bot.onText(/^\/addgmadmin(?:@\w+)?(?:\s+(.+))?$/i, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!isPrivateChat(msg)) return;
    if (!isMainAdmin(userId)) {
        return bot.sendMessage(chatId, ' Sizda ruxsat yo\'q!');
    }

    const gameUserId = (match && match[1]) ? String(match[1]).trim() : null;
    if (!gameUserId || !/^\d{6}$/.test(gameUserId)) {
        return bot.sendMessage(chatId, '⚠️ 6 xonali o\'yin user ID kiriting!\n\nMisol: `/addgmadmin 334123`', { parse_mode: 'Markdown' });
    }

    try {
        const { data: existing } = await supabase
            .from("admins")
            .select("id")
            .eq("user_id", gameUserId)
            .single();

        if (existing) {
            return bot.sendMessage(chatId, `ℹ️ \`${gameUserId}\` allaqachon admin.`);
        }

        // Upsert into profiles first (FK constraint)
        await supabase.from("profiles").upsert({ user_id: gameUserId }, { onConflict: "user_id" });

        const { error } = await supabase
            .from("admins")
            .insert({ user_id: gameUserId, added_by: userId });

        if (error) throw error;

        bot.sendMessage(chatId, `✅ O"yin admin qo"shildi: \`${gameUserId}\``, { parse_mode: "Markdown" });
    } catch (err) {
        console.error("Error adding game admin:", err);
        bot.sendMessage(chatId, `❌ Xato: ${err.message}`);
    }
});

// ============================================================
// /readgmadmin <6_xonali_id> — o'yin adminini o'chirish (admins jadvalidan)
// ============================================================
bot.onText(/^\/readgmadmin(?:@\w+)?(?:\s+(.+))?$/i, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!isPrivateChat(msg)) return;
    if (!isMainAdmin(userId)) {
        return bot.sendMessage(chatId, ' Sizda ruxsat yo\'q!');
    }

    const gameUserId = (match && match[1]) ? String(match[1]).trim() : null;
    if (!gameUserId || !/^\d{6}$/.test(gameUserId)) {
        return bot.sendMessage(chatId, '⚠️ 6 xonali o\'yin user ID kiriting!\n\nMisol: `/readgmadmin 334123`', { parse_mode: 'Markdown' });
    }

    try {
        const { error } = await supabase
            .from('admins')
            .delete()
            .eq('user_id', gameUserId);

        if (error) throw error;

        bot.sendMessage(chatId, `✅ O\'yin admin o\'chirildi: \`${gameUserId}\``, { parse_mode: 'Markdown' });
    } catch (err) {
        console.error('Error removing game admin:', err);
        bot.sendMessage(chatId, `❌ Xato: ${err.message}`);
    }
});

// ============================================================
// Yordamchi funksiyalar
// ============================================================

function isPrivateChat(msg) {
    return msg.chat.type === 'private';
}

function isMainAdmin(userId) {
    return HARDCODED_ADMIN_IDS.includes(Number(userId));
}

/**
 * Telegram ID validatsiyasi.
 * Telegram user/chat ID lar — manfiy bo'lmagan butun sonlar (5..15 raqam diapazonida).
 */
function parseTelegramId(input) {
    const normalized = String(input || '').trim().replace(/[{}]/g, '').replace(/\s+/g, '');
    return /^\d{5,15}$/.test(normalized) ? normalized : null;
}

async function readTelegramAdminsFile() {
    try {
        const content = await fs.readFile(TELEGRAM_ADMINS_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        const ids = Array.isArray(parsed?.telegramAdminIds) ? parsed.telegramAdminIds : [];
        return ids.map(String).filter(id => /^\d+$/.test(id));
    } catch (err) {
        if (err && err.code === 'ENOENT') return [];
        throw err;
    }
}

async function writeTelegramAdminsFile(ids, updatedBy) {
    // Hardcoded (.env) ID lar faylda saqlanmaydi — duplikatdan qochamiz, va ular doim
    // .env dan o'qilib, webapp tarafida automatik birlashtiriladi.
    const hardcoded = HARDCODED_ADMIN_IDS.map(String);
    const userManaged = Array.from(new Set(ids.map(String))).filter(id => !hardcoded.includes(id));

    const payload = {
        telegramAdminIds: userManaged,
        telegramAdminIdsUpdatedAt: new Date().toISOString(),
        updatedBy: updatedBy ? String(updatedBy) : null
    };

    await fs.mkdir(path.dirname(TELEGRAM_ADMINS_FILE), { recursive: true });
    await fs.writeFile(TELEGRAM_ADMINS_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    return userManaged;
}

/**
 * Telegram chat ID validatsiyasi.
 * Manfiy (guruh/kanal) yoki musbat (private) butun son. Masalan:
 *   -1003550651915  (supergroup/channel)
 *   123456789       (private chat)
 */
function parseTelegramChatId(input) {
    const normalized = String(input || '').trim().replace(/[{}]/g, '').replace(/\s+/g, '');
    return /^-?\d{5,20}$/.test(normalized) ? normalized : null;
}

async function readPaymentsChatFile() {
    try {
        const content = await fs.readFile(PAYMENTS_CHAT_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        return {
            chatId: typeof parsed?.paymentsChatId === 'string' ? parsed.paymentsChatId.trim() : '',
            updatedAt: typeof parsed?.paymentsChatIdUpdatedAt === 'string' ? parsed.paymentsChatIdUpdatedAt : null,
            updatedBy: typeof parsed?.updatedBy === 'string' ? parsed.updatedBy : null
        };
    } catch (err) {
        if (err && err.code === 'ENOENT') return { chatId: '', updatedAt: null, updatedBy: null };
        throw err;
    }
}

async function writePaymentsChatFile(chatId, updatedBy) {
    const payload = {
        paymentsChatId: String(chatId).trim(),
        paymentsChatIdUpdatedAt: new Date().toISOString(),
        updatedBy: updatedBy ? String(updatedBy) : null
    };
    await fs.mkdir(path.dirname(PAYMENTS_CHAT_FILE), { recursive: true });
    await fs.writeFile(PAYMENTS_CHAT_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    return payload;
}

// ============================================================
// /admins — adminlar ro'yxati
// ============================================================
bot.onText(/^\/admins(?:@\w+)?(?:\s|$)/i, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!isPrivateChat(msg)) return;
    if (!isMainAdmin(userId)) {
        return bot.sendMessage(chatId, '🚫 Sizda ruxsat yo\'q!');
    }

    let extra;
    try {
        extra = await readTelegramAdminsFile();
    } catch (err) {
        return bot.sendMessage(chatId, `❌ Faylni o'qib bo'lmadi: ${err.message}`);
    }

    let message = '👥 *Telegram adminlar:*\n\n';

    message += '🔒 *Asosiy (.env ADMIN_ID, o\'chirib bo\'lmaydi):*\n';
    if (HARDCODED_ADMIN_IDS.length === 0) {
        message += '_Yo\'q_\n';
    } else {
        HARDCODED_ADMIN_IDS.forEach((id, i) => {
            message += `  ${i + 1}. \`${id}\`\n`;
        });
    }

    message += '\n➕ *Qo\'shimcha (bot orqali qo\'shilgan):*\n';
    if (extra.length === 0) {
        message += '_Yo\'q_\n';
    } else {
        extra.forEach((id, i) => {
            message += `  ${i + 1}. \`${id}\`\n`;
        });
    }

    message += '\n*Buyruqlar:*\n';
    message += '`/addadmin {telegram_id}` — Admin qo\'shish\n';
    message += '`/readmin {telegram_id}` — Adminni o\'chirish\n';
    message += '`/setchatid {chat_id}` — Depozit chat ID ni o\'rnatish\n';
    message += '`/getchatid` — Joriy depozit chat ID ni ko\'rish\n';
    message += '`/me` — O\'z Telegram ID ni ko\'rish (hammaga ochiq)\n';
    message += '`/chid` — Chat ID ni ko\'rish (hammaga ochiq)';

    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

// ============================================================
// /addadmin {telegram_id} — Telegram ID bo'yicha admin qo'shish
// ============================================================
bot.onText(/^\/addadmin(?:@\w+)?(?:\s+(.+))?$/i, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!isPrivateChat(msg)) return;
    if (!isMainAdmin(userId)) {
        return bot.sendMessage(chatId, '🚫 Sizda ruxsat yo\'q!');
    }

    const telegramId = parseTelegramId(match && match[1]);
    if (!telegramId) {
        return bot.sendMessage(
            chatId,
            '⚠️ To\'g\'ri Telegram ID kiriting!\n\n' +
            'Misol: `/addadmin 1234567890`\n\n' +
            '💡 Telegram ID ni bilish uchun foydalanuvchi botga `/me` deb yozishi kifoya.',
            { parse_mode: 'Markdown' }
        );
    }

    if (HARDCODED_ADMIN_IDS.includes(Number(telegramId))) {
        return bot.sendMessage(
            chatId,
            `ℹ️ \`${telegramId}\` allaqachon asosiy admin (.env dan) — qo'shimcha qo'shish shart emas.`,
            { parse_mode: 'Markdown' }
        );
    }

    try {
        const current = await readTelegramAdminsFile();
        if (current.includes(telegramId)) {
            return bot.sendMessage(
                chatId,
                `ℹ️ \`${telegramId}\` allaqachon admin.`,
                { parse_mode: 'Markdown' }
            );
        }
        await writeTelegramAdminsFile([...current, telegramId], userId);
        bot.sendMessage(chatId, `✅ Admin qo'shildi: \`${telegramId}\``, { parse_mode: 'Markdown' });
    } catch (err) {
        console.error('Error adding telegram admin:', err);
        bot.sendMessage(chatId, `❌ Xato: ${err.message}`);
    }
});

// ============================================================
// /readmin {telegram_id} — Telegram ID bo'yicha adminni o'chirish
// ============================================================
bot.onText(/^\/readmin(?:@\w+)?(?:\s+(.+))?$/i, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!isPrivateChat(msg)) return;
    if (!isMainAdmin(userId)) {
        return bot.sendMessage(chatId, '🚫 Sizda ruxsat yo\'q!');
    }

    const telegramId = parseTelegramId(match && match[1]);
    if (!telegramId) {
        return bot.sendMessage(
            chatId,
            '⚠️ To\'g\'ri Telegram ID kiriting!\nMisol: `/readmin 1234567890`',
            { parse_mode: 'Markdown' }
        );
    }

    if (HARDCODED_ADMIN_IDS.includes(Number(telegramId))) {
        return bot.sendMessage(
            chatId,
            `🔒 \`${telegramId}\` — asosiy admin (.env dan), bot orqali o'chirib bo'lmaydi.\n\n` +
            'Olib tashlash uchun serverda `.env` faylida `ADMIN_ID` ni tahrirlang ' +
            'va `pm2 restart aviator-server` qiling.',
            { parse_mode: 'Markdown' }
        );
    }

    try {
        const current = await readTelegramAdminsFile();
        if (!current.includes(telegramId)) {
            return bot.sendMessage(
                chatId,
                `❌ \`${telegramId}\` adminlar ro'yxatida topilmadi.`,
                { parse_mode: 'Markdown' }
            );
        }
        const next = current.filter(id => id !== telegramId);
        await writeTelegramAdminsFile(next, userId);
        bot.sendMessage(chatId, `✅ Admin o'chirildi: \`${telegramId}\``, { parse_mode: 'Markdown' });
    } catch (err) {
        console.error('Error removing telegram admin:', err);
        bot.sendMessage(chatId, `❌ Xato: ${err.message}`);
    }
});

// ============================================================
// /setchatid <chat_id> — depozit so'rovlari yuboriladigan chat ID ni o'rnatadi
// ============================================================
bot.onText(/^\/setchatid(?:@\w+)?(?:\s+(.+))?$/i, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!isPrivateChat(msg)) return;
    if (!isMainAdmin(userId)) {
        return bot.sendMessage(chatId, '🚫 Sizda ruxsat yo\'q!');
    }

    const newChatId = parseTelegramChatId(match && match[1]);
    if (!newChatId) {
        return bot.sendMessage(
            chatId,
            '⚠️ To\'g\'ri Telegram chat ID kiriting!\n\n' +
            'Misol:\n' +
            '`/setchatid -1003550651915` — supergroup/channel\n' +
            '`/setchatid 123456789` — shaxsiy chat\n\n' +
            '💡 Chat ID ni bilish uchun botni shu chatga qo\'shing va `/chid` deb yozing.',
            { parse_mode: 'Markdown' }
        );
    }

    try {
        const result = await writePaymentsChatFile(newChatId, userId);
        bot.sendMessage(
            chatId,
            `✅ Depozit so'rovlari endi shu chatga yuboriladi:\n\`${result.paymentsChatId}\`\n\n` +
            `Sana: ${new Date(result.paymentsChatIdUpdatedAt).toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}\n\n` +
            '⚠️ Yodda tuting: bot shu chatga kirgan bo\'lishi va xabar yuborish huquqiga ega bo\'lishi kerak ' +
            '(aks holda, foydalanuvchining to\'lovi haqida xabar yetib bormaydi).',
            { parse_mode: 'Markdown' }
        );
    } catch (err) {
        console.error('Error saving payments chat id:', err);
        bot.sendMessage(chatId, `❌ Xato: ${err.message}`);
    }
});

// ============================================================
// /getchatid — joriy payments chat ID ni ko'rsatadi
// ============================================================
bot.onText(/^\/getchatid(?:@\w+)?(?:\s|$)/i, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!isPrivateChat(msg)) return;
    if (!isMainAdmin(userId)) {
        return bot.sendMessage(chatId, '🚫 Sizda ruxsat yo\'q!');
    }

    try {
        const current = await readPaymentsChatFile();
        if (!current.chatId) {
            return bot.sendMessage(
                chatId,
                'ℹ️ Hozircha depozit chat ID o\'rnatilmagan (yoki Supabase legacy qiymati ishlatiladi).\n\n' +
                'O\'rnatish uchun: `/setchatid <chat_id>`',
                { parse_mode: 'Markdown' }
            );
        }
        const updatedAtStr = current.updatedAt
            ? new Date(current.updatedAt).toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })
            : 'noma\'lum';
        bot.sendMessage(
            chatId,
            `💬 *Depozit so'rovlari chat ID:*\n\n` +
            `🆔 \`${current.chatId}\`\n` +
            `📅 Yangilangan: ${updatedAtStr}\n` +
            (current.updatedBy ? `👤 Yangilagan: \`${current.updatedBy}\`` : ''),
            { parse_mode: 'Markdown' }
        );
    } catch (err) {
        console.error('Error reading payments chat id:', err);
        bot.sendMessage(chatId, `❌ Xato: ${err.message}`);
    }
});

// ============================================================
// /help — yordam
// ============================================================
bot.onText(/^\/help(?:@\w+)?(?:\s|$)/i, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!isPrivateChat(msg)) return;
    if (!isMainAdmin(userId)) {
        return bot.sendMessage(chatId, '🚫 Sizda ruxsat yo\'q!');
    }

    const helpMessage = `
🎮 *Aviator Admin Bot*

*Asosiy admin buyruqlari (faqat .env dagi ADMIN_ID uchun):*
/admins — Telegram adminlar ro'yxati
/addadmin {telegram\\_id} — Telegram ID bo'yicha admin qo'shish
/readmin {telegram\\_id} — Telegram ID bo'yicha adminni o'chirish
/setchatid {chat\\_id} — Depozit so'rovlari yuboriladigan chat ID
/getchatid — Joriy depozit chat ID ni ko'rish
/status — Bot holati
/help — Yordam

*Hammaga ochiq buyruqlar:*
/me — O'z Telegram ID ni ko'rish (har qanday chatda)
/chid — Joriy chat ID ni ko'rish (guruhlar uchun foydali)

⚠️ Admin buyruqlari faqat shaxsiy chatda va asosiy admin uchun ishlaydi.
🔒 \`.env\` (\`ADMIN_ID\`) dagi adminlar bot orqali o'chirilmaydi.
💾 Depozit chat ID JSON faylda saqlanadi (\`aviat/data/payments-chat.json\`),
   Supabase \`telegram_settings\` ortiq ishlatilmaydi (faqat \`analysis_chat_id\` uchun).
`;

    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// ============================================================
// /status — bot holati
// ============================================================
bot.onText(/^\/status(?:@\w+)?(?:\s|$)/i, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!isPrivateChat(msg)) return;
    if (!isMainAdmin(userId)) {
        return bot.sendMessage(chatId, '🚫 Sizda ruxsat yo\'q!');
    }

    const now = Date.now();
    const uptimeSec = Math.floor((now - startTime) / 1000);
    const hours = Math.floor(uptimeSec / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);
    const seconds = uptimeSec % 60;
    const uptimeStr = `${hours}s ${minutes}m ${seconds}s`;

    const memUsage = process.memoryUsage();
    const memMB = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
    const memTotal = (memUsage.heapTotal / 1024 / 1024).toFixed(2);

    const pingStart = Date.now();
    let dbStatus = '🔴 Ulanmadi';
    try {
        await supabase.from('profiles').select('id').limit(1);
        const pingMs = Date.now() - pingStart;

        let pingEmoji = '🔴';
        let pingText = 'Yomon';
        if (pingMs < 100) { pingEmoji = '🟢'; pingText = 'Zo\'r'; }
        else if (pingMs < 300) { pingEmoji = '🟡'; pingText = 'Yaxshi'; }
        else if (pingMs < 500) { pingEmoji = '🟠'; pingText = 'Normal'; }

        dbStatus = `${pingEmoji} ${pingMs}ms (${pingText})`;
    } catch (e) {
        dbStatus = '🔴 Xato';
    }

    let extraCount = 0;
    try {
        const list = await readTelegramAdminsFile();
        extraCount = list.length;
    } catch { /* faylni o'qib bo'lmasa, 0 deb ko'rsatamiz */ }

    let paymentsChatStr = '_o\'rnatilmagan_';
    try {
        const pc = await readPaymentsChatFile();
        if (pc.chatId) paymentsChatStr = `\`${pc.chatId}\``;
    } catch { /* faylni o'qib bo'lmasa, "o'rnatilmagan" deb ko'rsatamiz */ }

    const statusMessage = `
📊 *Bot Holati*

⏱ *Uptime:* \`${uptimeStr}\`
🧠 *Memory:* \`${memMB} MB / ${memTotal} MB\`
🗄 *Database:* ${dbStatus}
👑 *Asosiy adminlar (.env):* \`${HARDCODED_ADMIN_IDS.length} ta\`
➕ *Qo'shimcha adminlar:* \`${extraCount} ta\`
💬 *Depozit chat ID:* ${paymentsChatStr}
🤖 *Node:* \`${process.version}\`
📅 *Sana:* \`${new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}\`
`;

    bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
});

// ============================================================
// /me — foydalanuvchi ID si (HAMMAGA ochiq, har qanday chatda)
// ============================================================
bot.onText(/^\/me(?:@\w+)?(?:\s|$)/i, (msg) => {
    const chatId = msg.chat.id;
    const user = msg.from;

    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'Ism kiritilmagan';
    const username = user.username ? `@${user.username}` : '—';

    const message = `
👋 Salom, *${fullName}*!

🆔 *Telegram ID:* \`${user.id}\`
👤 *Username:* ${username}

💡 Admin sifatida qo'shilish uchun ushbu Telegram ID ni asosiy adminga yuboring.
`;

    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

// ============================================================
// /chid — joriy chat ID si (HAMMAGA ochiq, asosan guruhlarda foydali)
// ============================================================
bot.onText(/^\/chid(?:@\w+)?(?:\s|$)/i, (msg) => {
    const chatId = msg.chat.id;
    const chat = msg.chat;

    let message = '💬 *Chat ma\'lumotlari:*\n\n';
    message += `🆔 *Chat ID:* \`${chat.id}\`\n`;
    message += `📂 *Turi:* \`${chat.type}\`\n`;
    if (chat.title) {
        message += `📛 *Nomi:* ${chat.title}\n`;
    }
    if (chat.username) {
        message += `🔗 *Username:* @${chat.username}\n`;
    }

    message += '\n💡 Bu ID ni `payments_chat_id` yoki `analysis_chat_id` sifatida ' +
        'admin panelda ishlatishingiz mumkin.';

    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

bot.on('polling_error', (error) => {
    console.error('Bot xatosi:', error.message);
});
