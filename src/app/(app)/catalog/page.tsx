'use client'

import { useState, useMemo, useEffect } from 'react'
import { Plus, ArrowUpDown } from 'lucide-react'
import {
  useCatalogAll,
  useReorderCatalog,
  useRemoveFromCatalog,
  type CatalogAlbum,
} from '@/hooks/useCatalog'
import { AlbumGrid } from '@/components/album/AlbumGrid'
import { AlbumCard, AlbumCardSkeleton } from '@/components/album/AlbumCard'
import { SortableGrid } from '@/components/dnd/SortableGrid'
import { ReviewModal } from '@/components/album/ReviewModal'
import { SearchBar } from '@/components/search/SearchBar'
import { toast } from '@/hooks/useToast'

type SortKey =
  | 'custom'
  | 'addedAt_desc'
  | 'addedAt_asc'
  | 'title_asc'
  | 'title_desc'
  | 'artist_asc'
  | 'year_desc'
  | 'year_asc'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'custom',       label: 'Minha ordem' },
  { value: 'addedAt_desc', label: 'Recently Added' },
  { value: 'addedAt_asc',  label: 'Oldest Added' },
  { value: 'title_asc',    label: 'Title A → Z' },
  { value: 'title_desc',   label: 'Title Z → A' },
  { value: 'artist_asc',   label: 'Artist A → Z' },
  { value: 'year_desc',    label: 'Year (Newest)' },
  { value: 'year_asc',     label: 'Year (Oldest)' },
]

function sortAlbums(albums: CatalogAlbum[], key: SortKey): CatalogAlbum[] {
  const sorted = [...albums]
  switch (key) {
    case 'custom':       return sorted // já vem na ordem custom (position) do backend
    case 'addedAt_desc': return sorted.sort((a, b) => b.addedAt.localeCompare(a.addedAt))
    case 'addedAt_asc':  return sorted.sort((a, b) => a.addedAt.localeCompare(b.addedAt))
    case 'title_asc':    return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'title_desc':   return sorted.sort((a, b) => b.title.localeCompare(a.title))
    case 'artist_asc':   return sorted.sort((a, b) => a.artist.localeCompare(b.artist))
    case 'year_desc':    return sorted.sort((a, b) => b.year - a.year)
    case 'year_asc':     return sorted.sort((a, b) => a.year - b.year)
  }
}

export default function CatalogPage() {
  const { data, isLoading } = useCatalogAll()
  const reorderCatalog = useReorderCatalog()
  const removeFromCatalog = useRemoveFromCatalog()
  const [reviewAlbum, setReviewAlbum] = useState<CatalogAlbum | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('custom')

  // ordem custom (position) mantida localmente — fonte de verdade pro drag
  const [order, setOrder] = useState<CatalogAlbum[]>([])
  useEffect(() => {
    if (data?.data) setOrder(data.data)
  }, [data])

  const total = order.length
  const displayed = useMemo(() => sortAlbums(order, sortKey), [order, sortKey])
  const catalogSpotifyIds = useMemo(
    () => new Set(order.map((a) => a.spotifyId)),
    [order],
  )

  function handleReorder(next: CatalogAlbum[]) {
    setOrder(next)          // otimista
    setSortKey('custom')    // arrastar sempre vira ordem custom
    reorderCatalog.mutate(next.map((a) => a.id), {
      onError: () => toast({ variant: 'destructive', title: 'Erro ao salvar ordem' }),
    })
  }

  async function handleRemove(entryId: string, albumId: string, title: string) {
    setOrder((prev) => prev.filter((a) => a.id !== entryId)) // otimista
    try {
      await removeFromCatalog.mutateAsync(albumId)
      toast({ title: `"${title}" removido do catálogo` })
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao remover álbum' })
    }
  }

  function renderCard(album: CatalogAlbum) {
    return (
      <AlbumCard
        title={album.title}
        artist={album.artist}
        coverUrl={album.coverUrl}
        hasReview={album.hasReview}
        onClick={() => setReviewAlbum(album)}
        onRemove={() => handleRemove(album.id, album.albumId, album.title)}
      />
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Shelf</h1>
          <p className="text-text-muted text-sm font-mono mt-0.5">{total} albums</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <ArrowUpDown size={13} className="absolute left-2.5 text-text-muted pointer-events-none" />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="pl-8 pr-3 py-2 text-sm bg-bg-elevated border border-border-subtle rounded-[4px] text-text-primary appearance-none cursor-pointer hover:border-accent transition-colors focus:outline-none focus:border-accent"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowSearch((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-[4px] transition-colors"
          >
            <Plus size={14} />
            Add Album
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="mb-4 md:mb-6">
          <SearchBar
            catalogSpotifyIds={catalogSpotifyIds}
            onClose={() => setShowSearch(false)}
          />
        </div>
      )}

      {isLoading ? (
        <AlbumGrid>
          {Array.from({ length: 24 }).map((_, i) => (
            <AlbumCardSkeleton key={i} />
          ))}
        </AlbumGrid>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-text-muted text-lg mb-2">Sua coleção está vazia</p>
          <p className="text-text-muted text-sm">
            Clique em &quot;Add Album&quot; para começar
          </p>
        </div>
      ) : (
        <SortableGrid items={displayed} onReorder={handleReorder} renderItem={renderCard} />
      )}

      <ReviewModal
        album={reviewAlbum}
        open={!!reviewAlbum}
        onClose={() => setReviewAlbum(null)}
      />
    </div>
  )
}
