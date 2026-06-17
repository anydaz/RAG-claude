import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function AssistantAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-sm">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
      </svg>
    </div>
  )
}

function UserAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-slate-600 dark:bg-slate-500 flex items-center justify-center shrink-0 shadow-sm">
      <span className="text-xs font-semibold text-white">You</span>
    </div>
  )
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === 'user'

  if (isUser) {
    return (
      <div className="flex items-end gap-2.5 justify-end mb-6">
        <div className="flex flex-col items-end gap-1 max-w-[72%]">
          <div className="px-4 py-3 rounded-2xl rounded-br-sm bg-indigo-600 text-white text-sm leading-relaxed shadow-sm">
            <div className="prose prose-sm prose-invert max-w-none break-words
              prose-p:my-1 prose-p:leading-relaxed
              prose-ul:my-1 prose-ul:pl-4
              prose-ol:my-1 prose-ol:pl-4
              prose-li:my-0.5
              prose-code:bg-indigo-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-indigo-100 prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-indigo-700/60 prose-pre:rounded-lg prose-pre:p-3
              prose-strong:text-white
              prose-a:text-indigo-200 prose-a:underline
              prose-headings:text-white prose-headings:font-semibold">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 px-1">
            {formatTime(timestamp)}
          </span>
        </div>
        <UserAvatar />
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2.5 mb-6">
      <AssistantAvatar />
      <div className="flex flex-col items-start gap-1 max-w-[72%]">
        <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white dark:bg-zinc-800 text-slate-800 dark:text-slate-100 text-sm leading-relaxed shadow-sm border border-slate-100 dark:border-zinc-700">
          <div className="prose prose-sm dark:prose-invert max-w-none break-words
            prose-p:my-1 prose-p:leading-relaxed
            prose-ul:my-1 prose-ul:pl-4
            prose-ol:my-1 prose-ol:pl-4
            prose-li:my-0.5
            prose-code:bg-slate-100 dark:prose-code:bg-zinc-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-slate-700 dark:prose-code:text-slate-200 prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-slate-100 dark:prose-pre:bg-zinc-700/60 prose-pre:rounded-lg prose-pre:p-3
            prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:underline
            prose-headings:font-semibold prose-headings:text-slate-900 dark:prose-headings:text-slate-100">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 px-1">
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  )
}
