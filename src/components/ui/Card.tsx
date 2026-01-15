interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-neutral-900 border border-neutral-800 rounded-xl p-6 ${onClick ? 'cursor-pointer hover:border-neutral-700 transition-colors' : ''} ${className}`}
    >
      {children}
    </div>
  )
}