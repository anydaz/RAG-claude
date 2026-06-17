import { useRef, useCallback } from 'react'

const CHARS_PER_TICK = 2   // characters revealed per interval
const TICK_MS = 20         // ~50fps — feels like fast, natural typing

export function useTypewriter(
  onUpdate: (id: string, text: string) => void
) {
  const receivedRef = useRef('')   // full text buffered from the stream
  const displayedRef = useRef(0)   // how many chars are currently visible
  const streamDoneRef = useRef(false)
  const activeIdRef = useRef<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const tick = useCallback(() => {
    const total = receivedRef.current.length
    const displayed = displayedRef.current

    if (displayed < total) {
      const next = Math.min(displayed + CHARS_PER_TICK, total)
      displayedRef.current = next
      if (activeIdRef.current) {
        onUpdate(activeIdRef.current, receivedRef.current.slice(0, next))
      }
    } else if (streamDoneRef.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [onUpdate])

  const start = useCallback((id: string) => {
    receivedRef.current = ''
    displayedRef.current = 0
    streamDoneRef.current = false
    activeIdRef.current = id

    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(tick, TICK_MS)
  }, [tick])

  const push = useCallback((chunk: string) => {
    receivedRef.current += chunk
  }, [])

  const finish = useCallback(() => {
    streamDoneRef.current = true
  }, [])

  // Immediately reveal all remaining buffered text (e.g. on unmount or error)
  const flush = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (activeIdRef.current && receivedRef.current) {
      onUpdate(activeIdRef.current, receivedRef.current)
    }
  }, [onUpdate])

  return { start, push, finish, flush }
}
