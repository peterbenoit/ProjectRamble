'use client';

import { Navigation, X } from 'lucide-react';

interface Props {
  onGrant: () => void;
  onDismiss: () => void;
}

export default function LocationPermissionModal({ onGrant, onDismiss }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-full bg-[var(--color-accent-muted)] flex items-center justify-center">
            <Navigation size={22} className="text-[var(--color-accent)]" />
          </div>
          <button
            onClick={onDismiss}
            aria-label="Dismiss"
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]"
          >
            <X size={18} />
          </button>
        </div>
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
          Enable Location
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          PathWeaver uses your location to find nearby parks, trails, and scenic byways.
          Your location is never stored or shared.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onGrant}
            className="flex-1 h-10 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-medium transition-colors"
          >
            Enable Location
          </button>
          <button
            onClick={onDismiss}
            className="h-10 px-4 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] text-sm transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
