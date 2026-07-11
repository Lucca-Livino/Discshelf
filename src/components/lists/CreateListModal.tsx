'use client'

import { useState } from 'react'
import { Disc, Mic2, Music } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCreateList, type ListType } from '@/hooks/useLists'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/useToast'

interface CreateListModalProps {
  open: boolean
  onClose: () => void
}

const TYPE_OPTIONS: { value: ListType; label: string; icon: typeof Disc }[] = [
  { value: 'album',  label: 'Albums',  icon: Disc },
  { value: 'artist', label: 'Artists', icon: Mic2 },
  { value: 'track',  label: 'Tracks',  icon: Music },
]

export function CreateListModal({ open, onClose }: CreateListModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<ListType>('album')
  const createList = useCreateList()

  function reset() {
    setName('')
    setDescription('')
    setType('album')
  }

  async function handleCreate() {
    if (!name.trim()) return
    try {
      await createList.mutateAsync({ name: name.trim(), description: description || undefined, type })
      toast({ title: 'Lista criada!' })
      reset()
      onClose()
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao criar lista' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-sm p-5 rounded-none">
        <DialogHeader>
          <DialogTitle>New List</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={cn(
                  'flex flex-col items-center gap-1 py-3 border rounded-[4px] text-xs transition-colors',
                  type === value
                    ? 'border-accent bg-accent/10 text-text-primary'
                    : 'border-border-subtle text-text-muted hover:border-accent hover:text-text-primary',
                )}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="List name"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle text-text-primary placeholder-text-muted text-sm rounded-[4px] focus:outline-none focus:border-accent"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle text-text-primary placeholder-text-muted text-sm rounded-[4px] focus:outline-none focus:border-accent"
          />
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-bg-elevated hover:bg-white/10 text-text-muted text-sm rounded-[4px] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!name.trim() || createList.isPending}
              className="flex-1 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-[4px] transition-colors disabled:opacity-50"
            >
              {createList.isPending ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
