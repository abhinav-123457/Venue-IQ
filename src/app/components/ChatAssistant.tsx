'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVenueStore } from '@/lib/store'
import { buildSystemPrompt } from '@/lib/venueData'
import { ChatMessage } from '@/lib/types'
import { Send, X, Sparkles, Bot } from 'lucide-react'

const INITIAL_MESSAGE: ChatMessage = {
  id: '0',
  role: 'assistant',
  content: 'Hi! I\'m VenueIQ. Tell me your section and what you need — food, exits, restrooms, or anything about the venue.',
  timestamp: new Date(),
}

const QUICK_CHIPS = [
  '🍔 Fastest food near me',
  '🚪 Least crowded exit',
  '🚻 Restroom wait time',
  '🅿️ Best parking exit route',
]

function LoadingDots() {
  return (
    <div className="flex gap-1.5 items-center px-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-blue-400/60"
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

export default function ChatAssistant() {
  const zones = useVenueStore((s) => s.zones)
  const event = useVenueStore((s) => s.event)

  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorBanner, setErrorBanner] = useState<string | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)

  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const prefill = localStorage.getItem('venueiq_prefill')
    if (prefill) {
      setInput(prefill)
      localStorage.removeItem('venueiq_prefill')
    }
  }, [])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, loading])

  async function sendMessage(content: string) {
    const trimmed = content.trim()
    if (loading || !trimmed) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }

    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)
    setErrorBanner(null)
    setHasInteracted(true)

    const systemPrompt = buildSystemPrompt(zones, event)
    const toSend = updated.slice(-12)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: toSend, systemPrompt }),
      })

      if (res.status === 429) {
        setErrorBanner('Too many messages. Wait a moment.')
        return
      }
      if (!res.ok) {
        setErrorBanner('Something went wrong. Try again.')
        return
      }

      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date(),
        },
      ])
    } catch {
      setErrorBanner('Connection failed.')
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages — centered container on desktop */}
      <div ref={listRef} className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant avatar */}
                {msg.role === 'assistant' && (
                  <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mt-0.5 shadow-lg shadow-blue-500/10">
                    <Bot size={15} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] md:max-w-[75%] px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-2xl rounded-br-md'
                      : 'bg-[#111111] border border-white/[0.04] text-slate-200 rounded-2xl rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {loading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mt-0.5 shadow-lg shadow-blue-500/10">
                <Bot size={15} className="text-white" />
              </div>
              <div className="bg-[#111111] border border-white/[0.04] px-4 py-3 rounded-2xl rounded-bl-md">
                <LoadingDots />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {errorBanner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-2xl mx-auto w-full px-4 md:px-6"
          >
            <div className="flex items-center justify-between gap-2 rounded-xl bg-red-500/10 border border-red-500/10 px-4 py-2.5 mb-2">
              <span className="text-xs text-red-400">{errorBanner}</span>
              <button onClick={() => setErrorBanner(null)} className="text-red-400/60 hover:text-red-300">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick chips */}
      {!hasInteracted && (
        <div className="max-w-2xl mx-auto w-full px-4 md:px-6 pb-2">
          <div className="flex gap-2 flex-wrap">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => sendMessage(chip)}
                className="px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-400 hover:text-blue-400 hover:border-blue-500/20 hover:bg-blue-500/5 transition-all duration-200"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="border-t border-white/[0.04] bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center gap-3 bg-[#111111] border border-white/[0.06] rounded-2xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/15 transition-all duration-200">
            <Sparkles size={16} className="text-slate-600 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about the venue..."
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-blue-600 text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-blue-500 transition-all duration-200"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
