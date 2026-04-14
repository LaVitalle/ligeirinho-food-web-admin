/**
 * Cores: primário #F97316 → #EA580C; secundário borda/texto laranja; outlined cinza #D1D5DB.
 */

export function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export const buttonBase = cx(
  'inline-flex items-center justify-center gap-2 font-bold',
  'transition-all duration-200',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2',
  'disabled:pointer-events-none disabled:opacity-50',
)

export const buttonVariants = {
  primary: cx(
    'bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shadow-sm',
    'hover:shadow-md hover:brightness-[1.02] active:brightness-95',
  ),
  secondary: cx(
    'border-2 border-[#F97316] bg-white text-[#F97316]',
    'hover:bg-orange-50 active:bg-orange-100/80',
  ),
  outlined: cx(
    'border border-[#D1D5DB] bg-transparent text-gray-800',
    'hover:bg-gray-50 active:bg-gray-100/80',
  ),
} as const

export const buttonSizes = {
  sm: 'min-h-8 rounded-lg px-3 py-1.5 text-sm',
  md: 'min-h-11 rounded-xl px-5 py-2.5 text-base',
  lg: 'min-h-[3.25rem] rounded-xl px-8 py-3 text-lg',
} as const

export const spinnerSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
} as const

export type ButtonVariant = keyof typeof buttonVariants
export type ButtonSize = keyof typeof buttonSizes
