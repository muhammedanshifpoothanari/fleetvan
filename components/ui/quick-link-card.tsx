import { cn } from '@/lib/utils'

interface QuickLinkCardProps {
  icon: React.ReactNode
  label: string
  description?: string
  onClick?: () => void
  variant?: 'default' | 'elevated' | 'subtle'
  className?: string
}

const variantStyles = {
  default: 'bg-card border border-border hover:border-border hover:bg-muted',
  elevated: 'bg-card shadow-lg hover:shadow-xl dark:shadow-black/40',
  subtle: 'bg-muted hover:bg-muted/80',
}

export function QuickLinkCard({
  icon,
  label,
  description,
  onClick,
  variant = 'default',
  className,
}: QuickLinkCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-2xl p-4 transition-all duration-200 active:scale-95',
        variantStyles[variant],
        className
      )}
    >
      <div className="text-3xl text-accent">{icon}</div>
      <span className="text-sm font-semibold text-foreground text-center">{label}</span>
      {description && (
        <span className="text-xs text-muted-foreground text-center">{description}</span>
      )}
    </button>
  )
}
