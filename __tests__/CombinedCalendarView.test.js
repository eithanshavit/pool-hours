import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CombinedCalendarView from '../app/components/CombinedCalendarView';

// Mock the child components
jest.mock('../app/components/TodayHighlight', () => {
  return function MockTodayHighlight({ poolData, loading, error, currentTime, onRefresh }) {
    if (loading) return <div data-testid="today-loading">Loading today...</div>;
    if (error) return <div data-testid="today-error">Error: {error}</div>;
    return (
      <div data-testid="today-highlight">
        <div>Today's Pool Hours</div>
        <div>Current Time: {currentTime.toISOString()}</div>
        {onRefresh && <button onClick={onRefresh} data-testid="today-refresh">Refresh Today</button>}
      </div>
    );
  };
});

jest.mock('../app/components/WeeklyCalendar', () => {
  return function MockWeeklyCalendar({ 
    weekData, 
    currentTime, 
    isCurrentWeek, 
    loading, 
    error, 
    weekOffset,
    weekStartDate,
    weekEndDate 
  }) {
    if (loading) return <div data-testid={`week-${weekOffset}-loading`}>Loading week {weekOffset}...</div>;
    if (error) return <div data-testid={`week-${weekOffset}-error`}>Error: {error}</div>;
    return (
      <div data-testid={`week-${weekOffset}-calendar`}>
        <div>Week {weekOffset} Calendar</div>
        <div>Is Current Week: {isCurrentWeek.toString()}</div>
        <div>Week Start: {weekStartDate}</div>
        <div>Week End: {weekEndDate}</div>
        <div>Days: {weekData ? weekData.length : 0}</div>
      </div>
    );
  };
});

// Mock fetch globally
global.fetch = jest.fn();

describe('CombinedCalendarView', () => {
  const mockCurrentTime = new Date('2024-01-15T10:30:00.000Z');

  beforeEach(() => {
    fetch.mockClear();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const setupMockFetch = () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/api/pool-hours')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            hours: [
              { start: '2024-01-15T18:00:00.000Z', end: '2024-01-15T20:00:00.000Z', type: 'lap' }
            ],
            error: null,
            timestamp: '2024-01-15T10:30:00.000Z'
          })
        });
      }
      
      if (url.includes('/api/weekly-hours?weekOffset=0')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            weekData: [
              { date: '2024-01-15', dayName: 'Monday', hours: [], error: null, isToday: true },
              { date: '2024-01-16', dayName: 'Tuesday', hours: [], error: null, isToday: false }
            ],
            weekStartDate: '2024-01-15',
            weekEndDate: '2024-01-21',
            weekOffset: 0,
            error: null,
            timestamp: '2024-01-15T10:30:00.000Z'
          })
        });
      }
      
      if (url.includes('/api/weekly-hours?weekOffset=1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            weekData: [
              { date: '2024-01-22', dayName: 'Monday', hours: [], error: null, isToday: false },
              { date: '2024-01-23', dayName: 'Tuesday', hours: [], error: null, isToday: false }
            ],
            weekStartDate: '2024-01-22',
            weekEndDate: '2024-01-28',
            weekOffset: 1,
            error: null,
            timestamp: '2024-01-15T10:30:00.000Z'
          })
        });
      }
      
      return Promise.reject(new Error('Unknown URL'));
    });
  };

  test('renders main structure with header and sections', async () => {
    setupMockFetch();
    
    render(<CombinedCalendarView currentTime={mockCurrentTime} />);
    
    // Check header elements
    expect(screen.getByText('Pool Schedule')).toBeInTheDocument();
    expect(screen.getByText('Highlands Recreation Center')).toBeInTheDocument();
    expect(screen.getByText('Refresh All')).toBeInTheDocument();
    
    // Check section separators
    expect(screen.getByText('Weekly Schedule')).toBeInTheDocument();
    expect(screen.getByText('Next Week')).toBeInTheDocument();
    
    // Wait for components to load
    await waitFor(() => {
      expect(screen.getByTestId('today-highlight')).toBeInTheDocument();
      expect(screen.getByTestId('week-0-calendar')).toBeInTheDocument();
      expect(screen.getByTestId('week-1-calendar')).toBeInTheDocument();
    });
  });

  test('shows loading states initially', () => {
    setupMockFetch();
    
    render(<CombinedCalendarView currentTime={mockCurrentTime} />);
    
    // Should show loading states for all sections
    expect(screen.getByTestId('today-loading')).toBeInTheDocument();
    expect(screen.getByTestId('week-0-loading')).toBeInTheDocument();
    expect(screen.getByTestId('week-1-loading')).toBeInTheDocument();
  });

  test('fetches data for all three sections on mount', async () => {
    setupMockFetch();
    
    render(<CombinedCalendarView currentTime={mockCurrentTime} />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(3);
      expect(fetch).toHaveBeenCalledWith('/api/pool-hours');
      expect(fetch).toHaveBeenCalledWith('/api/weekly-hours?weekOffset=0');
      expect(fetch).toHaveBeenCalledWith('/api/weekly-hours?weekOffset=1');
    });
  });

  test('passes correct props to child components', async () => {
    setupMockFetch();
    
    render(<CombinedCalendarView currentTime={mockCurrentTime} />);
    
    await waitFor(() => {
      // Check TodayHighlight receives current time
      expect(screen.getByText(`Current Time: ${mockCurrentTime.toISOString()}`)).toBeInTheDocument();
      
      // Check WeeklyCalendar components receive correct props
      expect(screen.getByText('Is Current Week: true')).toBeInTheDocument();
      expect(screen.getByText('Is Current Week: false')).toBeInTheDocument();
      expect(screen.getByText('Week Start: 2024-01-15')).toBeInTheDocument();
      expect(screen.getByText('Week Start: 2024-01-22')).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/api/pool-hours')) {
        return Promise.reject(new Error('Today API failed'));
      }
      if (url.includes('weekOffset=0')) {
        return Promise.reject(new Error('This week API failed'));
      }
      if (url.includes('weekOffset=1')) {
        return Promise.reject(new Error('Next week API failed'));
      }
      return Promise.reject(new Error('Unknown URL'));
    });
    
    render(<CombinedCalendarView currentTime={mockCurrentTime} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('today-error')).toBeInTheDocument();
      expect(screen.getByTestId('week-0-error')).toBeInTheDocument();
      expect(screen.getByTestId('week-1-error')).toBeInTheDocument();
      
      expect(screen.getByText('Error: Today API failed')).toBeInTheDocument();
      expect(screen.getByText('Error: This week API failed')).toBeInTheDocument();
      expect(screen.getByText('Error: Next week API failed')).toBeInTheDocument();
    });
  });



  test('calls onRefresh callback when provided', async () => {
    setupMockFetch();
    const mockOnRefresh = jest.fn();
    
    render(<CombinedCalendarView currentTime={mockCurrentTime} onRefresh={mockOnRefresh} />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('today-highlight')).toBeInTheDocument();
    });
    
    // Click refresh button
    fireEvent.click(screen.getByText('Refresh All'));
    
    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    });
  });

  test('auto-refreshes data every 5 minutes', async () => {
    setupMockFetch();
    
    render(<CombinedCalendarView currentTime={mockCurrentTime} />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(3);
    });
    
    // Clear fetch mock calls
    fetch.mockClear();
    
    // Fast-forward 5 minutes
    await act(async () => {
      jest.advanceTimersByTime(5 * 60 * 1000);
    });
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });

  test('disables refresh button during loading', async () => {
    // Mock fetch to return pending promises
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<CombinedCalendarView currentTime={mockCurrentTime} />);
    
    const refreshButton = screen.getByText('Refresh All');
    expect(refreshButton).toBeDisabled();
  });

  test('displays footer with current time and refresh info', () => {
    setupMockFetch();
    
    render(<CombinedCalendarView currentTime={mockCurrentTime} />);
    
    expect(screen.getByText('Data refreshes automatically every 5 minutes')).toBeInTheDocument();
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  test('handles partial data loading correctly', async () => {
    // Mock only today's API to succeed
    fetch.mockImplementation((url) => {
      if (url.includes('/api/pool-hours')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            hours: [],
            error: null,
            timestamp: '2024-01-15T10:30:00.000Z'
          })
        });
      }
      return Promise.reject(new Error('API failed'));
    });
    
    render(<CombinedCalendarView currentTime={mockCurrentTime} />);
    
    await waitFor(() => {
      // Today should load successfully
      expect(screen.getByTestId('today-highlight')).toBeInTheDocument();
      
      // Weeks should show errors
      expect(screen.getByTestId('week-0-error')).toBeInTheDocument();
      expect(screen.getByTestId('week-1-error')).toBeInTheDocument();
    });
  });

  test('responsive design classes are applied', () => {
    setupMockFetch();
    
    render(<CombinedCalendarView currentTime={mockCurrentTime} />);
    
    // Check for responsive classes in the main container (find the div with max-w-7xl)
    const mainContainer = document.querySelector('.max-w-7xl.mx-auto');
    expect(mainContainer).toBeInTheDocument();
    
    // Check for responsive text classes
    expect(screen.getByText('Pool Schedule')).toHaveClass('text-3xl', 'sm:text-4xl');
  });
});