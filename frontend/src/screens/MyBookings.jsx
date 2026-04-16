import { useState, useEffect } from 'react'
import { useMainButton, useBackButton, getUser } from '../hooks/useTelegram'
import { getMyBookings } from '../api'

const STATUS_CONFIG = {
  'Новая':    { cls: 'badge-new',        icon: '🟡' },
  'Принята':  { cls: 'badge-accepted',   icon: '🔵' },
  'В работе': { cls: 'badge-inprogress', icon: '🟠' },
  'Готово':   { cls: 'badge-done',       icon: '✅' },
  'Отменена': { cls: 'badge-cancelled',  icon: '⭕' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Новая']
  return (
    <span className={`badge ${cfg.cls}`}>
      {cfg.icon} {status}
    </span>
  )
}

export default function MyBookings({ data, update, go, startNewBooking }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useBackButton(() => go('WELCOME'))
  useMainButton('Новая запись', startNewBooking)

  useEffect(() => {
    const tgUser = getUser()
    if (!tgUser?.id) { setLoading(false); return }

    getMyBookings(tgUser.id)
      .then(setBookings)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const openDetail = (booking) => {
    update({ selectedBooking: booking })
    go('BOOKING_DETAIL')
  }

  if (loading) {
    return (
      <div className="screen">
        <div className="title" style={{ marginBottom: 24 }}>Мои заявки</div>
        {[1, 2, 3].map(i => (
          <div key={i} className="card" style={{ height: 72, opacity: 0.4 }} />
        ))}
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="title" style={{ marginBottom: 16 }}>Мои заявки</div>

      {error && (
        <div style={{ color: 'var(--destructive)', fontSize: 14, marginBottom: 16 }}>{error}</div>
      )}

      {bookings.length === 0 && !error ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏸</div>
          <div className="empty-state-text">Заявок пока нет</div>
        </div>
      ) : (
        bookings.map(b => (
          <div key={b.id} className="booking-card" onClick={() => openDetail(b)}>
            <div className="booking-card-header">
              <div className="booking-card-service">{b.service}</div>
              <StatusBadge status={b.status} />
            </div>
            <div className="booking-card-date">
              🗓 {b.date} · {b.time}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
