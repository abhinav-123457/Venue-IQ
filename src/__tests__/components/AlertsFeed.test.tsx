import { render, screen, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import AlertsFeed from '@/app/components/AlertsFeed'
import { useVenueStore } from '@/lib/store'

// Mock Zustand store
vi.mock('@/lib/store', () => ({
  useVenueStore: vi.fn(),
}))

describe('AlertsFeed Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(useVenueStore as unknown as any).mockImplementation((selector: (state: any) => any) => {
      const state = {
        incrementUnreadAlerts: vi.fn(),
        activeTab: 'alerts',
      }
      return selector(state)
    })
  })

  it('renders correctly with initial alerts', () => {
    render(<AlertsFeed />)
    expect(screen.getByText('Alerts')).toBeInTheDocument()
    // By default, INITIAL_ALERTS has 6 items
    expect(screen.getByText(/Gate B congested/i)).toBeInTheDocument()
    expect(screen.getByText(/Halftime show begins/i)).toBeInTheDocument()
  })

  it('allows dismissing all alerts', () => {
    // The "Clear All" button clears arrays
    render(<AlertsFeed />)
    const clearButton = screen.getByText('Clear All')
    act(() => {
      clearButton.click()
    })
    expect(screen.queryByText(/Gate B congested/i)).not.toBeInTheDocument()
    expect(screen.getByText('No active alerts')).toBeInTheDocument()
  })
})
