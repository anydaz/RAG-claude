'use client'

import { useState, useRef, useEffect } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    const maxHeight = 24 * 4 + 24
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
  }, [value])

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isEmpty = value.trim().length === 0

  return (
    <div className="border-t border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm px-4 py-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-3 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 shadow-sm focus-within:border-indigo-400 dark:focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-400/20 dark:focus-within:ring-indigo-500/20 transition-all">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Ask about experience, skills, or projects…"
            rows={1}
            className="flex-1 resize-none bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm leading-6 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed overflow-y-auto"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={disabled || isEmpty}
            aria-label="Send message"
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 shadow-sm hover:shadow-md hover:shadow-indigo-500/25"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-400 dark:text-slate-600">
          Press <kbd className="font-sans">Enter</kbd> to send · <kbd className="font-sans">Shift + Enter</kbd> for new line
        </p>
      </div>
    </div>
  )
}
