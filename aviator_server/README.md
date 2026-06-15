# Aviator Admin Bot 🤖

Telegram-бот для управления **Telegram-админами** игры Aviator.

> Telegram-админы — это пользователи, которые могут одобрять/отклонять заявки
> на пополнение баланса с помощью inline-кнопок прямо в Telegram-чате.
> Их права определяются по **Telegram ID** (а не по 6-значному игровому ID).

## Установка

```bash
cd /opt/aviator/aviator_server
npm install
```

## Запуск

PM2 (рекомендуется в production — конфиг в `/opt/aviator/ecosystem.config.cjs`):

```bash
pm2 restart aviator-server
pm2 logs aviator-server
```

Локально:

```bash
npm start          # обычный запуск
npm run dev        # с авто-перезапуском
```

## Конфигурация (`.env`)

```env
ADMIN_BOT_TOKEN=токен_бота_от_@BotFather
ADMIN_ID=6316063517,1207001217
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Опционально (по умолчанию резолвится в /opt/aviator/aviat/data/telegram-admins.json):
# TELEGRAM_ADMINS_FILE=/абсолютный/путь/к/telegram-admins.json

# Опционально (по умолчанию резолвится в /opt/aviator/aviat/data/payments-chat.json):
# PAYMENTS_CHAT_FILE=/абсолютный/путь/к/payments-chat.json
```

### `ADMIN_ID` — формат

- **Поддерживается несколько ID через запятую/`;`/перевод строки.**
- Это **Telegram ID** «асосий» (hardcoded) админов — они **не удаляются** через бот
  или веб-панель; изменить можно только в `.env` + рестарт.
- Пример: `ADMIN_ID=6316063517,1207001217`.

### Где хранятся «дополнительные» админы?

В файле `/opt/aviator/aviat/data/telegram-admins.json`. Бот пишет туда напрямую,
а Next.js webapp его читает (`aviat/src/lib/telegramAdminIds.ts`) и
объединяет с `.env ADMIN_ID` при проверке прав.

> **Не нужно** добавлять `ADMIN_ID` ID в этот файл — они и так автоматически
> подмешиваются на стороне webapp/бот.

### Где хранится chat ID для депозитов?

В файле `/opt/aviator/aviat/data/payments-chat.json`. Бот пишет туда через
`/setchatid <chat_id>`, а Next.js webapp читает этот же файл
(`aviat/src/lib/telegramSettings.ts`). Если файл ещё не создан, webapp использует
legacy `telegram_settings.payments_chat_id` из Supabase как fallback.

## Команды бота

| Команда                       | Кто может вызвать         | Что делает |
|-------------------------------|---------------------------|------------|
| `/me`                         | **Все, в любом чате**     | Показать свой Telegram ID и username |
| `/chid`                       | **Все, в любом чате**     | Показать `chat.id` текущего чата (полезно для групп) |
| `/admins`                     | Asosiy admin (private)    | Список Telegram-админов (asosiy + qo'shimcha) |
| `/addadmin {telegram_id}`     | Asosiy admin (private)    | Добавить Telegram-админа по его TG ID |
| `/readmin  {telegram_id}`     | Asosiy admin (private)    | Удалить дополнительного Telegram-админа (asosiy не трогает) |
| `/setchatid {chat_id}`        | Asosiy admin (private)    | Записать chat ID, куда webapp отправляет заявки на пополнение |
| `/getchatid`                  | Asosiy admin (private)    | Показать текущий chat ID для заявок на пополнение |
| `/status`                     | Asosiy admin (private)    | Uptime, память, ping БД, кол-во админов + payments chat ID |
| `/help`                       | Asosiy admin (private)    | Краткая справка |

⚠️ Админ-команды работают **только в личке с ботом** и только для `ADMIN_ID` из `.env`.
🔒 ID, перечисленные в `.env ADMIN_ID`, через бот удалить нельзя — это защищает от случайной потери доступа.

## Типичный сценарий выдачи прав

1. Новый админ пишет боту `/me` — узнаёт свой Telegram ID.
2. Передаёт его asosiy админу.
3. Asosiy admin в личке боту: `/addadmin <тот_telegram_id>`.
4. Готово — теперь новый админ может жать «Qabul qilish/Rad etish» под заявками
   на пополнение в Telegram-чате `payments_chat_id`.

## Чтобы настроить `chat_id` Telegram-чата для депозитов

1. Добавьте бота `@SasiqcaBot` в нужный чат (с правами читать/писать).
2. В этом чате наберите `/chid` — бот ответит chat ID.
3. Asosiy admin в личке боту пишет `/setchatid <chat_id>`.
4. Проверить текущее значение: `/getchatid`.

Для `analysis_chat_id` по-прежнему используется Supabase `telegram_settings`.

## База данных

Бот **не использует** таблицу `admins` Supabase для своей работы — он управляет
только файлом `telegram-admins.json`. Таблица `admins` остаётся только для прав
на веб-страницу `/admin` (game admins по 6-значному `user_id`); их при необходимости
заводят прямо в Supabase.

## Полезные `pm2` команды

```bash
pm2 status                       # все процессы Aviator
pm2 logs aviator-server          # логи бота
pm2 restart aviator-server       # рестарт после правки .env
pm2 restart aviator-server --update-env   # рестарт + перечитать .env
```
