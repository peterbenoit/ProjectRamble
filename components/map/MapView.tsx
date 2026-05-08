'use client';

import { useEffect, useRef, useState } from 'react';
import MapCanvas from './MapCanvas';
import BywayLayer from './BywayLayer';
import POIMarkers from './POIMarkers';
import UserLocation from './UserLocation';
import SearchBar from '@/components/discovery/SearchBar';
import POICard from '@/components/discovery/POICard';
import BywayCard from '@/components/discovery/BywayCard';
import ItineraryDrawer from '@/components/itinerary/ItineraryDrawer';
import LocationPermissionModal from '@/components/LocationPermissionModal';
import { useLocation } from '@/hooks/useLocation';
import { useMapStore } from '@/store/map.store';
import { useDiscoveryStore } from '@/store/discovery.store';
import { useItineraryStore } from '@/store/itinerary.store';
import { usePOISearch } from '@/hooks/usePOISearch';
import { MapIcon, Navigation, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MapView() {
  const location = useLocation();
  const { mapInstance, bywaysVisible, toggleByways } = useMapStore();
  const { selectedPOI, selectedBywayId, selectPOI, selectByway } = useDiscoveryStore();
  const { itinerary, drawerOpen, setDrawerOpen } = useItineraryStore();
  const { search } = usePOISearch();
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const permissionPromptShownRef = useRef(false);

  // Show permission modal on first visit after a short delay
  useEffect(() => {
    if (permissionPromptShownRef.current) return;
    if (location.source === 'default' && location.status === 'resolved') {
      permissionPromptShownRef.current = true;
      const timer = setTimeout(() => setShowPermissionModal(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [location.source, location.status]);

  // Search for POIs when location resolves
  useEffect(() => {
    if (location.coordinates && location.status === 'resolved') {
      search(location.coordinates);
    }
  }, [location.coordinates, location.status, search]);

  // Search when map center changes significantly
  useEffect(() => {
    if (!mapInstance) return;
    const listener = mapInstance.addListener('idle', () => {
      const center = mapInstance.getCenter();
      if (!center) return;
      search({ lat: center.lat(), lng: center.lng() });
    });
    return () => google.maps.event.removeListener(listener);
  }, [mapInstance, search]);

  const recenterOnLocation = () => {
    if (location.coordinates && mapInstance) {
      mapInstance.panTo(location.coordinates);
      mapInstance.setZoom(14);
    }
  };

  const stopCount = itinerary.stops.length;

  return (
    <div className="relative w-full h-dvh overflow-hidden bg-[var(--color-bg)]">
      {/* Map canvas — fills entire viewport */}
      <MapCanvas onMapClick={() => { selectPOI(null); selectByway(null); }} />

      {/* Overlays */}
      <BywayLayer />
      <POIMarkers />
      <UserLocation coordinates={location.coordinates} />

      {/* Search bar — top overlay */}
      <div className="absolute top-3 left-3 right-3 z-20 flex gap-2">
        <SearchBar />
        <button
          onClick={toggleByways}
          aria-label="Toggle byways layer"
          className={cn(
            'min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border transition-colors',
            'bg-[var(--color-surface)] border-[var(--color-border)]',
            bywaysVisible
              ? 'text-[var(--color-accent)]'
              : 'text-[var(--color-text-muted)]',
          )}
        >
          <Layers size={20} />
        </button>
      </div>

      {/* Bottom-left: recenter button */}
      <button
        onClick={recenterOnLocation}
        aria-label="Re-center on my location"
        className="absolute bottom-24 left-4 z-20 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors shadow-lg"
      >
        <Navigation size={20} />
      </button>

      {/* Bottom-right: itinerary FAB */}
      <button
        onClick={() => setDrawerOpen(true)}
        aria-label={`Open itinerary${stopCount > 0 ? `, ${stopCount} stops` : ''}`}
        className="absolute bottom-8 right-4 z-20 min-w-[56px] min-h-[56px] flex items-center justify-center rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white shadow-lg transition-colors"
      >
        <MapIcon size={24} />
        {stopCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-[var(--color-error)] text-white text-xs font-bold leading-none">
            {stopCount}
          </span>
        )}
      </button>

      {/* Info cards */}
      {selectedPOI && <POICard poi={selectedPOI} onClose={() => selectPOI(null)} />}
      {selectedBywayId && <BywayCard bywayId={selectedBywayId} onClose={() => selectByway(null)} />}

      {/* Itinerary drawer */}
      <ItineraryDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />

      {/* Location permission modal */}
      {showPermissionModal && (
        <LocationPermissionModal
          onGrant={() => {
            location.requestPermission();
            setShowPermissionModal(false);
          }}
          onDismiss={() => setShowPermissionModal(false)}
        />
      )}
    </div>
  );
}
