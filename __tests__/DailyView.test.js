import { render, screen, waitFor, act } from '@testing-library/react';
import DailyView from '../app/components/DailyView';

// Mock fetch globally
global.fetch = jest.fn();

describe('DailyView', () => {
  const mockCurrentTime = new Date('2024-01-15T14:30:00.000Z');
  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    fetch.mockClear();
    mockOnRefresh.mockClear();
    jest.useFakeTimers();
    jest.setSystemTime(mockCurrentTime);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const mockPoolData = {
    hours: [
      {
        start: '2024-01-15T13:00:00.000Z',
        end: '2024-01-15T15:00:00.000Z',
        type: 'lap',
        timezone: 'America/Los_Angeles',
        original: '6:00 AM - 8:00 AM'
      },
      {
        start: '2024-01-15T16:00:00.000Z',
        end: '2024-01-15T18:00:00.000Z',
        type: 'rec',
        timezone: 'America/Los_Angeles',
        original: '9:00 AM - 11:00 AM'
      }
    ],
    error: null,
    timestamp: '2024-01-15T14:30:00.000Z'
  };

  it('renders loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<DailyView currentTime={mockCurrentTime} onRefresh={mockOnRefresh} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders pool hours after successful fetch', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPoolData
    });

    await act(async () => {
      render(<DailyView currentTime={mockCurrentTime} onRefresh={mockOnRefresh} />);
    });

    await waitFor(() => {
      expect(screen.getByText('Monday')).toBeInTheDocument();
    });

    expect(screen.getByText('LAP')).toBeInTheDocument();
    expect(screen.getByText('REC')).toBeInTheDocument();
  });

  it('renders error state when fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      render(<DailyView currentTime={mockCurrentTime} onRefresh={mockOnRefresh} />);
    });

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    expect(screen.getByText('Network error: Unable to connect to the server')).toBeInTheDocument();
  });

  it('highlights current session correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPoolData
    });

    await act(async () => {
      render(<DailyView currentTime={mockCurrentTime} onRefresh={mockOnRefresh} />);
    });

    await waitFor(() => {
      expect(screen.getByText('NOW')).toBeInTheDocument();
    });
  });

  it('calls onRefresh callback when data is loaded', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPoolData
    });

    await act(async () => {
      render(<DailyView currentTime={mockCurrentTime} onRefresh={mockOnRefresh} />);
    });

    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalled();
    });
  });

  it('refreshes data every 5 minutes', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockPoolData
    });

    await act(async () => {
      render(<DailyView currentTime={mockCurrentTime} onRefresh={mockOnRefresh} />);
    });

    // Initial fetch
    expect(fetch).toHaveBeenCalledTimes(1);

    // Fast forward 5 minutes
    await act(async () => {
      jest.advanceTimersByTime(5 * 60 * 1000);
    });

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('uses correct date format for API call', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPoolData
    });

    await act(async () => {
      render(<DailyView currentTime={mockCurrentTime} onRefresh={mockOnRefresh} />);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/pool-hours?date=2024-01-15');
    });
  });
});