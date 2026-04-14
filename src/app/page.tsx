'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVenueStore } from '@/lib/store'
import {
  Zap, Home as HomeIcon, Map, MessageCircle, Bell,
} from 'lucide-react'

import SplashScreen from './components/SplashScreen'
import HomeTab from './components/HomeTab'
import VenueMap from './components/VenueMap'
import ChatAssistant from './components/ChatAssistant'
import AlertsFeed from './components/AlertsFeed'

/** Navigation item config */
const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'alerts', label: 'Alerts', icon: Bell },
] as const

/** Tab → Component mapping */
const TAB_COMPONENTS: Record<string, React.ComponentType> = {
  home: HomeTab,
  map: VenueMap,
  chat: ChatAssistant,
  alerts: AlertsFeed,
}

/**
 * Root page component — handles splash screen, sidebar/bottom nav, and tab routing.
 */
export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const activeTab = useVenueStore((s) => s.activeTab)
  const setActiveTab = useVenueStore((s) => s.setActiveTab)
  const unreadAlerts = useVenueStore((s) => s.unreadAlerts)
  const clearUnreadAlerts = useVenueStore((s) => s.clearUnreadAlerts)

  const handleNavClick = useCallback(
    (tabId: string) => {
      setActiveTab(tabId)
      if (tabId === 'alerts') clearUnreadAlerts()
    },
    [setActiveTab, clearUnreadAlerts]
  )

  /** Support keyboard navigation on sidebar buttons */
  const handleNavKeyDown = useCallback(
    (e: React.KeyboardEvent, tabId: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleNavClick(tabId)
      }
    },
    [handleNavClick]
  )

  const ActiveComponent = useMemo(
    () => TAB_COMPONENTS[activeTab] ?? HomeTab,
    [activeTab]
  )

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  return (
    <div className="h-screen flex bg-black">
      {/* ===== DESKTOP SIDEBAR (hidden on mobile) ===== */}
      <aside
        className="hidden md:flex flex-col w-[72px] border-r border-white/[0.04] bg-[#0a0a0a]"
        aria-label="Primary navigation"
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-white/[0.04]">
          <div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20"
            aria-hidden="true"
          >
            <Zap size={20} className="text-white" />
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 flex flex-col items-center gap-1 py-4" role="tablist" aria-label="App sections">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${item.id}`}
                aria-label={
                  item.id === 'alerts' && unreadAlerts > 0
                    ? `${item.label} (${unreadAlerts} unread)`
                    : item.label
                }
                onClick={() => handleNavClick(item.id)}
                onKeyDown={(e) => handleNavKeyDown(e, item.id)}
                className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group
                  ${isActive
                    ? 'bg-blue-500/15 text-blue-400'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
                  }`}
                title={item.label}
              >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" />
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-blue-500" aria-hidden="true" />
                )}
                {/* Unread badge */}
                {item.id === 'alerts' && unreadAlerts > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold shadow-lg shadow-red-500/30"
                    aria-hidden="true"
                  >
                    {unreadAlerts > 9 ? '9+' : unreadAlerts}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-8 border-b border-white/[0.04] bg-[#0a0a0a]/80 backdrop-blur-xl shrink-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile logo */}
            <div className="md:hidden w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center" aria-hidden="true">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm md:text-base font-bold text-white tracking-tight leading-none">
                VenueIQ
              </h1>
              <p className="text-[9px] md:text-[10px] text-slate-500 font-medium uppercase tracking-[0.15em]">
                Metro Arena
              </p>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto pb-20 md:pb-0"
          role="tabpanel"
          aria-label={`${activeTab} panel`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ===== MOBILE BOTTOM NAV (hidden on desktop) ===== */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.04] bg-[#0a0a0a]/90 backdrop-blur-xl"
        aria-label="Mobile navigation"
        role="tablist"
      >
        <div className="flex items-center justify-around px-2 pt-2 pb-5">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={isActive}
                aria-label={
                  item.id === 'alerts' && unreadAlerts > 0
                    ? `${item.label} (${unreadAlerts} unread)`
                    : item.label
                }
                onClick={() => handleNavClick(item.id)}
                className="relative flex flex-col items-center gap-1 min-w-[56px] py-0.5"
              >
                <div className="relative">
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.3 : 1.8}
                    className={isActive ? 'text-blue-400' : 'text-slate-500'}
                    aria-hidden="true"
                  />
                  {item.id === 'alerts' && unreadAlerts > 0 && (
                    <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold" aria-hidden="true">
                      {unreadAlerts > 9 ? '9+' : unreadAlerts}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute -bottom-0.5 w-6 h-[2px] rounded-full bg-blue-500" aria-hidden="true" />
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
