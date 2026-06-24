'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface AlbumList {
  id: string
  name: string
  description: string | null
  albumCount: number
  albums: { coverUrl: string; title: string }[]
}

export interface ListAlbum {
  id: string
  spotifyId: string
  title: string
  artist: string
  coverUrl: string
  year: number
}

export function useLists() {
  return useQuery({
    queryKey: ['lists'],
    queryFn: () => api.get<{ data: AlbumList[] }>('/lists'),
  })
}

export interface ListDetail extends Omit<AlbumList, 'albums'> {
  albums: ListAlbum[]
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
    mutationFn: (body: { name: string; description?: string }) =>
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

export function useAddAlbumToList() {
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

export function useRemoveAlbumFromList() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ listId, albumId }: { listId: string; albumId: string }) =>
      api.delete(`/lists/${listId}/albums/${albumId}`),
    onSuccess: (_, { listId }) => {
      qc.invalidateQueries({ queryKey: ['lists', listId] })
      qc.invalidateQueries({ queryKey: ['lists'] })
    },
  })
}
