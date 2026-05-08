import { NextRequest, NextResponse } from 'next/server';

const FLORIDA_CENTER = { lat: 27.9944024, lng: -81.7602544 };

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '8.8.8.8';

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=lat,lon,status`, {
      next: { revalidate: 3600 },
    });
    const data = await response.json();

    if (data.status !== 'success') {
      return NextResponse.json(FLORIDA_CENTER);
    }

    return NextResponse.json({ lat: data.lat, lng: data.lon });
  } catch {
    return NextResponse.json(FLORIDA_CENTER);
  }
}
