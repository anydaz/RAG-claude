interface CapybaraIconProps {
  className?: string
}

export default function CapybaraIcon({ className }: CapybaraIconProps) {
  return (
    <img
      src="/capybara.png"
      alt="Capybara"
      className={className}
    />
  )
}
