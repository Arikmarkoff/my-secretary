import { useState } from 'react'
import { useMainButton, useBackButton, haptic } from '../hooks/useTelegram'

const MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь',
                   'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
const MONTHS_GEN = ['января','февраля','марта','апреля','мая','июня',
                    'июля','августа','сентября','октября','ноября','декабря']
const DAYS_SHORT = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']

function startOfDay(d) {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c
}

function ProgressBar({ step, total }) {
  return (
    <div className="progress-bar">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`progress-step ${i < step ? 'active' : ''}`} />
      ))}
    </div>
  )
}

function formatNextSlot() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const days = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота']
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]} — ${days[d.getDay()]}`
}

export default function DateSelect({ data, update, go }) {
  const today = startOfDay(new Date())
  const minDate = startOfDay(new Date(today))
  minDate.setDate(minDate.getDate() + 1)
  const maxDate = startOfDay(new Date(today))
  maxDate.setDate(maxDate.getDate() + 30)

  const [selected, setSelected] = useState(data.date ? startOfDay(new Date(data.date)) : null)
  const [viewYear, setViewYear] = useState(minDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(minDate.getMonth())

  useBackButton(() => go('PROBLEM'))
  useMainButton('Выбрать время', () => go('TIME'), !!selected)

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDay = (() => {
    const d = new Date(viewYear, viewMonth, 1).getDay()
    return d === 0 ? 6 : d - 1  // 0=Пн
  })()

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const canPrev = new Date(viewYear, viewMonth, 1) > new Date(minDate.getFullYear(), minDate.getMonth(), 1)
  const canNext = new Date(viewYear, viewMonth + 1, 1) <= new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 1)

  const selectDay = (day) => {
    const d = startOfDay(new Date(viewYear, viewMonth, day))
    if (d < minDate || d > maxDate) return
    haptic.light()
    setSelected(d)
    update({ date: d.toISOString(), time: null })
  }

  const isSelected = (day) => {
    if (!selected) return false
    const d = new Date(viewYear, viewMonth, day)
    return d.toDateString() === selected.toDateString()
  }

  const isDisabled = (day) => {
    const d = startOfDay(new Date(viewYear, viewMonth, day))
    return d < minDate || d > maxDate
  }

  const isToday = (day) => {
    const d = new Date(viewYear, viewMonth, day)
    return d.toDateString() === today.toDateString()
  }

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="screen">
      <ProgressBar step={3} total={4} />
      <div className="title">Когда удобно прийти?</div>
      <div className="subtitle">Выберите дату</div>

      <div className="calendar">
        <div className="calendar-nav">
          <button className="calendar-nav-btn" onClick={prevMonth} disabled={!canPrev}>‹</button>
          <div className="calendar-month">{MONTHS_RU[viewMonth]} {viewYear}</div>
          <button className="calendar-nav-btn" onClick={nextMonth} disabled={!canNext}>›</button>
        </div>

        <div className="calendar-weekdays">
          {DAYS_SHORT.map((d, i) => (
            <div key={d} className={`calendar-weekday ${i >= 5 ? 'weekend' : ''}`}>{d}</div>
          ))}
        </div>

        <div className="calendar-days">
          {cells.map((day, i) => {
            if (!day) return <div key={`e${i}`} className="calendar-day empty" />
            const disabled = isDisabled(day)
            const selected_ = isSelected(day)
            const today_ = isToday(day)
            return (
              <div
                key={day}
                className={`calendar-day ${selected_ ? 'selected' : ''} ${disabled ? 'disabled' : ''} ${today_ && !selected_ ? 'today' : ''}`}
                onClick={() => !disabled && selectDay(day)}
              >
                {day}
              </div>
            )
          })}
        </div>

        <div className="next-slot-hint">
          💡 Ближайший свободный: <span>{formatNextSlot()}</span>
        </div>
      </div>
    </div>
  )
}
