import { NextRequest, NextResponse } from 'next/server';
import { normalizePlacesResult } from '@/lib/places';

export async function POST(req: NextRequest) {
  const {
    coordinates,
    radiusMeters = 16093,
    types = ['park', 'natural_feature', 'campground'],
  } = await req.json();

  const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY!,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.primaryType,places.currentOpeningHours,places.websiteUri,places.nationalPhoneNumber',
    },
    body: JSON.stringify({
      includedTypes: types,
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude: coordinates.lat, longitude: coordinates.lng },
          radius: radiusMeters,
        },
      },
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Places API error' }, { status: 502 });
  }

  const data = await response.json();
  const pois = (data.places ?? []).map(normalizePlacesResult);
  return NextResponse.json(pois);
}
