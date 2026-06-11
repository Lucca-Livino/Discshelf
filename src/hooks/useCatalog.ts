'use client'

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface ApiAlbum {
  id: string
  spotifyId: string
  title: string
  artist: string
  year: number
  coverUrl: string
  genre: string | null
}

interface ApiCatalogEntry {
  id: string
  albumId: string
  album: ApiAlbum
  addedAt: string
  hasReview: boolean
}

interface ApiCatalogResponse {
  data: ApiCatalogEntry[]
  total: number
  page: number
  limit: number
}

export interface CatalogAlbum {
  id: string        // catalog entry id
  albumId: string   // album DB id (used in review endpoints)
  spotifyId: string
  title: string
  artist: string
  coverUrl: string
  year: number
  addedAt: string
  hasReview: boolean
}

function mapEntry(entry: ApiCatalogEntry): CatalogAlbum {
  return {
    id: entry.id,
    albumId: entry.albumId,
    spotifyId: entry.album.spotifyId,
    title: entry.album.title,
    artist: entry.album.artist,
    coverUrl: entry.album.coverUrl,
    year: entry.album.year,
    addedAt: entry.addedAt,
    hasReview: entry.hasReview,
  }
}

export interface CatalogResponse {
  data: CatalogAlbum[]
  total: number
  page: number
  limit: number
}

const CATALOG_LIMIT = 40

export function useCatalog() {
  return useInfiniteQuery({
    queryKey: ['catalog'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get<ApiCatalogResponse>(
        `/catalog?page=${pageParam}&limit=${CATALOG_LIMIT}`,
      )
      return {
        data: res.data.map(mapEntry),
        total: res.total,
        page: res.page,
        limit: res.limit,
      } as CatalogResponse
    },
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page * last.limit < last.total ? last.page + 1 : undefined,
  })
}

export function useAddToCatalog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { spotifyId: string }) => api.post('/catalog', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['catalog'] })
      qc.invalidateQueries({ queryKey: ['waitlist'] })
    },
  })
}

export function useRemoveFromCatalog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (catalogEntryId: string) => api.delete(`/catalog/${catalogEntryId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['catalog'] }),
  })
}

interface ApiTrack {
  trackId: string
  trackName: string
  durationMs: number
  trackNumber: number
}

export interface Track {
  id: string
  name: string
  durationMs: number
  trackNumber: number
}

export interface ReviewData {
  id: string
  reviewText: string | null
  monthListened: string
  recommendedBy: string | null
  favoriteTracks: { trackId: string; trackName: string }[]
}

export function useReview(albumId: string, enabled = true) {
  return useQuery({
    queryKey: ['review', albumId],
    queryFn: () => api.get<ReviewData>(`/catalog/${albumId}/review`),
    enabled: !!albumId && enabled,
    retry: false,
  })
}

export function useAlbumTracks(spotifyId: string, enabled = true) {
  return useQuery({
    queryKey: ['tracks', spotifyId],
    queryFn: async () => {
      const raw = await api.get<ApiTrack[]>(`/albums/${spotifyId}/tracks`)
      return raw.map((t) => ({
        id: t.trackId,
        name: t.trackName,
        durationMs: t.durationMs,
        trackNumber: t.trackNumber,
      })) as Track[]
    },
    enabled: !!spotifyId && enabled,
  })
}

export function useSaveReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      albumId,
      hasReview,
      body,
    }: {
      albumId: string      // album DB id
      hasReview: boolean
      body: {
        reviewText?: string
        monthListened?: string  // YYYY-MM
        recommendedBy?: string
        favoriteTracks?: { trackId: string; trackName: string }[]
      }
    }) => {
      if (hasReview) {
        return api.patch(`/catalog/${albumId}/review`, body)
      }
      return api.post(`/catalog/${albumId}/review`, body)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['catalog'] }),
  })
}
