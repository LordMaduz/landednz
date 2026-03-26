import { cn } from '@/lib/utils/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
  children: React.ReactNode
}

const variantStyles = {
  primary: 'bg-primary text-text-inverse hover:bg-primary-hover',
  secondary: 'bg-secondary text-text-primary hover:bg-secondary-hover',
  outline: 'border border-primary bg-transparent text-primary hover:bg-primary-subtle',
  text: 'bg-transparent text-primary hover:bg-primary-subtle',
  destructive: 'bg-error text-text-inverse hover:bg-error-hover',
} as const

const sizeStyles = {
  sm: 'px-3 py-2 text-secondary',
  md: 'px-4 py-3 text-body',
  lg: 'px-6 py-4 text-body',
} as const

function Spinner() {
  return (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-button',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}