import LZString from 'lz-string';
import type { SharedItinerary, Itinerary } from '@/types';

export function encodeItinerary(itinerary: SharedItinerary): string {
  const json = JSON.stringify(itinerary);
  return LZString.compressToEncodedURIComponent(json);
}

export function decodeItinerary(encoded: string): SharedItinerary | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    return JSON.parse(json) as SharedItinerary;
  } catch {
    return null;
  }
}

export function itineraryToShared(itinerary: Itinerary): SharedItinerary {
  return {
    v: 1,
    name: itinerary.name,
    stops: itinerary.stops.map((stop) => ({
      id: stop.id,
      type: stop.type,
      name: stop.name,
      coordinates: stop.coordinates,
      address: stop.address,
      fieldNote: stop.fieldNote,
      bywayId: stop.bywayId,
    })),
  };
}
