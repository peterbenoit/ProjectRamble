import { describe, it, expect } from 'vitest'
import { haversineDistance, sortByProximity } from '../../lib/proximity-sort.js'

const ORIGIN = { lat: 27.9944, lng: -81.7603 } // Florida center

const STOPS = [
  { id: 'far',  name: 'Far Stop',  location: { lat: 30.0, lng: -81.0 } },
  { id: 'near', name: 'Near Stop', location: { lat: 28.1, lng: -81.8 } },
  { id: 'mid',  name: 'Mid Stop',  location: { lat: 29.0, lng: -81.4 } },
]

describe('haversineDistance', () => {
  it('returns 0 for the same point', () => {
    expect(haversineDistance(ORIGIN, ORIGIN)).toBe(0)
  })

  it('returns a positive number for different points', () => {
    expect(haversineDistance(ORIGIN, { lat: 28.5, lng: -81.5 })).toBeGreaterThan(0)
  })

  it('is symmetric', () => {
    const a = { lat: 27.5, lng: -82.0 }
    const b = { lat: 29.0, lng: -81.0 }
    expect(haversineDistance(a, b)).toBeCloseTo(haversineDistance(b, a), 8)
  })

  it('returns distance in miles — Tampa to Orlando is ~85 miles', () => {
    const tampa = { lat: 27.9506, lng: -82.4572 }
    const orlando = { lat: 28.5383, lng: -81.3792 }
    expect(haversineDistance(tampa, orlando)).toBeCloseTo(77, 0)
  })
})

describe('sortByProximity', () => {
  it('does not mutate the input array', () => {
    const snapshot = STOPS.map((s) => ({ ...s }))
    sortByProximity(STOPS, ORIGIN)
    expect(STOPS).toEqual(snapshot)
  })

  it('returns the same number of stops', () => {
    expect(sortByProximity(STOPS, ORIGIN)).toHaveLength(STOPS.length)
  })

  it('places the nearest stop first', () => {
    expect(sortByProximity(STOPS, ORIGIN)[0].id).toBe('near')
  })

  it('places the farthest stop last', () => {
    const result = sortByProximity(STOPS, ORIGIN)
    expect(result[result.length - 1].id).toBe('far')
  })

  it('handles an empty array', () => {
    expect(sortByProximity([], ORIGIN)).toEqual([])
  })

  it('handles a single stop', () => {
    expect(sortByProximity([STOPS[0]], ORIGIN)).toEqual([STOPS[0]])
  })

  it('contains all original stops in the result', () => {
    const result = sortByProximity(STOPS, ORIGIN)
    const ids = result.map((s) => s.id).sort()
    expect(ids).toEqual(STOPS.map((s) => s.id).sort())
  })
})
