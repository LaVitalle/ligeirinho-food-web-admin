import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

import {
  buttonBase,
  buttonSizes,
  buttonVariants,
  cx,
  spinnerSizes,
  type ButtonSize,
  type ButtonVariant,
} from './Button.styles'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  children?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  type = 'button',
  'aria-label': ariaLabel,
  ...rest
}: ButtonProps) {
  const isDisabled = Boolean(disabled || loading)

  const spinnerTone =
    variant === 'primary'
      ? 'text-white'
      : variant === 'secondary'
        ? 'text-[#F97316]'
        : 'text-gray-600'

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      aria-label={ariaLabel}
      className={cx(
        buttonBase,
        buttonVariants[variant],
        buttonSizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading && (
        <Loader2
          className={cx('shrink-0 animate-spin', spinnerSizes[size], spinnerTone)}
          aria-hidden
        />
      )}
      <span
        className={cx(
          'inline-flex items-center justify-center',
          loading && 'opacity-40',
        )}
      >
        {children}
      </span>
    </button>
  )
}
