import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const styles: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-600/50 disabled:shadow-none',
  secondary:
    'bg-surface text-brand-700 dark:text-brand-500 border border-slate-300 dark:border-slate-600 hover:border-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800 disabled:opacity-50',
  ghost:
    'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50',
  danger:
    'bg-line-scarlet text-white shadow-sm hover:brightness-90 disabled:opacity-50 disabled:shadow-none dark:text-slate-950',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-[background-color,border-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 ${sizes[size]} ${styles[variant]} ${className}`}
      {...props}
    />
  )
}
