'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVenueStore } from '@/lib/store'
import { Alert } from '@/lib/types'
import {
  AlertTriangle, Info, Utensils, Bus, Search, ShieldAlert,
  X, Bell,
} from 'lucide-react'

let alertCounter = 0
function genAlertId() {
  return `alert-${Date.now()}-${++alertCounter}-${Math.random().toString(36).slice(2, 8)}`
}

const TYPE_CONFIG: Record<
  Alert['type'],
  { color: string; border: string; bg: string; iconBg: string; icon: typeof Info }
> = {
  warning: { color: 'text-orange-400', border: 'border-l-orange-500', bg: 'bg-orange-500/5', iconBg: 'from-orange-500/15 to-amber-500/15', icon: AlertTriangle },
  info: { color: 'text-blue-400', border: 'border-l-blue-500', bg: 'bg-blue-500/5', iconBg: 'from-blue-500/15 to-cyan-500/15', icon: Info },
  food: { color: 'text-green-400', border: 'border-l-green-500', bg: 'bg-green-500/5', iconBg: 'from-green-500/15 to-emerald-500/15', icon: Utensils },
  transport: { color: 'text-purple-400', border: 'border-l-purple-500', bg: 'bg-purple-500/5', iconBg: 'from-purple-500/15 to-fuchsia-500/15', icon: Bus },
  lost: { color: 'text-yellow-400', border: 'border-l-yellow-500', bg: 'bg-yellow-500/5', iconBg: 'from-yellow-500/15 to-amber-500/15', icon: Search },
  emergency: { color: 'text-red-400', border: 'border-l-red-500', bg: 'bg-red-500/5', iconBg: 'from-red-500/15 to-rose-500/15', icon: ShieldAlert },
}

function makeAlert(type: Alert['type'], message: string, minutesAgo: number): Alert {
  return {
    id: genAlertId(),
    type,
    message,
    timestamp: new Date(Date.now() - minutesAgo * 60000),
    dismissed: false,
  }
}

const INITIAL_ALERTS: Alert[] = [
  makeAlert('warning', 'Gate B congested — use Gate D instead', 2),
  makeAlert('food', 'Concession Stand 2 has zero queue right now', 5),
  makeAlert('info', 'Halftime show begins in 8 minutes', 8),
  makeAlert('transport', 'Shuttle buses at Parking P3, departs in 15 min', 12),
  makeAlert('lost', 'Lost & Found: Blue jacket at Gate A info desk', 18),
  makeAlert('emergency', 'Medical team at Section 212 — please stay clear', 25),
]

const ALERT_POOL: { type: Alert['type']; message: string }[] = [
  { type: 'info', message: 'Gate A now open — low crowd' },
  { type: 'food', message: 'New food stand open near Section 108' },
  { type: 'warning', message: 'Restroom Block 1 queue now 20 minutes' },
  { type: 'transport', message: 'Metro train running every 8 minutes post-match' },
  { type: 'info', message: 'VIP lounge now open to all ticket holders' },
  { type: 'warning', message: 'Temporary closure: Gate C — use Gate B or D' },
  { type: 'food', message: 'Concession Stand 1 queue reduced — 5 min wait' },
  { type: 'emergency', message: 'Lost child reported near Gate A info desk' },
]

function relativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes === 1) return '1 min ago'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

export default function AlertsFeed() {
  const incrementUnreadAlerts = useVenueStore((s) => s.incrementUnreadAlerts)
  const activeTab = useVenueStore((s) => s.activeTab)

  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS)
  const poolIndex = useRef(0)
  const activeTabRef = useRef(activeTab)

  useEffect(() => {
    activeTabRef.current = activeTab
  }, [activeTab])

  useEffect(() => {
    const interval = setInterval(() => {
      const poolItem = ALERT_POOL[poolIndex.current % ALERT_POOL.length]
      poolIndex.current++
      const newAlert: Alert = {
        id: genAlertId(),
        type: poolItem.type,
        message: poolItem.message,
        timestamp: new Date(),
        dismissed: false,
      }
      setAlerts((prev) => [newAlert, ...prev])
      if (activeTabRef.current !== 'alerts') {
        incrementUnreadAlerts()
      }
    }, 40000)
    return () => clearInterval(interval)
  }, [incrementUnreadAlerts])

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, dismissed: true } : a)))
  }, [])

  const clearAll = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, dismissed: true })))
  }, [])

  const visibleAlerts = alerts.filter((a) => !a.dismissed)

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/[0.04] flex items-center justify-center">
            <Bell size={18} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white">Alerts</h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {visibleAlerts.length} active notification{visibleAlerts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {visibleAlerts.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs font-medium text-slate-500 hover:text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/5 border border-transparent hover:border-blue-500/10 transition-all duration-200"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Alert list */}
      {visibleAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-24 text-slate-600">
          <div className="w-16 h-16 rounded-2xl bg-[#111111] border border-white/[0.04] flex items-center justify-center mb-4">
            <Bell size={28} className="opacity-30" />
          </div>
          <p className="text-sm font-medium">No active alerts</p>
          <p className="text-xs text-slate-600 mt-1">New alerts will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {visibleAlerts.map((alert, index) => {
              const config = TYPE_CONFIG[alert.type]
              const Icon = config.icon

              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, height: 0 }}
                  transition={{ duration: 0.2, delay: index < 6 ? index * 0.03 : 0 }}
                  className={`relative rounded-2xl bg-[#111111] border border-white/[0.04] border-l-[3px] ${config.border} ${config.bg} p-4 pr-10 group hover:border-white/[0.08] transition-all duration-200`}
                >
                  <div className="flex gap-3">
                    <div className={`shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br ${config.iconBg} flex items-center justify-center`}>
                      <Icon size={16} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/90 leading-snug font-medium">{alert.message}</p>
                      <p className="text-[10px] text-slate-500 mt-1.5 font-medium">{relativeTime(alert.timestamp)}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="absolute top-4 right-3.5 text-slate-600 hover:text-slate-300 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
