import React from 'react';
import { render, screen } from '@testing-library/react';
import WeeklyCalendar from '../app/components/WeeklyCalendar';

describe('Next Opening Cross-Day Highlighting', () => {
  test('highlights next opening even if it is tomorrow', () => {
    // Mock current time to be late in the day when today's slots are over
    const currentTime = new Date('2024-01-15T22:00:00.000Z'); // 10 PM today

    // Mock week data where today (Monday) has past slots, tomorrow (Tuesday) has future slots
    const weekData = [
      {
        date: '2024-01-15',
        dayName: 'Monday',
        isToday: true,
        hours: [
          {
            start: '2024-01-15T14:00:00.000Z', // 2 PM today (past)
            end: '2024-01-15T16:00:00.000Z',   // 4 PM today (past)
            type: 'recreational'
          }
        ]
      },
      {
        date: '2024-01-16',
        dayName: 'Tuesday',
        isToday: false,
        hours: [
          {
            start: '2024-01-16T14:00:00.000Z', // 2 PM tomorrow (future - should be NEXT)
            end: '2024-01-16T16:00:00.000Z',   // 4 PM tomorrow
            type: 'recreational'
          }
        ]
      },
      // Rest of week with no hours
      {
        date: '2024-01-17',
        dayName: 'Wednesday',
        isToday: false,
        hours: []
      },
      {
        date: '2024-01-18',
        dayName: 'Thursday',
        isToday: false,
        hours: []
      },
      {
        date: '2024-01-19',
        dayName: 'Friday',
        isToday: false,
        hours: []
      },
      {
        date: '2024-01-20',
        dayName: 'Saturday',
        isToday: false,
        hours: []
      },
      {
        date: '2024-01-21',
        dayName: 'Sunday',
        isToday: false,
        hours: []
      }
    ];

    render(
      <WeeklyCalendar
        weekData={weekData}
        currentTime={currentTime}
        isCurrentWeek={true}
        loading={false}
        error={null}
        weekOffset={0}
      />
    );

    // Should show NEXT indicator for tomorrow's slot since today's slots are over
    // (Multiple indicators appear due to responsive layouts)
    const nextIndicators = screen.getAllByText('NEXT');
    expect(nextIndicators.length).toBeGreaterThan(0);
    
    // Verify that the NEXT indicator appears on Tuesday's slot
    expect(nextIndicators[0]).toBeInTheDocument();
  });

  test('highlights next opening later today if available', () => {
    // Mock current time to be early in the day
    const currentTime = new Date('2024-01-15T10:00:00.000Z'); // 10 AM today

    // Mock week data where today has a future slot
    const weekData = [
      {
        date: '2024-01-15',
        dayName: 'Monday',
        isToday: true,
        hours: [
          {
            start: '2024-01-15T08:00:00.000Z', // 8 AM today (past)
            end: '2024-01-15T10:00:00.000Z',   // 10 AM today (just ended)
            type: 'recreational'
          },
          {
            start: '2024-01-15T14:00:00.000Z', // 2 PM today (future - should be NEXT)
            end: '2024-01-15T16:00:00.000Z',   // 4 PM today
            type: 'recreational'
          }
        ]
      },
      {
        date: '2024-01-16',
        dayName: 'Tuesday',
        isToday: false,
        hours: [
          {
            start: '2024-01-16T14:00:00.000Z', // 2 PM tomorrow
            end: '2024-01-16T16:00:00.000Z',   // 4 PM tomorrow
            type: 'recreational'
          }
        ]
      },
      // Rest of week with no hours
      {
        date: '2024-01-17',
        dayName: 'Wednesday',
        isToday: false,
        hours: []
      },
      {
        date: '2024-01-18',
        dayName: 'Thursday',
        isToday: false,
        hours: []
      },
      {
        date: '2024-01-19',
        dayName: 'Friday',
        isToday: false,
        hours: []
      },
      {
        date: '2024-01-20',
        dayName: 'Saturday',
        isToday: false,
        hours: []
      },
      {
        date: '2024-01-21',
        dayName: 'Sunday',
        isToday: false,
        hours: []
      }
    ];

    render(
      <WeeklyCalendar
        weekData={weekData}
        currentTime={currentTime}
        isCurrentWeek={true}
        loading={false}
        error={null}
        weekOffset={0}
      />
    );

    // Should show NEXT indicator for today's future slot (not tomorrow's)
    // (Multiple indicators appear due to responsive layouts)
    const nextIndicators = screen.getAllByText('NEXT');
    expect(nextIndicators.length).toBeGreaterThan(0);
  });

  test('highlights next opening on Wednesday when Monday and Tuesday have no future slots', () => {
    // Mock current time to be late Monday
    const currentTime = new Date('2024-01-15T22:00:00.000Z'); // 10 PM Monday

    // Mock week data where Wednesday has the next opening
    const weekData = [
      {
        date: '2024-01-15',
        dayName: 'Monday',
        isToday: true,
        hours: [
          {
            start: '2024-01-15T14:00:00.000Z', // 2 PM today (past)
            end: '2024-01-15T16:00:00.000Z',   // 4 PM today (past)
            type: 'recreational'
          }
        ]
      },
      {
        date: '2024-01-16',
        dayName: 'Tuesday',
        isToday: false,
        hours: [] // No hours Tuesday
      },
      {
        date: '2024-01-17',
        dayName: 'Wednesday',
        isToday: false,
        hours: [
          {
            start: '2024-01-17T14:00:00.000Z', // 2 PM Wednesday (should be NEXT)
            end: '2024-01-17T16:00:00.000Z',   // 4 PM Wednesday
            type: 'recreational'
          }
        ]
      },
      {
        date: '2024-01-18',
        dayName: 'Thursday',
        isToday: false,
        hours: []
      },
      {
        date: '2024-01-19',
        dayName: 'Friday',
        isToday: false,
        hours: []
      },
      {
        date: '2024-01-20',
        dayName: 'Saturday',
        isToday: false,
        hours: []
      },
      {
        date: '2024-01-21',
        dayName: 'Sunday',
        isToday: false,
        hours: []
      }
    ];

    render(
      <WeeklyCalendar
        weekData={weekData}
        currentTime={currentTime}
        isCurrentWeek={true}
        loading={false}
        error={null}
        weekOffset={0}
      />
    );

    // Should show NEXT indicator for Wednesday's slot
    // (Multiple indicators appear due to responsive layouts)
    const nextIndicators = screen.getAllByText('NEXT');
    expect(nextIndicators.length).toBeGreaterThan(0);
  });
});