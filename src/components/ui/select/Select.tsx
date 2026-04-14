import type { SelectHTMLAttributes } from 'react'

import { cx } from '../button/Button.styles'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: SelectOption[]
  error?: string
  placeholder?: string
}

export function Select({
  label,
  options,
  error,
  placeholder = 'Selecione…',
  id,
  className,
  ...rest
}: SelectProps) {
  const selectId = id ?? rest.name

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label
        htmlFor={selectId}
        className="text-sm font-medium text-brand-dark"
      >
        {label}
        {rest.required ? <span className="text-brand-red"> *</span> : null}
      </label>
      <select
        id={selectId}
        className={cx(
          'min-h-11 w-full cursor-pointer rounded-xl border bg-white px-4 py-2.5 text-base text-brand-dark',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2',
          error ? 'border-brand-red' : 'border-gray-200',
          rest.disabled && 'cursor-not-allowed bg-gray-50 text-gray-500',
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${selectId}-error` : undefined}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={`${selectId}-error`} className="text-sm text-brand-red" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
