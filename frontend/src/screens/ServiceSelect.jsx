import { useState } from 'react'
import { useMainButton, useBackButton, haptic } from '../hooks/useTelegram'

const SERVICES = [
  { id: 'stringing', emoji: '🏸', label: 'Натяжка струны' },
  { id: 'frame',     emoji: '🔧', label: 'Ремонт обода ракетки' },
  { id: 'grip',      emoji: '🖐', label: 'Замена ручки' },
  { id: 'diagnosis', emoji: '🔍', label: 'Диагностика' },
  { id: 'other',     emoji: '✏️', label: 'Другое' },
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

export default function ServiceSelect({ data, update, go }) {
  const [selected, setSelected] = useState(data.service)

  useBackButton(() => go('WELCOME'))
  useMainButton('Далее', () => go('PROBLEM'), !!selected)

  const select = (service) => {
    haptic.light()
    setSelected(service)
    update({ service })
  }

  const mainServices = SERVICES.slice(0, 4)
  const otherService = SERVICES[4]

  return (
    <div className="screen">
      <ProgressBar step={1} total={4} />
      <div className="title">Что случилось с ракеткой?</div>
      <div className="subtitle">Выберите тип проблемы</div>

      <div className="service-grid">
        {mainServices.map(svc => (
          <div
            key={svc.id}
            className={`service-card ${selected?.id === svc.id ? 'selected' : ''}`}
            onClick={() => select(svc)}
          >
            <div className="service-card-emoji">{svc.emoji}</div>
            <div className="service-card-label">{svc.label}</div>
          </div>
        ))}
      </div>

      <div
        className={`service-card-full ${selected?.id === otherService.id ? 'selected' : ''}`}
        onClick={() => select(otherService)}
      >
        <span className="service-card-emoji">{otherService.emoji}</span>
        <span className="service-card-label">{otherService.label}</span>
      </div>
    </div>
  )
}
