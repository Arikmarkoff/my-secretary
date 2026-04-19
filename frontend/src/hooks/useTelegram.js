import { useEffect, useRef, useContext, createContext } from 'react'

// ── Contexts for in-layout buttons ───────────────────────────────────────────
// VK Mini Apps не имеет нативных MainButton/BackButton — управляем через контекст
export const MainButtonContext = createContext(null)
export const BackButtonContext = createContext(null)

// ── VK user cache ─────────────────────────────────────────────────────────────
let _cachedUser = null
export function setCachedUser(user) { _cachedUser = user }

// ── MainButton ────────────────────────────────────────────────────────────────
export function useMainButton(text, onClick, enabled = true) {
  const ctx = useContext(MainButtonContext)
  const handlerRef = useRef(onClick)
  useEffect(() => { handlerRef.current = onClick })

  useEffect(() => {
    if (!ctx) return
    ctx.setButton({ text, handler: () => handlerRef.current?.(), enabled })
    return () => ctx.setButton(null)
  }, [text, enabled])
}

// ── BackButton ────────────────────────────────────────────────────────────────
export function useBackButton(onClick) {
  const ctx = useContext(BackButtonContext)
  const handlerRef = useRef(onClick)
  useEffect(() => { handlerRef.current = onClick })

  useEffect(() => {
    if (!ctx) return
    ctx.setBack(onClick ? () => handlerRef.current?.() : null)
    return () => ctx.setBack(null)
  }, [!!onClick])
}

// ── ClosingConfirmation ───────────────────────────────────────────────────────
export function useClosingConfirmation(_enabled = true) {
  // В VK нет аналога — no-op
}

// ── Haptic feedback ───────────────────────────────────────────────────────────
export const haptic = {
  light:     () => {},
  medium:    () => {},
  success:   () => {},
  error:     () => {},
  selection: () => {},
}

// ── User data ─────────────────────────────────────────────────────────────────
export const getUser      = () => _cachedUser
export const getInitData  = () => ''
export const closeMiniApp = () => {}
export const expandMiniApp = () => {}
