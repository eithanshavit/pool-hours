import { render, screen } from '@testing-library/react';
import DayColumn from '../app/components/DayColumn';

// Mock data for testing
const mockDayData = {
  date: '2024-01-15',
  dayName: 'Monday',
  hours: [
    {
      start: '2024-01-15T06:00:00.000Z',
      end: '2024-01-15T08:00:00.000Z',
      type: 'lap'
    },
    {
      start: '2024-01-15T10:00:00.000Z',
      end: '2024-01-15T12:00:00.000Z',
      type: 'rec'
    },
    {
      start: '2024-01-15T14:00:00.000Z',
      end: '2024-01-15T16:00:00.000Z',
      type: 'lap'
    }
  ],
  isToday: false
};

const mockTodayData = {
  ...mockDayData,
  isToday: true
};

const mockCurrentTime = new Date('2024-01-15T11:00:00.000Z');

describe('DayColumn Component', () => {
  test('renders day header correctly', () => {
    render(
      <DayColumn 
        dayData={mockDayData} 
        currentTime={mockCurrentTime} 
        isCurrentWeek={false}
      />
    );
    
    expect(screen.getByText('Mon')).toBeInTheDocument(); // Changed to abbreviated form
    expect(screen.getByText('Jan 15')).toBeInTheDocument();
  });

  test('renders time slots correctly', () => {
    render(
      <DayColumn 
        dayData={mockDayData} 
        currentTime={mockCurrentTime} 
        isCurrentWeek={false}
      />
    );
    
    // Check for LAP and REC labels (full form for better readability)
    expect(screen.getAllByText('LAP')).toHaveLength(2);
    expect(screen.getAllByText('REC')).toHaveLength(1);
  });

  test('highlights current day correctly', () => {
    render(
      <DayColumn 
        dayData={mockTodayData} 
        currentTime={mockCurrentTime} 
        isCurrentWeek={true}
      />
    );
    
    expect(screen.getByText('Today')).toBeInTheDocument();
    
    // Check for today styling (blue border) - find the outermost container
    const container = document.querySelector('.border-blue-400');
    expect(container).toBeInTheDocument();
  });

  test('shows current/next indicators for today only', () => {
    // Mock current time to be during the second slot (10:00-12:00)
    const currentTimeInSlot = new Date('2024-01-15T11:00:00.000Z');
    
    render(
      <DayColumn 
        dayData={mockTodayData} 
        currentTime={currentTimeInSlot} 
        isCurrentWeek={true}
      />
    );
    
    // Should show NOW indicator for current slot
    expect(screen.getByText('NOW')).toBeInTheDocument();
  });

  test('does not show current/next indicators for non-today days', () => {
    render(
      <DayColumn 
        dayData={mockDayData} 
        currentTime={mockCurrentTime} 
        isCurrentWeek={true}
      />
    );
    
    // Should not show NOW or NEXT indicators
    expect(screen.queryByText('NOW')).not.toBeInTheDocument();
    expect(screen.queryByText('NEXT')).not.toBeInTheDocument();
  });

  test('renders loading state correctly', () => {
    render(
      <DayColumn 
        loading={true}
        currentTime={mockCurrentTime} 
        isCurrentWeek={false}
      />
    );
    
    // Should show skeleton loading elements
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  test('renders error state correctly', () => {
    const errorMessage = 'Failed to load pool hours';
    
    render(
      <DayColumn 
        dayData={mockDayData}
        error={errorMessage}
        currentTime={mockCurrentTime} 
        isCurrentWeek={false}
      />
    );
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('renders no hours state correctly', () => {
    const noHoursData = {
      ...mockDayData,
      hours: []
    };
    
    render(
      <DayColumn 
        dayData={noHoursData} 
        currentTime={mockCurrentTime} 
        isCurrentWeek={false}
      />
    );
    
    expect(screen.getByText('No Hours')).toBeInTheDocument();
    expect(screen.getByText('Pool Closed')).toBeInTheDocument(); // Updated text
  });

  test('handles null dayData gracefully', () => {
    render(
      <DayColumn 
        dayData={null} 
        currentTime={mockCurrentTime} 
        isCurrentWeek={false}
      />
    );
    
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  test('applies correct styling for lap vs recreational slots', () => {
    // Use a time before all slots to ensure they're not past
    const futureTime = new Date('2024-01-15T05:00:00.000Z'); // 5 AM, before all slots
    
    render(
      <DayColumn 
        dayData={mockDayData} 
        currentTime={futureTime} 
        isCurrentWeek={false}
      />
    );
    
    const lapSlots = screen.getAllByText('LAP'); // Full form for better readability
    const recSlots = screen.getAllByText('REC'); // Full form for better readability
    
    // Check that LAP slots have blue styling (when not past)
    lapSlots.forEach(slot => {
      expect(slot).toHaveClass('bg-blue-600');
    });
    
    // Check that REC slots have orange styling (when not past)
    recSlots.forEach(slot => {
      expect(slot).toHaveClass('bg-orange-500');
    });
  });

  test('shows next slot indicator correctly', () => {
    // Mock current time to be before the first slot
    const currentTimeBeforeSlots = new Date('2024-01-15T05:00:00.000Z');
    
    render(
      <DayColumn 
        dayData={mockTodayData} 
        currentTime={currentTimeBeforeSlots} 
        isCurrentWeek={true}
      />
    );
    
    // Should show NEXT indicator for the first upcoming slot
    expect(screen.getByText('NEXT')).toBeInTheDocument();
  });

  test('shows past slot styling correctly', () => {
    // Mock current time to be after all slots
    const currentTimeAfterSlots = new Date('2024-01-15T18:00:00.000Z');
    
    render(
      <DayColumn 
        dayData={mockTodayData} 
        currentTime={currentTimeAfterSlots} 
        isCurrentWeek={true}
      />
    );
    
    // All slots should have past styling (opacity-60)
    const timeSlots = document.querySelectorAll('.opacity-60');
    expect(timeSlots.length).toBeGreaterThan(0);
  });

  test('grays out past slots on any day', () => {
    // Mock current time to be after some slots
    const currentTimeAfterSlots = new Date('2024-01-15T13:00:00.000Z'); // 1 PM
    
    render(
      <DayColumn 
        dayData={mockDayData} // Not today, but should still gray out past slots
        currentTime={currentTimeAfterSlots} 
        isCurrentWeek={true}
      />
    );
    
    // Should show past styling for slots that ended before current time
    const pastSlots = document.querySelectorAll('.opacity-60');
    expect(pastSlots.length).toBeGreaterThan(0); // At least some slots should be grayed out
    
    // Future slots should not be grayed out
    const futureSlots = document.querySelectorAll('.bg-blue-50, .bg-orange-50');
    expect(futureSlots.length).toBeGreaterThan(0); // At least some slots should have normal colors
  });

  test('responsive design classes are applied', () => {
    render(
      <DayColumn 
        dayData={mockDayData} 
        currentTime={mockCurrentTime} 
        isCurrentWeek={false}
      />
    );
    
    // Check for full width classes on the container (updated for flowing grid design)
    const container = document.querySelector('.w-full');
    expect(container).toBeInTheDocument();
  });
});