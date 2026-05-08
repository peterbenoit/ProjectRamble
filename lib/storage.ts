const KEYS = {
  ITINERARY: 'pw_itinerary',
  DRAWER_OPEN: 'pw_drawer_open',
  BYWAYS_VISIBLE: 'pw_byways_visible',
  LOCATION_PERMISSION: 'pw_location_permission',
} as const;

export { KEYS as STORAGE_KEYS };

export function storageGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function storageSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage might be full or unavailable
  }
}

export function storageRemove(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
