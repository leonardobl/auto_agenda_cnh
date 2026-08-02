import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, id, name, ...props }, ref) => {
    const inputId = id ?? name
    const errorId = error ? `${inputId}-error` : undefined

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="font-medium">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          name={name}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className="min-h-touch rounded-lg border border-solid p-2"
          {...props}
        />
        {error && (
          <p id={errorId} className="text-error">
            {error}
          </p>
        )}
      </div>
    )
  },
)

TextField.displayName = 'TextField'

export default TextField
