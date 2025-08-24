import { render, screen } from '@testing-library/react';
import WeeklyCalendar from '../app/components/WeeklyCalendar';

// Mock the DayColumn component since it's tested separately
jest.mock('../app/components/DayColumn', () => {
  return function MockDayColumn({ dayData, loading, error }) {
    if (loading) return <div data-testid="day-column-loading">Loading day</div>;
    if (error) return <div data-testid="day-column-error">{error}</div>;
    if (!dayData) return <div data-testid="day-column-no-data">No data</div>;
    return (
      <div data-testid="day-column">
        <div data-testid="day-name">{dayData.dayName}</div>
        <div data-testid="day-date">{dayData.date}</div>
        <div data-testid="day-hours-count">{dayData.hours?.length || 0}</div>
        {dayData.isToday && <div data-testid="is-today">Today</div>}
      </div>
    );
  };
});

describe('WeeklyCalendar', () => {
  const mockCurrentTime = new Date('2024-01-15T10:00:00Z'); // Monday
  
  const mockWeekData = [
    {
      date: '2024-01-15',
      dayName: 'Monday',
      hours: [
        { start: '2024-01-15T06:00:00Z', end: '2024-01-15T08:00:00Z', type: 'lap' },
        { start: '2024-01-15T18:00:00Z', end: '2024-01-15T20:00:00Z', type: 'rec' }
      ],
      error: null,
      isToday: true
    },
    {
      date: '2024-01-16',
      dayName: 'Tuesday',
      hours: [
        { start: '2024-01-16T06:00:00Z', end: '2024-01-16T08:00:00Z', type: 'lap' }
      ],
      error: null,
      isToday: false
    },
    {
      date: '2024-01-17',
      dayName: 'Wednesday',
      hours: [],
      error: null,
      isToday: false
    },
    {
      date: '2024-01-18',
      dayName: 'Thursday',
      hours: [
        { start: '2024-01-18T18:00:00Z', end: '2024-01-18T20:00:00Z', type: 'rec' }
      ],
      error: null,
      isToday: false
    },
    {
      date: '2024-01-19',
      dayName: 'Friday',
      hours: [],
      error: 'Pool closed for maintenance',
      isToday: false
    },
    {
      date: '2024-01-20',
      dayName: 'Saturday',
      hours: [
        { start: '2024-01-20T09:00:00Z', end: '2024-01-20T17:00:00Z', type: 'rec' }
      ],
      error: null,
      isToday: false
    },
    {
      date: '2024-01-21',
      dayName: 'Sunday',
      hours: [
        { start: '2024-01-21T10:00:00Z', end: '2024-01-21T16:00:00Z', type: 'rec' }
      ],
      error: null,
      isToday: false
    }
  ];

  describe('Loading State', () => {
    it('renders loading skeleton when loading is true', () => {
      render(
        <WeeklyCalendar
          weekData={[]}
          currentTime={mockCurrentTime}
          isCurrentWeek={true}
          loading={true}
        />
      );

      // Should show 7 loading day columns
      const loadingColumns = screen.getAllByTestId('day-column-loading');
      expect(loadingColumns).toHaveLength(7);
    });

    it('renders week header skeleton when loading', () => {
      render(
        <WeeklyCalendar
          weekData={[]}
          currentTime={mockCurrentTime}
          isCurrentWeek={true}
          loading={true}
        />
      );

      // Should show header skeleton
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('renders error message when error prop is provided and no data', () => {
      render(
        <WeeklyCalendar
          weekData={[]}
          currentTime={mockCurrentTime}
          isCurrentWeek={true}
          error="Failed to load week data"
        />
      );

      expect(screen.getByText('Unable to Load Week')).toBeInTheDocument();
      expect(screen.getByText('Failed to load week data')).toBeInTheDocument();
    });

    it('renders week header even in error state', () => {
      render(
        <WeeklyCalendar
          weekData={[]}
          currentTime={mockCurrentTime}
          isCurrentWeek={true}
          weekOffset={0}
          error="Failed to load week data"
        />
      );

      expect(screen.getByText('This Week')).toBeInTheDocument();
    });
  });

  describe('Week Header', () => {
    it('displays "This Week" for weekOffset 0', () => {
      render(
        <WeeklyCalendar
          weekData={mockWeekData}
          currentTime={mockCurrentTime}
          isCurrentWeek={true}
          weekOffset={0}
        />
      );

      expect(screen.getByText(/This Week/)).toBeInTheDocument();
      expect(screen.getByText('Current Week')).toBeInTheDocument();
    });

    it('displays "Next Week" for weekOffset 1', () => {
      render(
        <WeeklyCalendar
          weekData={mockWeekData}
          currentTime={mockCurrentTime}
          isCurrentWeek={false}
          weekOffset={1}
        />
      );

      expect(screen.getByText(/Next Week/)).toBeInTheDocument();
      expect(screen.getByText('Upcoming Week')).toBeInTheDocument();
    });

    it('displays date range when weekStartDate and weekEndDate are provided', () => {
      render(
        <WeeklyCalendar
          weekData={mockWeekData}
          currentTime={mockCurrentTime}
          isCurrentWeek={true}
          weekOffset={0}
          weekStartDate="2024-01-15"
          weekEndDate="2024-01-21"
        />
      );

      expect(screen.getByText(/This Week • Jan 15-21/)).toBeInTheDocument();
    });

    it('handles cross-month date ranges', () => {
      render(
        <WeeklyCalendar
          weekData={mockWeekData}
          currentTime={mockCurrentTime}
          isCurrentWeek={true}
          weekOffset={0}
          weekStartDate="2024-01-29"
          weekEndDate="2024-02-04"
        />
      );

      expect(screen.getByText(/This Week • Jan 29 - Feb 4/)).toBeInTheDocument();
    });
  });

  describe('Day Columns Rendering', () => {
    it('renders all 7 day columns with data', () => {
      render(
        <WeeklyCalendar
          weekData={mockWeekData}
          currentTime={mockCurrentTime}
          isCurrentWeek={true}
        />
      );

      // Should render 7 columns total (6 regular + 1 error for Friday)
      const dayColumns = screen.getAllByTestId('day-column');
      const errorColumns = screen.getAllByTestId('day-column-error');
      expect(dayColumns.length + errorColumns.length).toBe(7);

      // Check that all days are rendered (Friday will be in error state)
      expect(screen.getByText('Monday')).toBeInTheDocument();
      expect(screen.getByText('Tuesday')).toBeInTheDocument();
      expect(screen.getByText('Wednesday')).toBeInTheDocument();
      expect(screen.getByText('Thursday')).toBeInTheDocument();
      expect(screen.getByText('Pool closed for maintenance')).toBeInTheDocument(); // Friday error
      expect(screen.getByText('Saturday')).toBeInTheDocument();
      expect(screen.getByText('Sunday')).toBeInTheDocument();
    });

    it('fills missing days with placeholder data', () => {
      const incompleteWeekData = mockWeekData.slice(0, 3); // Only first 3 days
      
      render(
        <WeeklyCalendar
          weekData={incompleteWeekData}
          currentTime={mockCurrentTime}
          isCurrentWeek={true}
        />
      );

      // Should still render 7 columns (3 with data, 4 with errors)
      const dayColumns = screen.getAllByTestId(/day-column/);
      expect(dayColumns).toHaveLength(7);

      // First 3 should have data
      expect(screen.getByText('Monday')).toBeInTheDocument();
      expect(screen.getByText('Tuesday')).toBeInTheDocument();
      expect(screen.getByText('Wednesday')).toBeInTheDocument();
      
      // Last 4 should be error states with "No data available"
      const errorColumns = screen.getAllByTestId('day-column-error');
      expect(errorColumns).toHaveLength(4);
      errorColumns.forEach(column => {
        expect(column).toHaveTextContent('No data available');
      });
    });

    it('passes correct props to DayColumn components', () => {
      render(
        <WeeklyCalendar
          weekData={mockWeekData}
          currentTime={mockCurrentTime}
          isCurrentWeek={true}
        />
      );

      // Check that today is marked correctly
      expect(screen.getByTestId('is-today')).toBeInTheDocument();

      // Check that hours count is passed correctly
      const hoursCountElements = screen.getAllByTestId('day-hours-count');
      expect(hoursCountElements[0]).toHaveTextContent('2'); // Monday has 2 hours
      expect(hoursCountElements[1]).toHaveTextContent('1'); // Tuesday has 1 hour
      expect(hoursCountElements[2]).toHaveTextContent('0'); // Wednesday has 0 hours
    });
  });

  describe('Responsive Design', () => {
    it('renders horizontal scroll container', () => {
      render(
        <WeeklyCalendar
          weekData={mockWeekData}
          currentTime={mockCurrentTime}
          isCurrentWeek={true}
        />
      );

      const scrollContainer = document.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
      expect(scrollContainer).toHaveClass('flex', 'gap-3', 'pb-4');
    });

    it('renders scroll hint for mobile', () => {
      render(
        <WeeklyCalendar
          weekData={mockWeekData}
          currentTime={mockCurrentTime}
          isCurrentWeek={true}
        />
      );

      expect(screen.getByText('Scroll to see all days')).toBeInTheDocument();
    });
  });

  describe('Week Summary', () => {
    it('displays correct count of days with pool hours', () => {
      render(
        <WeeklyCalendar
          weekData={mockWeekData}
          currentTime={mockCurrentTime}
          isCurrentWeek={true}
        />
      );

      // Count days with hours: Monday(2), Tuesday(1), Thursday(1), Saturday(1), Sunday(1) = 5 days
      expect(screen.getByText('5 of 7 days have pool hours')).toBeInTheDocument();
    });

    it('handles week with no pool hours', () => {
      const emptyWeekData = mockWeekData.map(day => ({
        ...day,
        hours: []
      }));

      render(
        <WeeklyCalendar
          weekData={emptyWeekData}
          currentTime={mockCurrentTime}
          isCurrentWeek={true}
        />
      );

      expect(screen.getByText('0 of 7 days have pool hours')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('handles empty weekData array', () => {
      render(
        <WeeklyCalendar
          weekData={[]}
          currentTime={mockCurrentTime}
          isCurrentWeek={true}
        />
      );

      // Should still render 7 placeholder columns
      const dayColumns = screen.getAllByTestId(/day-column/);
      expect(dayColumns).toHaveLength(7);
    });

    it('handles null weekData', () => {
      render(
        <WeeklyCalendar
          weekData={null}
          currentTime={mockCurrentTime}
          isCurrentWeek={true}
        />
      );

      // Should still render 7 placeholder columns
      const dayColumns = screen.getAllByTestId(/day-column/);
      expect(dayColumns).toHaveLength(7);
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(
        <WeeklyCalendar
          weekData={mockWeekData}
          currentTime={mockCurrentTime}
          isCurrentWeek={true}
          weekOffset={0}
        />
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(/This Week/);
    });

    it('provides scroll indicators with proper icons', () => {
      render(
        <WeeklyCalendar
          weekData={mockWeekData}
          currentTime={mockCurrentTime}
          isCurrentWeek={true}
        />
      );

      const scrollHint = screen.getByText('Scroll to see all days');
      expect(scrollHint).toBeInTheDocument();
      
      // Check for arrow icons
      const svgElements = document.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });
  });
});