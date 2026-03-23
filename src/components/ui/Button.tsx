'use client'

import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  style,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none select-none'

  const variantClass = {
    primary: 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-900/40',
    secondary: 'border font-semibold',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'text-violet-500 hover:text-violet-400',
  }[variant]

  const variantStyle =
    variant === 'secondary'
      ? { background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--fg)' }
      : variant === 'ghost'
      ? { background: 'transparent' }
      : {}

  const sizes = {
    sm: 'text-sm px-3 py-2 min-h-[36px]',
    md: 'text-base px-4 py-3 min-h-[44px]',
    lg: 'text-lg px-6 py-4 min-h-[52px]',
  }

  return (
    <button
      className={`${base} ${variantClass} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      style={{ ...variantStyle, ...style }}
      {...props}
    >
      {children}
    </button>
  )
}
