import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { input, sessionToken, locationBias } = await req.json();

  if (!input || typeof input !== 'string') {
    return NextResponse.json({ error: 'input is required' }, { status: 400 });
  }

  const body: Record<string, unknown> = {
    input,
    sessionToken,
    includedRegionCodes: ['us'],
  };

  if (locationBias) {
    body.locationBias = {
      circle: {
        center: { latitude: locationBias.lat, longitude: locationBias.lng },
        radius: 50000,
      },
    };
  }

  const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY!,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return NextResponse.json({ suggestions: [] });
  }

  const data = await response.json();
  const suggestions = (data.suggestions ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (s: any) => ({
      placeId: s.placePrediction?.placeId ?? '',
      text: s.placePrediction?.text?.text ?? '',
      secondaryText: s.placePrediction?.structuredFormat?.secondaryText?.text,
    }),
  );

  return NextResponse.json({ suggestions });
}
