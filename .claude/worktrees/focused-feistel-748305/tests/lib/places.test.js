import { describe, it, expect } from 'vitest'
import { normalizePlacesResult } from '../../lib/places.js'

const RAW = {
  id: 'ChIJ_abc123',
  displayName: { text: 'Myakka River State Park' },
  location: { latitude: 27.2308, longitude: -82.3206 },
  formattedAddress: '13208 FL-72, Sarasota, FL 34241',
  nationalPhoneNumber: '(941) 361-6511',
  websiteUri: 'https://www.floridastateparks.org/myakka',
  rating: 4.8,
  userRatingCount: 1200,
  primaryType: 'park',
  currentOpeningHours: { openNow: true },
}

describe('normalizePlacesResult', () => {
  it('maps id correctly', () => {
    expect(normalizePlacesResult(RAW).id).toBe('ChIJ_abc123')
  })

  it('maps displayName.text to name', () => {
    expect(normalizePlacesResult(RAW).name).toBe('Myakka River State Park')
  })

  it('maps location to { lat, lng }', () => {
    expect(normalizePlacesResult(RAW).location).toEqual({ lat: 27.2308, lng: -82.3206 })
  })

  it('maps formattedAddress to address', () => {
    expect(normalizePlacesResult(RAW).address).toBe('13208 FL-72, Sarasota, FL 34241')
  })

  it('maps nationalPhoneNumber to phone', () => {
    expect(normalizePlacesResult(RAW).phone).toBe('(941) 361-6511')
  })

  it('maps websiteUri to website', () => {
    expect(normalizePlacesResult(RAW).website).toBe('https://www.floridastateparks.org/myakka')
  })

  it('maps rating', () => {
    expect(normalizePlacesResult(RAW).rating).toBe(4.8)
  })

  it('maps userRatingCount to userRatingsTotal', () => {
    expect(normalizePlacesResult(RAW).userRatingsTotal).toBe(1200)
  })

  it('maps primaryType into types array', () => {
    expect(normalizePlacesResult(RAW).types).toContain('park')
  })

  it('maps currentOpeningHours.openNow to openNow', () => {
    expect(normalizePlacesResult(RAW).openNow).toBe(true)
  })

  it('handles missing currentOpeningHours gracefully', () => {
    const raw = { ...RAW, currentOpeningHours: undefined }
    expect(() => normalizePlacesResult(raw)).not.toThrow()
    expect(normalizePlacesResult(raw).openNow).toBeUndefined()
  })

  it('handles missing optional fields without throwing', () => {
    const minimal = { id: 'x', displayName: { text: 'Place' }, location: { latitude: 0, longitude: 0 } }
    expect(() => normalizePlacesResult(minimal)).not.toThrow()
  })
})
