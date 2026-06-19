const BARS = [
  { delay: '0s',    color: '#6B4822' },
  { delay: '0.12s', color: '#9B6940' },
  { delay: '0.24s', color: '#D4A86A' },
  { delay: '0.36s', color: '#9B6940' },
  { delay: '0.48s', color: '#6B4822' },
]

export default function LoadingIndicator() {
  return (
    <div className="flex items-center gap-0.5 h-4">
      {BARS.map(({ delay, color }) => (
        <div
          key={delay}
          className="w-1 rounded-full"
          style={{
            backgroundColor: color,
            animation: 'audioBar 0.9s ease-in-out infinite',
            animationDelay: delay,
          }}
        />
      ))}
    </div>
  )
}
