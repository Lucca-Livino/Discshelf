'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface SearchResult {
  id: string
  spotifyId: string
  title: string
  artist: string
  coverUrl: string
  year: number
  genre: string | null
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () =>
      api.get<SearchResult[]>(`/albums/search?q=${encodeURIComponent(query)}`),
    enabled: query.trim().length >= 2,
    staleTime: 30 * 1000,
  })
}
