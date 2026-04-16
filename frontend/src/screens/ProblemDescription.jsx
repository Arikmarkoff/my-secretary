import { useState } from 'react'
import { useMainButton, useBackButton, useClosingConfirmation } from '../hooks/useTelegram'

function ProgressBar({ step, total }) {
  return (
    <div className="progress-bar">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`progress-step ${i < step ? 'active' : ''}`} />
      ))}
    </div>
  )
}

export default function ProblemDescription({ data, update, go }) {
  const [text, setText] = useState(data.problem)
  const isValid = text.trim().length >= 10

  useBackButton(() => go('SERVICE'))
  useMainButton('Далее', () => go('DATE'), isValid)
  useClosingConfirmation(text.length > 0)

  const handleChange = (e) => {
    setText(e.target.value)
    update({ problem: e.target.value })
  }

  return (
    <div className="screen">
      <ProgressBar step={2} total={4} />
      <div className="title">Опишите проблему</div>

      {data.service && (
        <div className="recap-chip">
          <span>{data.service.emoji}</span>
          <span>{data.service.label}</span>
        </div>
      )}

      <div className="textarea-wrap">
        <textarea
          className="textarea-field"
          placeholder="Например: струна лопнула во время игры, нужна натяжка ~10 кг..."
          value={text}
          onChange={handleChange}
          autoFocus
        />
      </div>

      <div className="hint-text">
        Чем подробнее — тем лучше. Мастер придёт подготовленным.
      </div>
    </div>
  )
}
