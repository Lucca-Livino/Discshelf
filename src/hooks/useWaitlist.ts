'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface WaitlistEntry {
  id: string
  albumId: string
  recommendedBy: string | null
  addedAt: string
  album: {
    id: string
    spotifyId: string
    title: string
    artist: string
    year: number
    coverUrl: string
    genre: string | null
  }
}

export function useWaitlist() {
  return useQuery({
    queryKey: ['waitlist'],
    queryFn: () => api.get<WaitlistEntry[]>('/waitlist'),
  })
}

export function useAddToWaitlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { spotifyId: string; recommendedBy?: string }) =>
      api.post('/waitlist', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['waitlist'] }),
  })
}

export function useRemoveFromWaitlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (albumId: string) => api.delete(`/waitlist/${albumId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['waitlist'] }),
  })
}
