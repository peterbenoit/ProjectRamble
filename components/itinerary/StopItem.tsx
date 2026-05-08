'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical } from 'lucide-react';
import type { Stop } from '@/types';
import { useItineraryStore } from '@/store/itinerary.store';
import FieldNoteInput from './FieldNoteInput';

interface Props {
  stop: Stop;
  index: number;
}

export default function StopItem({ stop, index }: Props) {
  const { removeStop } = useItineraryStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stop.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className="flex items-start gap-2 px-4 py-3 bg-[var(--color-surface)]">
      <button
        {...attributes}
        {...listeners}
        aria-roledescription="sortable"
        aria-label={`Drag to reorder ${stop.name}`}
        className="mt-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical size={18} />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <span className="shrink-0 w-5 h-5 rounded-full bg-[var(--color-accent)] text-white text-xs flex items-center justify-center font-bold leading-none mt-0.5">
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{stop.name}</p>
            {stop.address && (
              <p className="text-xs text-[var(--color-text-muted)] truncate">{stop.address}</p>
            )}
            <FieldNoteInput stop={stop} />
          </div>
        </div>
      </div>

      <button
        onClick={() => removeStop(stop.id)}
        aria-label={`Remove ${stop.name}`}
        className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-surface-2)] transition-colors"
      >
        <X size={14} />
      </button>
    </li>
  );
}
