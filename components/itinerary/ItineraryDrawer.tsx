'use client';

import { X, Share2, SortAsc, Map } from 'lucide-react';
import { toast } from 'sonner';
import { useItineraryStore } from '@/store/itinerary.store';
import { useLocationStore } from '@/store/location.store';
import StopList from './StopList';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ItineraryDrawer({ open, onOpenChange }: Props) {
  const { itinerary, sortByProximity, getShareURL, clearItinerary } = useItineraryStore();
  const location = useLocationStore();

  const handleSort = () => {
    if (!location.coordinates) {
      toast.error('Location not available for sorting');
      return;
    }
    sortByProximity(location.coordinates);
    toast.success('Sorted by proximity');
  };

  const handleShare = async () => {
    if (itinerary.stops.length === 0) {
      toast.error('Add stops before sharing');
      return;
    }
    const url = getShareURL();
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleGoogleMaps = () => {
    const stops = itinerary.stops;
    if (stops.length === 0) return;

    if (stops.length === 1) {
      const s = stops[0];
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${s.coordinates.lat},${s.coordinates.lng}`,
        '_blank',
      );
      return;
    }

    const origin = `${stops[0].coordinates.lat},${stops[0].coordinates.lng}`;
    const dest = `${stops[stops.length - 1].coordinates.lat},${stops[stops.length - 1].coordinates.lng}`;
    const waypoints = stops
      .slice(1, -1)
      .map((s) => `${s.coordinates.lat},${s.coordinates.lng}`)
      .join('|');

    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}${waypoints ? `&waypoints=${waypoints}` : ''}`;
    window.open(url, '_blank');
  };

  // clearItinerary is available but not used in this UI currently
  void clearItinerary;

  const stopCount = itinerary.stops.length;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Drawer panel */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 md:left-auto md:right-4 md:bottom-4 md:top-4 md:w-96',
          'bg-[var(--color-surface)] border border-[var(--color-border)] rounded-t-2xl md:rounded-2xl shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          'flex flex-col max-h-[85vh] md:max-h-full',
          open ? 'translate-y-0' : 'translate-y-full md:translate-y-0 md:translate-x-[calc(100%+2rem)]',
        )}
      >
        {/* Handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[var(--color-border)]" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)]">
          <h2 className="flex-1 text-base font-semibold text-[var(--color-text-primary)]">
            My Route
            {stopCount > 0 && (
              <span className="ml-2 text-sm font-normal text-[var(--color-text-secondary)]">
                {stopCount} stop{stopCount !== 1 ? 's' : ''}
              </span>
            )}
          </h2>
          <button
            onClick={handleSort}
            disabled={stopCount < 2}
            aria-label="Sort by proximity"
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <SortAsc size={18} />
          </button>
          <button
            onClick={handleShare}
            disabled={stopCount === 0}
            aria-label="Share itinerary"
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Share2 size={18} />
          </button>
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close itinerary"
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stop list */}
        <div className="flex-1 overflow-y-auto">
          <StopList />
        </div>

        {/* Footer */}
        {stopCount > 0 && (
          <div className="p-4 border-t border-[var(--color-border)] flex gap-2">
            <button
              onClick={handleGoogleMaps}
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-medium transition-colors"
            >
              <Map size={16} />
              Open in Google Maps
            </button>
          </div>
        )}
      </div>
    </>
  );
}
