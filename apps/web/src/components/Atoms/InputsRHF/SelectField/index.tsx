import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, id, name, children, ...props }, ref) => {
    const inputId = id ?? name
    const errorId = error ? `${inputId}-error` : undefined

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="font-medium">
          {label}
        </label>
        <select
          ref={ref}
          id={inputId}
          name={name}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className="min-h-touch rounded-lg border border-solid p-2"
          {...props}
        >
          {children}
        </select>
        {error && (
          <p id={errorId} className="text-error">
            {error}
          </p>
        )}
      </div>
    )
  },
)

SelectField.displayName = 'SelectField'

export default SelectField
