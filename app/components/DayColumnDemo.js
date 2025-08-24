'use client';

import { useState, useEffect } from 'react';
import DayColumn from './DayColumn';

/**
 * Demo component to showcase DayColumn functionality
 */
export default function DayColumnDemo() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Mock data for different scenarios
  const todayData = {
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
    isToday: true
  };

  const tomorrowData = {
    date: '2024-01-16',
    dayName: 'Tuesday',
    hours: [
      {
        start: '2024-01-16T07:00:00.000Z',
        end: '2024-01-16T09:00:00.000Z',
        type: 'lap'
      },
      {
        start: '2024-01-16T11:00:00.000Z',
        end: '2024-01-16T13:00:00.000Z',
        type: 'rec'
      }
    ],
    isToday: false
  };

  const noHoursData = {
    date: '2024-01-17',
    dayName: 'Wednesday',
    hours: [],
    isToday: false
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          DayColumn Component Demo
        </h1>
        
        <div className="mb-6 text-center">
          <p className="text-gray-600">
            Current Time: {currentTime.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              second: '2-digit',
              hour12: true,
              timeZone: 'America/Los_Angeles'
            })} PST
          </p>
        </div>

        {/* Different States Demo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-center">Today (Current Week)</h3>
            <DayColumn 
              dayData={todayData}
              currentTime={currentTime}
              isCurrentWeek={true}
            />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-center">Tomorrow (Current Week)</h3>
            <DayColumn 
              dayData={tomorrowData}
              currentTime={currentTime}
              isCurrentWeek={true}
            />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-center">No Hours</h3>
            <DayColumn 
              dayData={noHoursData}
              currentTime={currentTime}
              isCurrentWeek={false}
            />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-center">Loading State</h3>
            <DayColumn 
              loading={true}
              currentTime={currentTime}
              isCurrentWeek={false}
            />
          </div>
        </div>

        {/* Error State Demo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-center">Error State</h3>
            <DayColumn 
              dayData={todayData}
              error="Failed to load pool hours"
              currentTime={currentTime}
              isCurrentWeek={false}
            />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-center">No Data</h3>
            <DayColumn 
              dayData={null}
              currentTime={currentTime}
              isCurrentWeek={false}
            />
          </div>
        </div>

        {/* Weekly View Simulation */}
        <div>
          <h3 className="text-2xl font-semibold mb-6 text-center">Weekly View Simulation</h3>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[
              { ...todayData, date: '2024-01-15', dayName: 'Monday', isToday: true },
              { ...tomorrowData, date: '2024-01-16', dayName: 'Tuesday', isToday: false },
              { ...noHoursData, date: '2024-01-17', dayName: 'Wednesday', isToday: false },
              { ...tomorrowData, date: '2024-01-18', dayName: 'Thursday', isToday: false },
              { ...todayData, date: '2024-01-19', dayName: 'Friday', isToday: false },
              { ...noHoursData, date: '2024-01-20', dayName: 'Saturday', isToday: false },
              { ...tomorrowData, date: '2024-01-21', dayName: 'Sunday', isToday: false }
            ].map((dayData, index) => (
              <DayColumn 
                key={index}
                dayData={dayData}
                currentTime={currentTime}
                isCurrentWeek={true}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}