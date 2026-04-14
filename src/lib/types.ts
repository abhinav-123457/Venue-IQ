/** Crowd density classification */
export type CrowdLevel = 'low' | 'medium' | 'high'

/** Categories of venue zones */
export type ZoneType =
  'gate' | 'food' | 'restroom' | 'medical' | 'parking'

/** A venue zone with real-time crowd data and accessibility info */
export interface Zone {
  /** Unique zone identifier (e.g., 'gate-a') */
  id: string
  /** Display name (e.g., 'Gate A — North') */
  name: string
  /** Zone category */
  type: ZoneType
  /** Current crowd density */
  crowdLevel: CrowdLevel
  /** Estimated wait time in minutes */
  waitMinutes: number
  /** Latitude coordinate for map placement */
  lat: number
  /** Longitude coordinate for map placement */
  lng: number
  /** Whether this zone is wheelchair accessible */
  accessible: boolean
}

/** Live event metadata */
export interface VenueEvent {
  name: string
  status: 'LIVE' | 'UPCOMING' | 'FINISHED'
  minute: number
  half: 1 | 2
}

/** In-app alert notification */
export interface Alert {
  id: string
  message: string
  type: 'warning' | 'info' | 'food' | 'transport' | 'lost' | 'emergency'
  timestamp: Date
  dismissed: boolean
}

/** A single message in the AI chat conversation */
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

/** Snapshot of the full venue state */
export interface VenueState {
  zones: Zone[]
  event: VenueEvent
  isHalftime: boolean
}
