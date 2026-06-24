'use client'

import Image from 'next/image'
import { Trash2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AlbumCardProps {
  title: string
  artist: string
  coverUrl: string
  hasReview?: boolean
  onClick?: () => void
  onRemove?: () => void
  onAdd?: () => void
  inShelf?: boolean
  disabled?: boolean
  className?: string
}

export function AlbumCard({
  title,
  artist,
  coverUrl,
  hasReview,
  onClick,
  onRemove,
  onAdd,
  inShelf,
  disabled,
  className,
}: AlbumCardProps) {
  return (
    <div
      className={cn('relative group aspect-square cursor-pointer', className)}
      onClick={onClick}
    >
      <Image
        src={coverUrl}
        alt={`${title} by ${artist}`}
        fill
        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 16vw, 12vw"
        className="object-cover"
        unoptimized={coverUrl.startsWith('http')}
      />

      {hasReview && (
        <div className="absolute top-2 right-2 z-10 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
          <Check size={10} strokeWidth={3} className="text-white" />
        </div>
      )}

      {/* hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/65 transition-all duration-200 flex flex-col justify-end p-2.5 opacity-0 group-hover:opacity-100">
        <p className="text-white text-xs font-medium leading-tight line-clamp-1 mb-0.5">{title}</p>
        <p className="text-white/70 text-xs leading-tight line-clamp-1">{artist}</p>

        {onRemove && (
          <div className="mt-2 flex">
            <button
              onClick={(e) => { e.stopPropagation(); onRemove() }}
              className="flex items-center justify-center w-7 h-7 bg-white/10 hover:bg-accent rounded-[4px] transition-colors"
              title="Remover do catálogo"
            >
              <Trash2 size={12} className="text-white" />
            </button>
          </div>
        )}

        {onAdd && (
          <div className="mt-2">
            {inShelf ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 text-white text-xs rounded-[4px]">
                <Check size={10} /> In Shelf
              </span>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onAdd() }}
                disabled={disabled}
                className="inline-flex items-center gap-1 px-2 py-1 bg-accent hover:bg-accent-hover text-white text-xs rounded-[4px] transition-colors disabled:opacity-50"
              >
                + Add to Shelf
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function AlbumCardSkeleton() {
  return <div className="aspect-square bg-bg-elevated animate-pulse" />
}

export function AlbumCardRemovable({
  title,
  artist,
  coverUrl,
  onRemove,
}: {
  title: string
  artist: string
  coverUrl: string
  onRemove: () => void
}) {
  return (
    <div className="relative group aspect-square">
      <Image
        src={coverUrl}
        alt={`${title} by ${artist}`}
        fill
        sizes="25vw"
        className="object-cover"
        unoptimized={coverUrl.startsWith('http')}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/65 transition-all duration-200 flex flex-col justify-end p-2.5 opacity-0 group-hover:opacity-100">
        <p className="text-white text-xs font-medium leading-tight line-clamp-1 mb-0.5">{title}</p>
        <p className="text-white/70 text-xs leading-tight line-clamp-1">{artist}</p>
        <div className="mt-2">
          <button
            onClick={onRemove}
            className="flex items-center justify-center w-7 h-7 bg-white/10 hover:bg-accent rounded-[4px] transition-colors"
            title="Remover da lista"
          >
            <Trash2 size={12} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
