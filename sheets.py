import gspread
from google.oauth2.service_account import Credentials
from datetime import datetime
import os
import json
import base64

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

HEADERS = [
    "№", "Дата заявки", "Услуга", "Имя", "Телефон",
    "Описание проблемы", "Желаемая дата/время", "Статус", "TG User ID",
]


def get_sheet():
    # Приоритет: base64 из переменной окружения → файл
    creds_b64 = os.getenv("GOOGLE_CREDENTIALS_BASE64")
    if creds_b64:
        creds_info = json.loads(base64.b64decode(creds_b64).decode("utf-8"))
        creds = Credentials.from_service_account_info(creds_info, scopes=SCOPES)
    else:
        creds = Credentials.from_service_account_file(
            os.getenv("GOOGLE_CREDENTIALS_FILE", "credentials.json"),
            scopes=SCOPES,
        )
    client = gspread.authorize(creds)
    spreadsheet_id = os.getenv("SPREADSHEET_ID", "").strip().splitlines()[0].strip()
    spreadsheet = client.open_by_key(spreadsheet_id)

    try:
        sheet = spreadsheet.worksheet("Заявки")
    except gspread.WorksheetNotFound:
        sheet = spreadsheet.add_worksheet(title="Заявки", rows=1000, cols=len(HEADERS))
        sheet.append_row(HEADERS)
        sheet.format(f"A1:{chr(64 + len(HEADERS))}1", {"textFormat": {"bold": True}})

    return sheet


def add_booking(
    name: str,
    phone: str,
    problem: str,
    datetime_wish: str,
    service: str = "",
    tg_user_id: int | None = None,
) -> int:
    sheet = get_sheet()
    all_rows = sheet.get_all_values()
    booking_number = len(all_rows)  # строки включая заголовок → номер = кол-во строк

    row = [
        booking_number,
        datetime.now().strftime("%d.%m.%Y %H:%M"),
        service,
        name,
        phone,
        problem,
        datetime_wish,
        "Новая",
        str(tg_user_id) if tg_user_id else "",
    ]
    sheet.append_row(row)
    return booking_number


def get_user_bookings(tg_user_id: int) -> list[dict]:
    """Возвращает все заявки пользователя по его Telegram ID."""
    sheet = get_sheet()
    rows = sheet.get_all_values()
    if len(rows) <= 1:
        return []

    headers = rows[0]
    result = []
    for row in rows[1:]:
        # TG User ID — последняя колонка (индекс 8)
        if len(row) >= 9 and row[8] == str(tg_user_id):
            result.append({
                "id":         row[0],
                "created_at": row[1],
                "service":    row[2],
                "name":       row[3],
                "phone":      row[4],
                "problem":    row[5],
                "date":       row[6].split(" ")[0] if row[6] else "",
                "time":       row[6].split(" ")[1] if " " in row[6] else "",
                "status":     row[7],
            })

    # Сначала новые
    result.reverse()
    return result
