import type { ButtonHTMLAttributes } from 'react'
import { mergeClassNames } from '../../../utils/mergeClassNames'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={mergeClassNames(
        'min-h-touch rounded-lg bg-primary px-4 py-2 font-medium text-white disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export default Button
