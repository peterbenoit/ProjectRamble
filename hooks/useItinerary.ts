'use client';

import { useItineraryStore } from '@/store/itinerary.store';

export function useItinerary() {
  return useItineraryStore();
}
