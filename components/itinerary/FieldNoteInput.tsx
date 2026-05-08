'use client';

import { useState } from 'react';
import type { Stop } from '@/types';
import { useItineraryStore } from '@/store/itinerary.store';

interface Props {
  stop: Stop;
}

export default function FieldNoteInput({ stop }: Props) {
  const { updateFieldNote } = useItineraryStore();
  const [editing, setEditing] = useState(false);

  if (!editing && !stop.fieldNote) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] mt-1"
      >
        + Add a note
      </button>
    );
  }

  return (
    <div className="mt-1">
      {editing || stop.fieldNote ? (
        <textarea
          defaultValue={stop.fieldNote ?? ''}
          maxLength={280}
          autoFocus={editing}
          onFocus={() => setEditing(true)}
          onBlur={(e) => {
            updateFieldNote(stop.id, e.target.value);
            setEditing(false);
          }}
          onChange={(e) => updateFieldNote(stop.id, e.target.value)}
          placeholder="Add a note…"
          rows={2}
          className="w-full text-xs italic text-[var(--color-text-secondary)] bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded px-2 py-1 resize-none outline-none focus:border-[var(--color-accent)]"
          aria-label="Field note"
        />
      ) : (
        <p className="text-xs italic text-[var(--color-text-secondary)] mt-0.5">
          &ldquo;{stop.fieldNote}&rdquo;
        </p>
      )}
    </div>
  );
}
