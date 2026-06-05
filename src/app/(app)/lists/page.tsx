'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useLists } from '@/hooks/useLists'
import { ListCard, ListCardSkeleton } from '@/components/lists/ListCard'
import { CreateListModal } from '@/components/lists/CreateListModal'

export default function ListsPage() {
  const { data, isLoading } = useLists()
  const [createOpen, setCreateOpen] = useState(false)

  const lists = data?.data ?? []

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Lists</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-[4px] transition-colors"
        >
          <Plus size={14} />
          New List
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-px">
          {Array.from({ length: 5 }).map((_, i) => (
            <ListCardSkeleton key={i} />
          ))}
        </div>
      ) : lists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-text-muted text-lg mb-2">Nenhuma lista criada</p>
          <p className="text-text-muted text-sm">
            Clique em &quot;New List&quot; para começar
          </p>
        </div>
      ) : (
        <div className="space-y-px max-w-2xl">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      )}

      <CreateListModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
