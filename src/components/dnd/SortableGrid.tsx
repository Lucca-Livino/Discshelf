'use client'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'

// mesma grade do AlbumGrid — mantém layout consistente
const GRID_CLASSES =
  'grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-0.5 sm:gap-1'

interface SortableGridProps<T extends { id: string }> {
  items: T[]
  onReorder: (next: T[]) => void
  renderItem: (item: T) => React.ReactNode
  className?: string
}

export function SortableGrid<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  className,
}: SortableGridProps<T>) {
  const sensors = useSensors(
    // distance: clique sem arrastar (< 6px) ainda dispara onClick do card
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    // delay no touch pra não conflitar com scroll no mobile
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    onReorder(arrayMove(items, oldIndex, newIndex))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
        <div className={cn(GRID_CLASSES, className)}>
          {items.map((item) => (
            <SortableCell key={item.id} id={item.id}>
              {renderItem(item)}
            </SortableCell>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function SortableCell({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
    opacity: isDragging ? 0.55 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none cursor-grab active:cursor-grabbing"
    >
      {children}
    </div>
  )
}
