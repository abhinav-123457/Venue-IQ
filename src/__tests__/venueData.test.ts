import { describe, it, expect } from 'vitest'
import {
  INITIAL_ZONES,
  INITIAL_EVENT,
  getCrowdColor,
  getCrowdBg,
  getBestZoneByType,
  getOverallCrowdLevel,
  getPersonalizedInfo,
  buildSystemPrompt,
  generateDirections,
} from '@/lib/venueData'
import type { Zone } from '@/lib/types'

describe('venueData', () => {
  // ──────────── Data Integrity ────────────
  describe('INITIAL_ZONES', () => {
    it('should contain at least one zone per type', () => {
      const types = ['gate', 'food', 'restroom', 'medical', 'parking']
      types.forEach((type) => {
        const matching = INITIAL_ZONES.filter((z) => z.type === type)
        expect(matching.length).toBeGreaterThanOrEqual(1)
      })
    })

    it('should have unique IDs', () => {
      const ids = INITIAL_ZONES.map((z) => z.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('should have valid lat/lng on all zones', () => {
      INITIAL_ZONES.forEach((z) => {
        expect(z.lat).toBeGreaterThan(0)
        expect(z.lng).toBeGreaterThan(0)
      })
    })

    it('should have a boolean accessible field on all zones', () => {
      INITIAL_ZONES.forEach((z) => {
        expect(typeof z.accessible).toBe('boolean')
      })
    })

    it('should have at least one accessible zone of each navigable type', () => {
      const navigableTypes = ['gate', 'food', 'restroom', 'parking']
      navigableTypes.forEach((type) => {
        const accessible = INITIAL_ZONES.filter((z) => z.type === type && z.accessible)
        expect(accessible.length).toBeGreaterThanOrEqual(1)
      })
    })
  })

  describe('INITIAL_EVENT', () => {
    it('should have required fields', () => {
      expect(INITIAL_EVENT.name).toBeTruthy()
      expect(['LIVE', 'UPCOMING', 'FINISHED']).toContain(INITIAL_EVENT.status)
      expect(INITIAL_EVENT.minute).toBeGreaterThanOrEqual(0)
      expect([1, 2]).toContain(INITIAL_EVENT.half)
    })
  })

  // ──────────── Utility Functions ────────────
  describe('getCrowdColor', () => {
    it('returns green hex for low', () => {
      expect(getCrowdColor('low')).toBe('#22c55e')
    })

    it('returns orange hex for medium', () => {
      expect(getCrowdColor('medium')).toBe('#f97316')
    })

    it('returns red hex for high', () => {
      expect(getCrowdColor('high')).toBe('#ef4444')
    })
  })

  describe('getCrowdBg', () => {
    it('returns Tailwind classes for each crowd level', () => {
      expect(getCrowdBg('low')).toContain('green')
      expect(getCrowdBg('medium')).toContain('orange')
      expect(getCrowdBg('high')).toContain('red')
    })
  })

  describe('getBestZoneByType', () => {
    it('returns the zone with lowest wait time for gates', () => {
      const best = getBestZoneByType(INITIAL_ZONES, 'gate')
      const allGates = INITIAL_ZONES.filter((z) => z.type === 'gate')
      const minWait = Math.min(...allGates.map((z) => z.waitMinutes))
      expect(best.waitMinutes).toBe(minWait)
    })

    it('returns a food zone for food type', () => {
      const best = getBestZoneByType(INITIAL_ZONES, 'food')
      expect(best.type).toBe('food')
    })
  })

  describe('getOverallCrowdLevel', () => {
    it('returns low when majority of zones are low', () => {
      const zones: Zone[] = [
        { id: '1', name: 'A', type: 'gate', crowdLevel: 'low', waitMinutes: 1, lat: 0, lng: 0, accessible: true },
        { id: '2', name: 'B', type: 'gate', crowdLevel: 'low', waitMinutes: 1, lat: 0, lng: 0, accessible: true },
        { id: '3', name: 'C', type: 'gate', crowdLevel: 'high', waitMinutes: 1, lat: 0, lng: 0, accessible: true },
      ]
      expect(getOverallCrowdLevel(zones)).toBe('low')
    })

    it('returns high when majority of zones are high', () => {
      const zones: Zone[] = [
        { id: '1', name: 'A', type: 'gate', crowdLevel: 'high', waitMinutes: 10, lat: 0, lng: 0, accessible: true },
        { id: '2', name: 'B', type: 'gate', crowdLevel: 'high', waitMinutes: 10, lat: 0, lng: 0, accessible: true },
        { id: '3', name: 'C', type: 'gate', crowdLevel: 'low', waitMinutes: 1, lat: 0, lng: 0, accessible: true },
      ]
      expect(getOverallCrowdLevel(zones)).toBe('high')
    })
  })

  // ──────────── Personalization ────────────
  describe('getPersonalizedInfo', () => {
    it('returns null for empty section input', () => {
      expect(getPersonalizedInfo('', INITIAL_ZONES, INITIAL_EVENT)).toBeNull()
      expect(getPersonalizedInfo('   ', INITIAL_ZONES, INITIAL_EVENT)).toBeNull()
    })

    it('returns valid info for numeric sections', () => {
      const info = getPersonalizedInfo('101', INITIAL_ZONES, INITIAL_EVENT)
      expect(info).not.toBeNull()
      expect(info!.area).toBe('North Stand')
      expect(info!.nearestGate).toBeDefined()
      expect(info!.nearestFood).toBeDefined()
      expect(info!.tips.length).toBeGreaterThan(0)
    })

    it('maps sections to correct areas', () => {
      expect(getPersonalizedInfo('105', INITIAL_ZONES, INITIAL_EVENT)!.area).toBe('North Stand')
      expect(getPersonalizedInfo('115', INITIAL_ZONES, INITIAL_EVENT)!.area).toBe('East Stand')
      expect(getPersonalizedInfo('205', INITIAL_ZONES, INITIAL_EVENT)!.area).toBe('South Stand')
      expect(getPersonalizedInfo('215', INITIAL_ZONES, INITIAL_EVENT)!.area).toBe('West Stand')
    })

    it('maps letter sections correctly', () => {
      expect(getPersonalizedInfo('A1', INITIAL_ZONES, INITIAL_EVENT)!.area).toBe('North Stand')
      expect(getPersonalizedInfo('B12', INITIAL_ZONES, INITIAL_EVENT)!.area).toBe('East Stand')
      expect(getPersonalizedInfo('C5', INITIAL_ZONES, INITIAL_EVENT)!.area).toBe('South Stand')
      expect(getPersonalizedInfo('D3', INITIAL_ZONES, INITIAL_EVENT)!.area).toBe('West Stand')
    })

    it('prefers accessible zones in accessibility mode', () => {
      const info = getPersonalizedInfo('115', INITIAL_ZONES, INITIAL_EVENT, true)
      expect(info).not.toBeNull()
      expect(info!.nearestGate.accessible).toBe(true)
      expect(info!.nearestRestroom.accessible).toBe(true)
    })

    it('adds accessibility tips in accessibility mode', () => {
      const info = getPersonalizedInfo('101', INITIAL_ZONES, INITIAL_EVENT, true)
      const a11yTips = info!.tips.filter((t) => t.includes('♿'))
      expect(a11yTips.length).toBeGreaterThan(0)
    })
  })

  // ──────────── System Prompt ────────────
  describe('buildSystemPrompt', () => {
    it('includes event name and status', () => {
      const prompt = buildSystemPrompt(INITIAL_ZONES, INITIAL_EVENT)
      expect(prompt).toContain(INITIAL_EVENT.name)
      expect(prompt).toContain('LIVE')
    })

    it('includes zone names and accessibility data', () => {
      const prompt = buildSystemPrompt(INITIAL_ZONES, INITIAL_EVENT)
      expect(prompt).toContain('Gate A')
      expect(prompt).toContain('accessible=')
    })

    it('includes wheelchair accessibility instructions', () => {
      const prompt = buildSystemPrompt(INITIAL_ZONES, INITIAL_EVENT)
      expect(prompt.toLowerCase()).toContain('wheelchair')
    })
  })

  // ──────────── Wayfinding ────────────
  describe('generateDirections', () => {
    const foodZone = INITIAL_ZONES.find((z) => z.id === 'food-1')!
    const gateZone = INITIAL_ZONES.find((z) => z.id === 'gate-a')!

    it('returns steps, time, and distance for valid inputs', () => {
      const result = generateDirections('101', foodZone)
      expect(result.steps.length).toBeGreaterThan(0)
      expect(result.estimatedMinutes).toBeGreaterThan(0)
      expect(result.distanceMeters).toBeGreaterThan(0)
    })

    it('each step has a number, instruction, and icon', () => {
      const result = generateDirections('101', foodZone)
      result.steps.forEach((step, index) => {
        expect(step.step).toBe(index + 1)
        expect(step.instruction).toBeTruthy()
        expect(step.icon).toBeTruthy()
      })
    })

    it('includes elevator/ramp step in accessible mode', () => {
      const result = generateDirections('101', foodZone, true)
      const hasAccessibleStep = result.steps.some(
        (step) => step.instruction.includes('elevator') || step.instruction.includes('ramp')
      )
      expect(hasAccessibleStep).toBe(true)
    })

    it('adds extra time for accessible routing', () => {
      const normal = generateDirections('101', gateZone, false)
      const accessible = generateDirections('101', gateZone, true)
      expect(accessible.estimatedMinutes).toBeGreaterThan(normal.estimatedMinutes)
    })

    it('generates different steps for different starting sections', () => {
      const fromNorth = generateDirections('101', foodZone)
      const fromSouth = generateDirections('205', foodZone)
      expect(fromNorth.steps[0].instruction).not.toBe(fromSouth.steps[0].instruction)
    })

    it('mentions the destination zone name in final step', () => {
      const result = generateDirections('101', foodZone)
      const lastStep = result.steps[result.steps.length - 1]
      expect(lastStep.instruction).toContain(foodZone.name)
    })
  })
})
