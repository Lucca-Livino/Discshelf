'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Search, X, Disc, Mic2, Music } from 'lucide-react'
import {
  useSearch,
  useSearchArtists,
  useSearchTracks,
} from '@/hooks/useSearch'
import { useAddToCatalog } from '@/hooks/useCatalog'
import type { ListType } from '@/hooks/useLists'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/useToast'

interface NormalizedResult {
  spotifyId: string
  primary: string
  secondary: string
  coverUrl: string | null
}

interface SearchBarProps {
  kind?: ListType
  catalogSpotifyIds?: Set<string>
  onClose?: () => void
  listId?: string
  onAddToList?: (spotifyId: string) => void
  addingToListId?: string | null
}

const PLACEHOLDER: Record<ListType, string> = {
  album: 'Search albums...',
  artist: 'Search artists...',
  track: 'Search tracks...',
}

const EMPTY_ICON: Record<ListType, typeof Disc> = {
  album: Disc,
  artist: Mic2,
  track: Music,
}

export function SearchBar({
  kind = 'album',
  catalogSpotifyIds = new Set(),
  onClose,
  listId,
  onAddToList,
  addingToListId,
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [addingId, setAddingId] = useState<string | null>(null)

  const albumSearch = useSearch(kind === 'album' ? debouncedQuery : '')
  const artistSearch = useSearchArtists(kind === 'artist' ? debouncedQuery : '')
  const trackSearch = useSearchTracks(kind === 'track' ? debouncedQuery : '')

  const active =
    kind === 'artist' ? artistSearch : kind === 'track' ? trackSearch : albumSearch
  const isFetching = active.isFetching

  const addToCatalog = useAddToCatalog()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400)
    return () => clearTimeout(timer)
  }, [query])

  const handleAdd = useCallback(
    async (spotifyId: string) => {
      if (onAddToList) {
        onAddToList(spotifyId)
        return
      }
      setAddingId(spotifyId)
      try {
        await addToCatalog.mutateAsync({ spotifyId })
        toast({ title: 'Álbum adicionado ao catálogo!' })
      } catch {
        toast({ variant: 'destructive', title: 'Erro ao adicionar' })
      } finally {
        setAddingId(null)
      }
    },
    [addToCatalog, onAddToList],
  )

  const results: NormalizedResult[] = normalize(kind, active.data)
  const rounded = kind === 'artist'
  const EmptyIcon = EMPTY_ICON[kind]

  return (
    <div className="w-full">
      <div className="relative flex items-center">
        <Search size={16} className="absolute left-3 text-text-muted pointer-events-none" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={PLACEHOLDER[kind]}
          className="w-full pl-9 pr-10 py-2.5 bg-bg-elevated border border-border-subtle text-text-primary placeholder-text-muted text-sm rounded-[4px] focus:outline-none focus:border-accent transition-colors"
        />
        {onClose && (
          <button onClick={onClose} className="absolute right-3 text-text-muted hover:text-text-primary">
            <X size={16} />
          </button>
        )}
      </div>

      {debouncedQuery.length >= 2 && (
        <div className="mt-2 bg-bg-secondary border border-border-subtle max-h-[60vh] overflow-y-auto">
          {isFetching ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className={cn('w-10 h-10 bg-bg-elevated animate-pulse shrink-0', rounded && 'rounded-full')} />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-bg-elevated animate-pulse w-3/4" />
                    <div className="h-3 bg-bg-elevated animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-text-muted text-sm text-center">
              Nenhum resultado para &quot;{debouncedQuery}&quot;
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {results.map((r) => {
                const inShelf = kind === 'album' && catalogSpotifyIds.has(r.spotifyId)
                const isAdding = addingId === r.spotifyId || addingToListId === r.spotifyId
                return (
                  <div key={r.spotifyId} className="flex items-center gap-3 px-3 py-2.5 hover:bg-bg-elevated transition-colors">
                    <div className={cn('relative w-10 h-10 shrink-0 overflow-hidden bg-bg-elevated', rounded && 'rounded-full')}>
                      {r.coverUrl ? (
                        <Image src={r.coverUrl} alt={r.primary} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted">
                          <EmptyIcon size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium truncate">{r.primary}</p>
                      {r.secondary && (
                        <p className="text-text-muted text-xs font-mono truncate">{r.secondary}</p>
                      )}
                    </div>
                    {inShelf && !listId ? (
                      <span className="text-text-muted text-xs px-2 py-1 border border-border-subtle rounded-[4px] shrink-0">
                        In Shelf
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAdd(r.spotifyId)}
                        disabled={isAdding}
                        className="text-xs px-2.5 py-1 bg-accent hover:bg-accent-hover text-white rounded-[4px] transition-colors disabled:opacity-50 shrink-0"
                      >
                        {isAdding ? '...' : listId ? '+ Add' : '+ Add to Shelf'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function normalize(kind: ListType, data: unknown): NormalizedResult[] {
  if (!Array.isArray(data)) return []
  if (kind === 'artist') {
    return data.map((a) => ({
      spotifyId: a.spotifyId,
      primary: a.name,
      secondary: a.genre ?? '',
      coverUrl: a.imageUrl ?? null,
    }))
  }
  if (kind === 'track') {
    return data.map((t) => ({
      spotifyId: t.spotifyId,
      primary: t.name,
      secondary: [t.artist, t.albumTitle].filter(Boolean).join(' · '),
      coverUrl: t.coverUrl ?? null,
    }))
  }
  return data.map((al) => ({
    spotifyId: al.spotifyId,
    primary: al.title,
    secondary: `${al.artist} · ${al.year}`,
    coverUrl: al.coverUrl ?? null,
  }))
}
