import { describe, it, expect, beforeEach } from 'vitest'
import { loadItinerary, saveItinerary, clearItinerary } from '../../lib/storage.js'

const STOPS = [
  { id: 'a1', name: 'Myakka River State Park', location: { lat: 27.2, lng: -82.3 }, note: '' },
  { id: 'b2', name: 'Corkscrew Swamp', location: { lat: 26.4, lng: -81.6 }, note: 'bring boots' },
]

beforeEach(() => {
  localStorage.clear()
})

describe('storage', () => {
  it('loadItinerary returns [] when nothing is stored', () => {
    expect(loadItinerary()).toEqual([])
  })

  it('saveItinerary + loadItinerary round-trips the full stop list', () => {
    saveItinerary(STOPS)
    expect(loadItinerary()).toEqual(STOPS)
  })

  it('clearItinerary removes persisted data', () => {
    saveItinerary(STOPS)
    clearItinerary()
    expect(loadItinerary()).toEqual([])
  })

  it('loadItinerary returns [] if stored JSON is corrupt', () => {
    localStorage.setItem('pathweaver_itinerary', '{bad json}')
    expect(loadItinerary()).toEqual([])
  })

  it('overwriting with saveItinerary replaces the previous value', () => {
    saveItinerary(STOPS)
    saveItinerary([STOPS[0]])
    expect(loadItinerary()).toEqual([STOPS[0]])
  })
})
