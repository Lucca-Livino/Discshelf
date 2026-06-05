import Image from 'next/image'
import Link from 'next/link'
import type { AlbumList } from '@/hooks/useLists'

interface ListCardProps {
  list: AlbumList
}

export function ListCard({ list }: ListCardProps) {
  const covers = list.albums.slice(0, 4)

  return (
    <Link
      href={`/lists/${list.id}`}
      className="flex items-center gap-4 px-4 py-3 bg-bg-secondary border border-border-subtle hover:bg-bg-elevated transition-colors group"
    >
      <div className="relative w-14 h-14 shrink-0">
        {covers.length === 0 ? (
          <div className="w-full h-full bg-bg-elevated flex items-center justify-center">
            <span className="text-text-muted text-xs">Empty</span>
          </div>
        ) : covers.length === 1 ? (
          <Image
            src={covers[0].coverUrl}
            alt={covers[0].title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="relative w-full h-full">
            {covers.map((cover, i) => (
              <div
                key={i}
                className="absolute w-9 h-9 border border-bg-primary"
                style={{
                  top: i < 2 ? 0 : undefined,
                  bottom: i >= 2 ? 0 : undefined,
                  left: i % 2 === 0 ? 0 : undefined,
                  right: i % 2 === 1 ? 0 : undefined,
                  zIndex: i + 1,
                }}
              >
                <Image
                  src={cover.coverUrl}
                  alt={cover.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-text-primary font-medium text-sm group-hover:text-white transition-colors truncate">
          {list.name}
        </p>
        <p className="text-text-muted text-xs font-mono mt-0.5">
          {list.albumCount} album{list.albumCount !== 1 ? 's' : ''}
        </p>
      </div>

      <span className="text-text-muted text-xs">→</span>
    </Link>
  )
}

export function ListCardSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-bg-secondary border border-border-subtle">
      <div className="w-14 h-14 bg-bg-elevated animate-pulse shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-bg-elevated animate-pulse w-2/3" />
        <div className="h-3 bg-bg-elevated animate-pulse w-1/4" />
      </div>
    </div>
  )
}
