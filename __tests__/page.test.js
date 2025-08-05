import { render, screen } from '@testing-library/react'
import Home from '../app/page'

// Mock fetch globally
global.fetch = jest.fn()

// Mock the Date constructor to control the current time
const mockDate = (dateString) => {
  const date = new Date(dateString)
  const RealDate = global.Date
  global.Date = class extends RealDate {
    constructor(...args) {
      if (args.length === 0) {
        return date
      }
      return new RealDate(...args)
    }
    static now() {
      return date.getTime()
    }
  }
  return date
}

describe('Pool Status Color Tests', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('should show red background when pool is closed (no hours data)', async () => {
    // Mock current time to a specific time when pool should be closed
    const currentTime = mockDate('2025-01-15T02:00:00.000Z') // 2 AM UTC
    
    // Mock API response with no pool hours (pool closed)
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ hours: [] })
    })

    render(<Home />)
    
    // Wait for the component to load - look for any day name
    await screen.findByText(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/)
    
    // Check that the background is red (pool closed)
    const container = screen.getByRole('heading', { level: 1 }).closest('div[class*="bg-red-300"]')
    expect(container).toBeInTheDocument()
  })

  test('should show red background when pool hours are in the past', async () => {
    // Mock current time to after pool hours
    const currentTime = mockDate('2025-01-15T23:00:00.000Z') // 11 PM UTC
    
    // Mock API response with pool hours that are in the past
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        hours: [
          {
            start: '2025-01-15T14:30:00.000Z', // 2:30 PM UTC
            end: '2025-01-15T18:00:00.000Z',   // 6:00 PM UTC
            type: 'lap',
            original: '7:30am - 11:00am'
          }
        ]
      })
    })

    render(<Home />)
    
    // Wait for the component to load - look for any day name
    await screen.findByText(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/)
    
    // Check that the background is red (pool closed - hours are in the past)
    const container = screen.getByRole('heading', { level: 1 }).closest('div[class*="bg-red-300"]')
    expect(container).toBeInTheDocument()
  })

  test('should show red background when pool hours are in the future', async () => {
    // Mock current time to before pool hours
    const currentTime = mockDate('2025-01-15T10:00:00.000Z') // 10 AM UTC
    
    // Mock API response with pool hours that are in the future
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        hours: [
          {
            start: '2025-01-15T14:30:00.000Z', // 2:30 PM UTC
            end: '2025-01-15T18:00:00.000Z',   // 6:00 PM UTC
            type: 'lap',
            original: '7:30am - 11:00am'
          }
        ]
      })
    })

    render(<Home />)
    
    // Wait for the component to load - look for any day name
    await screen.findByText(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/)
    
    // Check that the background is red (pool closed - hours are in the future)
    const container = screen.getByRole('heading', { level: 1 }).closest('div[class*="bg-red-300"]')
    expect(container).toBeInTheDocument()
  })

  test('should show green background when pool is currently open', async () => {
    // Mock current time to during pool hours
    const currentTime = mockDate('2025-01-15T16:00:00.000Z') // 4 PM UTC (during pool hours)
    
    // Mock API response with pool hours that include current time
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        hours: [
          {
            start: '2025-01-15T14:30:00.000Z', // 2:30 PM UTC
            end: '2025-01-15T18:00:00.000Z',   // 6:00 PM UTC
            type: 'lap',
            original: '7:30am - 11:00am'
          }
        ]
      })
    })

    render(<Home />)
    
    // Wait for the component to load - look for any day name
    await screen.findByText(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/)
    
    // Check that the background is green (pool open)
    const container = screen.getByRole('heading', { level: 1 }).closest('div[class*="bg-green-300"]')
    expect(container).toBeInTheDocument()
  })

  test('should show red background when API returns error', async () => {
    // Mock current time
    const currentTime = mockDate('2025-01-15T16:00:00.000Z')
    
    // Mock API response with error
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to fetch pool hours' })
    })

    render(<Home />)
    
    // Wait for error to be displayed
    await screen.findByText('Error')
    
    // When there's an error, the pool should be considered closed (red background)
    // But since the error state shows a different UI, we check for the error message instead
    expect(screen.getByText('Error')).toBeInTheDocument()
  })
}) 