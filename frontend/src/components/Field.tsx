import type { InputHTMLAttributes } from 'react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Field({ label, error, id, ...props }: FieldProps) {
  const inputId = id ?? props.name
  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-ink">{label}</label>
      <input id={inputId} aria-invalid={Boolean(error)} aria-describedby={error ? `${inputId}-error` : undefined} className="field-input" {...props} />
      {error && <p id={`${inputId}-error`} className="text-xs text-red-700">{error}</p>}
    </div>
  )
}
