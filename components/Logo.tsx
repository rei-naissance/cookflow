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
      className={`bg-primary border-primary flex items-center justify-center shadow-lg shadow-black/5 transition-all duration-300 hover:rotate-3 hover:scale-105 hover:shadow-primary/20 ${sizeClasses[size]} ${className || ''}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={iconSizes[size]}
        height={iconSizes[size]}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={iconClassName || 'text-primary-foreground'}
      >
        {/* Pan Handle */}
        <line x1="2" y1="16" x2="6" y2="16" />
        {/* Pan Body */}
        <path d="M6 16 H20 C20 19.5 17 22 13 22 C9 22 6 19.5 6 16 Z" />
        {/* Egg White */}
        <path d="M9 7 C9 4.5 12 3 14.5 3 C17.5 3 20 5 20 7.5 C20 10 17 11.5 13.5 11.5 C10.5 11.5 9 9.5 9 7 Z" />
        {/* Egg Yolk */}
        <circle cx="14.5" cy="7.5" r="1.5" />
        {/* Motion/Flip Lines */}
        <path d="M10 14 C10 13 11 11.5 12 11" />
        <path d="M17 14 C17 13 16 11.5 15 11" />
      </svg>
    </div>
  )
}
