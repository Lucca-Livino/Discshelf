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

export interface ArtistSearchResult {
  id: string
  spotifyId: string
  name: string
  imageUrl: string | null
  genre: string | null
}

export interface TrackSearchResult {
  id: string
  spotifyId: string
  name: string
  artist: string
  albumTitle: string | null
  coverUrl: string | null
  durationMs: number
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', 'album', query],
    queryFn: () =>
      api.get<SearchResult[]>(`/albums/search?q=${encodeURIComponent(query)}`),
    enabled: query.trim().length >= 2,
    staleTime: 30 * 1000,
  })
}

export function useSearchArtists(query: string) {
  return useQuery({
    queryKey: ['search', 'artist', query],
    queryFn: () =>
      api.get<ArtistSearchResult[]>(`/albums/search/artists?q=${encodeURIComponent(query)}`),
    enabled: query.trim().length >= 2,
    staleTime: 30 * 1000,
  })
}

export function useSearchTracks(query: string) {
  return useQuery({
    queryKey: ['search', 'track', query],
    queryFn: () =>
      api.get<TrackSearchResult[]>(`/albums/search/tracks?q=${encodeURIComponent(query)}`),
    enabled: query.trim().length >= 2,
    staleTime: 30 * 1000,
  })
}
