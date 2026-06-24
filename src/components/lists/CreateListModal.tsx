'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCreateList } from '@/hooks/useLists'
import { toast } from '@/hooks/useToast'

interface CreateListModalProps {
  open: boolean
  onClose: () => void
}

export function CreateListModal({ open, onClose }: CreateListModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const createList = useCreateList()

  async function handleCreate() {
    if (!name.trim()) return
    try {
      await createList.mutateAsync({ name: name.trim(), description: description || undefined })
      toast({ title: 'Lista criada!' })
      setName('')
      setDescription('')
      onClose()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar lista',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-sm p-5 rounded-none">
        <DialogHeader>
          <DialogTitle>New List</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-3">
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
