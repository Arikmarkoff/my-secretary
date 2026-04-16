import { useMainButton, useBackButton, closeMiniApp } from '../hooks/useTelegram'

const MONTHS_GEN = ['января','февраля','марта','апреля','мая','июня',
                    'июля','августа','сентября','октября','ноября','декабря']
const DAYS_SHORT = ['вс','пн','вт','ср','чт','пт','сб']

function formatDate(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  return `${DAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`
}

export default function Success({ data, go }) {
  useBackButton(null)
  useMainButton('Закрыть', closeMiniApp)

  return (
    <div className="screen-center">
      <div className="success-icon">✅</div>

      <div className="title">Заявка принята!</div>

      <div className="booking-number-label">Номер заявки</div>
      <div className="booking-number">#{data.bookingId}</div>

      <div className="success-info-card">
        <div className="success-info-row">
          🏸 {data.service?.label}
        </div>
        <div className="success-info-row">
          🗓 {formatDate(data.date)} · {data.time}
        </div>
        <div className="success-info-row">
          👤 {data.name} · {data.phone}
        </div>
      </div>

      <div className="hint-text" style={{ textAlign: 'center', marginBottom: 16 }}>
        Аркадий свяжется с вами в течение&nbsp;1&nbsp;часа для подтверждения
      </div>

      <button className="secondary-btn" onClick={() => go('MY_BOOKINGS')}>
        📋 Мои заявки
      </button>
    </div>
  )
}
