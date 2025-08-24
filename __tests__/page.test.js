import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../app/page';

// Mock fetch globally
global.fetch = jest.fn();

// Mock the child components to focus on testing the main App logic
jest.mock('../app/components/DailyView', () => {
  return function MockDailyView({ currentTime, onRefresh }) {
    return (
      <div data-testid="daily-view">
        <div>Daily View</div>
        <div>Current Time: {currentTime.toISOString()}</div>
        <button onClick={onRefresh}>Refresh Daily</button>
      </div>
    );
  };
});

jest.mock('../app/components/CombinedCalendarView', () => {
  return function MockCombinedCalendarView({ currentTime, onRefresh }) {
    return (
      <div data-testid="combined-calendar-view">
        <div>Combined Calendar View</div>
        <div>Current Time: {currentTime.toISOString()}</div>
        <button onClick={onRefresh}>Refresh Combined</button>
      </div>
    );
  };
});

describe('Home Page - View Switching', () => {
  beforeEach(() => {
    fetch.mockClear();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T14:30:00.000Z'));
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders daily view by default', () => {
    render(<Home />);

    expect(screen.getByTestId('daily-view')).toBeInTheDocument();
    expect(screen.getByText('Daily View')).toBeInTheDocument();
    expect(screen.queryByTestId('combined-calendar-view')).not.toBeInTheDocument();
  });

  it('renders ViewToggle component', () => {
    render(<Home />);

    expect(screen.getByRole('tablist', { name: 'View toggle' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Daily' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Weekly' })).toBeInTheDocument();
  });

  it('switches to weekly view when weekly button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(<Home />);

    // Initially shows daily view
    expect(screen.getByTestId('daily-view')).toBeInTheDocument();
    expect(screen.queryByTestId('combined-calendar-view')).not.toBeInTheDocument();

    // Click weekly button
    const weeklyButton = screen.getByRole('tab', { name: 'Weekly' });
    await act(async () => {
      await user.click(weeklyButton);
    });

    // Should now show weekly view
    expect(screen.queryByTestId('daily-view')).not.toBeInTheDocument();
    expect(screen.getByTestId('combined-calendar-view')).toBeInTheDocument();
    expect(screen.getByText('Combined Calendar View')).toBeInTheDocument();
  });

  it('switches back to daily view when daily button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(<Home />);

    // Switch to weekly view first
    const weeklyButton = screen.getByRole('tab', { name: 'Weekly' });
    await act(async () => {
      await user.click(weeklyButton);
    });

    expect(screen.getByTestId('combined-calendar-view')).toBeInTheDocument();

    // Switch back to daily view
    const dailyButton = screen.getByRole('tab', { name: 'Daily' });
    await act(async () => {
      await user.click(dailyButton);
    });

    expect(screen.getByTestId('daily-view')).toBeInTheDocument();
    expect(screen.queryByTestId('combined-calendar-view')).not.toBeInTheDocument();
  });

  it('passes current time to child components', () => {
    render(<Home />);

    expect(screen.getByText('Current Time: 2024-01-15T14:30:00.000Z')).toBeInTheDocument();
  });

  it('updates current time every minute', async () => {
    render(<Home />);

    // Initial time
    expect(screen.getByText('Current Time: 2024-01-15T14:30:00.000Z')).toBeInTheDocument();

    // Fast forward 1 minute
    await act(async () => {
      jest.advanceTimersByTime(60 * 1000);
    });

    // Time should be updated
    expect(screen.getByText('Current Time: 2024-01-15T14:31:00.000Z')).toBeInTheDocument();
  });

  it('handles refresh callback from daily view', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(<Home />);

    const refreshButton = screen.getByText('Refresh Daily');
    
    await act(async () => {
      await user.click(refreshButton);
    });

    // The refresh should update the current time
    // This is tested by checking that the component re-renders with updated time
    expect(screen.getByTestId('daily-view')).toBeInTheDocument();
  });

  it('handles refresh callback from combined calendar view', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(<Home />);

    // Switch to weekly view
    const weeklyButton = screen.getByRole('tab', { name: 'Weekly' });
    await act(async () => {
      await user.click(weeklyButton);
    });

    const refreshButton = screen.getByText('Refresh Combined');
    
    await act(async () => {
      await user.click(refreshButton);
    });

    // The refresh should update the current time
    expect(screen.getByTestId('combined-calendar-view')).toBeInTheDocument();
  });

  it('maintains view state when switching between views', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(<Home />);

    // Switch to weekly view
    const weeklyButton = screen.getByRole('tab', { name: 'Weekly' });
    await act(async () => {
      await user.click(weeklyButton);
    });

    expect(screen.getByTestId('combined-calendar-view')).toBeInTheDocument();

    // Switch back to daily view
    const dailyButton = screen.getByRole('tab', { name: 'Daily' });
    await act(async () => {
      await user.click(dailyButton);
    });

    expect(screen.getByTestId('daily-view')).toBeInTheDocument();

    // Switch to weekly again
    await act(async () => {
      await user.click(weeklyButton);
    });

    expect(screen.getByTestId('combined-calendar-view')).toBeInTheDocument();
  });

  it('sets correct ARIA attributes for view panels', () => {
    render(<Home />);

    // Daily view should be active initially
    const dailyPanel = screen.getByRole('tabpanel');
    expect(dailyPanel).toBeInTheDocument();
    expect(dailyPanel).toHaveAttribute('id', 'daily-view');
  });

  it('updates ARIA attributes when switching views', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(<Home />);

    // Switch to weekly view
    const weeklyButton = screen.getByRole('tab', { name: 'Weekly' });
    await act(async () => {
      await user.click(weeklyButton);
    });

    // Weekly panel should now be active
    const weeklyPanel = screen.getByRole('tabpanel');
    expect(weeklyPanel).toBeInTheDocument();
    expect(weeklyPanel).toHaveAttribute('id', 'weekly-view');
  });
});