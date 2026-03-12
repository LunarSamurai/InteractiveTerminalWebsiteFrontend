import { cn } from '../../lib/utils'
import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

export default function Card({ hover = true, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-surface-light border border-white/5 p-6',
        hover && 'transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
