"""
FastAPI REST API для Telegram Mini App.
Запускается рядом с ботом: uvicorn api:app --host 0.0.0.0 --port 8000
"""
import os
import hashlib
import hmac
import json
import traceback
from urllib.parse import unquote, parse_qsl
from datetime import datetime

from fastapi import FastAPI, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from sheets import add_booking, get_user_bookings

load_dotenv()

app = FastAPI(title="Secretary Mini App API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BOT_TOKEN = os.getenv("BOT_TOKEN", "")


# ── Telegram initData verification ─────────────────────────────────────────
def verify_init_data(init_data: str) -> dict | None:
    """
    Проверяет подпись initData от Telegram.
    Возвращает словарь с данными пользователя или None если подпись неверна.
    В dev-режиме (BOT_TOKEN пустой) пропускает проверку.
    """
    if not BOT_TOKEN or not init_data or init_data.strip() == '':
        return {}  # dev mode / VK mode

    try:
        parsed = dict(parse_qsl(init_data, keep_blank_values=True))
        received_hash = parsed.pop("hash", None)
        if not received_hash:
            return None

        data_check_string = "\n".join(
            f"{k}={v}" for k, v in sorted(parsed.items())
        )
        secret_key = hmac.new(b"WebAppData", BOT_TOKEN.encode(), hashlib.sha256).digest()
        expected_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

        if not hmac.compare_digest(expected_hash, received_hash):
            return None

        user_raw = parsed.get("user", "{}")
        return json.loads(user_raw)
    except Exception:
        return None


# ── Schemas ─────────────────────────────────────────────────────────────────
class BookingRequest(BaseModel):
    service: str
    problem: str
    date: str
    time: str
    name: str
    phone: str
    tg_user_id: int | None = None


# ── Endpoints ───────────────────────────────────────────────────────────────
@app.post("/api/booking")
async def create_booking(
    payload: BookingRequest,
    x_telegram_init_data: str = Header(default=""),
):
    user = verify_init_data(x_telegram_init_data)
    if user is None:
        raise HTTPException(status_code=401, detail="Неверная подпись Telegram")

    try:
        booking_id = add_booking(
            name=payload.name,
            phone=payload.phone,
            problem=payload.problem,
            datetime_wish=f"{payload.date} {payload.time}",
            service=payload.service,
            tg_user_id=payload.tg_user_id,
        )
        return {"booking_id": booking_id}
    except Exception as e:
        print("BOOKING ERROR:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/bookings")
async def list_bookings(
    tg_user_id: int,
    x_telegram_init_data: str = Header(default=""),
):
    user = verify_init_data(x_telegram_init_data)
    if user is None:
        raise HTTPException(status_code=401, detail="Неверная подпись Telegram")

    try:
        bookings = get_user_bookings(tg_user_id)
        return bookings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/test-sheets")
async def test_sheets():
    try:
        from sheets import get_sheet
        sheet = get_sheet()
        return {"status": "ok", "sheet": sheet.title}
    except Exception as e:
        import traceback
        return {"status": "error", "error": str(e), "trace": traceback.format_exc()[-500:]}


@app.get("/vk-test", response_class=FileResponse)
async def vk_test():
    from fastapi.responses import HTMLResponse
    return HTMLResponse("<html><body><h1>VK Test OK</h1><script>window.onload=function(){try{var b=window['vk-bridge']||window.vkBridge;if(b)b.send('VKWebAppInit');}catch(e){}}</script></body></html>")


@app.get("/health")
async def health():
    return {"status": "ok", "time": datetime.now().isoformat()}


@app.get("/debug-env")
async def debug_env():
    import os
    return {
        "has_b64": bool(os.getenv("GOOGLE_CREDENTIALS_BASE64")),
        "b64_len": len(os.getenv("GOOGLE_CREDENTIALS_BASE64", "")),
        "has_file": bool(os.getenv("GOOGLE_CREDENTIALS_FILE")),
        "file_val": os.getenv("GOOGLE_CREDENTIALS_FILE", "")[:50],
        "spreadsheet_id": os.getenv("SPREADSHEET_ID", ""),
        "has_bot_token": bool(os.getenv("BOT_TOKEN")),
    }


# ── Serve frontend static files ──────────────────────────────────────────────
import os as _os
_static_dir = _os.path.join(_os.path.dirname(__file__), "static")
if _os.path.isdir(_static_dir):
    app.mount("/assets", StaticFiles(directory=_os.path.join(_static_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        return FileResponse(_os.path.join(_static_dir, "index.html"))
