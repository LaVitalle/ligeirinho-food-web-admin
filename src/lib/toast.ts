import { createElement } from 'react'
import { Info } from 'lucide-react'
import toast from 'react-hot-toast'

const infoIcon = createElement(Info, {
  className: 'h-5 w-5 shrink-0 text-[#F97316]',
  'aria-hidden': true,
})

export const showToast = {
  success: (message: string) =>
    toast.success(message, {
      duration: 3000,
    }),

  error: (message: string) =>
    toast.error(message, {
      duration: 5000,
    }),

  info: (message: string) =>
    toast(message, {
      icon: infoIcon,
      duration: 4000,
      style: {
        background: '#fff7ed',
        color: '#7c2d12',
        border: '1px solid #fed7aa',
        borderRadius: '0.75rem',
        boxShadow:
          '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)',
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      },
    }),
}
