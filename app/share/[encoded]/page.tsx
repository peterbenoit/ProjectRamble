import type { Metadata } from 'next';
import { decodeItinerary } from '@/lib/url-encoding';
import type { SharedItinerary } from '@/types';
import { MapPin, ExternalLink } from 'lucide-react';

interface Props {
  params: Promise<{ encoded: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { encoded } = await params;
  const itinerary = decodeItinerary(decodeURIComponent(encoded));
  return {
    title: itinerary?.name ? `${itinerary.name} — PathWeaver` : 'Shared Route — PathWeaver',
  };
}

export default async function SharePage({ params }: Props) {
  const { encoded } = await params;
  let itinerary: SharedItinerary | null = null;

  try {
    itinerary = decodeItinerary(decodeURIComponent(encoded));
  } catch {
    itinerary = null;
  }

  if (!itinerary || !itinerary.stops) {
    return (
      <div className="min-h-dvh bg-[#020617] flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-[#f8fafc] mb-2">Link not found</h1>
          <p className="text-[#94a3b8] text-sm mb-6">This link may be invalid or expired.</p>
          <a href="/" className="text-[#3b82f6] hover:underline text-sm">
            Open PathWeaver →
          </a>
        </div>
      </div>
    );
  }

  const stops = itinerary.stops;
  const stopCount = stops.length;

  const googleMapsUrl = (() => {
    if (stopCount === 0) return null;
    if (stopCount === 1) {
      const s = stops[0];
      return `https://www.google.com/maps/search/?api=1&query=${s.coordinates.lat},${s.coordinates.lng}`;
    }
    const origin = `${stops[0].coordinates.lat},${stops[0].coordinates.lng}`;
    const dest = `${stops[stopCount - 1].coordinates.lat},${stops[stopCount - 1].coordinates.lng}`;
    const waypoints = stops
      .slice(1, -1)
      .map((s) => `${s.coordinates.lat},${s.coordinates.lng}`)
      .join('|');
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}${waypoints ? `&waypoints=${waypoints}` : ''}`;
  })();

  return (
    <div className="min-h-dvh bg-[#020617] text-[#f8fafc]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-sm text-[#94a3b8] mb-1">PathWeaver</p>
          <h1 className="text-xl font-semibold">
            {itinerary.name ?? 'Shared Route'}
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1">
            {stopCount} stop{stopCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Static map placeholder */}
        <div className="rounded-xl overflow-hidden border border-[#334155] mb-6 aspect-video bg-[#0f172a] flex items-center justify-center">
          <p className="text-sm text-[#475569]">Map preview</p>
        </div>

        {/* Stop list */}
        <ol className="space-y-4 mb-8">
          {stops.map((stop, idx) => (
            <li key={stop.id} className="flex gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-[#3b82f6] text-white text-sm font-bold flex items-center justify-center mt-0.5">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#f8fafc]">{stop.name}</p>
                {stop.address && (
                  <div className="flex items-center gap-1 text-sm text-[#94a3b8] mt-0.5">
                    <MapPin size={12} />
                    <span>{stop.address}</span>
                  </div>
                )}
                {stop.fieldNote && (
                  <p className="text-sm italic text-[#94a3b8] mt-1">&ldquo;{stop.fieldNote}&rdquo;</p>
                )}
              </div>
            </li>
          ))}
        </ol>

        {googleMapsUrl && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium transition-colors"
          >
            <ExternalLink size={16} />
            Open in Google Maps
          </a>
        )}

        <p className="mt-8 text-xs text-[#475569]">Built with PathWeaver</p>
      </div>
    </div>
  );
}
