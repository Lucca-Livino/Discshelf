'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Search, X } from 'lucide-react'
import { useSearch, type SearchResult } from '@/hooks/useSearch'
import { useAddToCatalog } from '@/hooks/useCatalog'
import { toast } from '@/hooks/useToast'

interface SearchBarProps {
  catalogSpotifyIds?: Set<string>
  onClose?: () => void
  listId?: string
  onAddToList?: (spotifyId: string) => void
  addingToListId?: string | null
}

export function SearchBar({
  catalogSpotifyIds = new Set(),
  onClose,
  listId,
  onAddToList,
  addingToListId,
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [addingId, setAddingId] = useState<string | null>(null)

  const { data, isFetching } = useSearch(debouncedQuery)
  const addToCatalog = useAddToCatalog()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400)
    return () => clearTimeout(timer)
  }, [query])

  const handleAdd = useCallback(async (spotifyId: string) => {
    if (onAddToList) { onAddToList(spotifyId); return }
    setAddingId(spotifyId)
    try {
      await addToCatalog.mutateAsync({ spotifyId })
      toast({ title: 'Álbum adicionado ao catálogo!' })
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao adicionar' })
    } finally {
      setAddingId(null)
    }
  }, [addToCatalog, onAddToList])

  const results: SearchResult[] = data ?? []

  return (
    <div className="w-full">
      <div className="relative flex items-center">
        <Search size={16} className="absolute left-3 text-text-muted pointer-events-none" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search albums or artists..."
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
                  <div className="w-10 h-10 bg-bg-elevated animate-pulse shrink-0" />
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
              {results.map((album) => {
                const inShelf = catalogSpotifyIds.has(album.spotifyId)
                const isAdding = addingId === album.spotifyId || addingToListId === album.spotifyId
                return (
                  <div key={album.spotifyId} className="flex items-center gap-3 px-3 py-2.5 hover:bg-bg-elevated transition-colors">
                    <div className="relative w-10 h-10 shrink-0">
                      <Image src={album.coverUrl} alt={album.title} fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium truncate">{album.title}</p>
                      <p className="text-text-muted text-xs font-mono truncate">
                        {album.artist} · {album.year}
                      </p>
                    </div>
                    {inShelf && !listId ? (
                      <span className="text-text-muted text-xs px-2 py-1 border border-border-subtle rounded-[4px] shrink-0">
                        In Shelf
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAdd(album.spotifyId)}
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
