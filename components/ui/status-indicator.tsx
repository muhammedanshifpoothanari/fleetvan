import { cn } from '@/lib/utils'

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'in-route' | 'on-break' | 'completed' | 'pending' | 'issue'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
  className?: string
}

const statusConfig = {
  online: {
    color: 'bg-ugreen',
    label: 'Online',
    animation: 'animate-pulse',
  },
  'in-route': {
    color: 'bg-blue-500',
    label: 'In Route',
    animation: 'animate-pulse',
  },
  'on-break': {
    color: 'bg-amber-500',
    label: 'On Break',
    animation: '',
  },
  offline: {
    color: 'bg-gray-500',
    label: 'Offline',
    animation: '',
  },
  completed: {
    color: 'bg-ugreen',
    label: 'Completed',
    animation: '',
  },
  pending: {
    color: 'bg-amber-500',
    label: 'Pending',
    animation: 'animate-pulse',
  },
  issue: {
    color: 'bg-red-500',
    label: 'Issue',
    animation: 'animate-pulse',
  },
}

const sizes = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
}

export function StatusIndicator({
  status,
  size = 'md',
  showLabel = false,
  animated = true,
  className,
}: StatusIndicatorProps) {
  const config = statusConfig[status]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          sizes[size],
          'rounded-full',
          config.color,
          animated && config.animation
        )}
      />
      {showLabel && <span className="text-xs text-muted-foreground">{config.label}</span>}
    </div>
  )
}
