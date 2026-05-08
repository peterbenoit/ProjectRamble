'use client';

import { useEffect, useRef } from 'react';
import { useMapStore } from '@/store/map.store';
import type { Coordinates } from '@/types';

interface Props {
  coordinates: Coordinates | null;
}

export default function UserLocation({ coordinates }: Props) {
  const { mapInstance } = useMapStore();
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  useEffect(() => {
    if (!mapInstance || !coordinates) return;

    const el = document.createElement('div');
    el.style.cssText = `
      width: 16px; height: 16px; border-radius: 50%;
      background: var(--color-location, #60a5fa);
      box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3);
      position: relative;
    `;

    const pulse = document.createElement('div');
    pulse.style.cssText = `
      position: absolute; inset: -8px; border-radius: 50%;
      background: rgba(96, 165, 250, 0.3);
      animation: pulse-ring 2s ease-out infinite;
    `;
    el.appendChild(pulse);

    if (markerRef.current) {
      markerRef.current.map = null;
    }

    markerRef.current = new google.maps.marker.AdvancedMarkerElement({
      map: mapInstance,
      position: coordinates,
      content: el,
      title: 'Your location',
      zIndex: 100,
    });

    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
    };
  }, [mapInstance, coordinates]);

  return null;
}
