'use client'

import { useCallback, useState } from 'react'
import ChatContainer, { type Message } from '@/components/ChatContainer'
import ChatInput from '@/components/ChatInput'
import CapybaraIcon from '@/components/CapybaraIcon'
import ThemeToggle from '@/components/ThemeToggle'
import { useTypewriter } from '@/hooks/useTypewriter'

export default function Home() {
  const [threadId] = useState(() => crypto.randomUUID())
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
        body: JSON.stringify({ message: text, thread_id: threadId }),
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
    <div className="flex flex-col h-screen bg-[#f0f4f9] dark:bg-[#131314]">
      <header className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <CapybaraIcon className="w-7 h-7" />
          <span className="text-lg font-medium text-slate-800 dark:text-slate-100 tracking-tight">
            Assistant
          </span>
        </div>
        <ThemeToggle />
      </header>

      <ChatContainer messages={messages} isLoading={isLoading} onSuggestion={handleSend} />
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  )
}

