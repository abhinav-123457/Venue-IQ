'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useVenueStore } from '@/lib/store'
import {
  getBestZoneByType, getOverallCrowdLevel, getCrowdBg, getCrowdColor,
  getPersonalizedInfo,
} from '@/lib/venueData'
import { Zone } from '@/lib/types'
import {
  Utensils, DoorOpen, Clock, Users, MapPin,
  AlertTriangle, Sparkles, ChevronRight, TrendingDown, Activity,
  Navigation, ShowerHead, Car, Lightbulb, Accessibility, Check,
} from 'lucide-react'
import NavigationPanel from './NavigationPanel'

export default function HomeTab() {
  const zones = useVenueStore((s) => s.zones)
  const event = useVenueStore((s) => s.event)
  const userSection = useVenueStore((s) => s.userSection)
  const setUserSection = useVenueStore((s) => s.setUserSection)
  const setActiveTab = useVenueStore((s) => s.setActiveTab)
  const tickGameMinute = useVenueStore((s) => s.tickGameMinute)
  const accessibilityMode = useVenueStore((s) => s.accessibilityMode)
  const toggleAccessibility = useVenueStore((s) => s.toggleAccessibility)

  const [navTarget, setNavTarget] = useState<Zone | null>(null)

  useEffect(() => {
    const interval = setInterval(() => tickGameMinute(), 60000)
    return () => clearInterval(interval)
  }, [tickGameMinute])

  const overallCrowd = getOverallCrowdLevel(zones)
  const bestFood = getBestZoneByType(zones, 'food')
  const bestGate = getBestZoneByType(zones, 'gate')

  const personalizedInfo = useMemo(
    () => getPersonalizedInfo(userSection, zones, event, accessibilityMode),
    [userSection, zones, event, accessibilityMode]
  )

  function handleQuickAction(prefill: string) {
    localStorage.setItem('venueiq_prefill', prefill)
    setActiveTab('chat')
  }

  const stats = [
    {
      icon: MapPin, label: 'Your Section', value: userSection || '—',
      sub: personalizedInfo ? personalizedInfo.area : null,
      accent: 'text-blue-400', bg: 'bg-blue-500/8',
    },
    {
      icon: Users, label: 'Overall Crowd', value: overallCrowd,
      sub: null, accent: 'text-purple-400', bg: 'bg-purple-500/8',
      badge: true,
    },
    {
      icon: Utensils, label: 'Best Food', value: bestFood.name,
      sub: `${bestFood.waitMinutes} min wait`, subColor: getCrowdColor(bestFood.crowdLevel),
      accent: 'text-emerald-400', bg: 'bg-emerald-500/8',
    },
    {
      icon: DoorOpen, label: 'Best Exit', value: bestGate.name,
      sub: `${bestGate.waitMinutes} min wait`, subColor: getCrowdColor(bestGate.crowdLevel),
      accent: 'text-cyan-400', bg: 'bg-cyan-500/8',
    },
  ]

  const quickActions = [
    { emoji: '🍔', label: 'Find Food', desc: 'Nearest with short wait', prefill: 'Fastest food near me', gradient: 'from-orange-500/10 to-amber-500/5', border: 'border-orange-500/10 hover:border-orange-500/25' },
    { emoji: '🚪', label: 'Best Exit', desc: 'Least crowded gate', prefill: 'Best exit gate right now', gradient: 'from-blue-500/10 to-cyan-500/5', border: 'border-blue-500/10 hover:border-blue-500/25' },
    { emoji: '🚻', label: 'Restroom', desc: 'Shortest queue nearby', prefill: 'Nearest restroom with shortest wait', gradient: 'from-purple-500/10 to-fuchsia-500/5', border: 'border-purple-500/10 hover:border-purple-500/25' },
    { emoji: '🅿️', label: 'Parking', desc: 'Best lot to exit from', prefill: 'Best parking lot to leave from', gradient: 'from-green-500/10 to-emerald-500/5', border: 'border-green-500/10 hover:border-green-500/25' },
  ]

  return (
    <>
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* ===== ROW 1: Event Card + Section Input ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Event Card */}
        <div className="lg:col-span-2 relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-blue-500/40 p-px">
            <div className="w-full h-full rounded-2xl bg-[#111111]" />
          </div>
          <div className="relative p-5 md:p-6">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/5 to-transparent rounded-tr-full" />

            <div className="relative flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={12} className="text-blue-400" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400/70">Now Playing</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">{event.name}</h2>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/15">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">Live</span>
              </div>
            </div>

            <div className="relative flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.04]">
                <Clock size={13} className="text-slate-400" />
                <span className="text-sm font-semibold font-mono text-white">{event.minute}&apos;</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/10">
                <span className="text-xs font-semibold text-blue-400">
                  {event.half === 1 ? '1st Half' : '2nd Half'}
                </span>
              </div>
            </div>

            {event.minute >= 44 && event.minute <= 46 && event.half === 1 && (
              <div className="mt-4 flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/8 border border-amber-500/10">
                <AlertTriangle size={15} className="text-amber-400 shrink-0" />
                <span className="text-xs text-amber-300/90">Halftime approaching — expect rush at food &amp; restrooms</span>
              </div>
            )}
          </div>
        </div>

        {/* Section Input + Accessibility Toggle Card */}
        <div className="rounded-2xl bg-[#111111] border border-white/[0.04] p-5 md:p-6 flex flex-col justify-center">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Your Section
          </label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={userSection}
              onChange={(e) => setUserSection(e.target.value)}
              placeholder="e.g. 114, B12"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/20 transition-all"
            />
          </div>
          {personalizedInfo ? (
            <p className="text-[11px] text-blue-400/80 mt-2.5 flex items-center gap-1.5">
              <Navigation size={10} />
              {personalizedInfo.area} — personalized info active
              <span className="ml-auto flex items-center gap-1 text-green-400/70">
                <Check size={10} /> Saved
              </span>
            </p>
          ) : (
            <p className="text-[10px] text-slate-600 mt-2">Enter your ticket section for personalized info</p>
          )}

          {/* Accessibility toggle */}
          <div className="mt-4 pt-4 border-t border-white/[0.04]">
            <button
              onClick={toggleAccessibility}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 ${
                accessibilityMode
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  : 'bg-white/[0.02] border-white/[0.04] text-slate-500 hover:text-slate-300'
              }`}
            >
              <Accessibility size={16} />
              <span className="text-xs font-semibold flex-1 text-left">Accessibility Mode</span>
              <div className={`w-9 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5 ${
                accessibilityMode ? 'bg-blue-500' : 'bg-white/[0.08]'
              }`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  accessibilityMode ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </div>
            </button>
            <p className="text-[9px] text-slate-600 mt-1.5 pl-1">
              {accessibilityMode ? '♿ Showing wheelchair-accessible zones & routes' : 'Prioritize accessible zones & routes'}
            </p>
          </div>
        </div>
      </div>

      {/* ===== ROW 2: Personalized "For Your Section" Panel ===== */}
      {personalizedInfo && (
        <div className="rounded-2xl bg-gradient-to-br from-blue-500/5 via-[#111111] to-purple-500/5 border border-blue-500/10 p-5 md:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Navigation size={15} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">For Your Section</h3>
              <p className="text-[10px] text-slate-500">{personalizedInfo.area} • Section {userSection}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {accessibilityMode && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/15">
                  <Accessibility size={10} className="text-blue-400" />
                  <span className="text-[9px] font-bold text-blue-400">♿</span>
                </span>
              )}
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/15">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-bold text-green-400 uppercase">Live</span>
              </span>
            </div>
          </div>

          {/* Nearby zones grid with Navigate buttons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {[
              { icon: DoorOpen, label: 'Nearest Gate', zone: personalizedInfo.nearestGate, accent: 'text-cyan-400', bg: 'bg-cyan-500/8' },
              { icon: Utensils, label: 'Nearest Food', zone: personalizedInfo.nearestFood, accent: 'text-emerald-400', bg: 'bg-emerald-500/8' },
              { icon: ShowerHead, label: 'Nearest Restroom', zone: personalizedInfo.nearestRestroom, accent: 'text-purple-400', bg: 'bg-purple-500/8' },
              { icon: Car, label: 'Nearest Parking', zone: personalizedInfo.nearestParking, accent: 'text-amber-400', bg: 'bg-amber-500/8' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3.5 group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-md ${item.bg} flex items-center justify-center`}>
                      <Icon size={12} className={item.accent} />
                    </div>
                    <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-white">{item.zone.name}</p>
                    {item.zone.accessible && accessibilityMode && (
                      <span className="text-[10px] text-blue-400">♿</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[11px] font-medium" style={{ color: getCrowdColor(item.zone.crowdLevel) }}>
                      {item.zone.waitMinutes} min
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${getCrowdBg(item.zone.crowdLevel)}`}
                    >
                      {item.zone.crowdLevel}
                    </span>
                  </div>
                  {/* Navigate button */}
                  <button
                    onClick={() => setNavTarget(item.zone)}
                    className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-[10px] font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.08] transition-all duration-200"
                  >
                    <Navigation size={10} />
                    Navigate
                  </button>
                </div>
              )
            })}
          </div>

          {/* Live tips */}
          {personalizedInfo.tips.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Lightbulb size={12} className="text-amber-400" />
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Live Tips</span>
              </div>
              {personalizedInfo.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                  <span className="text-xs text-slate-300 leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== ROW 3: Stats Grid ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-2xl bg-[#111111] border border-white/[0.04] p-4 md:p-5 hover:border-white/[0.08] transition-all duration-300 group"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <Icon size={15} className={stat.accent} />
                </div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
              </div>
              {stat.badge ? (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${getCrowdBg(stat.value)}`}>
                  {stat.value}
                </span>
              ) : (
                <p className="text-sm md:text-base font-bold text-white">{stat.value}</p>
              )}
              {stat.sub && (
                <div className="flex items-center gap-1 mt-1.5">
                  <TrendingDown size={10} style={{ color: stat.subColor }} />
                  <p className="text-[11px] font-medium" style={{ color: stat.subColor }}>
                    {stat.sub}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ===== ROW 4: Quick Actions ===== */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-blue-400" />
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action.prefill)}
              className={`flex items-center gap-3 md:gap-4 p-4 rounded-2xl bg-gradient-to-br ${action.gradient} border ${action.border} text-left hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 group`}
            >
              <span className="text-2xl">{action.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{action.label}</p>
                <p className="text-[11px] text-slate-500 hidden md:block">{action.desc}</p>
              </div>
              <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 shrink-0 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* Navigation Panel Modal */}
    <AnimatePresence>
      {navTarget && (
        <NavigationPanel toZone={navTarget} onClose={() => setNavTarget(null)} />
      )}
    </AnimatePresence>
    </>
  )
}
