import logging
import os
from dotenv import load_dotenv
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    ContextTypes,
    filters,
)

load_dotenv()

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

MINI_APP_URL = os.getenv("MINI_APP_URL", "")
OWNER_CHAT_ID = os.getenv("OWNER_CHAT_ID", "")


# ── /start ───────────────────────────────────────────────────────────────────
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if MINI_APP_URL:
        keyboard = InlineKeyboardMarkup([[
            InlineKeyboardButton(
                text="🏸 Записаться на ремонт",
                web_app=WebAppInfo(url=MINI_APP_URL),
            )
        ]])
        await update.message.reply_text(
            "Привет! 👋\n\n"
            "Я помогу записаться на ремонт бадминтонной ракетки к мастеру Аркадию.\n\n"
            "Нажмите кнопку ниже — это займёт меньше минуты 👇",
            reply_markup=keyboard,
        )
    else:
        await update.message.reply_text(
            "Привет! 👋\n\n"
            "Бот настраивается. Скоро здесь появится запись на ремонт ракеток."
        )


# ── Уведомление мастеру при новой заявке через Mini App ─────────────────────
# Mini App отправляет данные через sendData (для простых случаев)
# или через WebApp.sendData() — бот получает их как web_app_data
async def handle_web_app_data(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Получает данные из Mini App когда используется sendData."""
    import json
    try:
        data = json.loads(update.effective_message.web_app_data.data)
        booking_id = data.get("booking_id")
        name = data.get("name", "—")
        phone = data.get("phone", "—")
        service = data.get("service", "—")
        date = data.get("date", "—")
        time = data.get("time", "—")
        problem = data.get("problem", "—")

        # Подтверждение клиенту
        await update.message.reply_text(
            f"✅ Заявка #{booking_id} принята!\n\n"
            f"Аркадий свяжется с вами в течение 1 часа."
        )

        # Уведомление мастеру
        if OWNER_CHAT_ID:
            await context.bot.send_message(
                chat_id=int(OWNER_CHAT_ID),
                text=(
                    f"📬 Новая заявка #{booking_id}\n\n"
                    f"👤 {name}\n"
                    f"📞 {phone}\n"
                    f"🏸 {service}\n"
                    f"🗓 {date} · {time}\n\n"
                    f"Проблема:\n{problem}"
                ),
            )
    except Exception as e:
        logger.error(f"Ошибка обработки web_app_data: {e}")


# ── /notify — уведомление от API (внутренний webhook) ───────────────────────
# FastAPI вызывает этот endpoint когда Mini App создаёт заявку через REST
async def notify_owner(booking_id: int, name: str, phone: str,
                       service: str, date: str, time: str, problem: str,
                       bot) -> None:
    """Вызывается из api.py для отправки уведомления мастеру."""
    if not OWNER_CHAT_ID:
        return
    try:
        await bot.send_message(
            chat_id=int(OWNER_CHAT_ID),
            text=(
                f"📬 Новая заявка #{booking_id}\n\n"
                f"👤 {name}\n"
                f"📞 {phone}\n"
                f"🏸 {service}\n"
                f"🗓 {date}\n\n"
                f"Проблема:\n{problem}"
            ),
        )
    except Exception as e:
        logger.error(f"Ошибка отправки уведомления мастеру: {e}")


# ── /help ────────────────────────────────────────────────────────────────────
async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "🏸 *Мастер по ремонту ракеток — Аркадий Марков*\n\n"
        "Команды:\n"
        "/start — записаться на ремонт\n"
        "/help — помощь\n\n"
        "Вопросы? Пишите прямо в чат.",
        parse_mode="Markdown",
    )


def main() -> None:
    token = os.getenv("BOT_TOKEN")
    if not token:
        raise ValueError("BOT_TOKEN не задан в .env файле")

    app = Application.builder().token(token).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_cmd))
    app.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_web_app_data))

    logger.info("Бот запущен. Mini App URL: %s", MINI_APP_URL or "не задан")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
