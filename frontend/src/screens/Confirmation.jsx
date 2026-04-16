import { useState } from 'react'
import { useMainButton, useBackButton, haptic } from '../hooks/useTelegram'
import { createBooking } from '../api'
import { getUser } from '../hooks/useTelegram'

const MONTHS_GEN = ['января','февраля','марта','апреля','мая','июня',
                    'июля','августа','сентября','октября','ноября','декабря']
const DAYS_SHORT = ['вс','пн','вт','ср','чт','пт','сб']

function formatDate(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  return `${DAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`
}

export default function Confirmation({ data, update, go }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useBackButton(() => go('CONTACT'))

  const submit = async () => {
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      const tgUser = getUser()
      const result = await createBooking({
        service: data.service?.label,
        problem: data.problem,
        date: formatDate(data.date),
        time: data.time,
        name: data.name,
        phone: data.phone,
        tgUserId: tgUser?.id || null,
      })
      haptic.success()
      update({ bookingId: result.booking_id })
      go('SUCCESS')
    } catch (e) {
      haptic.error()
      setError(e.message || 'Не удалось отправить заявку. Попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  useMainButton(loading ? 'Отправляем...' : 'Отправить заявку', submit, !loading)

  const rows = [
    { icon: '🏸', label: 'Услуга', value: data.service?.label || '—' },
    { icon: '📝', label: 'Проблема', value: data.problem || '—' },
    { icon: '🗓', label: 'Дата и время', value: `${formatDate(data.date)} · ${data.time || '—'}` },
    { icon: '👤', label: 'Контакт', value: `${data.name} · ${data.phone}` },
  ]

  return (
    <div className="screen">
      <div className="title" style={{ marginBottom: 6 }}>Проверьте заявку</div>
      <div className="subtitle">Всё верно?</div>

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

      {error && (
        <div style={{ color: 'var(--destructive)', fontSize: 14, marginTop: 12, textAlign: 'center' }}>
          {error}
        </div>
      )}
    </div>
  )
}
