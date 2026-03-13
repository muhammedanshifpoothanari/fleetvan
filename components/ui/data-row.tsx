import { cn } from '@/lib/utils'

interface DataRowProps {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
  action?: React.ReactNode
  divider?: boolean
  className?: string
}

export function DataRow({
  label,
  value,
  icon,
  action,
  divider = true,
  className,
}: DataRowProps) {
  return (
    <>
      <div
        className={cn(
          'flex items-center justify-between py-3 px-4 rounded-lg gap-3',
          'bg-muted/30 hover:bg-muted/50 transition-colors',
          className
        )}
      >
        <div className="flex items-center gap-3 flex-1">
          {icon && <div className="text-muted-foreground shrink-0">{icon}</div>}
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{value}</span>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>
      {divider && <div className="h-px bg-border" />}
    </>
  )
}
