'use client';

import { useEffect, useRef } from 'react';
import { useMapStore } from '@/store/map.store';
import { useDiscoveryStore } from '@/store/discovery.store';
import { useItineraryStore } from '@/store/itinerary.store';
import type { POI } from '@/types';

function createPOIMarkerElement(poi: POI, isSelected: boolean, stopIndex: number | null): HTMLElement {
  const el = document.createElement('div');
  el.style.cssText = `
    width: 32px; height: 32px; border-radius: 50%; display: flex;
    align-items: center; justify-content: center; cursor: pointer;
    position: relative; transition: all 0.15s;
    background: ${isSelected ? '#ffffff' : 'var(--color-accent, #3b82f6)'};
    box-shadow: ${isSelected ? '0 2px 8px rgba(0,0,0,0.4)' : '0 1px 4px rgba(0,0,0,0.3)'};
  `;

  if (stopIndex !== null) {
    const badge = document.createElement('span');
    badge.style.cssText = `
      position: absolute; top: -6px; right: -6px; min-width: 18px; height: 18px;
      padding: 0 4px; border-radius: 9px; background: var(--color-error, #ef4444);
      color: white; font-size: 10px; font-weight: 700; display: flex;
      align-items: center; justify-content: center; font-family: sans-serif;
    `;
    badge.textContent = String(stopIndex + 1);
    el.appendChild(badge);
  }

  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('width', '16');
  icon.setAttribute('height', '16');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('fill', 'none');
  icon.setAttribute('stroke', isSelected ? 'var(--color-accent, #3b82f6)' : 'white');
  icon.setAttribute('stroke-width', '2');
  icon.setAttribute('stroke-linecap', 'round');
  icon.setAttribute('stroke-linejoin', 'round');
  // Tree/leaf icon path
  icon.innerHTML = '<path d="M17 8C8 10 5.9 16.17 3.82 19.83M12 22V12M12 12C12 12 15 9 19 9M12 12C12 12 9 9 5 9"/>';
  el.appendChild(icon);

  return el;
}

export default function POIMarkers() {
  const { mapInstance } = useMapStore();
  const { pois, selectedPOI, selectPOI } = useDiscoveryStore();
  const { itinerary } = useItineraryStore();
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  useEffect(() => {
    if (!mapInstance) return;

    // Clear existing markers
    markersRef.current.forEach((m) => (m.map = null));
    markersRef.current = [];

    const stopPlaceIds = new Set(itinerary.stops.map((s) => s.placeId).filter(Boolean));

    pois.forEach((poi) => {
      const isSelected = selectedPOI?.placeId === poi.placeId;
      const stopIdx = itinerary.stops.findIndex((s) => s.placeId === poi.placeId);
      const el = createPOIMarkerElement(poi, isSelected, stopIdx >= 0 ? stopIdx : null);

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapInstance,
        position: poi.coordinates,
        content: el,
        title: poi.name,
        zIndex: isSelected ? 10 : stopPlaceIds.has(poi.placeId) ? 5 : 1,
      });

      marker.addListener('click', () => selectPOI(poi));
      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => (m.map = null));
      markersRef.current = [];
    };
  }, [mapInstance, pois, selectedPOI, itinerary.stops, selectPOI]);

  return null;
}
