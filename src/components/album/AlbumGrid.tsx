import { cn } from '@/lib/utils'

interface AlbumGridProps {
  children: React.ReactNode
  className?: string
}

export function AlbumGrid({ children, className }: AlbumGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-0.5 sm:gap-1',
        className
      )}
    >
      {children}
    </div>
  )
}
