'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Clock, Trash2, BookOpen, Shuffle } from 'lucide-react'
import { useWaitlist, useRemoveFromWaitlist } from '@/hooks/useWaitlist'
import { useAddToCatalog } from '@/hooks/useCatalog'
import { toast } from '@/hooks/useToast'
import { AlbumGrid } from '@/components/album/AlbumGrid'
import { AlbumCard, AlbumCardSkeleton } from '@/components/album/AlbumCard'
import { AlbumRoulette } from '@/components/waitlist/AlbumRoulette'

function WaitlistCardSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-bg-secondary border border-border-subtle">
      <div className="w-12 h-12 bg-bg-elevated animate-pulse shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-bg-elevated animate-pulse w-3/4" />
        <div className="h-3 bg-bg-elevated animate-pulse w-1/2" />
      </div>
    </div>
  )
}

export default function WaitlistPage() {
  const { data: entries, isLoading } = useWaitlist()
  const removeFromWaitlist = useRemoveFromWaitlist()
  const addToCatalog = useAddToCatalog()
  const [rouletteOpen, setRouletteOpen] = useState(false)

  async function handleAddToShelf(spotifyId: string, albumId: string, title: string) {
    try {
      await addToCatalog.mutateAsync({ spotifyId })
      toast({ title: `"${title}" adicionado ao catálogo!` })
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao adicionar ao catálogo' })
    }
  }

  async function handleRemove(albumId: string) {
    try {
      await removeFromWaitlist.mutateAsync(albumId)
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao remover' })
    }
  }

  const items = entries ?? []

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Listening Queue</h1>
          <p className="text-text-muted text-sm font-mono mt-0.5">
            {isLoading ? '—' : items.length} álbum{items.length !== 1 ? 's' : ''}
          </p>
        </div>

        {!isLoading && (
          <button
            onClick={() => setRouletteOpen(true)}
            disabled={items.length < 2}
            className="flex items-center gap-2 px-3 py-2 bg-bg-elevated hover:bg-bg-secondary border border-border-subtle text-text-primary text-sm rounded-[4px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Shuffle size={14} />
            Sortear
          </button>
        )}
      </div>

      {rouletteOpen && (
        <AlbumRoulette
          items={items}
          onClose={() => setRouletteOpen(false)}
          onAddToShelf={handleAddToShelf}
        />
      )}

      {isLoading ? (
        <>
          {/* Desktop skeleton */}
          <div className="hidden md:block">
            <AlbumGrid>
              {Array.from({ length: 12 }).map((_, i) => <AlbumCardSkeleton key={i} />)}
            </AlbumGrid>
          </div>
          {/* Mobile skeleton */}
          <div className="md:hidden space-y-px max-w-2xl">
            {Array.from({ length: 4 }).map((_, i) => <WaitlistCardSkeleton key={i} />)}
          </div>
        </>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Clock size={40} className="text-text-muted mb-3 opacity-30" />
          <p className="text-text-muted text-lg mb-1">Lista de espera vazia</p>
          <p className="text-text-muted text-sm">
            Pesquise um álbum e clique em &quot;+ Waitlist&quot; para adicionar
          </p>
        </div>
      ) : (
        <>
          {/* Desktop grid — igual à shelf */}
          <div className="hidden md:block">
            <AlbumGrid>
              {items.map((entry) => (
                <AlbumCard
                  key={entry.id}
                  title={entry.album.title}
                  artist={entry.album.artist}
                  coverUrl={entry.album.coverUrl}
                  onRemove={() => handleRemove(entry.albumId)}
                  onAdd={() => handleAddToShelf(entry.album.spotifyId, entry.albumId, entry.album.title)}
                  inShelf={false}
                />
              ))}
            </AlbumGrid>
          </div>

          {/* Mobile list */}
          <div className="md:hidden space-y-px max-w-2xl">
            {items.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 px-4 py-3 bg-bg-secondary border border-border-subtle hover:bg-bg-elevated transition-colors group"
              >
                <div className="relative w-12 h-12 shrink-0">
                  <Image
                    src={entry.album.coverUrl}
                    alt={entry.album.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-medium truncate">
                    {entry.album.title}
                  </p>
                  <p className="text-text-muted text-xs font-mono truncate">
                    {entry.album.artist} · {entry.album.year}
                  </p>
                  {entry.recommendedBy && (
                    <p className="text-accent text-xs mt-0.5 truncate">
                      recomendado por {entry.recommendedBy}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => handleAddToShelf(entry.album.spotifyId, entry.albumId, entry.album.title)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs rounded-[4px] transition-colors"
                    title="Adicionar ao catálogo"
                  >
                    <BookOpen size={12} />
                    Add to Shelf
                  </button>
                  <button
                    onClick={() => handleRemove(entry.albumId)}
                    className="flex items-center justify-center w-7 h-7 bg-bg-primary hover:bg-accent text-text-muted hover:text-white rounded-[4px] transition-colors"
                    title="Remover da lista"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
