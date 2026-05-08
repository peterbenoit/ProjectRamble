import { Loader } from '@googlemaps/js-api-loader';

let loader: Loader | null = null;
let googleMapsPromise: Promise<typeof google.maps> | null = null;

export async function getGoogleMaps(): Promise<typeof google.maps> {
  if (googleMapsPromise) return googleMapsPromise;

  if (!loader) {
    loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['places', 'geometry', 'marker'],
    });
  }

  googleMapsPromise = loader.load().then(() => google.maps);
  return googleMapsPromise;
}
