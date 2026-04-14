import { create } from 'zustand'
import { Zone, VenueEvent } from './types'
import { INITIAL_ZONES, INITIAL_EVENT } from './venueData'

function readLS(key: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  try { return localStorage.getItem(key) ?? fallback } catch { return fallback }
}

function readLSBool(key: string, fallback: boolean): boolean {
  if (typeof window === 'undefined') return fallback
  try { return localStorage.getItem(key) === 'true' } catch { return fallback }
}

export const useVenueStore = create<{
  zones: Zone[]
  event: VenueEvent
  isHalftime: boolean
  activeTab: string
  unreadAlerts: number
  userSection: string
  accessibilityMode: boolean

  setActiveTab: (tab: string) => void
  setUserSection: (section: string) => void
  toggleAccessibility: () => void
  incrementUnreadAlerts: () => void
  clearUnreadAlerts: () => void
  triggerHalftimeRush: () => void
  resetCrowds: () => void
  tickGameMinute: () => void
}>((set) => ({
  zones: INITIAL_ZONES,
  event: INITIAL_EVENT,
  isHalftime: false,
  activeTab: 'home',
  unreadAlerts: 0,
  userSection: readLS('venueiq_section', ''),
  accessibilityMode: readLSBool('venueiq_a11y', false),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setUserSection: (section) => {
    try { localStorage.setItem('venueiq_section', section) } catch {}
    set({ userSection: section })
  },

  toggleAccessibility: () =>
    set((s) => {
      const next = !s.accessibilityMode
      try { localStorage.setItem('venueiq_a11y', String(next)) } catch {}
      return { accessibilityMode: next }
    }),

  incrementUnreadAlerts: () =>
    set((s) => ({ unreadAlerts: s.unreadAlerts + 1 })),
  clearUnreadAlerts: () => set({ unreadAlerts: 0 }),

  triggerHalftimeRush: () =>
    set((s) => ({
      isHalftime: true,
      zones: s.zones.map((z) =>
        z.type === 'food' || z.type === 'restroom'
          ? { ...z, crowdLevel: 'high' as const, waitMinutes: z.waitMinutes * 2 }
          : z.type === 'gate'
          ? { ...z, crowdLevel: 'low' as const, waitMinutes: 1 }
          : z
      ),
    })),

  resetCrowds: () =>
    set({
      zones: INITIAL_ZONES,
      isHalftime: false,
    }),

  tickGameMinute: () =>
    set((s) => ({
      event: {
        ...s.event,
        minute: s.event.minute >= 90 ? 90 : s.event.minute + 1,
        half: s.event.minute >= 45 ? 2 : 1,
      },
    })),
}))
