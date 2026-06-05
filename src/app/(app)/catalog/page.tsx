'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useCatalog, useRemoveFromCatalog, type CatalogAlbum } from '@/hooks/useCatalog'
import { AlbumGrid } from '@/components/album/AlbumGrid'
import { AlbumCard, AlbumCardSkeleton } from '@/components/album/AlbumCard'
import { ReviewModal } from '@/components/album/ReviewModal'
import { SearchBar } from '@/components/search/SearchBar'
import { toast } from '@/hooks/useToast'

export default function CatalogPage() {
  const { data, isLoading } = useCatalog()
  const removeFromCatalog = useRemoveFromCatalog()
  const [reviewAlbum, setReviewAlbum] = useState<CatalogAlbum | null>(null)
  const [showSearch, setShowSearch] = useState(false)

  const albums = data?.data ?? []
  const total = data?.total ?? 0

  const catalogSpotifyIds = new Set(albums.map((a) => a.spotifyId))

  async function handleRemove(albumId: string, title: string) {
    try {
      await removeFromCatalog.mutateAsync(albumId)
      toast({ title: `"${title}" removido do catálogo` })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro ao remover álbum',
      })
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Shelf</h1>
          <p className="text-text-muted text-sm font-mono mt-0.5">{total} albums</p>
        </div>
        <button
          onClick={() => setShowSearch((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-[4px] transition-colors"
        >
          <Plus size={14} />
          Add Album
        </button>
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
      ) : albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-text-muted text-lg mb-2">Sua coleção está vazia</p>
          <p className="text-text-muted text-sm">
            Clique em &quot;Add Album&quot; para começar
          </p>
        </div>
      ) : (
        <AlbumGrid>
          {albums.map((album) => (
            <AlbumCard
              key={album.id}
              title={album.title}
              artist={album.artist}
              coverUrl={album.coverUrl}
              hasReview={album.hasReview}
              onClick={() => setReviewAlbum(album)}
              onRemove={() => handleRemove(album.albumId, album.title)}
            />
          ))}
        </AlbumGrid>
      )}

      <ReviewModal
        album={reviewAlbum}
        open={!!reviewAlbum}
        onClose={() => setReviewAlbum(null)}
      />
    </div>
  )
}
