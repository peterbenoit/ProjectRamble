'use client';

import { X, Star, MapPin, Clock, ExternalLink, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { POI } from '@/types';
import { useItineraryStore } from '@/store/itinerary.store';
import { cn } from '@/lib/utils';

interface Props {
  poi: POI;
  onClose: () => void;
}

export default function POICard({ poi, onClose }: Props) {
  const { itinerary, addStop } = useItineraryStore();
  const isInItinerary = itinerary.stops.some((s) => s.placeId === poi.placeId);

  const handleAdd = () => {
    addStop({
      type: 'poi',
      name: poi.name,
      coordinates: poi.coordinates,
      address: poi.address,
      placeId: poi.placeId,
    });
    toast.success('Added to itinerary');
  };

  const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${poi.placeId}`;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-30 md:left-auto md:right-4 md:bottom-4 md:w-96"
      aria-live="polite"
    >
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[45vh] overflow-y-auto">
        {/* Drag handle (mobile) */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[var(--color-border)]" />
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-[var(--color-text-primary)] truncate">{poi.name}</h2>
              <p className="text-sm text-[var(--color-text-secondary)] capitalize">{poi.type.replace(/_/g, ' ')}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {poi.rating && (
                <span className="flex items-center gap-1 text-sm text-[var(--color-warning)]">
                  <Star size={14} fill="currentColor" />
                  {poi.rating.toFixed(1)}
                  {poi.ratingCount && (
                    <span className="text-[var(--color-text-muted)]">({poi.ratingCount})</span>
                  )}
                </span>
              )}
              <button
                onClick={onClose}
                aria-label="Close"
                className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {poi.address && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-[var(--color-text-secondary)]">
              <MapPin size={14} className="shrink-0" />
              <span className="truncate">{poi.address}</span>
            </div>
          )}

          {poi.openNow !== undefined && (
            <div className="flex items-center gap-1.5 mt-1 text-sm">
              <Clock size={14} className="shrink-0 text-[var(--color-text-muted)]" />
              <span className={poi.openNow ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}>
                {poi.openNow ? 'Open now' : 'Closed'}
              </span>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAdd}
              disabled={isInItinerary}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg text-sm font-medium transition-colors',
                isInItinerary
                  ? 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] cursor-default'
                  : 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white',
              )}
            >
              {isInItinerary ? <Check size={15} /> : <Plus size={15} />}
              {isInItinerary ? 'In Itinerary' : 'Add to Itinerary'}
            </button>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 h-10 px-3 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface-2)] transition-colors"
              aria-label="View in Google Maps"
            >
              <ExternalLink size={15} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
