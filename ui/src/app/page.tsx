'use client'

import { useCallback, useState } from 'react'
import ChatContainer, { type Message } from '@/components/ChatContainer'
import ChatInput from '@/components/ChatInput'
import ThemeToggle from '@/components/ThemeToggle'
import { useTypewriter } from '@/hooks/useTypewriter'

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const updateMessage = useCallback((id: string, text: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, content: text } : msg))
    )
  }, [])

  const { start, push, finish, flush } = useTypewriter(updateMessage)

  const handleSend = async (text: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    const assistantId = crypto.randomUUID()

    try {
      const res = await fetch('http://localhost:8000/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let sseBuffer = ''
      let started = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        sseBuffer += decoder.decode(value, { stream: true })
        const lines = sseBuffer.split('\n')
        sseBuffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6)
          if (payload === '[DONE]') break

          let chunk: string
          try {
            chunk = JSON.parse(payload)
          } catch {
            continue
          }

          if (!started) {
            started = true
            setIsLoading(false)
            setMessages((prev) => [
              ...prev,
              { id: assistantId, role: 'assistant', content: '', timestamp: new Date() },
            ])
            start(assistantId)
          }

          push(chunk)
        }
      }

      finish()
    } catch (err) {
      flush()
      setIsLoading(false)
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: 'assistant',
          content: `I encountered an error: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3.5 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
              Professional Assistant
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Online</span>
            </div>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <ChatContainer messages={messages} isLoading={isLoading} onSuggestion={handleSend} />
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  )
}
