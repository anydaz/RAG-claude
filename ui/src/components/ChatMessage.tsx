import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CapybaraIcon from "@/components/CapybaraIcon";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatMessage({
  role,
  content,
  timestamp,
}: ChatMessageProps) {
  const isUser = role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%]">
          <div className="px-5 py-3 rounded-3xl bg-white dark:bg-[#1e1f20] text-slate-800 dark:text-slate-100 text-sm leading-relaxed shadow-sm">
            {content}
          </div>
          {/* <p className="mt-1 text-right text-[11px] text-slate-400 dark:text-slate-600 pr-1">
            {formatTime(timestamp)}
          </p> */}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start">
      <div className="flex-1 min-w-0">
        <div
          className="prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-100 break-words
          prose-p:my-2 prose-p:leading-relaxed
          prose-ul:my-2 prose-ul:pl-5
          prose-ol:my-2 prose-ol:pl-5
          prose-li:my-1
          prose-code:bg-slate-100 dark:prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-slate-700 dark:prose-code:text-slate-200 prose-code:before:content-none prose-code:after:content-none prose-code:text-xs
          prose-pre:bg-slate-100 dark:prose-pre:bg-zinc-800 prose-pre:rounded-xl prose-pre:p-4
          prose-a:text-blue-500 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
          prose-headings:font-semibold prose-headings:text-slate-900 dark:prose-headings:text-slate-100
          prose-strong:text-slate-900 dark:prose-strong:text-slate-100
          prose-blockquote:border-blue-400 prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-400"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
        {/* <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-600">
          {formatTime(timestamp)}
        </p> */}
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
