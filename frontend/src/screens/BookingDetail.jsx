import { useMainButton, useBackButton } from '../hooks/useTelegram'

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
    <span className={`badge ${cfg.cls}`} style={{ fontSize: 14, padding: '5px 12px' }}>
      {cfg.icon} {status}
    </span>
  )
}

export default function BookingDetail({ data, go }) {
  const b = data.selectedBooking

  useBackButton(() => go('MY_BOOKINGS'))
  useMainButton('', null, false)

  if (!b) return null

  const rows = [
    { icon: '🏸', label: 'Услуга', value: b.service },
    { icon: '🗓', label: 'Дата и время', value: `${b.date} · ${b.time}` },
    { icon: '👤', label: 'Контакт', value: `${b.name} · ${b.phone}` },
  ]

  return (
    <div className="screen">
      <div className="title" style={{ marginBottom: 8 }}>Заявка #{b.id}</div>
      <div style={{ marginBottom: 20 }}>
        <StatusBadge status={b.status} />
      </div>

      {rows.map(row => (
        <div key={row.label} className="card">
          <div className="card-row">
            <div className="card-icon">{row.icon}</div>
            <div className="card-content">
              <div className="card-label">{row.label}</div>
              <div className="card-value">{row.value}</div>
            </div>
          </div>
        </div>
      ))}

      {b.problem && (
        <div className="card">
          <div className="card-row">
            <div className="card-icon">📝</div>
            <div className="card-content">
              <div className="card-label">Описание проблемы</div>
              <div className="card-value" style={{ whiteSpace: 'pre-wrap' }}>{b.problem}</div>
            </div>
          </div>
        </div>
      )}

      <div className="hint-text" style={{ marginTop: 16 }}>
        Подана: {b.created_at}
      </div>
    </div>
  )
}
