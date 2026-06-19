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
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`
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
    <div className="px-4 pb-6 pt-2">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 rounded-3xl bg-white dark:bg-[#1e1f20] px-5 py-3.5 shadow-md focus-within:shadow-lg transition-shadow">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Ask me anything..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm leading-6 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed overflow-y-auto"
            style={{ maxHeight: '160px' }}
          />
          <button
            onClick={handleSend}
            disabled={disabled || isEmpty}
            aria-label="Send message"
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-150 disabled:cursor-not-allowed bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 dark:disabled:bg-zinc-700 text-white disabled:text-slate-400 dark:disabled:text-zinc-500 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-400 dark:text-slate-600">
          Enter to send · Shift + Enter for new line
        </p>
      </div>
    </div>
  )
}
