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
  'What is your professional background?',
  'Tell me about your most recent role.',
  'What technical skills do you have?',
  'Describe a challenging project you worked on.',
]

function WelcomeScreen({ onSuggestion }: { onSuggestion: (text: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-4 py-12 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            Professional Assistant
          </h2>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-xs">
            Ask me anything about professional background, experience, skills, or past projects.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSuggestion(suggestion)}
            className="text-left px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 text-sm transition-all duration-150 shadow-sm hover:shadow-md group"
          >
            <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {suggestion}
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
        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}
          {isLoading && (
            <div className="flex items-end gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                </svg>
              </div>
              <div className="rounded-2xl rounded-bl-sm bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 shadow-sm">
                <LoadingIndicator />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}
