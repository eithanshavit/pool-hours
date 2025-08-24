import { render, screen, fireEvent } from '@testing-library/react';
import TodayHighlight from '../app/components/TodayHighlight';

// Mock current time for consistent testing
const mockCurrentTime = new Date('2024-01-15T14:30:00.000Z'); // 6:30 AM PST

// Mock pool data
const mockPoolData = {
  hours: [
    {
      start: '2024-01-15T13:00:00.000Z', // 5:00 AM PST
      end: '2024-01-15T15:00:00.000Z',   // 7:00 AM PST
      type: 'lap'
    },
    {
      start: '2024-01-15T16:00:00.000Z', // 8:00 AM PST
      end: '2024-01-15T18:00:00.000Z',   // 10:00 AM PST
      type: 'rec'
    },
    {
      start: '2024-01-15T20:00:00.000Z', // 12:00 PM PST
      end: '2024-01-15T22:00:00.000Z',   // 2:00 PM PST
      type: 'lap'
    }
  ],
  date: '2024-01-15',
  dayName: 'Monday'
};

describe('TodayHighlight Component', () => {
  beforeEach(() => {
    // Mock toLocaleTimeString and toLocaleDateString
    jest.spyOn(Date.prototype, 'toLocaleTimeString').mockImplementation(function(locale, options) {
      if (options?.timeZone === 'America/Los_Angeles') {
        // Mock PST conversion
        const utcTime = this.getTime();
        const pstOffset = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
        const pstTime = new Date(utcTime - pstOffset);
        
        const hours = pstTime.getUTCHours();
        const minutes = pstTime.getUTCMinutes();
        const seconds = pstTime.getUTCSeconds();
        
        if (options.second) {
          return `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
        }
        return `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
      }
      return this.toLocaleTimeString(locale, options);
    });

    jest.spyOn(Date.prototype, 'toLocaleDateString').mockImplementation(function(locale, options) {
      if (options?.weekday && options?.month && options?.day) {
        return 'Monday, January 15';
      }
      return this.toLocaleDateString(locale, options);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders loading state correctly', () => {
    render(
      <TodayHighlight 
        poolData={null}
        loading={true}
        error={null}
        currentTime={mockCurrentTime}
      />
    );

    expect(screen.getByText("Loading today's hours...")).toBeInTheDocument();
    // Check for loading spinner by class
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  test('renders error state correctly', () => {
    const mockOnRefresh = jest.fn();
    render(
      <TodayHighlight 
        poolData={null}
        loading={false}
        error="Network error"
        currentTime={mockCurrentTime}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByText("Error Loading Today's Hours")).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();
    
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });

  test('renders today header correctly', () => {
    render(
      <TodayHighlight 
        poolData={mockPoolData}
        loading={false}
        error={null}
        currentTime={mockCurrentTime}
      />
    );

    expect(screen.getByText('TODAY')).toBeInTheDocument();
    expect(screen.getByText('Monday, January 15')).toBeInTheDocument();
  });

  test('displays pool hours correctly', () => {
    render(
      <TodayHighlight 
        poolData={mockPoolData}
        loading={false}
        error={null}
        currentTime={mockCurrentTime}
      />
    );

    // Check that all pool sessions are displayed (using getAllByText for multiple instances)
    expect(screen.getAllByText('LAP SWIM')).toHaveLength(2);
    expect(screen.getByText('RECREATIONAL')).toBeInTheDocument();
    
    // Check time formatting (mocked to show PST times)
    expect(screen.getByText('5:00 AM - 7:00 AM')).toBeInTheDocument();
    expect(screen.getByText('8:00 AM - 10:00 AM')).toBeInTheDocument();
    expect(screen.getByText('12:00 PM - 2:00 PM')).toBeInTheDocument();
  });

  test('highlights current session correctly', () => {
    // Set current time to be during the first lap session (5:00-7:00 AM PST)
    const currentSessionTime = new Date('2024-01-15T14:30:00.000Z'); // 6:30 AM PST
    
    render(
      <TodayHighlight 
        poolData={mockPoolData}
        loading={false}
        error={null}
        currentTime={currentSessionTime}
      />
    );

    // Should show "NOW" indicator for current session
    expect(screen.getByText('NOW')).toBeInTheDocument();
    expect(screen.getByText('Pool is OPEN')).toBeInTheDocument();
  });

  test('highlights next session correctly', () => {
    // Set current time to be between sessions (7:30 AM PST)
    const betweenSessionsTime = new Date('2024-01-15T15:30:00.000Z'); // 7:30 AM PST
    
    render(
      <TodayHighlight 
        poolData={mockPoolData}
        loading={false}
        error={null}
        currentTime={betweenSessionsTime}
      />
    );

    // Should show "NEXT" indicator for upcoming session
    expect(screen.getByText('NEXT')).toBeInTheDocument();
    expect(screen.getByText('Pool is CLOSED')).toBeInTheDocument();
  });

  test('shows current time display', () => {
    render(
      <TodayHighlight 
        poolData={mockPoolData}
        loading={false}
        error={null}
        currentTime={mockCurrentTime}
      />
    );

    expect(screen.getByText('Current Time')).toBeInTheDocument();
    expect(screen.getByText(/PST$/)).toBeInTheDocument();
  });

  test('handles empty pool hours', () => {
    const emptyPoolData = {
      hours: [],
      date: '2024-01-15',
      dayName: 'Monday'
    };

    render(
      <TodayHighlight 
        poolData={emptyPoolData}
        loading={false}
        error={null}
        currentTime={mockCurrentTime}
      />
    );

    expect(screen.getByText('No pool hours available')).toBeInTheDocument();
    expect(screen.getByText('Check back later for updates')).toBeInTheDocument();
    expect(screen.getByText('Pool is CLOSED')).toBeInTheDocument();
  });

  test('applies correct styling for open vs closed states', () => {
    // Test when pool is open (during a session)
    const openTime = new Date('2024-01-15T14:30:00.000Z'); // 6:30 AM PST, during first session
    
    const { rerender } = render(
      <TodayHighlight 
        poolData={mockPoolData}
        loading={false}
        error={null}
        currentTime={openTime}
      />
    );

    // Should have green background when open - find the main card container
    const openCard = document.querySelector('.bg-green-300');
    expect(openCard).toBeInTheDocument();

    // Test when pool is closed (between sessions)
    const closedTime = new Date('2024-01-15T15:30:00.000Z'); // 7:30 AM PST, between sessions
    
    rerender(
      <TodayHighlight 
        poolData={mockPoolData}
        loading={false}
        error={null}
        currentTime={closedTime}
      />
    );

    // Should have red background when closed
    const closedCard = document.querySelector('.bg-red-300');
    expect(closedCard).toBeInTheDocument();
  });

  test('is responsive and accessible', () => {
    render(
      <TodayHighlight 
        poolData={mockPoolData}
        loading={false}
        error={null}
        currentTime={mockCurrentTime}
      />
    );

    // Check for responsive classes on the main container
    const container = document.querySelector('.max-w-4xl.mx-auto');
    expect(container).toBeInTheDocument();

    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('TODAY');
  });
});