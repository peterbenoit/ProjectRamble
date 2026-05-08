import type { POI } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizePlacesResult(place: any): POI {
  return {
    placeId: place.id ?? place.place_id ?? '',
    name: place.displayName?.text ?? place.name ?? '',
    type: place.primaryType ?? place.types?.[0] ?? 'place',
    coordinates: {
      lat: place.location?.latitude ?? place.geometry?.location?.lat ?? 0,
      lng: place.location?.longitude ?? place.geometry?.location?.lng ?? 0,
    },
    address: place.formattedAddress ?? place.vicinity ?? '',
    rating: place.rating,
    ratingCount: place.userRatingCount ?? place.user_ratings_total,
    openNow: place.currentOpeningHours?.openNow ?? place.opening_hours?.open_now,
    websiteUrl: place.websiteUri ?? place.website,
    phoneNumber: place.nationalPhoneNumber ?? place.formatted_phone_number,
  };
}
