'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import {
  useList,
  useUpdateList,
  useDeleteList,
  useRemoveItemFromList,
  useAddItemToList,
  useReorderList,
  type ListDetail,
  type ListItem,
  type ListType,
} from '@/hooks/useLists'
import { AlbumGrid } from '@/components/album/AlbumGrid'
import { AlbumCardSkeleton } from '@/components/album/AlbumCard'
import { ListItemCard } from '@/components/lists/ListItemCard'
import { SortableGrid } from '@/components/dnd/SortableGrid'
import { SearchBar } from '@/components/search/SearchBar'
import { toast } from '@/hooks/useToast'

const ADD_LABEL: Record<ListType, string> = {
  album: 'Add Album',
  artist: 'Add Artist',
  track: 'Add Track',
}

const EMPTY_LABEL: Record<ListType, string> = {
  album: 'Adicione álbuns com o botão acima',
  artist: 'Adicione artistas com o botão acima',
  track: 'Adicione faixas com o botão acima',
}

// item (union) → shape genérico do card
function present(item: ListItem, type: ListType) {
  if (type === 'artist') {
    const a = item as Extract<ListItem, { imageUrl: string | null }>
    return { coverUrl: a.imageUrl, primary: a.name, secondary: a.genre ?? '', rounded: true, fallback: 'artist' as const }
  }
  if (type === 'track') {
    const t = item as Extract<ListItem, { albumTitle: string | null }>
    return { coverUrl: t.coverUrl, primary: t.name, secondary: [t.artist, t.albumTitle].filter(Boolean).join(' · '), rounded: false, fallback: 'track' as const }
  }
  const al = item as Extract<ListItem, { title: string }>
  return { coverUrl: al.coverUrl, primary: al.title, secondary: al.artist, rounded: false, fallback: undefined }
}

export default function ListDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data, isLoading } = useList(id)
  const updateList = useUpdateList()
  const deleteList = useDeleteList()
  const removeItem = useRemoveItemFromList()
  const addItem = useAddItemToList()
  const reorderList = useReorderList()

  const [showSearch, setShowSearch] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [addingSpotifyId, setAddingSpotifyId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const list: ListDetail | undefined = data?.list
  const type: ListType = list?.type ?? 'album'

  // ordem local (position) — fonte de verdade pro drag
  const [order, setOrder] = useState<ListItem[]>([])
  useEffect(() => {
    if (list?.items) setOrder(list.items)
  }, [list])

  function startEditName() {
    setNameValue(list?.name ?? '')
    setEditingName(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  async function saveName() {
    if (!nameValue.trim() || !list) return
    setEditingName(false)
    if (nameValue === list.name) return
    try {
      await updateList.mutateAsync({ id, body: { name: nameValue.trim() } })
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao renomear lista' })
    }
  }

  async function handleDelete() {
    if (!confirm('Deletar esta lista?')) return
    try {
      await deleteList.mutateAsync(id)
      router.push('/lists')
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao deletar lista' })
    }
  }

  async function handleRemoveItem(itemId: string) {
    setOrder((prev) => prev.filter((i) => i.id !== itemId)) // otimista
    try {
      await removeItem.mutateAsync({ listId: id, itemId })
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao remover item' })
    }
  }

  function handleReorder(next: ListItem[]) {
    setOrder(next) // otimista
    reorderList.mutate(
      { id, orderedIds: next.map((i) => i.id) },
      { onError: () => toast({ variant: 'destructive', title: 'Erro ao salvar ordem' }) },
    )
  }

  async function handleAddItem(spotifyId: string) {
    setAddingSpotifyId(spotifyId)
    try {
      await addItem.mutateAsync({ listId: id, spotifyId })
      toast({ title: 'Adicionado à lista!' })
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao adicionar' })
    } finally {
      setAddingSpotifyId(null)
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-start justify-between gap-3 mb-4 md:mb-6">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {editingName ? (
            <input
              ref={inputRef}
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveName()
                if (e.key === 'Escape') setEditingName(false)
              }}
              className="text-2xl font-bold bg-transparent border-b border-accent text-text-primary focus:outline-none"
            />
          ) : (
            <h1
              className="text-2xl font-bold text-text-primary cursor-pointer hover:text-white transition-colors flex items-center gap-2 group"
              onClick={startEditName}
            >
              {isLoading ? (
                <span className="inline-block w-40 h-7 bg-bg-elevated animate-pulse" />
              ) : (
                list?.name
              )}
              <Edit2 size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </h1>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setShowSearch((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-[4px] transition-colors"
          >
            <Plus size={14} />
            {ADD_LABEL[type]}
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 bg-bg-elevated hover:bg-accent text-text-muted hover:text-white text-sm rounded-[4px] transition-colors"
          >
            <Trash2 size={14} />
            Delete List
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="mb-4 md:mb-6">
          <SearchBar
            kind={type}
            listId={id}
            onAddToList={handleAddItem}
            addingToListId={addingSpotifyId}
            onClose={() => setShowSearch(false)}
          />
        </div>
      )}

      {isLoading ? (
        <AlbumGrid>
          {Array.from({ length: 12 }).map((_, i) => (
            <AlbumCardSkeleton key={i} />
          ))}
        </AlbumGrid>
      ) : order.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-text-muted text-lg mb-2">Lista vazia</p>
          <p className="text-text-muted text-sm">{EMPTY_LABEL[type]}</p>
        </div>
      ) : (
        <SortableGrid
          items={order}
          onReorder={handleReorder}
          renderItem={(item) => {
            const p = present(item, type)
            return (
              <ListItemCard
                coverUrl={p.coverUrl}
                primary={p.primary}
                secondary={p.secondary}
                rounded={p.rounded}
                fallback={p.fallback}
                onRemove={() => handleRemoveItem(item.id)}
              />
            )
          }}
        />
      )}
    </div>
  )
}
