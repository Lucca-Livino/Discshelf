'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Shuffle, X, BookOpen } from 'lucide-react'
import type { WaitlistEntry } from '@/hooks/useWaitlist'

const TILE_SIZE = 140
const TILE_GAP = 8
const TILE_FULL = TILE_SIZE + TILE_GAP  // 148
const VISIBLE = 3
const CONTAINER_W = TILE_FULL * VISIBLE - TILE_GAP  // 436px — cabe em max-w-xl (576) com px-5
const CENTER = CONTAINER_W / 2
const SPIN_REPEATS = 8

interface AlbumRouletteProps {
  items: WaitlistEntry[]
  onClose: () => void
  onAddToShelf: (spotifyId: string, albumId: string, title: string) => void
}

function buildStrip(items: WaitlistEntry[], winnerIndex: number) {
  const strip: WaitlistEntry[] = []
  for (let i = 0; i < SPIN_REPEATS; i++) {
    strip.push(...items)
  }
  // winner lands at a fixed position near end
  const winnerStripIndex = (SPIN_REPEATS - 1) * items.length + winnerIndex
  return { strip, winnerStripIndex }
}

export function AlbumRoulette({ items, onClose, onAddToShelf }: AlbumRouletteProps) {
  const midIndex = Math.floor(items.length / 2)
  const initialX = CENTER - (midIndex * TILE_FULL + TILE_SIZE / 2)

  const [strip, setStrip] = useState<WaitlistEntry[]>(items)
  const [translateX, setTranslateX] = useState(initialX)
  const [transitioning, setTransitioning] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<WaitlistEntry | null>(null)

  function spin() {
    if (spinning || items.length < 2) return

    const winnerIndex = Math.floor(Math.random() * items.length)
    const winnerEntry = items[winnerIndex]
    const { strip: newStrip, winnerStripIndex } = buildStrip(items, winnerIndex)

    const targetX = CENTER - (winnerStripIndex * TILE_FULL + TILE_SIZE / 2)

    setStrip(newStrip)
    setTranslateX(0)
    setTransitioning(false)
    setWinner(null)
    setSpinning(true)

    // one frame to apply the reset position, then animate
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransitioning(true)
        setTranslateX(targetX)

        setTimeout(() => {
          setSpinning(false)
          setWinner(winnerEntry)
        }, 3200)
      })
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-bg-secondary border border-border-subtle rounded-[4px] w-full max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <h2 className="text-text-primary font-bold">Roleta da Queue</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-6 space-y-6">
          {/* Carousel viewport */}
          <div
            className="relative overflow-hidden"
            style={{ width: CONTAINER_W, height: TILE_SIZE + 16, margin: '0 auto' }}
          >
            {/* Selection indicator */}
            <div
              className="absolute inset-y-2 border-2 border-accent rounded-[2px] z-10 pointer-events-none"
              style={{ left: CENTER - TILE_SIZE / 2, width: TILE_SIZE }}
            />

            {/* Fade edges */}
            <div className="absolute inset-y-0 left-0 z-10 pointer-events-none" style={{ width: TILE_FULL * 0.6, background: 'linear-gradient(to right, var(--color-bg-secondary) 30%, transparent)' }} />
            <div className="absolute inset-y-0 right-0 z-10 pointer-events-none" style={{ width: TILE_FULL * 0.6, background: 'linear-gradient(to left, var(--color-bg-secondary) 30%, transparent)' }} />

            {/* Strip */}
            <div
              className="flex absolute top-2"
              style={{
                gap: TILE_GAP,
                transform: `translateX(${translateX}px)`,
                transition: transitioning
                  ? 'transform 3s cubic-bezier(0.12, 0.8, 0.18, 1)'
                  : 'none',
                willChange: 'transform',
              }}
            >
              {strip.map((entry, i) => (
                <div
                  key={i}
                  style={{ width: TILE_SIZE, height: TILE_SIZE, flexShrink: 0 }}
                  className="rounded-[2px] overflow-hidden"
                >
                  <Image
                    src={entry.album.coverUrl}
                    alt={entry.album.title}
                    width={TILE_SIZE}
                    height={TILE_SIZE}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Winner info */}
          <div className="min-h-[60px] flex flex-col items-center justify-center text-center">
            {winner ? (
              <>
                <p className="text-accent text-xs font-mono font-bold tracking-widest mb-1">SORTEADO</p>
                <p className="text-text-primary font-bold text-lg leading-tight">{winner.album.title}</p>
                <p className="text-text-muted text-sm">{winner.album.artist} · {winner.album.year}</p>
              </>
            ) : spinning ? (
              <p className="text-text-muted text-sm font-mono animate-pulse">Sorteando...</p>
            ) : (
              <p className="text-text-muted text-sm">Clique em Sortear para escolher um álbum</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={spin}
              disabled={spinning || items.length < 2}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-[4px] transition-colors disabled:opacity-40"
            >
              <Shuffle size={14} />
              {winner ? 'Sortear novamente' : 'Sortear'}
            </button>

            {winner && (
              <button
                onClick={() => onAddToShelf(winner.album.spotifyId, winner.albumId, winner.album.title)}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-bg-elevated hover:bg-bg-primary border border-border-subtle text-text-primary text-sm rounded-[4px] transition-colors"
              >
                <BookOpen size={14} />
                Add to Shelf
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
