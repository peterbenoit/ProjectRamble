'use client';

import { useEffect, useRef } from 'react';
import type { Feature, LineString, MultiLineString, GeoJsonProperties } from 'geojson';
import { useMapStore } from '@/store/map.store';
import { useDiscoveryStore } from '@/store/discovery.store';
import { useItineraryStore } from '@/store/itinerary.store';
import { useByways } from '@/hooks/useByways';
import type { BywayProperties } from '@/types';

export default function BywayLayer() {
  const { mapInstance, bywaysVisible } = useMapStore();
  const { selectByway } = useDiscoveryStore();
  const { setDrawerOpen } = useItineraryStore();
  const byways = useByways();
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!mapInstance || !byways) return;

    // Clear existing polylines
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    byways.features.forEach((feature: Feature<GeoJSON.Geometry, GeoJsonProperties>) => {
      const props = feature.properties as BywayProperties;
      const color = props.color ?? '#4A90D9';

      const getPath = (coords: number[][]): google.maps.LatLngLiteral[] =>
        coords.map(([lng, lat]) => ({ lat, lng }));

      let paths: google.maps.LatLngLiteral[][] = [];

      if (feature.geometry.type === 'LineString') {
        paths = [getPath((feature as Feature<LineString>).geometry.coordinates)];
      } else if (feature.geometry.type === 'MultiLineString') {
        paths = (feature as Feature<MultiLineString>).geometry.coordinates.map(getPath);
      }

      paths.forEach((path) => {
        const polyline = new google.maps.Polyline({
          path,
          strokeColor: color,
          strokeWeight: 4,
          strokeOpacity: 0.8,
          map: bywaysVisible ? mapInstance : null,
          clickable: true,
        });

        polyline.addListener('click', () => { setDrawerOpen(false); selectByway(props.id); });
        polyline.addListener('mouseover', () => {
          polyline.setOptions({ strokeWeight: 6, strokeOpacity: 1 });
        });
        polyline.addListener('mouseout', () => {
          polyline.setOptions({ strokeWeight: 4, strokeOpacity: 0.8 });
        });

        polylinesRef.current.push(polyline);
      });
    });

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [mapInstance, byways]); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle visibility
  useEffect(() => {
    polylinesRef.current.forEach((p) =>
      p.setMap(bywaysVisible ? mapInstance : null),
    );
  }, [bywaysVisible, mapInstance]);

  return null;
}
