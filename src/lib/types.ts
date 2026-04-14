export type CrowdLevel = 'low' | 'medium' | 'high'

export type ZoneType =
  'gate' | 'food' | 'restroom' | 'medical' | 'parking'

export interface Zone {
  id: string
  name: string
  type: ZoneType
  crowdLevel: CrowdLevel
  waitMinutes: number
  lat: number
  lng: number
  accessible: boolean
}

export interface VenueEvent {
  name: string
  status: 'LIVE' | 'UPCOMING' | 'FINISHED'
  minute: number
  half: 1 | 2
}

export interface Alert {
  id: string
  message: string
  type: 'warning' | 'info' | 'food' | 'transport' | 'lost' | 'emergency'
  timestamp: Date
  dismissed: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface VenueState {
  zones: Zone[]
  event: VenueEvent
  isHalftime: boolean
}
