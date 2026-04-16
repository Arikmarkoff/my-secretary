import { useMainButton, useBackButton } from '../hooks/useTelegram'

export default function Welcome({ go }) {
  useBackButton(null)
  useMainButton('Записаться', () => go('SERVICE'))

  return (
    <div className="screen-center">
      <div className="master-avatar">🏸</div>

      <div className="master-name">Аркадий Марков</div>
      <div className="master-role">Мастер по ремонту ракеток</div>
      <div className="master-stats">18 лет опыта · 2000+ ракеток</div>

      <div className="services-preview">
        {[
          ['🏸', 'Натяжка струны'],
          ['🔧', 'Ремонт обода ракетки'],
          ['🖐', 'Замена ручки'],
          ['🔍', 'Диагностика'],
        ].map(([emoji, label]) => (
          <div key={label} className="services-preview-item">
            <span>{emoji}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="response-hint">Ответим в течение 1 часа</div>
    </div>
  )
}
