import { NextRequest, NextResponse } from 'next/server';

const FLORIDA_CENTER = { lat: 27.9944024, lng: -81.7602544 };

const LOCALHOST_IPS = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1';

  // On localhost the server sees a loopback address — skip the lookup
  if (LOCALHOST_IPS.has(ip)) {
    return NextResponse.json(FLORIDA_CENTER);
  }

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
