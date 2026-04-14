'use client'

import { Home, Map, MessageCircle, Bell } from 'lucide-react'
import { useVenueStore } from '@/lib/store'

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'alerts', label: 'Alerts', icon: Bell },
] as const

export default function BottomNav() {
  const activeTab = useVenueStore((s) => s.activeTab)
  const unreadAlerts = useVenueStore((s) => s.unreadAlerts)
  const setActiveTab = useVenueStore((s) => s.setActiveTab)
  const clearUnreadAlerts = useVenueStore((s) => s.clearUnreadAlerts)

  function handleTabClick(tabId: string) {
    setActiveTab(tabId)
    if (tabId === 'alerts') {
      clearUnreadAlerts()
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.04]">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
      <div className="relative flex items-center justify-around px-2 pt-2 pb-5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className="relative flex flex-col items-center gap-1 min-w-[60px] py-1 transition-all duration-200"
            >
              <div className="relative">
                {/* Active glow background */}
                {isActive && (
                  <div className="absolute -inset-2 rounded-xl bg-blue-500/10 blur-sm" />
                )}
                <Icon
                  size={21}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`relative transition-colors duration-200 ${
                    isActive ? 'text-blue-400' : 'text-slate-500'
                  }`}
                />
                {/* Red badge on bell */}
                {tab.id === 'alerts' && unreadAlerts > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-white text-[9px] font-bold px-1 shadow-lg shadow-red-500/30">
                    {unreadAlerts > 9 ? '9+' : unreadAlerts}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive ? 'text-blue-400' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </span>

              {/* Active indicator line */}
              {isActive && (
                <span className="absolute -bottom-1 w-8 h-[2px] rounded-full bg-gradient-to-r from-blue-400 to-blue-500" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
