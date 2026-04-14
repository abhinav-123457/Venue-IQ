'use client'

import { useVenueStore } from '@/lib/store'
import { generateDirections, DirectionStep } from '@/lib/venueData'
import { Zone } from '@/lib/types'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { X, Navigation, Clock, MapPin } from 'lucide-react'
import { getCrowdColor } from '@/lib/venueData'

interface NavigationPanelProps {
  toZone: Zone
  onClose: () => void
}

export default function NavigationPanel({ toZone, onClose }: NavigationPanelProps) {
  const userSection = useVenueStore((s) => s.userSection)
  const accessibilityMode = useVenueStore((s) => s.accessibilityMode)

  const directions = useMemo(() => {
    if (!userSection.trim()) return null
    return generateDirections(userSection, toZone, accessibilityMode)
  }, [userSection, toZone, accessibilityMode])

  if (!directions) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        onClick={onClose}
      >
        <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-6 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
          <Navigation size={32} className="text-slate-500 mx-auto mb-3" />
          <h3 className="text-white font-bold mb-2">Enter Your Section First</h3>
          <p className="text-sm text-slate-400 mb-4">Go to the Home tab and enter your ticket section to get directions.</p>
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white/[0.06] text-sm text-slate-300 hover:bg-white/[0.1] transition-colors">
            Close
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-4 md:pb-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        className="bg-[#111111] border border-white/[0.06] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Navigation size={18} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Navigate to {toZone.name}</h3>
              <p className="text-[10px] text-slate-500">From Section {userSection.toUpperCase()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.08] transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-white/[0.04]">
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-slate-500" />
            <span className="text-xs text-slate-300 font-medium">{directions.estimatedMinutes} min walk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-slate-500" />
            <span className="text-xs text-slate-300 font-medium">{directions.distanceMeters}m</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getCrowdColor(toZone.crowdLevel) }}
            />
            <span className="text-xs text-slate-300 font-medium capitalize">{toZone.crowdLevel} crowd</span>
          </div>
          {accessibilityMode && (
            <span className="text-xs text-blue-400 font-semibold">♿ Accessible route</span>
          )}
        </div>

        {/* Steps */}
        <div className="p-4 space-y-0">
          {directions.steps.map((step: DirectionStep, i: number) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-3"
            >
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                  i === directions.steps.length - 1
                    ? 'bg-green-500/15 ring-1 ring-green-500/30'
                    : 'bg-white/[0.04]'
                }`}>
                  {step.icon}
                </div>
                {i < directions.steps.length - 1 && (
                  <div className="w-px h-6 bg-white/[0.06] my-1" />
                )}
              </div>

              {/* Content */}
              <div className="pb-4 pt-1.5">
                <p className={`text-sm leading-snug ${
                  i === directions.steps.length - 1 ? 'text-green-400 font-semibold' : 'text-slate-300'
                }`}>
                  {step.instruction}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        {!toZone.accessible && accessibilityMode && (
          <div className="mx-4 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2">
            <p className="text-xs text-amber-400">
              ⚠️ This zone may have limited wheelchair access. An accessible alternative route has been provided.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
