import { render, screen, act } from '@testing-library/react';
import DailyPage from '../app/daily/page';

// Mock fetch globally
global.fetch = jest.fn();

// Mock the DailyView component
jest.mock('../app/components/DailyView', () => {
  return function MockDailyView({ currentTime }) {
    return (
      <div data-testid="daily-view">
        <div>Daily View</div>
        <div>Current Time: {currentTime.toISOString()}</div>
      </div>
    );
  };
});

describe('Daily Page', () => {
  beforeEach(() => {
    fetch.mockClear();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T14:30:00.000Z'));
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders daily view', () => {
    render(<DailyPage />);

    expect(screen.getByTestId('daily-view')).toBeInTheDocument();
    expect(screen.getByText('Daily View')).toBeInTheDocument();
  });

  it('passes current time to daily view component', () => {
    render(<DailyPage />);

    expect(screen.getByText('Current Time: 2024-01-15T14:30:00.000Z')).toBeInTheDocument();
  });

  it('updates current time every minute', async () => {
    render(<DailyPage />);

    // Initial time
    expect(screen.getByText('Current Time: 2024-01-15T14:30:00.000Z')).toBeInTheDocument();

    // Fast forward 1 minute
    await act(async () => {
      jest.advanceTimersByTime(60 * 1000);
    });

    // Time should be updated
    expect(screen.getByText('Current Time: 2024-01-15T14:31:00.000Z')).toBeInTheDocument();
  });
});