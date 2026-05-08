'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useItineraryStore } from '@/store/itinerary.store';
import StopItem from './StopItem';
import { MapPin } from 'lucide-react';

export default function StopList() {
  const { itinerary, reorderStops } = useItineraryStore();
  const stops = itinerary.stops;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = stops.findIndex((s) => s.id === active.id);
    const newIndex = stops.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    reorderStops(arrayMove(stops, oldIndex, newIndex));
  };

  if (stops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
        <MapPin size={32} className="text-[var(--color-text-muted)]" />
        <p className="text-sm text-[var(--color-text-muted)]">
          Tap a place on the map to add it to your itinerary
        </p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <ul className="divide-y divide-[var(--color-border)]">
          {stops.map((stop, idx) => (
            <StopItem key={stop.id} stop={stop} index={idx} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
