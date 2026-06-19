'use client'

import { useEffect, useRef } from 'react'
import ChatMessage from '@/components/ChatMessage'
import LoadingIndicator from '@/components/LoadingIndicator'

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatContainerProps {
  messages: Message[]
  isLoading: boolean
  onSuggestion: (text: string) => void
}

const SUGGESTIONS = [
  { icon: '💼', text: 'What is your professional background?' },
  { icon: '🚀', text: 'Tell me about your most recent role.' },
  { icon: '⚙️', text: 'What technical skills do you have?' },
  { icon: '📅', text: 'Arrange a meeting on my schedule.' },
]


function WelcomeScreen({ onSuggestion }: { onSuggestion: (text: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-10 px-4 pb-10">
      <div className="text-center">
        <h1 className="text-4xl font-semibold bg-gradient-to-r from-[#6B4822] via-[#B8824D] to-[#D4A86A] bg-clip-text text-transparent pb-1">
          Hello there
        </h1>
        <p className="mt-2 text-xl text-slate-500 dark:text-slate-400 font-light">
          How can I help you today?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.text}
            onClick={() => onSuggestion(s.text)}
            className="flex items-start gap-3 text-left px-5 py-4 rounded-2xl bg-white dark:bg-[#1e1f20] hover:bg-blue-50 dark:hover:bg-[#28292a] text-slate-700 dark:text-slate-300 text-sm transition-all duration-150 shadow-sm hover:shadow-md group"
          >
            <span className="text-lg leading-snug">{s.icon}</span>
            <span className="leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {s.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ChatContainer({ messages, isLoading, onSuggestion }: ChatContainerProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 && !isLoading ? (
        <WelcomeScreen onSuggestion={onSuggestion} />
      ) : (
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}
          {isLoading && <LoadingIndicator />}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}
