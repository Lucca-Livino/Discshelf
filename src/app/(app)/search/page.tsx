'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Search, Clock } from 'lucide-react'
import { useSearch } from '@/hooks/useSearch'
import { useCatalog, useAddToCatalog } from '@/hooks/useCatalog'
import { useWaitlist, useAddToWaitlist } from '@/hooks/useWaitlist'
import { toast } from '@/hooks/useToast'

interface WaitlistFormState {
  spotifyId: string
  value: string
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [addingShelfId, setAddingShelfId] = useState<string | null>(null)
  const [addingQueueId, setAddingQueueId] = useState<string | null>(null)
  const [queueForm, setQueueForm] = useState<WaitlistFormState | null>(null)

  const { data: catalogData } = useCatalog()
  const { data: waitlistData } = useWaitlist()
  const { data: searchResults, isFetching } = useSearch(debouncedQuery)
  const addToCatalog = useAddToCatalog()
  const addToWaitlist = useAddToWaitlist()

  const catalogSpotifyIds = new Set((catalogData?.data ?? []).map((a) => a.spotifyId))
  const waitlistSpotifyIds = new Set((waitlistData ?? []).map((e) => e.album.spotifyId))

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400)
    return () => clearTimeout(t)
  }, [query])

  async function handleAddToShelf(spotifyId: string) {
    setAddingShelfId(spotifyId)
    try {
      await addToCatalog.mutateAsync({ spotifyId })
      toast({ title: 'Álbum adicionado ao catálogo!' })
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao adicionar' })
    } finally {
      setAddingShelfId(null)
    }
  }

  async function handleConfirmQueue(spotifyId: string, recommendedBy: string) {
    setQueueForm(null)
    setAddingQueueId(spotifyId)
    try {
      await addToWaitlist.mutateAsync({ spotifyId, recommendedBy: recommendedBy || undefined })
      toast({ title: 'Adicionado à lista de espera!' })
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao adicionar à lista de espera' })
    } finally {
      setAddingQueueId(null)
    }
  }

  const results = searchResults ?? []

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-text-primary mb-4 md:mb-6">Search</h1>

      <div className="relative flex items-center mb-4 md:mb-6">
        <Search size={18} className="absolute left-3 text-text-muted pointer-events-none" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search albums or artists..."
          className="w-full max-w-xl pl-10 pr-4 py-3 bg-bg-elevated border border-border-subtle text-text-primary placeholder-text-muted text-sm rounded-[4px] focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {debouncedQuery.length < 2 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Search size={40} className="text-text-muted mb-3 opacity-30" />
          <p className="text-text-muted text-sm">Digite para buscar álbuns</p>
        </div>
      ) : isFetching ? (
        <>
          {/* skeleton mobile */}
          <div className="sm:hidden space-y-px">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-center px-0 py-3 bg-bg-secondary border border-border-subtle">
                <div className="w-12 h-12 bg-bg-elevated animate-pulse shrink-0 ml-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-bg-elevated animate-pulse w-3/4" />
                  <div className="h-3 bg-bg-elevated animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
          {/* skeleton desktop */}
          <div className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-6 gap-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square bg-bg-elevated animate-pulse" />
            ))}
          </div>
        </>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-text-muted text-lg mb-2">Nenhum resultado</p>
          <p className="text-text-muted text-sm">Tente outros termos de busca</p>
        </div>
      ) : (
        <>
          {/* Lista mobile */}
          <div className="sm:hidden divide-y divide-border-subtle border border-border-subtle bg-bg-secondary">
            {results.map((album) => {
              const inShelf = catalogSpotifyIds.has(album.spotifyId)
              const inQueue = waitlistSpotifyIds.has(album.spotifyId)
              const isAddingShelf = addingShelfId === album.spotifyId
              const isAddingQueue = addingQueueId === album.spotifyId
              const isPendingQueue = queueForm?.spotifyId === album.spotifyId

              return (
                <div key={album.spotifyId} className="flex flex-col">
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <div className="relative w-11 h-11 shrink-0">
                      <Image src={album.coverUrl} alt={album.title} fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium truncate">{album.title}</p>
                      <p className="text-text-muted text-xs font-mono truncate">{album.artist} · {album.year}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {inShelf ? (
                        <span className="text-text-muted text-xs px-2 py-1 border border-border-subtle rounded-[4px]">In Shelf</span>
                      ) : (
                        <button
                          onClick={() => handleAddToShelf(album.spotifyId)}
                          disabled={isAddingShelf}
                          className="text-xs px-2.5 py-1 bg-accent hover:bg-accent-hover text-white rounded-[4px] disabled:opacity-50"
                        >
                          {isAddingShelf ? '...' : '+ Shelf'}
                        </button>
                      )}
                      {inQueue ? (
                        <span className="flex items-center justify-center w-7 h-7 border border-border-subtle rounded-[4px]">
                          <Clock size={12} className="text-text-muted" />
                        </span>
                      ) : (
                        <button
                          onClick={() => setQueueForm(isPendingQueue ? null : { spotifyId: album.spotifyId, value: '' })}
                          disabled={isAddingQueue}
                          className={`flex items-center justify-center w-7 h-7 border rounded-[4px] transition-colors ${isPendingQueue ? 'border-accent text-accent' : 'border-border-subtle text-text-muted'}`}
                        >
                          <Clock size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  {isPendingQueue && (
                    <div className="flex items-center gap-2 px-3 pb-2.5">
                      <input
                        autoFocus
                        type="text"
                        value={queueForm!.value}
                        onChange={(e) => setQueueForm({ ...queueForm!, value: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleConfirmQueue(album.spotifyId, queueForm!.value)
                          if (e.key === 'Escape') setQueueForm(null)
                        }}
                        placeholder="Recomendado por... (opcional)"
                        className="flex-1 px-2.5 py-1.5 bg-bg-elevated border border-border-subtle text-text-primary placeholder-text-muted text-xs rounded-[4px] focus:outline-none focus:border-accent"
                      />
                      <button onClick={() => handleConfirmQueue(album.spotifyId, queueForm!.value)} className="px-2.5 py-1.5 bg-accent text-white text-xs rounded-[4px]">OK</button>
                      <button onClick={() => setQueueForm(null)} className="px-2.5 py-1.5 bg-bg-elevated text-text-muted text-xs rounded-[4px]">✕</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Grid desktop */}
          <div className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-6 gap-1">
          {results.map((album) => {
            const inShelf = catalogSpotifyIds.has(album.spotifyId)
            const inQueue = waitlistSpotifyIds.has(album.spotifyId)
            const isAddingShelf = addingShelfId === album.spotifyId
            const isAddingQueue = addingQueueId === album.spotifyId
            const isPendingQueue = queueForm?.spotifyId === album.spotifyId

            return (
              <div key={album.spotifyId} className="relative group aspect-square">
                <Image
                  src={album.coverUrl}
                  alt={album.title}
                  fill
                  sizes="25vw"
                  className="object-cover"
                  unoptimized
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/70 transition-all duration-200 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-2">
                  <p className="text-white text-xs font-medium leading-tight line-clamp-1 mb-0.5">{album.title}</p>
                  <p className="text-white/70 text-xs leading-tight line-clamp-1 font-mono mb-2">{album.artist}</p>

                  {isPendingQueue ? (
                    <div className="flex flex-col gap-1">
                      <input
                        autoFocus
                        type="text"
                        value={queueForm!.value}
                        onChange={(e) => setQueueForm({ ...queueForm!, value: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleConfirmQueue(album.spotifyId, queueForm!.value)
                          if (e.key === 'Escape') setQueueForm(null)
                        }}
                        placeholder="Recomendado por..."
                        className="w-full px-2 py-1 bg-black/60 border border-white/20 text-white placeholder-white/40 text-xs rounded-[4px] focus:outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleConfirmQueue(album.spotifyId, queueForm.value) }}
                          className="flex-1 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded-[4px] transition-colors"
                        >
                          OK
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setQueueForm(null) }}
                          className="flex-1 py-1 bg-white/10 hover:bg-white/20 text-white/70 text-xs rounded-[4px] transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      {inShelf ? (
                        <span className="flex-1 text-center py-1 bg-white/10 text-white/60 text-xs rounded-[4px]">
                          In Shelf
                        </span>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAddToShelf(album.spotifyId) }}
                          disabled={isAddingShelf}
                          className="flex-1 py-1 bg-accent hover:bg-accent-hover text-white text-xs rounded-[4px] transition-colors disabled:opacity-50"
                        >
                          {isAddingShelf ? '...' : '+ Shelf'}
                        </button>
                      )}

                      {inQueue ? (
                        <span className="flex items-center justify-center w-7 bg-white/10 rounded-[4px]">
                          <Clock size={10} className="text-white/60" />
                        </span>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); setQueueForm({ spotifyId: album.spotifyId, value: '' }) }}
                          disabled={isAddingQueue}
                          className="flex items-center justify-center w-7 bg-white/10 hover:bg-white/25 text-white rounded-[4px] transition-colors disabled:opacity-50"
                          title="Add to Queue"
                        >
                          {isAddingQueue ? '…' : <Clock size={11} />}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          </div>
        </>
      )}
    </div>
  )
}
