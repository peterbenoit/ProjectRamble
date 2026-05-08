import { NextRequest, NextResponse } from 'next/server';
import { normalizePlacesResult } from '@/lib/places';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get('placeId');

  if (!placeId) {
    return NextResponse.json({ error: 'placeId is required' }, { status: 400 });
  }

  const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY!,
      'X-Goog-FieldMask':
        'id,displayName,formattedAddress,location,rating,userRatingCount,primaryType,currentOpeningHours,websiteUri,nationalPhoneNumber',
    },
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Places API error' }, { status: 502 });
  }

  const data = await response.json();
  return NextResponse.json(normalizePlacesResult(data));
}
