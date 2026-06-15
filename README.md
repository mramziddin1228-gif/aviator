# Aviator Project — Полное руководство по запуску

> Документация на основе реального деплоя (май 2026). Все шаги проверены.

---

## Структура проекта

```
aviator/
├── aviat/                  # Next.js 16 фронтенд + API routes + game-loop
│   ├── src/                # Исходники
│   ├── scripts/game-loop.js  # Игровой цикл (раунды, сигналы)
│   ├── supabase/           # SQL миграции
│   ├── .env                # Переменные окружения
│   └── package.json
├── aviator_server/         # Telegram admin-бот (Node.js)
│   ├── index.js
│   ├── .env
│   └── package.json
├── ecosystem.config.cjs    # PM2 конфигурация
└── nginx-my-do2/           # Шаблоны nginx конфигов (референс)
```

---

## Требования к серверу

| Параметр | Минимум | Рекомендация |
|----------|---------|--------------|
| CPU | 2 ядра | 4+ ядер |
| RAM | 2 GB | 4+ GB |
| Диск | 10 GB | 20+ GB |
| OS | Ubuntu 22.04+ | Ubuntu 22.04 |
| Node.js | 20.x | 20.20+ |

**ВАЖНО:** Next.js билд требует ~1.5-2 GB RAM. На сервере с 1 GB RAM без swap билд упадёт с OOM.
Если RAM мало — добавь swap: `sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`

---

## Пошаговый запуск

### 1. Установка системных зависимостей

```bash
# Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs

# PM2
sudo npm install -g pm2

# Nginx + Certbot
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

### 2. Копирование проекта

```bash
sudo mkdir -p /opt/aviator
# Копируй проект целиком в /opt/aviator/
# Убедись что aviat/ и aviator_server/ внутри
sudo chown -R root:root /opt/aviator
```

### 3. Установка npm зависимостей

```bash
sudo npm install --prefix /opt/aviator/aviator_server
sudo npm install --prefix /opt/aviator/aviat
```

### 4. Исправление tsconfig (ОБЯЗАТЕЛЬНО!)

**Проблема:** `tsconfig.json` включает `**/*.ts` и `**/*.tsx` — это захватывает `mobile/` папку
с Expo зависимостями, которых нет в node_modules. Билд падает с ошибкой `Cannot find module 'expo-status-bar'`.

**Решение:** Добавь `"mobile"` в `exclude`:

```json
// /opt/aviator/aviat/tsconfig.json
{
  "exclude": ["node_modules", "mobile"]
}
```

### 5. Настройка Supabase

#### 5.1 Создать новый проект

1. Зайти на [supabase.com](https://supabase.com) → New Project
2. Запомнить Project Ref (например `wobpqnnadoganelkijze`)

#### 5.2 Создать таблицы

Выполнить SQL миграцию в SQL Editor. Файл: `supabase-setup.sql` (в корне проекта).

**9 таблиц:**

| # | Таблица | Описание |
|---|---------|----------|
| 1 | `profiles` | Пользователи (id, user_id, phone, email, balance) |
| 2 | `admins` | Админы (user_id → profiles) |
| 3 | `game_state` | Состояние игры (singleton — одна строка) |
| 4 | `game_rounds` | История раундов |
| 5 | `game_settings` | Настройки (key-value) |
| 6 | `bets` | Ставки |
| 7 | `payment_requests` | Заявки на пополнение |
| 8 | `withdraw_requests` | Заявки на вывод |
| 9 | `telegram_settings` | Telegram chat IDs (singleton) |

**Альтернативный способ через API** (если есть Personal Access Token):

```bash
# Установить User-Agent обязательно! Без него Cloudflare блокирует запросы.
curl -s "https://api.supabase.com/v1/projects/PROJECT_REF/database/query" \
  -X POST \
  -H "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0" \
  -d '{"query": "CREATE TABLE ..."}'
```

#### 5.3 Отключить email подтверждение (OTP)

**КРИТИЧНО!** Без этого логин/регистрация не работают — Supabase шлёт OTP на email.

Через API:
```bash
curl -s -X PATCH "https://api.supabase.com/v1/projects/PROJECT_REF/config/auth" \
  -H "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0" \
  -d '{"mailer_autoconfirm": true, "sms_autoconfirm": true}'
```

Или через Dashboard: **Authentication → Providers → Email → Confirm email = OFF**

Проверить:
```bash
curl -s "https://api.supabase.com/v1/projects/PROJECT_REF/config/auth" \
  -H "Authorization: Bearer TOKEN" -H "User-Agent: Mozilla/5.0" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('autoconfirm:', d.get('mailer_autoconfirm'))"
# Должно быть: autoconfirm: True
```

#### 5.4 Настроить Telegram chat IDs

**КРИТИЧНО!** Без этого сигналы/заявки в Telegram не отправляются.

`analysis_chat_id` всё ещё хранится в Supabase `telegram_settings`:

```sql
UPDATE telegram_settings
SET analysis_chat_id = '-1003556663636'
WHERE id = 1;
```

`payments_chat_id` для заявок на пополнение теперь хранится в JSON-файле
`/opt/aviator/aviat/data/payments-chat.json` и меняется через админ-бота:

```text
/chid                         # написать в нужном Telegram-чате, чтобы узнать chat.id
/setchatid <chat_id>          # написать боту в личку от asosiy admin
/getchatid                    # проверить текущий chat.id для депозитов
```

Если `payments-chat.json` ещё не создан, webapp временно использует legacy
`telegram_settings.payments_chat_id` как fallback.

#### 5.5 Получить ключи

Из **Settings → API**:
- `Project URL` (вида `https://xxxxx.supabase.co`)
- `anon public` ключ
- `service_role secret` ключ

### 6. Настройка .env файлов

#### aviat/.env

```env
# Supabase (ОБЯЗАТЕЛЬНО обновить при новом проекте!)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_XXX
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SUPPORT_TELEGRAM=aviatr_admin

# Telegram бот (для сигналов и уведомлений)
BOT_TOKEN=7948643026:AAGuWVqvOYu-d6vd6bIV2ahgTe5I1LqWikY
ADMIN_ID=6316063517,1207001217
GAME_ADMIN_ID=0323c3a5-2edf-4309-9f66-c3c3acb994ee
GAME_ADMIN_KEY=df44a23291847fe4eb0d5ad8b26cadb6
PASSWORDS_CHAT_ID=-1003550651915

# Game-loop использует это для API запросов
API_URL=http://127.0.0.1:3000

# Supabase service role (для API routes)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

#### aviator_server/.env

```env
# Supabase (те же ключи что и в aviat/.env)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_XXX
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SUPPORT_TELEGRAM=aviatr_admin

# Admin-бот (ДРУГОЙ бот, не тот что в aviat!)
ADMIN_BOT_TOKEN=8353429800:AAHx0jLfBOnIUFwku3Bf3_mJrn8fAYNN4NY
GROUP_ID=-5219478880
GROUP_ANALYSIS_ID=-1003556663636
ADMIN_ID=6316063517,1207001217
GAME_ADMIN_ID=0323c3a5-2edf-4309-9f66-c3c3acb994ee
GAME_ADMIN_KEY=df44a23291847fe4eb0d5ad8b26cadb6
PASSWORDS_CHAT_ID=-1003550651915

# Внешний URL (для бота)
API_URL=https://aviatorz.bounceme.net

SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Разница между BOT_TOKEN и ADMIN_BOT_TOKEN:**
- `BOT_TOKEN` (aviat) — бот `@aviatorwinzbot` — отправляет сигналы, уведомления о платежах
- `ADMIN_BOT_TOKEN` (aviator_server) — бот `@aviatorwinzbot` admin — управление админами

#### 6.1 Модель админов (ВАЖНО!)

В системе **две независимые роли**:

| Роль | Где хранится | Что даёт | Кто добавляет |
|------|--------------|----------|---------------|
| **Telegram-админ** | `.env ADMIN_ID` + `aviat/data/telegram-admins.json` | Жмёт «Qabul qilish/Rad etish» под заявками на пополнение **в Telegram-чате** + кнопка работает | Asosiy admin (из `.env`) через бот `/addadmin <telegram_id>` или через веб-админку |
| **Game-admin (web)** | таблица `admins` в Supabase (по 6-значному `user_id`) | Доступ к веб-странице `/admin` для просмотра заявок | Прямо в Supabase (или отдельная процедура — бот этим не управляет) |

`ADMIN_ID` в `.env` — это **Telegram ID** «асосий» админов:
- Можно перечислить несколько через `,`/`;`/перенос строки: `ADMIN_ID=6316063517,1207001217`.
- Эти ID **всегда** допущены, даже если файл `data/telegram-admins.json` отсутствует или повреждён.
- Через бот или веб-админку их **нельзя удалить** — только править `.env` и перезапускать (`pm2 restart aviator-server aviator-ui --update-env`).

#### 6.2 Логотипы платёжных методов (ОБЯЗАТЕЛЬНО!)

В `aviat/src/app/games/aviator/constants.ts` ссылки на логотипы:

```
/images/uzcardlogo.png
/images/humologo1.png
/images/payme-logo-v2.png
/images/logo_click-v2.png
```

Эти файлы **должны существовать** в `/opt/aviator/aviat/public/images/`. Если их нет —
в модалке пополнения вместо логотипов будут «?» иконки и в `aviator-ui-error.log`
посыпется `⨯ The requested resource isn't a valid image for /images/...`.

> **Не используйте SVG** для платёжных логотипов через `<Image>` — Next.js по умолчанию
> не оптимизирует SVG (нужен `dangerouslyAllowSVG`), и `/_next/image?url=...svg` отдаёт 400.
> Берите PNG (24–48px высотой достаточно).

Создать папку и скопировать локальные логотипы:

```bash
sudo mkdir -p /opt/aviator/aviat/public/images
# Скопировать uzcardlogo.png, humologo1.png, payme-logo-v2.png, logo_click-v2.png
sudo chown -R root:root /opt/aviator/aviat/public/images
```

Проверить, что отдаются:
```bash
for f in uzcardlogo.png humologo1.png payme-logo-v2.png logo_click-v2.png; do
  curl -sI "https://aviatorz.bounceme.net/_next/image?url=%2Fimages%2F$f&w=128&q=75" | head -1
done
# Все: HTTP/1.1 200 OK
```

### 7. Билд Next.js

```bash
sudo bash -c 'cd /opt/aviator/aviat && npm run build'
```

**Ожидаемый вывод:**
```
✓ Compiled successfully
✓ Generating static pages (29/29)
Route (app)
┌ ○ /
├ ○ /login
├ ○ /registration
├ ƒ /api/game/state
└ ...
```

**Если билд падает с OOM:** добавь swap (см. раздел "Требования").

**Если ошибка `Cannot find module 'expo-status-bar'`:** не добавлен `"mobile"` в exclude tsconfig.json (шаг 4).

### 8. Настройка PM2

Создать `/opt/aviator/ecosystem.config.cjs`:

```javascript
module.exports = {
  apps: [
    {
      name: 'aviator-ui',
      cwd: '/opt/aviator/aviat',
      script: '/usr/bin/bash',
      args: '-lc "npm run start -- -p 3000"',
      interpreter: 'none',
      env: { PORT: '3000' },
      autorestart: true,
    },
    {
      name: 'aviator-loop',
      cwd: '/opt/aviator/aviat',
      script: '/usr/bin/bash',
      args: '-lc "node scripts/game-loop.js"',
      interpreter: 'none',
      env: { API_URL: 'http://127.0.0.1:3000' },
      autorestart: true,
    },
    {
      name: 'aviator-server',
      cwd: '/opt/aviator/aviator_server',
      script: '/usr/bin/node',
      args: 'index.js',
      interpreter: 'none',
      autorestart: true,
    },
  ],
};
```

Запуск:
```bash
sudo pm2 start /opt/aviator/ecosystem.config.cjs
sudo pm2 save
sudo pm2 startup    # автозапуск при перезагрузке
```

### 9. Настройка Nginx

Создать `/etc/nginx/sites-available/aviatorz.bounceme.net`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name aviatorz.bounceme.net;

    client_max_body_size 25m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }
}
```

Активировать и проверить:
```bash
sudo ln -sf /etc/nginx/sites-available/aviatorz.bounceme.net /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 10. SSL сертификат

```bash
sudo certbot --nginx -d aviatorz.bounceme.net --non-interactive --agree-tos --email YOUR_EMAIL
```

Certbot автоматически добавит SSL блок и редирект 80→443.

---

## Проверка что всё работает

```bash
# 1. API отвечает
curl http://127.0.0.1:3000/api/game/state
# Ожидание: {"state":{"phase":"waiting",...}}

# 2. HTTPS работает
curl -sI https://aviatorz.bounceme.net | head -3
# Ожидание: HTTP/1.1 200 OK

# 3. PM2 процессы онлайн
sudo pm2 list
# Ожидание: 3 процесса, все status=online

# 4. Сигналы в Telegram
curl -X POST http://127.0.0.1:3000/api/telegram/game-signal \
  -H "Content-Type: application/json" \
  -d '{"multiplier": 2.5}'
# Ожидание: {"success":true}

# 5. Логи
sudo pm2 logs --lines 20
```

---

## Устранение неполадок

### "Could not find the table in the schema cache"
**Причина:** Таблицы не созданы в Supabase.
**Решение:** Выполнить SQL миграцию (шаг 5.2).

### "Telegram not configured"
**Причина:** нет chat IDs: `analysis_chat_id` пуст в `telegram_settings` или не задан `payments_chat_id`.
**Решение:** `analysis_chat_id` заполнить в Supabase, а `payments_chat_id` задать через `/setchatid <chat_id>` (шаг 5.4).

### "exceed_egress_quota" от Supabase
**Причина:** Превышен лимит трафика на бесплатном плане.
**Решение:** Создать новый Supabase проект, обновить ключи в .env, перебилдить, перезапустить.

### OTP отправляется при регистрации
**Причина:** `mailer_autoconfirm` = false.
**Решение:** Включить через API или Dashboard (шаг 5.3).

### Билд падает с OOM
**Причина:** Мало RAM (< 2 GB).
**Решение:** Добавить swap или билдить на другом сервере и скопировать `.next/`.

### Next.js "Failed to find Server Action"
**Причина:** Кэш от старого билда.
**Решение:** `sudo rm -rf /opt/aviator/aviat/.next && npm run build`

### "Cannot find module 'expo-status-bar'"
**Причина:** tsconfig захватывает `mobile/` папку.
**Решение:** Добавить `"mobile"` в `exclude` tsconfig.json (шаг 4).

### Cloudflare блокирует Supabase Management API
**Причина:** Нет User-Agent заголовка.
**Решение:** Добавить `-H "User-Agent: Mozilla/5.0"` к curl запросам.

### Логотипы платёжных методов отображаются как «?»
**Причина:** Нет файлов в `/opt/aviator/aviat/public/images/` (uzcardlogo.png, humologo1.png, payme-logo-v2.png, logo_click-v2.png) — `<Image src="/images/...">` отдаёт 404.
**Решение:** Создать папку и положить PNG (см. шаг 6.2). Не использовать SVG для `<Image>`.

### При пополнении баланса на сайте «Xatolik yuz berdi»
**Возможные причины:**
1. Браузер не восстановил Supabase-session (особенно Telegram/native bridge). Текущий код перед insert повторно делает `supabase.auth.setSession(...)`; после деплоя нужен `npm run build && pm2 restart aviator-ui`.
2. `payment_requests.card_number` принимает 16 цифр: в БД пишется `5614684878106374`, а в UI отображается `5614 6848 7810 6374`.
3. Не задан payments chat ID → задать через `/setchatid <chat_id>` (шаг 5.4).
4. Бот `BOT_TOKEN` не имеет прав писать в chat ID депозитов → ответ Telegram API «chat not found / bot kicked». Проверь, что бот есть в чате с правами «Send messages».
5. Истёкший `payment_request` (TTL 15 мин) → клиент видит «To'lov so'rovi muddati tugagan». Это норма — пользователю надо создать новую заявку.

### Кнопки «Qabul qilish/Rad etish» под заявкой не работают (ничего не происходит)
**Причина:** Telegram ID нажимающего НЕ в `.env ADMIN_ID` и НЕ в `data/telegram-admins.json` → `isAllowedTelegramAdmin` → `false` → бот отвечает callback-popup «Нет прав».
**Решение:**
- Asosiy admin: `/addadmin <его_telegram_id>` боту в личку.
- Или временно: добавить ID в `.env ADMIN_ID` через запятую и `pm2 restart aviator-server aviator-ui --update-env`.

### `/addadmin <id>` ругается «Bunday ID bilan foydalanuvchi topilmadi»
**Причина:** Это сообщение из **старой** версии бота (там `/addadmin` ожидал 6-значный игровой ID). После обновления бот принимает **Telegram ID** (5–15 цифр) и не проверяет таблицу `profiles` — сообщение должно исчезнуть.
**Решение:** Перезапустить бот: `pm2 restart aviator-server`. Если всё ещё видите эту фразу — значит, на сервере деплоилась старая `index.js`, обновите файл.

### Только один TG-админ работает, хотя в `.env ADMIN_ID` указано несколько через запятую
**Причина:** Старый парсер (`process.env.ADMIN_ID?.trim()` + `/^\d+$/`) отбрасывал значения с запятой и возвращал `[]`.
**Решение:** Текущий код парсит `,`/`;`/`\n`. Убедитесь, что обновлены оба:
- `aviat/src/lib/telegramAdminIds.ts` (для webapp/webhook)
- `aviator_server/index.js` (для бота)
И сделать `pm2 restart aviator-server aviator-ui --update-env`.

---

## Архитектура процессов

```
Пользователь → Nginx (443 SSL, 25MB max) → Next.js (:3000)
                                          ├── /api/game/*     — игровая логика
                                          ├── /api/telegram/* — уведомления
                                          └── /api/admin/*    — админ-панель

Game-loop (PM2) → http://127.0.0.1:3000/api/game/state
  ├── Управляет раундами (waiting → flying → crashed)
  ├── Отправляет сигналы в TG (analysis_chat_id)
  └── Сохраняет историю в game_rounds

Admin-bot (PM2) → Telegram polling (отдельный bot @SasiqcaBot)
  ├── Управляет Telegram-админами (по Telegram ID)
  │   через файл /opt/aviator/aviat/public/../data/telegram-admins.json
  │   (его же читает webapp в lib/telegramAdminIds.ts)
  ├── /admins                  — список TG-админов (asosiy + qo'shimcha)
  ├── /addadmin <telegram_id>  — добавить (только asosiy admin)
  ├── /readmin  <telegram_id>  — удалить (asosiy не трогает)
  ├── /setchatid <chat_id>     — записать chat ID для депозитов в payments-chat.json
  ├── /getchatid               — показать текущий chat ID для депозитов
  ├── /status                  — uptime/память/ping БД
  ├── /me                      — Telegram ID пользователя (всем, любой чат)
  └── /chid                    — chat.id текущего чата (всем, удобно для групп)
```

> **Чтобы выдать кому-то права одобрять платежи**:
> 1. Новый сотрудник пишет боту `/me` → получает свой Telegram ID.
> 2. Asosiy admin (из `.env ADMIN_ID`) в личке боту: `/addadmin <тот_telegram_id>`.
> 3. Готово — теперь его клики «Qabul qilish/Rad etish» будут засчитаны.

> **Чтобы настроить chat для заявок на пополнение**: добавить бота в нужный
> Telegram-чат, написать там `/chid`, затем asosiy admin пишет боту в личку
> `/setchatid <полученный_chat_id>`. Проверить можно через `/getchatid`.

---

## Переменные окружения — шпаргалка

| Переменная | Где | Описание |
|-----------|-----|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | оба .env | URL Supabase проекта |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | оба .env | Anon ключ (публичный) |
| `SUPABASE_SERVICE_ROLE_KEY` | оба .env | Service role ключ (секретный!) |
| `BOT_TOKEN` | aviat/.env | Токен TG бота для сигналов |
| `ADMIN_BOT_TOKEN` | aviator_server/.env | Токен TG бота для админов |
| `GAME_ADMIN_KEY` | оба .env | Секретный ключ для game API |
| `API_URL` | aviat/.env | `http://127.0.0.1:3000` (для game-loop) |
| `API_URL` | aviator_server/.env | `https://aviatorz.bounceme.net` (внешний) |
| `PASSWORDS_CHAT_ID` | оба .env | TG chat для кредов |
| `ADMIN_ID` | оба .env | **Telegram ID** «асосий» админов через `,`/`;`/`\n` (например `6316063517,1207001217`). Эти ID всегда допущены к одобрению платежей и не удаляются через бот/UI. |
| `TELEGRAM_ADMINS_FILE` | aviator_server/.env (опционально) | Путь к `telegram-admins.json` (по умолчанию `<repo>/aviat/data/telegram-admins.json`) |
| `PAYMENTS_CHAT_FILE` | оба .env (опционально) | Путь к `payments-chat.json` (по умолчанию `<repo>/aviat/data/payments-chat.json`) |

---

## Порты

| Порт | Процесс | Примечание |
|------|---------|------------|
| 3000 | aviator-ui (Next.js) | Основной веб |
| 80/443 | Nginx | Проксирует на 3000 |
| 22 | SSH | |

**Не конфликтует с другими проектами** — nfttoys использует 4100/4101/4200/4201.

---

## Файл supabase-setup.sql

Полный SQL для создания всех таблиц находится в `supabase-setup.sql` в корне проекта.
Запускать одним запросом в Supabase SQL Editor.
