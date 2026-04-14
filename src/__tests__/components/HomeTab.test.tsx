import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import HomeTab from '@/app/components/HomeTab'
import { useVenueStore } from '@/lib/store'

vi.mock('@/lib/store', () => ({
  useVenueStore: vi.fn(),
}))

describe('HomeTab Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
     
    ;(useVenueStore as unknown as Record<string, unknown>).mockImplementation((selector: (state: unknown) => unknown) => {
      const state = {
        zones: [
          { id: 'gate-a', name: 'Gate A', type: 'gate', crowdLevel: 'low', waitMinutes: 2, accessible: true },
          { id: 'food-a', name: 'Hot Dogs', type: 'food', crowdLevel: 'low', waitMinutes: 5, accessible: true },
          { id: 'rest-a', name: 'Restrooms', type: 'restrooms', crowdLevel: 'low', waitMinutes: 1, accessible: true },
          { id: 'park-a', name: 'Parking A', type: 'parking', crowdLevel: 'low', waitMinutes: 1, accessible: true },
        ],
        event: { status: 'LIVE', name: 'Test Match', minute: 15, half: 1 },
        userSection: '101',
        setUserSection: vi.fn(),
        accessibilityMode: false,
        toggleAccessibilityMode: vi.fn(),
        setActiveTab: vi.fn(),
        triggerHalftimeRush: vi.fn(),
        isHalftime: false,
      }
      return selector(state)
    })
  })

  it('renders section input form', () => {
    // We can also just find it by role 'textbox'
    render(<HomeTab />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('displays user section if set', () => {
    render(<HomeTab />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('101')
  })

  it('renders stadium status based on event', () => {
    render(<HomeTab />)
    expect(screen.getByText('Test Match')).toBeInTheDocument()
    expect(screen.getByText('1st Half')).toBeInTheDocument()
    // 15' might be split or rendered separately, so verify part of it
    expect(screen.getByText(/15/)).toBeInTheDocument()
  })
})
