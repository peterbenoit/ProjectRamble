import { describe, it, expect } from 'vitest'
import { encodeItinerary, decodeItinerary, buildShareUrl } from '../../lib/url-encoding.js'

const STOPS = [
  { id: 'abc', name: 'Test Park', location: { lat: 27.5, lng: -81.5 }, note: '' },
  { id: 'def', name: 'Cypress Trail', location: { lat: 28.0, lng: -82.0 }, note: 'bring water' },
]

describe('url-encoding', () => {
  it('encodes and decodes a round-trip correctly', () => {
    const encoded = encodeItinerary(STOPS)
    const decoded = decodeItinerary(encoded)
    expect(decoded).toEqual(STOPS)
  })

  it('returns null for a malformed encoded string', () => {
    expect(decodeItinerary('not-valid-lzstring-data!!')).toBeNull()
  })

  it('buildShareUrl produces a /share/ path', () => {
    const url = buildShareUrl(STOPS)
    expect(url).toMatch(/^\/share\//)
  })

  it('share URL round-trips correctly', () => {
    const url = buildShareUrl(STOPS)
    const encoded = url.replace('/share/', '')
    expect(decodeItinerary(encoded)).toEqual(STOPS)
  })

  it('handles an empty stop list', () => {
    const encoded = encodeItinerary([])
    expect(decodeItinerary(encoded)).toEqual([])
  })
})
