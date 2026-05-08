'use client';

import { useEffect, useRef } from 'react';
import { getGoogleMaps } from '@/lib/google-maps';
import { MAP_STYLE } from '@/lib/map-style';
import { useMapStore } from '@/store/map.store';

interface Props {
  onMapClick: () => void;
}

export default function MapCanvas({ onMapClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { center, zoom, setMapInstance, setCenter, setZoom } = useMapStore();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || !containerRef.current) return;
    initializedRef.current = true;

    getGoogleMaps().then((maps) => {
      const map = new maps.Map(containerRef.current!, {
        center,
        zoom,
        styles: MAP_STYLE,
        disableDefaultUI: true,
        gestureHandling: 'greedy',
        clickableIcons: false,
        mapId: 'pathweaver-map',
      });

      map.addListener('center_changed', () => {
        const c = map.getCenter();
        if (c) setCenter({ lat: c.lat(), lng: c.lng() });
      });

      map.addListener('zoom_changed', () => {
        setZoom(map.getZoom() ?? 12);
      });

      map.addListener('click', onMapClick);

      setMapInstance(map);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      aria-label="Map"
    />
  );
}
