interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export default function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm text-neutral-400">{label}</label>
      )}
      <select
        className={`w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5
                   text-white focus:outline-none focus:border-neutral-600 transition-colors
                   ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
