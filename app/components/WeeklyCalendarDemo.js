'use client';

import { useState, useEffect } from 'react';
import WeeklyCalendar from './WeeklyCalendar';

/**
 * Demo component for WeeklyCalendar - showcases the component with sample data
 */
export default function WeeklyCalendarDemo() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Sample week data for demonstration
  const sampleWeekData = [
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
        { start: '2024-01-16T06:00:00Z', end: '2024-01-16T08:00:00Z', type: 'lap' },
        { start: '2024-01-16T12:00:00Z', end: '2024-01-16T14:00:00Z', type: 'rec' },
        { start: '2024-01-16T18:00:00Z', end: '2024-01-16T20:00:00Z', type: 'lap' }
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

  const nextWeekData = [
    {
      date: '2024-01-22',
      dayName: 'Monday',
      hours: [
        { start: '2024-01-22T06:00:00Z', end: '2024-01-22T08:00:00Z', type: 'lap' },
        { start: '2024-01-22T18:00:00Z', end: '2024-01-22T20:00:00Z', type: 'rec' }
      ],
      error: null,
      isToday: false
    },
    {
      date: '2024-01-23',
      dayName: 'Tuesday',
      hours: [
        { start: '2024-01-23T06:00:00Z', end: '2024-01-23T08:00:00Z', type: 'lap' }
      ],
      error: null,
      isToday: false
    },
    {
      date: '2024-01-24',
      dayName: 'Wednesday',
      hours: [
        { start: '2024-01-24T12:00:00Z', end: '2024-01-24T14:00:00Z', type: 'rec' }
      ],
      error: null,
      isToday: false
    },
    {
      date: '2024-01-25',
      dayName: 'Thursday',
      hours: [],
      error: null,
      isToday: false
    },
    {
      date: '2024-01-26',
      dayName: 'Friday',
      hours: [
        { start: '2024-01-26T18:00:00Z', end: '2024-01-26T20:00:00Z', type: 'lap' }
      ],
      error: null,
      isToday: false
    },
    {
      date: '2024-01-27',
      dayName: 'Saturday',
      hours: [
        { start: '2024-01-27T09:00:00Z', end: '2024-01-27T17:00:00Z', type: 'rec' }
      ],
      error: null,
      isToday: false
    },
    {
      date: '2024-01-28',
      dayName: 'Sunday',
      hours: [],
      error: 'Pool closed for cleaning',
      isToday: false
    }
  ];

  const toggleLoading = () => {
    setLoading(!loading);
  };

  const toggleError = () => {
    setError(error ? null : 'Failed to load weekly data');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            WeeklyCalendar Component Demo
          </h1>
          <p className="text-gray-600 mb-6">
            Responsive 7-day grid layout with horizontal scrolling for mobile devices
          </p>
          
          {/* Demo Controls */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={toggleLoading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                loading 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {loading ? 'Stop Loading' : 'Show Loading'}
            </button>
            <button
              onClick={toggleError}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                error 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {error ? 'Clear Error' : 'Show Error'}
            </button>
          </div>
        </div>

        {/* This Week */}
        <div className="mb-12">
          <WeeklyCalendar
            weekData={sampleWeekData}
            currentTime={currentTime}
            isCurrentWeek={true}
            loading={loading}
            error={error}
            weekOffset={0}
            weekStartDate="2024-01-15"
            weekEndDate="2024-01-21"
          />
        </div>

        {/* Next Week */}
        <div className="mb-12">
          <WeeklyCalendar
            weekData={nextWeekData}
            currentTime={currentTime}
            isCurrentWeek={false}
            loading={false}
            error={null}
            weekOffset={1}
            weekStartDate="2024-01-22"
            weekEndDate="2024-01-28"
          />
        </div>

        {/* Feature Highlights */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Component Features</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Responsive Design</h3>
              <ul className="space-y-1">
                <li>• Horizontal scrolling on mobile</li>
                <li>• Fixed grid layout on desktop</li>
                <li>• Touch-friendly interactions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Data Handling</h3>
              <ul className="space-y-1">
                <li>• Loading states for each day</li>
                <li>• Error handling per day</li>
                <li>• Empty state management</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Visual Hierarchy</h3>
              <ul className="space-y-1">
                <li>• Week headers with date ranges</li>
                <li>• Current day highlighting</li>
                <li>• Session type color coding</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Accessibility</h3>
              <ul className="space-y-1">
                <li>• Proper heading structure</li>
                <li>• Scroll indicators</li>
                <li>• Screen reader friendly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}