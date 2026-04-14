'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useVenueStore } from '@/lib/store'
import { getCrowdColor } from '@/lib/venueData'
import { ZoneType, Zone } from '@/lib/types'
import { Navigation } from 'lucide-react'
import NavigationPanel from './NavigationPanel'

type FilterKey = 'all' | ZoneType | 'accessible'

const FILTERS: { key: FilterKey; label: string; emoji: string }[] = [
  { key: 'all', label: 'All Zones', emoji: '📍' },
  { key: 'gate', label: 'Gates', emoji: '🚪' },
  { key: 'food', label: 'Food', emoji: '🍔' },
  { key: 'restroom', label: 'Restrooms', emoji: '🚻' },
  { key: 'parking', label: 'Parking', emoji: '🅿️' },
  { key: 'accessible', label: '♿ Accessible', emoji: '♿' },
]

const CROWD_META: Record<string, { label: string; color: string; bar: string }> = {
  low:    { label: 'Low Crowd',    color: '#22c55e', bar: 'w-1/4' },
  medium: { label: 'Medium Crowd', color: '#f97316', bar: 'w-2/3' },
  high:   { label: 'High Crowd',   color: '#ef4444', bar: 'w-full' },
}

function getTypeIcon(type: ZoneType): string {
  switch (type) {
    case 'gate': return '🚪'
    case 'food': return '🍔'
    case 'restroom': return '🚻'
    case 'parking': return '🅿️'
    case 'medical': return '🏥'
    default: return '📍'
  }
}

export default function VenueMap() {
  const zones = useVenueStore((s) => s.zones)
  const isHalftime = useVenueStore((s) => s.isHalftime)
  const triggerHalftimeRush = useVenueStore((s) => s.triggerHalftimeRush)
  const resetCrowds = useVenueStore((s) => s.resetCrowds)
  const accessibilityMode = useVenueStore((s) => s.accessibilityMode)

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const overlaysRef = useRef<google.maps.Circle[]>([])

  const [mapReady, setMapReady] = useState(false)
  const [noGoogle, setNoGoogle] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
  const [navTarget, setNavTarget] = useState<Zone | null>(null)

  // Initialize map with HYBRID
  useEffect(() => {
    if (!window.google) {
      setNoGoogle(true)
      return
    }

    if (!mapContainerRef.current || mapRef.current) return

    mapRef.current = new google.maps.Map(mapContainerRef.current, {
      center: { lat: 28.6145, lng: 77.2090 },
      zoom: 17,
      mapTypeId: 'hybrid',
      disableDefaultUI: true,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER,
      },
      gestureHandling: 'greedy',
      tilt: 0,
    })

    setMapReady(true)
  }, [])

  // Render markers
  const renderMarkers = useCallback(() => {
    if (!mapRef.current || !mapReady) return

    overlaysRef.current.forEach((c) => c.setMap(null))
    overlaysRef.current = []

    let filtered: Zone[]
    if (activeFilter === 'all') {
      filtered = zones
    } else if (activeFilter === 'accessible') {
      filtered = zones.filter((z) => z.accessible)
    } else {
      filtered = zones.filter((z) => z.type === activeFilter)
    }

    filtered.forEach((zone) => {
      const color = getCrowdColor(zone.crowdLevel)
      const isDimmed = accessibilityMode && !zone.accessible && activeFilter !== 'accessible'

      // Outer glow ring
      const glow = new google.maps.Circle({
        map: mapRef.current!,
        center: { lat: zone.lat, lng: zone.lng },
        radius: 50,
        fillColor: color,
        fillOpacity: isDimmed ? 0.04 : 0.12,
        strokeColor: color,
        strokeWeight: 1.5,
        strokeOpacity: isDimmed ? 0.06 : 0.2,
        clickable: false,
      })

      // Core circle (clickable)
      const core = new google.maps.Circle({
        map: mapRef.current!,
        center: { lat: zone.lat, lng: zone.lng },
        radius: 28,
        fillColor: isDimmed ? '#666666' : color,
        fillOpacity: isDimmed ? 0.3 : 0.75,
        strokeColor: isDimmed ? '#666666' : color,
        strokeWeight: isDimmed ? 1 : 2,
        strokeOpacity: isDimmed ? 0.2 : 0.5,
        clickable: true,
      })

      core.addListener('click', () => {
        setSelectedZone(zone)
      })

      overlaysRef.current.push(glow, core)
    })
  }, [zones, activeFilter, mapReady, accessibilityMode])

  useEffect(() => {
    renderMarkers()
  }, [renderMarkers])

  if (noGoogle) {
    return (
      <div className="flex items-center justify-center h-full px-4">
        <div className="rounded-2xl bg-[#111111] border border-white/[0.04] p-8 text-center max-w-sm">
          <div className="text-4xl mb-3">🗺️</div>
          <h3 className="text-lg font-semibold text-white mb-2">Google Maps API Required</h3>
          <p className="text-sm text-slate-500">Add NEXT_PUBLIC_GOOGLE_MAPS_KEY to .env.local</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full">
      {/* ===== TOP: Filter Bar ===== */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between gap-3">
        <div className="flex gap-1.5 bg-[#0a0a0a]/90 backdrop-blur-xl rounded-2xl p-1.5 border border-white/[0.06] shadow-2xl overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                activeFilter === f.key
                  ? f.key === 'accessible'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <span className="text-sm hidden md:inline">{f.emoji}</span>
              {f.label}
            </button>
          ))}
        </div>

        <div>
          {!isHalftime ? (
            <button
              onClick={triggerHalftimeRush}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              Simulate Halftime
            </button>
          ) : (
            <button
              onClick={resetCrowds}
              className="px-4 py-2.5 rounded-xl bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/[0.06] text-slate-300 text-xs font-bold hover:text-white hover:border-white/[0.12] transition-all duration-200"
            >
              Reset Crowds
            </button>
          )}
        </div>
      </div>

      {/* ===== BOTTOM-LEFT: Legend ===== */}
      <div className="absolute bottom-6 left-4 z-10 bg-[#0a0a0a]/90 backdrop-blur-xl rounded-2xl p-4 border border-white/[0.06] shadow-2xl w-52">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-3">Zone Density</h4>
        <div className="space-y-2.5">
          {Object.entries(CROWD_META).map(([key, meta]) => (
            <div key={key} className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-5 h-5">
                <span className="absolute inset-0 rounded-full opacity-25" style={{ backgroundColor: meta.color }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
              </div>
              <span className="text-xs text-slate-300 flex-1 font-medium">{meta.label}</span>
              <div className="w-14 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div className={`h-full rounded-full ${meta.bar}`} style={{ backgroundColor: meta.color }} />
              </div>
            </div>
          ))}
        </div>
        {accessibilityMode && (
          <div className="mt-3 pt-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="text-sm">♿</span>
              <span className="text-[10px] text-blue-400 font-semibold">Accessible zones highlighted</span>
            </div>
          </div>
        )}
      </div>

      {/* ===== BOTTOM-RIGHT: Selected Zone Detail Card ===== */}
      {selectedZone && (
        <div className="absolute bottom-6 right-4 z-10 bg-[#0a0a0a]/90 backdrop-blur-xl rounded-2xl border border-white/[0.06] shadow-2xl w-72 overflow-hidden">
          {/* Colored accent top edge */}
          <div className="h-1" style={{ backgroundColor: getCrowdColor(selectedZone.crowdLevel) }} />

          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${getCrowdColor(selectedZone.crowdLevel)}15` }}
                >
                  {getTypeIcon(selectedZone.type)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-white">{selectedZone.name}</h4>
                    {selectedZone.accessible && (
                      <span className="text-[10px] text-blue-400" title="Wheelchair accessible">♿</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 capitalize">{selectedZone.type}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedZone(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.04] text-slate-500 hover:text-white hover:bg-white/[0.08] transition-all text-xs"
              >
                ✕
              </button>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-3 mb-3">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide"
                style={{
                  color: getCrowdColor(selectedZone.crowdLevel),
                  backgroundColor: `${getCrowdColor(selectedZone.crowdLevel)}12`,
                  border: `1px solid ${getCrowdColor(selectedZone.crowdLevel)}25`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: getCrowdColor(selectedZone.crowdLevel) }}
                />
                {selectedZone.crowdLevel}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                ⏱ {selectedZone.waitMinutes} min wait
              </span>
            </div>

            {/* Accessibility badge */}
            {!selectedZone.accessible && (
              <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-amber-500/8 border border-amber-500/10">
                <p className="text-[10px] text-amber-400">⚠️ Limited wheelchair access (stairs only)</p>
              </div>
            )}

            {/* Density bar */}
            <div className="space-y-1.5 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-medium">Density</span>
                <span className="text-[10px] font-semibold" style={{ color: getCrowdColor(selectedZone.crowdLevel) }}>
                  {selectedZone.crowdLevel === 'low' ? '25%' : selectedZone.crowdLevel === 'medium' ? '60%' : '95%'}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    backgroundColor: getCrowdColor(selectedZone.crowdLevel),
                    width: selectedZone.crowdLevel === 'low' ? '25%' : selectedZone.crowdLevel === 'medium' ? '60%' : '95%',
                    boxShadow: `0 0 8px ${getCrowdColor(selectedZone.crowdLevel)}40`,
                  }}
                />
              </div>
            </div>

            {/* Navigate button */}
            <button
              onClick={() => setNavTarget(selectedZone)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-600/15 border border-blue-500/20 text-blue-400 text-xs font-bold hover:bg-blue-600/25 hover:border-blue-500/30 transition-all duration-200"
            >
              <Navigation size={13} />
              Navigate Here
            </button>
          </div>
        </div>
      )}

      {/* ===== Map Container ===== */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Navigation Panel Modal */}
      <AnimatePresence>
        {navTarget && (
          <NavigationPanel toZone={navTarget} onClose={() => setNavTarget(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
