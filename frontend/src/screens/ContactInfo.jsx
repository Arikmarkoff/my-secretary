import { useState, useEffect } from 'react'
import { useMainButton, useBackButton, useClosingConfirmation, getUser } from '../hooks/useTelegram'

function ProgressBar({ step, total }) {
  return (
    <div className="progress-bar">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`progress-step ${i < step ? 'active' : ''}`} />
      ))}
    </div>
  )
}

function isValidPhone(p) {
  return p.replace(/\D/g, '').length >= 10
}

export default function ContactInfo({ data, update, go }) {
  const tgUser = getUser()
  const defaultName = tgUser ? [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') : ''

  const [name, setName] = useState(data.name || defaultName)
  const [phone, setPhone] = useState(data.phone)

  const isValid = name.trim().length >= 2 && isValidPhone(phone)

  useBackButton(() => go('TIME'))
  useMainButton('Проверить заявку', () => { update({ name, phone }); go('CONFIRM') }, isValid)
  useClosingConfirmation(phone.length > 0)

  useEffect(() => {
    if (!data.name && defaultName) update({ name: defaultName })
  }, [])

  return (
    <div className="screen">
      <ProgressBar step={4} total={4} />
      <div className="title">Как с вами связаться?</div>
      <div className="subtitle">Для подтверждения записи</div>

      <div className="input-group">
        <label className="input-label">Имя</label>
        <input
          className="input-field"
          type="text"
          placeholder="Ваше имя"
          value={name}
          onChange={e => { setName(e.target.value); update({ name: e.target.value }) }}
        />
      </div>

      <div className="input-group">
        <label className="input-label">Телефон</label>
        <input
          className="input-field"
          type="tel"
          placeholder="+7 (___) ___-__-__"
          value={phone}
          onChange={e => { setPhone(e.target.value); update({ phone: e.target.value }) }}
          autoFocus={!defaultName}
        />
      </div>

      <div className="hint-text">Мы позвоним для подтверждения времени</div>
    </div>
  )
}
