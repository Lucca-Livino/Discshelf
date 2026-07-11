'use client'

import Image from 'next/image'
import { Trash2, Mic2, Music } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ListItemCardProps {
  coverUrl: string | null
  primary: string
  secondary?: string
  rounded?: boolean          // artistas: imagem circular
  fallback?: 'artist' | 'track'
  onRemove: () => void
}

export function ListItemCard({
  coverUrl,
  primary,
  secondary,
  rounded,
  fallback,
  onRemove,
}: ListItemCardProps) {
  const FallbackIcon = fallback === 'artist' ? Mic2 : Music
  return (
    <div className="relative group aspect-square">
      <div className={cn('absolute inset-0 overflow-hidden bg-bg-elevated', rounded && 'rounded-full')}>
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={primary}
            fill
            sizes="25vw"
            className="object-cover"
            unoptimized={coverUrl.startsWith('http')}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">
            <FallbackIcon size={28} />
          </div>
        )}
      </div>

      <div
        className={cn(
          'absolute inset-0 bg-black/0 group-hover:bg-black/65 transition-all duration-200 flex flex-col justify-end p-2.5 opacity-0 group-hover:opacity-100',
          rounded && 'rounded-full',
        )}
      >
        <p className="text-white text-xs font-medium leading-tight line-clamp-1 mb-0.5">{primary}</p>
        {secondary && (
          <p className="text-white/70 text-xs leading-tight line-clamp-1">{secondary}</p>
        )}
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
