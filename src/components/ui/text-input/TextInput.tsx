import type { InputHTMLAttributes } from 'react'

import { cx } from '../button/Button.styles'

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export function TextInput({
  label,
  error,
  hint,
  id,
  className,
  maxLength,
  ...rest
}: TextInputProps) {
  const inputId = id ?? rest.name

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-brand-dark"
      >
        {label}
        {rest.required ? <span className="text-brand-red"> *</span> : null}
      </label>
      <input
        id={inputId}
        maxLength={maxLength}
        className={cx(
          'min-h-11 w-full rounded-xl border bg-white px-4 py-2.5 text-base text-brand-dark',
          'placeholder:text-gray-400',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2',
          error ? 'border-brand-red' : 'border-gray-200',
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        {...rest}
      />
      {hint && !error ? (
        <p id={`${inputId}-hint`} className="text-xs text-gray-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${inputId}-error`} className="text-sm text-brand-red" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
