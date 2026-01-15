interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error'
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  const variants = {
    default: 'bg-neutral-800 text-neutral-300',
    success: 'bg-green-900/50 text-green-400',
    warning: 'bg-yellow-900/50 text-yellow-400',
    error: 'bg-red-900/50 text-red-400'
  }

  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${variants[variant]}`}>
      {children}
    </span>
  )
}
