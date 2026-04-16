import { getInitData } from './hooks/useTelegram'

const BASE_URL = import.meta.env.VITE_API_URL || ''

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': getInitData(),
    },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Ошибка сервера' }))
    throw new Error(err.detail || 'Ошибка сервера')
  }
  return res.json()
}

// Создать новую заявку
// Возвращает { booking_id: number }
export async function createBooking({ service, problem, date, time, name, phone, tgUserId }) {
  return request('/api/booking', {
    method: 'POST',
    body: JSON.stringify({ service, problem, date, time, name, phone, tg_user_id: tgUserId }),
  })
}

// Получить заявки пользователя по tg_user_id
// Возвращает [{ id, service, problem, date, time, name, phone, status, created_at }, ...]
export async function getMyBookings(tgUserId) {
  return request(`/api/bookings?tg_user_id=${tgUserId}`)
}
