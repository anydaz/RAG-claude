export default function LoadingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3.5">
      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
    </div>
  )
}
