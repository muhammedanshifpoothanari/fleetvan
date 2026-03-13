import { cn } from '@/lib/utils'

interface LoadingStateProps {
  text?: string
  fullHeight?: boolean
  className?: string
}

export function LoadingState({
  text = 'Loading...',
  fullHeight = false,
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullHeight && 'h-full',
        className
      )}
    >
      <div className="relative w-10 h-10">
        <div
          className="absolute inset-0 rounded-full border-4 border-muted"
        />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-accent animate-spin"
        />
      </div>
      {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
    </div>
  )
}
