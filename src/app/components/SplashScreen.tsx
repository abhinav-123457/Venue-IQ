'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ backgroundColor: '#000000' }}
        >
          {/* ===== Atmospheric Radial Glows ===== */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Primary blue glow — centered behind logo */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: 700,
                height: 700,
                background: 'radial-gradient(circle, rgba(0,112,243,0.08) 0%, rgba(0,112,243,0) 70%)',
              }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Secondary purple glow — offset */}
            <motion.div
              className="absolute rounded-full"
              style={{
                top: '35%',
                left: '35%',
                width: 500,
                height: 500,
                background: 'radial-gradient(circle, rgba(121,40,202,0.06) 0%, rgba(121,40,202,0) 70%)',
              }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            />
            {/* Subtle pink accent glow */}
            <motion.div
              className="absolute rounded-full"
              style={{
                bottom: '25%',
                right: '30%',
                width: 350,
                height: 350,
                background: 'radial-gradient(circle, rgba(255,0,128,0.03) 0%, rgba(255,0,128,0) 70%)',
              }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
          </div>

          {/* ===== Concentric Pulsing Rings ===== */}
          <div className="relative flex items-center justify-center">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  border: `1px solid rgba(174,198,255,${0.15 - i * 0.025})`,
                }}
                initial={{ width: 60, height: 60, opacity: 0.5 }}
                animate={{
                  width: [60, 220 + i * 80],
                  height: [60, 220 + i * 80],
                  opacity: [0.4, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: 'easeOut',
                }}
              />
            ))}

            {/* Static inner ring (decorative telemetry) */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 120,
                height: 120,
                border: '1px solid rgba(174,198,255,0.06)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />

            {/* ===== Logo Block ===== */}
            <motion.div
              className="relative z-10 text-center"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
            >
              {/* Brand icon */}
              <motion.div
                className="mx-auto mb-5 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #0070f3, #7928CA)',
                  boxShadow: '0 0 40px rgba(0,112,243,0.2), 0 0 80px rgba(121,40,202,0.1)',
                }}
                initial={{ rotate: -15, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </motion.div>

              {/* Title */}
              <h1
                className="text-5xl md:text-7xl font-extrabold tracking-tight"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  background: 'linear-gradient(135deg, #e2e2e2 0%, #aec6ff 50%, #dbb8ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.03em',
                }}
              >
                VenueIQ
              </h1>

              {/* Subtitle */}
              <motion.p
                className="mt-3 md:mt-4 text-sm md:text-base font-medium tracking-[0.25em] uppercase"
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  color: 'rgba(174,198,255,0.5)',
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                Smart Stadium Assistant
              </motion.p>

              {/* Tagline */}
              <motion.p
                className="mt-2 text-[11px] md:text-xs font-medium tracking-wider"
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  color: 'rgba(193,198,215,0.3)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                Real-time crowd intelligence for every seat
              </motion.p>
            </motion.div>
          </div>

          {/* ===== Progress Bar ===== */}
          <motion.div
            className="absolute bottom-20 md:bottom-16 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <div
              className="w-48 md:w-64 h-[2px] rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(65,71,84,0.3)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #0070f3, #7928CA, #0070f3)',
                  backgroundSize: '200% 100%',
                }}
                initial={{ width: '0%' }}
                animate={{
                  width: '100%',
                  backgroundPosition: ['0% 50%', '100% 50%'],
                }}
                transition={{
                  width: { duration: 2.4, ease: [0.25, 0.46, 0.45, 0.94] },
                  backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' },
                }}
              />
            </div>

            {/* Status text */}
            <motion.p
              className="mt-3 text-center text-[10px] font-medium tracking-[0.15em] uppercase"
              style={{
                fontFamily: "'Manrope', sans-serif",
                color: 'rgba(193,198,215,0.25)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0.5, 1] }}
              transition={{ delay: 0.8, duration: 2, ease: 'easeInOut' }}
            >
              Initializing venue systems…
            </motion.p>
          </motion.div>

          {/* ===== Bottom Version Tag ===== */}
          <motion.div
            className="absolute bottom-6 md:bottom-8 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: '#0070f3' }}
            />
            <p
              className="text-[9px] md:text-[10px] font-medium tracking-[0.15em]"
              style={{
                fontFamily: "'Manrope', sans-serif",
                color: 'rgba(139,144,160,0.5)',
              }}
            >
              v1.0 — Powered by Groq AI
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
