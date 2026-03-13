import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  className?: string
}

const variantStyles = {
  default: 'bg-card border border-border',
  success: 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800',
  warning: 'bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800',
  error: 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800',
  info: 'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800',
}

export function StatCard({
  label,
  value,
  subtitle,
  icon,
  variant = 'default',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-4 flex flex-col gap-2',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {label}
        </span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        {subtitle && (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        )}
      </div>
    </div>
  )
}
