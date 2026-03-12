import { cn } from '../../lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer text-center whitespace-normal gap-2',
        {
          'bg-gradient-to-b from-primary to-primary-dark text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 active:scale-[0.98] rounded-xl':
            variant === 'primary',
          'bg-white/[0.04] text-white/90 hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/15 rounded-xl backdrop-blur-sm':
            variant === 'secondary',
          'text-white/60 hover:text-white hover:bg-white/5 rounded-lg': variant === 'ghost',
        },
        {
          'px-4 py-2 text-sm': size === 'sm',
          'px-6 py-2.5 text-sm': size === 'md',
          'px-8 py-3.5 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
