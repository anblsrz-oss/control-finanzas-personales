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
      className={`rounded-xl border border-slate-200 dark:border-slate-700 bg-surface p-5 shadow-sm ${className}`}
    >
      {children}
    </div>
  )
}
