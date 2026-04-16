import { useState } from 'react'
import { useMainButton, useBackButton, haptic } from '../hooks/useTelegram'

const MONTHS_GEN = ['января','февраля','марта','апреля','мая','июня',
                    'июля','августа','сентября','октября','ноября','декабря']
const DAYS_RU = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота']
const DAYS_SHORT = ['вс','пн','вт','ср','чт','пт','сб']

const TIME_GROUPS = [
  { label: 'Утро', slots: ['9:00','10:00','11:00'] },
  { label: 'День',  slots: ['12:00','13:00','14:00','15:00','16:00'] },
  { label: 'Вечер', slots: ['17:00','18:00','19:00'] },
]

function ProgressBar({ step, total }) {
  return (
    <div className="progress-bar">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`progress-step ${i < step ? 'active' : ''}`} />
      ))}
    </div>
  )
}

function formatDate(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return `${DAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`
}

export default function TimeSelect({ data, update, go }) {
  const [selected, setSelected] = useState(data.time)

  useBackButton(() => go('DATE'))
  useMainButton('Далее', () => go('CONTACT'), !!selected)

  const select = (slot) => {
    haptic.selection()
    setSelected(slot)
    update({ time: slot })
  }

  return (
    <div className="screen">
      <ProgressBar step={3} total={4} />
      <div className="title">Удобное время</div>
      <div className="subtitle">{formatDate(data.date)}</div>

      {TIME_GROUPS.map(group => (
        <div key={group.label} className="time-group">
          <div className="section-title">{group.label}</div>
          <div className="time-slots">
            {group.slots.map(slot => (
              <div
                key={slot}
                className={`time-slot ${selected === slot ? 'selected' : ''}`}
                onClick={() => select(slot)}
              >
                {slot}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
