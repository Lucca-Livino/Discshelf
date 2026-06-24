'use client'

import { useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, Trash2, Check, Edit2 } from 'lucide-react'
import { useList, useUpdateList, useDeleteList, useRemoveAlbumFromList, useAddAlbumToList, type ListDetail } from '@/hooks/useLists'
import { AlbumGrid } from '@/components/album/AlbumGrid'
import { AlbumCardSkeleton, AlbumCardRemovable } from '@/components/album/AlbumCard'
import { SearchBar } from '@/components/search/SearchBar'
import { toast } from '@/hooks/useToast'

export default function ListDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data, isLoading } = useList(id)
  const updateList = useUpdateList()
  const deleteList = useDeleteList()
  const removeAlbum = useRemoveAlbumFromList()
  const addAlbum = useAddAlbumToList()

  const [showSearch, setShowSearch] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [addingSpotifyId, setAddingSpotifyId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const list: ListDetail | undefined = data?.list

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

  async function handleRemoveAlbum(albumId: string) {
    try {
      await removeAlbum.mutateAsync({ listId: id, albumId })
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao remover álbum' })
    }
  }

  async function handleAddToList(spotifyId: string) {
    setAddingSpotifyId(spotifyId)
    try {
      await addAlbum.mutateAsync({ listId: id, spotifyId })
      toast({ title: 'Álbum adicionado à lista!' })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro ao adicionar',
      })
    } finally {
      setAddingSpotifyId(null)
    }
  }

  const albums = list?.albums ?? []

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
            Add Album
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
            listId={id}
            onAddToList={handleAddToList}
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
      ) : albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-text-muted text-lg mb-2">Lista vazia</p>
          <p className="text-text-muted text-sm">Adicione álbuns com o botão acima</p>
        </div>
      ) : (
        <AlbumGrid>
          {albums.map((album) => (
            <AlbumCardRemovable
              key={album.id}
              title={album.title}
              artist={album.artist}
              coverUrl={album.coverUrl}
              onRemove={() => handleRemoveAlbum(album.id)}
            />
          ))}
        </AlbumGrid>
      )}
    </div>
  )
}
