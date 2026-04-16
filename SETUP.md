# Настройка и деплой бота + Mini App

## Шаг 1 — Telegram бот

1. Напишите [@BotFather](https://t.me/BotFather)
2. Команда `/newbot` → введите имя и username бота
3. Скопируйте токен — это `BOT_TOKEN`
4. Узнайте свой Telegram ID у [@userinfobot](https://t.me/userinfobot) — это `OWNER_CHAT_ID`

---

## Шаг 2 — Google Sheets

### Создать сервисный аккаунт:
1. Откройте [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте проект → включите **Google Sheets API** и **Google Drive API**
3. `IAM & Admin` → `Service Accounts` → `Create Service Account`
4. Скачайте JSON-ключ → переименуйте в `credentials.json`, положите в корень проекта

### Создать таблицу:
1. Создайте новую Google Таблицу
2. Скопируйте ID из URL: `docs.google.com/spreadsheets/d/**ID**/edit`
3. `Поделиться` → добавьте email из `credentials.json` (поле `client_email`) с правами **Редактора**

---

## Шаг 3 — Деплой фронтенда на Vercel

### Установить Vercel CLI:
```bash
npm install -g vercel
```

### Задеплоить:
```bash
cd frontend
cp .env.example .env        # пока оставьте VITE_API_URL пустым
vercel                       # следуйте инструкциям, выберите папку frontend
```

После деплоя Vercel даст URL вида `https://secretary-mini-app.vercel.app` — это ваш `MINI_APP_URL`.

### Переменные окружения в Vercel:
В настройках проекта на vercel.com добавьте:
- `VITE_API_URL` = URL вашего бэкенда (после деплоя на Railway, шаг 4)

После добавления переменной сделайте redeploy:
```bash
vercel --prod
```

---

## Шаг 4 — Деплой бэкенда на Railway

1. Зарегистрируйтесь на [railway.app](https://railway.app)
2. `New Project` → `Deploy from GitHub repo` → выберите репозиторий
3. Railway автоматически найдёт `Procfile` и запустит `uvicorn api:app`

### Переменные окружения в Railway:
В настройках сервиса добавьте все переменные из `.env.example`:
- `BOT_TOKEN`
- `OWNER_CHAT_ID`
- `SPREADSHEET_ID`
- `MINI_APP_URL` (URL фронтенда с Vercel)

### Добавить credentials.json на Railway:
Способ 1 — через переменную окружения:
```bash
# Закодируйте файл в base64
base64 -i credentials.json
```
Добавьте переменную `GOOGLE_CREDENTIALS_BASE64` и обновите `sheets.py` для чтения из неё.

Способ 2 — через Railway Volume (проще для начала):
В настройках добавьте Volume, загрузите `credentials.json`.

### Получить URL бэкенда:
После деплоя Railway покажет URL вида `https://secretary.up.railway.app`.
Вернитесь в Vercel и обновите `VITE_API_URL` этим URL.

---

## Шаг 5 — Зарегистрировать Mini App в BotFather

1. Напишите [@BotFather](https://t.me/BotFather)
2. Команда `/newapp`
3. Выберите вашего бота
4. Название: `Запись на ремонт ракетки`
5. Описание: `Быстрая запись на консультацию к мастеру`
6. Загрузите иконку (640×360 px)
7. URL: вставьте URL с Vercel

---

## Шаг 6 — Запустить бота

### Локально:
```bash
cp .env.example .env    # заполните значения
pip install -r requirements.txt
python bot.py
```

### На Railway:
Бот запускается автоматически через `Procfile`.
Если нужно запускать и бот и API одновременно — добавьте второй сервис в Railway.

---

## Структура деплоя

```
Telegram
   ↓ кнопка "Записаться"
Vercel (React Mini App)
   ↓ POST /api/booking
Railway (FastAPI)
   ↓ add_booking()
Google Sheets  ←→  Railway (python-telegram-bot)
                        ↓ уведомление
                   Telegram (мастеру)
```

---

## Быстрая проверка после деплоя

1. Откройте бота → `/start` → должна появиться кнопка "Записаться на ремонт"
2. Нажмите кнопку → должен открыться Mini App
3. Пройдите флоу до конца → в Google Sheets должна появиться строка
4. Мастер должен получить уведомление в Telegram
5. Откройте `https://your-backend.railway.app/health` → должно вернуть `{"status":"ok"}`
