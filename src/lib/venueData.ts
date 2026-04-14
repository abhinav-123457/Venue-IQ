import { CrowdLevel, Zone, ZoneType, VenueEvent } from './types'

export const INITIAL_ZONES: Zone[] = [
  { id: 'gate-a', name: 'Gate A', type: 'gate', crowdLevel: 'low', waitMinutes: 2, lat: 28.6145, lng: 77.2095, accessible: true },
  { id: 'gate-b', name: 'Gate B', type: 'gate', crowdLevel: 'high', waitMinutes: 12, lat: 28.6155, lng: 77.2085, accessible: false },
  { id: 'gate-c', name: 'Gate C', type: 'gate', crowdLevel: 'medium', waitMinutes: 6, lat: 28.6135, lng: 77.2080, accessible: false },
  { id: 'gate-d', name: 'Gate D', type: 'gate', crowdLevel: 'low', waitMinutes: 1, lat: 28.6150, lng: 77.2100, accessible: true },
  { id: 'food-1', name: 'Concession Stand 1', type: 'food', crowdLevel: 'high', waitMinutes: 15, lat: 28.6142, lng: 77.2088, accessible: true },
  { id: 'food-2', name: 'Concession Stand 2', type: 'food', crowdLevel: 'low', waitMinutes: 3, lat: 28.6148, lng: 77.2092, accessible: true },
  { id: 'restroom-1', name: 'Restroom Block 1', type: 'restroom', crowdLevel: 'high', waitMinutes: 8, lat: 28.6140, lng: 77.2090, accessible: false },
  { id: 'restroom-2', name: 'Restroom Block 2', type: 'restroom', crowdLevel: 'low', waitMinutes: 1, lat: 28.6152, lng: 77.2094, accessible: true },
  { id: 'medical', name: 'Medical Bay', type: 'medical', crowdLevel: 'low', waitMinutes: 0, lat: 28.6138, lng: 77.2087, accessible: true },
  { id: 'parking-p1', name: 'Parking P1', type: 'parking', crowdLevel: 'medium', waitMinutes: 5, lat: 28.6130, lng: 77.2075, accessible: false },
  { id: 'parking-p2', name: 'Parking P2', type: 'parking', crowdLevel: 'low', waitMinutes: 2, lat: 28.6160, lng: 77.2105, accessible: true },
]

export const INITIAL_EVENT: VenueEvent = {
  name: 'Metro Lions vs City FC',
  status: 'LIVE',
  minute: 62,
  half: 1,
}

export function getCrowdColor(level: CrowdLevel): string {
  switch (level) {
    case 'low':
      return '#22c55e'
    case 'medium':
      return '#f97316'
    case 'high':
      return '#ef4444'
  }
}

export function getCrowdBg(level: CrowdLevel): string {
  switch (level) {
    case 'low':
      return 'bg-green-500/20 text-green-400'
    case 'medium':
      return 'bg-orange-500/20 text-orange-400'
    case 'high':
      return 'bg-red-500/20 text-red-400'
  }
}

export function getBestZoneByType(zones: Zone[], type: ZoneType): Zone {
  const filtered = zones.filter((z) => z.type === type)
  return filtered.reduce((best, zone) =>
    zone.waitMinutes < best.waitMinutes ? zone : best
  )
}

export function getOverallCrowdLevel(zones: Zone[]): CrowdLevel {
  const counts: Record<CrowdLevel, number> = { low: 0, medium: 0, high: 0 }
  zones.forEach((z) => counts[z.crowdLevel]++)

  if (counts.high >= counts.medium && counts.high >= counts.low) return 'high'
  if (counts.medium >= counts.low) return 'medium'
  return 'low'
}

export function buildSystemPrompt(zones: Zone[], event: VenueEvent): string {
  const zoneInfo = zones
    .map(
      (z) =>
        `- ${z.name} (${z.type}): crowd=${z.crowdLevel}, wait=${z.waitMinutes}min, accessible=${z.accessible}`
    )
    .join('\n')

  return `You are VenueIQ, an intelligent stadium assistant helping fans navigate a live event.

Current Event: ${event.name}
Status: ${event.status} | Minute: ${event.minute} | Half: ${event.half}

Live Zone Data:
${zoneInfo}

Instructions:
- Give concise, actionable answers about the venue.
- Recommend the least crowded zones when asked about food, restrooms, gates, or parking.
- If asked about wait times, use the live data above.
- For emergencies, always direct users to the Medical Bay.
- If user mentions accessibility or wheelchair, only recommend zones with accessible=true.
- Be friendly, brief, and helpful. Use emojis sparingly.
- If you don't know something, say so honestly.`
}

/* ─────────────── Section → Nearby Zone Mapping ─────────────── */

const SECTION_ZONE_MAP: Record<string, { gate: string; food: string; restroom: string; parking: string }> = {
  north: { gate: 'gate-a', food: 'food-2', restroom: 'restroom-2', parking: 'parking-p2' },
  east:  { gate: 'gate-b', food: 'food-1', restroom: 'restroom-1', parking: 'parking-p1' },
  south: { gate: 'gate-c', food: 'food-1', restroom: 'restroom-1', parking: 'parking-p1' },
  west:  { gate: 'gate-d', food: 'food-2', restroom: 'restroom-2', parking: 'parking-p2' },
}

function getSectionArea(section: string): string {
  const s = section.trim().toUpperCase()

  const num = parseInt(s, 10)
  if (!isNaN(num)) {
    if (num >= 100 && num <= 112) return 'north'
    if (num >= 113 && num <= 120) return 'east'
    if (num >= 200 && num <= 212) return 'south'
    if (num >= 213 && num <= 220) return 'west'
  }

  if (s.startsWith('A')) return 'north'
  if (s.startsWith('B')) return 'east'
  if (s.startsWith('C')) return 'south'
  if (s.startsWith('D')) return 'west'
  if (s.includes('VIP')) return 'west'

  return 'north'
}

export interface PersonalizedInfo {
  area: string
  nearestGate: Zone
  nearestFood: Zone
  nearestRestroom: Zone
  nearestParking: Zone
  tips: string[]
}

export function getPersonalizedInfo(
  section: string,
  zones: Zone[],
  event: VenueEvent,
  accessibilityMode: boolean = false
): PersonalizedInfo | null {
  if (!section.trim()) return null

  const area = getSectionArea(section)
  const mapping = SECTION_ZONE_MAP[area]

  const findZone = (id: string) => zones.find((z) => z.id === id)!

  let nearestGate = findZone(mapping.gate)
  let nearestFood = findZone(mapping.food)
  let nearestRestroom = findZone(mapping.restroom)
  let nearestParking = findZone(mapping.parking)

  // In accessibility mode, prefer accessible zones even if slightly further
  if (accessibilityMode) {
    const preferAccessible = (zone: Zone, type: ZoneType): Zone => {
      if (zone.accessible) return zone
      const alt = zones
        .filter((z) => z.type === type && z.accessible)
        .sort((a, b) => a.waitMinutes - b.waitMinutes)[0]
      return alt ?? zone
    }
    nearestGate = preferAccessible(nearestGate, 'gate')
    nearestFood = preferAccessible(nearestFood, 'food')
    nearestRestroom = preferAccessible(nearestRestroom, 'restroom')
    nearestParking = preferAccessible(nearestParking, 'parking')
  }

  const tips: string[] = []

  if (nearestGate.crowdLevel === 'high') {
    const altGate = zones
      .filter((z) => z.type === 'gate' && z.id !== nearestGate.id && (!accessibilityMode || z.accessible))
      .sort((a, b) => a.waitMinutes - b.waitMinutes)[0]
    tips.push(`⚠️ ${nearestGate.name} is crowded (${nearestGate.waitMinutes}min). Try ${altGate.name} instead (${altGate.waitMinutes}min).`)
  } else {
    tips.push(`✅ ${nearestGate.name} is clear — ${nearestGate.waitMinutes} min wait.`)
  }

  if (nearestFood.crowdLevel === 'high') {
    const altFood = zones
      .filter((z) => z.type === 'food' && z.id !== nearestFood.id && (!accessibilityMode || z.accessible))
      .sort((a, b) => a.waitMinutes - b.waitMinutes)[0]
    if (altFood) {
      tips.push(`🍔 Food near you is packed. ${altFood.name} has a shorter queue (${altFood.waitMinutes}min).`)
    }
  } else {
    tips.push(`🍔 ${nearestFood.name} has a ${nearestFood.waitMinutes} min wait.`)
  }

  if (nearestRestroom.crowdLevel === 'high') {
    const altRestroom = zones
      .filter((z) => z.type === 'restroom' && z.id !== nearestRestroom.id && (!accessibilityMode || z.accessible))
      .sort((a, b) => a.waitMinutes - b.waitMinutes)[0]
    if (altRestroom) {
      tips.push(`🚻 Nearest restroom is busy. Head to ${altRestroom.name} (${altRestroom.waitMinutes}min wait).`)
    }
  }

  if (accessibilityMode) {
    if (nearestRestroom.accessible) {
      tips.push(`♿ ${nearestRestroom.name} has wheelchair access.`)
    }
    if (nearestGate.accessible) {
      tips.push(`♿ ${nearestGate.name} has ramp access — no stairs.`)
    }
  }

  if (event.minute >= 80) {
    tips.push(`🅿️ Match ending soon — head to ${nearestParking.name} early to avoid rush.`)
  }

  return {
    area: area.charAt(0).toUpperCase() + area.slice(1) + ' Stand',
    nearestGate,
    nearestFood,
    nearestRestroom,
    nearestParking,
    tips,
  }
}

/* ─────────────── Navigation / Wayfinding ─────────────── */

export interface DirectionStep {
  step: number
  instruction: string
  icon: string
}

const AREA_LABELS: Record<string, string> = {
  north: 'North Stand concourse',
  east: 'East Stand concourse',
  south: 'South Stand concourse',
  west: 'West Stand concourse',
}

const ZONE_TYPE_LABELS: Record<ZoneType, string> = {
  gate: 'exit gate',
  food: 'food area',
  restroom: 'restroom area',
  parking: 'parking zone',
  medical: 'medical bay',
}

export function generateDirections(
  fromSection: string,
  toZone: Zone,
  accessible: boolean = false
): { steps: DirectionStep[]; estimatedMinutes: number; distanceMeters: number } {
  const area = getSectionArea(fromSection)
  const concourse = AREA_LABELS[area] || 'main concourse'
  const zoneLabel = ZONE_TYPE_LABELS[toZone.type] || 'destination'
  const steps: DirectionStep[] = []
  let stepNum = 1

  // Step 1: Leave section
  steps.push({
    step: stepNum++,
    instruction: `Exit Section ${fromSection.toUpperCase()} and head to the ${concourse}.`,
    icon: '🚶',
  })

  // Step 2: Accessibility routing
  if (accessible) {
    steps.push({
      step: stepNum++,
      instruction: `Take the elevator/ramp near the ${concourse} (wheelchair accessible).`,
      icon: '♿',
    })
  }

  // Step 3: Navigate to zone area
  const isSameArea = getSectionArea(fromSection) === getZoneArea(toZone)
  if (!isSameArea) {
    const targetArea = getZoneArea(toZone)
    const targetConcourse = AREA_LABELS[targetArea] || 'main concourse'
    if (accessible) {
      steps.push({
        step: stepNum++,
        instruction: `Follow accessible pathway signs to the ${targetConcourse}.`,
        icon: '♿',
      })
    } else {
      steps.push({
        step: stepNum++,
        instruction: `Walk along the ring corridor towards the ${targetConcourse}.`,
        icon: '🚶',
      })
    }
  }

  // Step 4: Follow signs
  steps.push({
    step: stepNum++,
    instruction: `Follow signs for "${toZone.name}" (${zoneLabel}).`,
    icon: '🪧',
  })

  // Step 5: Arrive
  const waitNote = toZone.waitMinutes > 0 ? ` — current wait: ${toZone.waitMinutes} min` : ' — no queue'
  const a11yNote = toZone.accessible ? ' (♿ accessible)' : ''
  steps.push({
    step: stepNum++,
    instruction: `Arrive at ${toZone.name}${a11yNote}${waitNote}.`,
    icon: '📍',
  })

  // Estimate distance/time
  const baseMinutes = isSameArea ? 2 : 4
  const estimatedMinutes = accessible ? baseMinutes + 1 : baseMinutes
  const distanceMeters = isSameArea ? 150 : 350

  return { steps, estimatedMinutes, distanceMeters }
}

function getZoneArea(zone: Zone): string {
  // Map zones to areas based on their IDs
  const zoneAreaMap: Record<string, string> = {
    'gate-a': 'north', 'food-2': 'north', 'restroom-2': 'north', 'parking-p2': 'north',
    'gate-b': 'east', 'food-1': 'east', 'restroom-1': 'east', 'parking-p1': 'east',
    'gate-c': 'south', 'medical': 'south',
    'gate-d': 'west',
  }
  return zoneAreaMap[zone.id] || 'north'
}
