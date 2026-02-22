'use client'


interface LogoProps {
  className?: string
  iconClassName?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Logo({ className, iconClassName, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg border-2',
    md: 'w-10 h-10 rounded-xl border-2',
    lg: 'w-12 h-12 rounded-xl border-2',
    xl: 'w-16 h-16 rounded-2xl border-2',
  }

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 28,
    xl: 36,
  }

  return (
    <div
      className={`bg-primary border-primary flex items-center justify-center shadow-lg shadow-black/5 transition-transform duration-300 ${sizeClasses[size]} ${className || ''}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={iconSizes[size]}
        height={iconSizes[size]}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={iconClassName || 'text-primary-foreground'}
      >
        <path d="M17 21H7a2 2 0 0 1-2-2v-3a2 2 0 1 1 2-2 2 2 0 0 1 2-2 5 5 0 1 1 6 0 2 2 0 0 1 2 2 2 2 0 0 1 2 2v3a2 2 0 0 1-2 2Z" />
        <path d="M19 16H5" />
        <path d="M7 21v-5" />
        <path d="M17 21v-5" />
      </svg>
    </div>
  )
}
