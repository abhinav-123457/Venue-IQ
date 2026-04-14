import { render, screen, act } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import SplashScreen from '@/app/components/SplashScreen'

describe('SplashScreen Component', () => {
  it('renders Google Gemini branding', () => {
    render(<SplashScreen onComplete={vi.fn()} />)
    expect(screen.getByText(/Powered by Google Gemini/i)).toBeInTheDocument()
  })
})
