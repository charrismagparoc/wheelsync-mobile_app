// Live updates by polling. Every 15 seconds, while the app is open, each screen reloads its data
// through the normal REST endpoints. Works on Vercel, where WebSockets are not available.
import { AppState } from 'react-native'

const POLL_MS = 15000

const listeners = new Set()
let timer = null

function tick() {
  if (AppState.currentState !== 'active') return
  listeners.forEach((l) => { try { l.callback({ table: '*' }) } catch { /* ignore */ } })
}

function start() {
  if (!timer && listeners.size > 0) timer = setInterval(tick, POLL_MS)
}

function stop() {
  clearInterval(timer)
  timer = null
}

// Stop polling in the background; refresh straight away when the app comes back.
AppState.addEventListener('change', (next) => {
  if (next === 'active') {
    tick()
    start()
  } else {
    stop()
  }
})

/** `tables` is kept for compatibility: every listener is refreshed on each poll. */
export function subscribe(tables, callback) {
  const listener = { tables: Array.isArray(tables) ? tables : [tables], callback }
  listeners.add(listener)
  start()
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) stop()
  }
}

/** Call after sign-in / sign-out. */
export function resetRealtime() {
  stop()
  if (listeners.size > 0) start()
}
