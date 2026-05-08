import type { Coordinates, Stop } from '@/types';

function haversineDistance(a: Coordinates, b: Coordinates): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinDLng *
      sinDLng;
  return R * 2 * Math.asin(Math.sqrt(h));
}

export function sortByProximity(stops: Stop[], origin: Coordinates): Stop[] {
  if (stops.length <= 1) return stops;

  const remaining = [...stops];
  const sorted: Stop[] = [];
  let current = origin;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = haversineDistance(current, remaining[0].coordinates);

    for (let i = 1; i < remaining.length; i++) {
      const dist = haversineDistance(current, remaining[i].coordinates);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    sorted.push(remaining[nearestIdx]);
    current = remaining[nearestIdx].coordinates;
    remaining.splice(nearestIdx, 1);
  }

  return sorted;
}

export function distanceMiles(a: Coordinates, b: Coordinates): number {
  return haversineDistance(a, b);
}
