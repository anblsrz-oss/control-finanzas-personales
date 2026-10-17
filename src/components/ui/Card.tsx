import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  id?: string
}

export function Card({ children, className = '', id }: CardProps) {
  return (
    <div
      id={id}
      className={`rounded-lg border border-slate-200 dark:border-slate-700/70 bg-surface p-5 shadow-[0_1px_2px_rgb(8_13_32/0.06)] ${className}`}
    >
      {children}
    </div>
  )
}
