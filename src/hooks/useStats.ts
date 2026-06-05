'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Stats {
  totalAlbums: number
  totalReviews: number
  byMonth: { month: string; count: number }[]
  byGenre: { genre: string; count: number }[]
  byRecommender: { name: string; count: number }[]
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get<Stats>('/catalog/stats'),
  })
}
