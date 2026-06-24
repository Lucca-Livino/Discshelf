'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useAlbumTracks, useSaveReview, useReview, type CatalogAlbum, type Track } from '@/hooks/useCatalog'
import { toast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

function formatDuration(ms: number) {
  const total = Math.floor(ms / 1000)
  const min = Math.floor(total / 60)
  const sec = total % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

interface ReviewModalProps {
  album: CatalogAlbum | null
  open: boolean
  onClose: () => void
}

export function ReviewModal({ album, open, onClose }: ReviewModalProps) {
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set())
  const [monthListened, setMonthListened] = useState('')
  const [recommendedBy, setRecommendedBy] = useState('')
  const [reviewText, setReviewText] = useState('')

  const { data: existingReview, isLoading: reviewLoading } = useReview(
    album?.albumId ?? '',
    open && !!album && album.hasReview
  )

  const { data: tracksData, isLoading: tracksLoading } = useAlbumTracks(
    album?.spotifyId ?? '',
    open && !!album
  )

  const saveReview = useSaveReview()

  // pré-popula quando review existente carrega
  useEffect(() => {
    if (!open || !album) return

    if (album.hasReview && existingReview) {
      setReviewText(existingReview.reviewText ?? '')
      setRecommendedBy(existingReview.recommendedBy ?? '')
      setSelectedTracks(new Set(existingReview.favoriteTracks.map((t) => t.trackId)))
      // monthListened vem como ISO date string, pegar YYYY-MM
      const ml = existingReview.monthListened
      if (ml) {
        setMonthListened(typeof ml === 'string' ? ml.slice(0, 7) : '')
      }
    } else if (!album.hasReview) {
      setReviewText('')
      setRecommendedBy('')
      setSelectedTracks(new Set())
      const now = new Date()
      setMonthListened(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
    }
  }, [open, album, existingReview])

  if (!album) return null

  function toggleTrack(id: string) {
    setSelectedTracks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSave() {
    if (!album) return
    const tracks: Track[] = tracksData ?? []
    const favoriteTracks = tracks
      .filter((t) => selectedTracks.has(t.id))
      .map((t) => ({ trackId: t.id, trackName: t.name }))

    try {
      await saveReview.mutateAsync({
        albumId: album.albumId,
        hasReview: album.hasReview,
        body: {
          reviewText: reviewText || undefined,
          recommendedBy: recommendedBy || undefined,
          monthListened: monthListened || undefined,
          favoriteTracks,
        },
      })
      toast({ title: 'Review salva!' })
      onClose()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
      })
    }
  }

  const isLoading = (album.hasReview && reviewLoading) || tracksLoading

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-[480px] p-0 overflow-hidden rounded-none max-h-[95dvh] overflow-y-auto">
        <DialogTitle className="sr-only">{album.title} — Review</DialogTitle>

        <div className="relative w-full aspect-square shrink-0">
          <Image
            src={album.coverUrl}
            alt={album.title}
            fill
            className="object-cover"
            unoptimized={album.coverUrl.startsWith('http')}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4">
            <p className="text-white font-semibold leading-tight">{album.title}</p>
            <p className="text-white/70 text-sm font-mono">
              {album.artist} · {album.year}
            </p>
          </div>
        </div>

        <div className="p-5 space-y-4 bg-bg-secondary">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-text-muted text-xs mb-1">Month Listened</label>
              <input
                type="month"
                value={monthListened}
                onChange={(e) => setMonthListened(e.target.value)}
                className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle text-text-primary text-sm rounded-[4px] focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-text-muted text-xs mb-1">Recommended by</label>
              <input
                type="text"
                value={recommendedBy}
                onChange={(e) => setRecommendedBy(e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle text-text-primary placeholder-text-muted text-sm rounded-[4px] focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-text-muted text-xs mb-1">Review</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Optional"
              rows={3}
              className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle text-text-primary placeholder-text-muted text-sm rounded-[4px] focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div>
            <label className="block text-text-muted text-xs mb-2">Favorite Tracks</label>
            {isLoading ? (
              <div className="space-y-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-8 bg-bg-elevated animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="max-h-44 overflow-y-auto space-y-px">
                {(tracksData ?? []).map((track) => {
                  const selected = selectedTracks.has(track.id)
                  return (
                    <button
                      key={track.id}
                      onClick={() => toggleTrack(track.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 text-sm transition-colors text-left',
                        selected
                          ? 'bg-accent text-white'
                          : 'bg-bg-elevated text-text-primary hover:bg-white/5'
                      )}
                    >
                      <span className="font-mono text-xs mr-2 opacity-50 shrink-0">
                        {track.trackNumber}.
                      </span>
                      <span className="flex-1 truncate">{track.name}</span>
                      <span className="font-mono text-xs opacity-50 ml-2 shrink-0">
                        {formatDuration(track.durationMs)}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-bg-elevated hover:bg-white/10 text-text-muted text-sm rounded-[4px] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saveReview.isPending || isLoading}
              className="flex-1 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-[4px] transition-colors disabled:opacity-50"
            >
              {saveReview.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
