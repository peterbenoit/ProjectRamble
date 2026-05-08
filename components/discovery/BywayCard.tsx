'use client';

import { X, ExternalLink, Plus, Check, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useMapStore } from '@/store/map.store';
import { useItineraryStore } from '@/store/itinerary.store';
import { useByways } from '@/hooks/useByways';
import { cn } from '@/lib/utils';
import type { BywayProperties } from '@/types';
import type { Feature } from 'geojson';

interface Props {
  bywayId: string;
  onClose: () => void;
}

export default function BywayCard({ bywayId, onClose }: Props) {
  const byways = useByways();
  const { mapInstance } = useMapStore();
  const { itinerary, addStop } = useItineraryStore();

  const feature = byways?.features.find((f: Feature) => f.properties?.id === bywayId);
  const props = feature?.properties as BywayProperties | undefined;

  if (!props) return null;

  const isInItinerary = itinerary.stops.some((s) => s.bywayId === bywayId);

  const handleAdd = () => {
    const center = mapInstance?.getCenter();
    addStop({
      type: 'byway_waypoint',
      name: `${props.name} — Waypoint`,
      coordinates: center
        ? { lat: center.lat(), lng: center.lng() }
        : { lat: 0, lng: 0 },
      bywayId: props.id,
    });
    toast.success('Added to itinerary');
  };

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-30 md:left-auto md:right-4 md:bottom-4 md:w-96"
      aria-live="polite"
    >
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[45vh] overflow-y-auto">
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[var(--color-border)]" />
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{props.name}</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Florida Scenic Highway · {props.length_miles} miles
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]"
            >
              <X size={16} />
            </button>
          </div>

          {props.description && (
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{props.description}</p>
          )}

          {props.counties?.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-[var(--color-text-muted)]">
              <MapPin size={14} className="shrink-0" />
              <span>{props.counties.join(', ')}</span>
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
              {isInItinerary ? 'In Itinerary' : 'Add Waypoint'}
            </button>
            {props.url && (
              <a
                href={props.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 h-10 px-3 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface-2)] transition-colors"
                aria-label="Official byway website"
              >
                <ExternalLink size={15} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
