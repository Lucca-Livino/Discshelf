'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type ListType = 'album' | 'artist' | 'track'

export interface AlbumList {
  id: string
  name: string
  description: string | null
  type: ListType
  albumCount: number // itemCount (backend usa albumCount no summary)
  albums: { coverUrl: string | null; title: string }[]
}

// ── Itens por tipo de lista ──────────────────────────────────
export interface AlbumItem {
  id: string
  spotifyId: string
  title: string
  artist: string
  coverUrl: string
  year: number
}
export interface ArtistItem {
  id: string
  spotifyId: string
  name: string
  imageUrl: string | null
  genre: string | null
}
export interface TrackItem {
  id: string
  spotifyId: string
  name: string
  artist: string
  albumTitle: string | null
  coverUrl: string | null
  durationMs: number
}
export type ListItem = AlbumItem | ArtistItem | TrackItem

// mantido por compat (list detail antigo)
export type ListAlbum = AlbumItem

export interface ListDetail {
  id: string
  name: string
  description: string | null
  type: ListType
  itemCount: number
  items: ListItem[]
}

export function useLists() {
  return useQuery({
    queryKey: ['lists'],
    queryFn: () => api.get<{ data: AlbumList[] }>('/lists'),
  })
}

export function useList(id: string) {
  return useQuery({
    queryKey: ['lists', id],
    queryFn: () => api.get<{ list: ListDetail }>(`/lists/${id}`),
    enabled: !!id,
  })
}

export function useCreateList() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; description?: string; type?: ListType }) =>
      api.post('/lists', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lists'] }),
  })
}

export function useUpdateList() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { name?: string; description?: string } }) =>
      api.patch(`/lists/${id}`, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['lists'] })
      qc.invalidateQueries({ queryKey: ['lists', id] })
    },
  })
}

export function useDeleteList() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/lists/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lists'] }),
  })
}

export function useReorderList() {
  const qc = useQueryClient()
  return useMutation({
    // orderedIds = item ids na nova ordem
    mutationFn: ({ id, orderedIds }: { id: string; orderedIds: string[] }) =>
      api.patch(`/lists/${id}/reorder`, { orderedIds }),
    onSettled: (_d, _e, { id }) => {
      qc.invalidateQueries({ queryKey: ['lists', id] })
      qc.invalidateQueries({ queryKey: ['lists'] }) // index: covers/count dos cards
    },
  })
}

// endpoint /lists/:id/albums resolve album/artist/track pelo type da lista
export function useAddItemToList() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ listId, spotifyId }: { listId: string; spotifyId: string }) =>
      api.post(`/lists/${listId}/albums`, { spotifyId }),
    onSuccess: (_, { listId }) => {
      qc.invalidateQueries({ queryKey: ['lists', listId] })
      qc.invalidateQueries({ queryKey: ['lists'] })
    },
  })
}

export function useRemoveItemFromList() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ listId, itemId }: { listId: string; itemId: string }) =>
      api.delete(`/lists/${listId}/albums/${itemId}`),
    onSuccess: (_, { listId }) => {
      qc.invalidateQueries({ queryKey: ['lists', listId] })
      qc.invalidateQueries({ queryKey: ['lists'] })
    },
  })
}
