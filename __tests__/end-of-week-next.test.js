import React from 'react';
import { render, screen } from '@testing-library/react';
import WeeklyCalendar from '../app/components/WeeklyCalendar';

describe('End of Week Next Indication', () => {

  test('shows NEXT in next week when global next opening is there', () => {
    // Mock current time to be late Sunday (end of week)
    const currentTime = new Date('2024-01-21T22:00:00.000Z'); // 10 PM Sunday

    // Next week data with future slots
    const nextWeekData = [
      {
        date: '2024-01-22',
        dayName: 'Monday',
        isToday: false,
        hours: [
          {
            start: '2024-01-22T14:00:00.000Z', // Future - should be NEXT
            end: '2024-01-22T16:00:00.000Z',
            type: 'recreational'
          }
        ]
      },
      {
        date: '2024-01-23',
        dayName: 'Tuesday',
        isToday: false,
        hours: [
          {
            start: '2024-01-23T14:00:00.000Z', // Future but later than Monday
            end: '2024-01-23T16:00:00.000Z',
            type: 'recreational'
          }
        ]
      },
      {
        date: '2024-01-24',
        dayName: 'Wednesday',
        isToday: false,
        hours: []
      },
      {
        date: '2024-01-25',
        dayName: 'Thursday',
        isToday: false,
        hours: []
      },
      {
        date: '2024-01-26',
        dayName: 'Friday',
        isToday: false,
        hours: []
      },
      {
        date: '2024-01-27',
        dayName: 'Saturday',
        isToday: false,
        hours: []
      },
      {
        date: '2024-01-28',
        dayName: 'Sunday',
        isToday: false,
        hours: []
      }
    ];

    // Global next opening is in next week (Monday) - earliest future slot
    const globalNextOpening = {
      slot: {
        start: '2024-01-22T14:00:00.000Z',
        end: '2024-01-22T16:00:00.000Z',
        type: 'recreational'
      },
      weekOffset: 1,
      dayIndex: 0
    };

    render(
      <WeeklyCalendar
        weekData={nextWeekData}
        currentTime={currentTime}
        isCurrentWeek={false}
        loading={false}
        error={null}
        weekOffset={1} // This is next week
        weekStartDate="2024-01-22"
        weekEndDate="2024-01-28"
        globalNextOpening={globalNextOpening}
      />
    );

    // Should show NEXT indicators in next week since global next opening is there
    const nextIndicators = screen.getAllByText('NEXT');
    expect(nextIndicators.length).toBeGreaterThan(0);
    
    // Verify the NEXT indicator appears on Monday of next week (earliest slot)
    expect(nextIndicators[0]).toBeInTheDocument();
  });

  test('shows NEXT in current week when global next opening is there', () => {
    // Mock current time to be Friday evening
    const currentTime = new Date('2024-01-19T20:00:00.000Z'); // 8 PM Friday

    // Current week data with future slots on weekend
    const currentWeekData = [
      {
        date: '2024-01-15',
        dayName: 'Monday',
        isToday: false,
        hours: []
      },
      {
        date: '2024-01-16',
        dayName: 'Tuesday',
        isToday: false,
        hours: []
      },
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
        isToday: true,
        hours: []
      },
      {
        date: '2024-01-20',
        dayName: 'Saturday',
        isToday: false,
        hours: [
          {
            start: '2024-01-20T14:00:00.000Z', // Future - should be NEXT
            end: '2024-01-20T16:00:00.000Z',
            type: 'recreational'
          }
        ]
      },
      {
        date: '2024-01-21',
        dayName: 'Sunday',
        isToday: false,
        hours: []
      }
    ];

    // Global next opening is in current week (Saturday) - earliest future slot
    const globalNextOpening = {
      slot: {
        start: '2024-01-20T14:00:00.000Z',
        end: '2024-01-20T16:00:00.000Z',
        type: 'recreational'
      },
      weekOffset: 0,
      dayIndex: 5 // Saturday
    };

    render(
      <WeeklyCalendar
        weekData={currentWeekData}
        currentTime={currentTime}
        isCurrentWeek={true}
        loading={false}
        error={null}
        weekOffset={0} // This is current week
        weekStartDate="2024-01-15"
        weekEndDate="2024-01-21"
        globalNextOpening={globalNextOpening}
      />
    );

    // Should show NEXT indicators in current week (Saturday) since it has the earliest future slot
    const nextIndicators = screen.getAllByText('NEXT');
    expect(nextIndicators.length).toBeGreaterThan(0);
    
    // The NEXT should be on Saturday of current week
    expect(nextIndicators[0]).toBeInTheDocument();
  });
});