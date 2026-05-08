export interface Coordinates {
  lat: number;
  lng: number;
}

export type BywayDesignation =
  | 'florida_scenic'
  | 'national_scenic'
  | 'all_american_road'
  | 'state_historic';

export type BywayTag =
  | 'coastal'
  | 'historic'
  | 'nature'
  | 'photography'
  | 'wildlife'
  | 'urban'
  | 'forest'
  | 'heritage';

export interface BywayProperties {
  id: string;
  name: string;
  state: string;
  designation: BywayDesignation[];
  length_miles: number;
  description: string;
  counties: string[];
  url: string;
  color: string;
  tags: BywayTag[];
}

export type StopType = 'poi' | 'byway_waypoint' | 'custom';

export interface Stop {
  id: string;
  type: StopType;
  name: string;
  coordinates: Coordinates;
  address?: string;
  placeId?: string;
  bywayId?: string;
  fieldNote?: string;
  addedAt: number;
}

export interface Itinerary {
  id: string;
  name?: string;
  stops: Stop[];
  createdAt: number;
  updatedAt: number;
}

export interface SharedStop {
  id: string;
  type: StopType;
  name: string;
  coordinates: Coordinates;
  address?: string;
  fieldNote?: string;
  bywayId?: string;
}

export interface SharedItinerary {
  v: 1;
  name?: string;
  stops: SharedStop[];
}

export interface POI {
  placeId: string;
  name: string;
  type: string;
  coordinates: Coordinates;
  address: string;
  distanceMiles?: number;
  rating?: number;
  ratingCount?: number;
  openNow?: boolean;
  websiteUrl?: string;
  phoneNumber?: string;
}

export type LocationSource = 'browser_gps' | 'ip_geolocation' | 'default';
export type LocationStatus = 'idle' | 'resolving' | 'resolved' | 'denied' | 'error';

export interface LocationState {
  coordinates: Coordinates | null;
  accuracy: number | null;
  source: LocationSource;
  status: LocationStatus;
}
