import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'

try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (e) {
  document.getElementById('root').innerHTML = '<p style="padding:20px;color:red;font-size:14px">Ошибка: ' + e.message + '</p>'
}
