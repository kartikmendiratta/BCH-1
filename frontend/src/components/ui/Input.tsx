interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm text-neutral-400">{label}</label>
      )}
      <input
        className={`w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5
                   text-white placeholder:text-neutral-600
                   focus:outline-none focus:border-neutral-600 transition-colors
                   ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}
