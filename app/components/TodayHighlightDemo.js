'use client';

import { useState, useEffect } from 'react';
import TodayHighlight from './TodayHighlight';

/**
 * Demo component for TodayHighlight to showcase different states
 */
export default function TodayHighlightDemo() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [demoState, setDemoState] = useState('normal');

  // Update current time every second for demo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Mock pool data for demo
  const mockPoolData = {
    hours: [
      {
        start: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        end: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),   // 1 hour ago
        type: 'lap'
      },
      {
        start: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        end: new Date(Date.now() + 30 * 60 * 1000).toISOString(),  // 30 minutes from now
        type: 'rec'
      },
      {
        start: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        end: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),  // 4 hours from now
        type: 'lap'
      }
    ],
    date: new Date().toISOString().split('T')[0],
    dayName: new Date().toLocaleDateString('en-US', { weekday: 'long' })
  };

  const emptyPoolData = {
    hours: [],
    date: new Date().toISOString().split('T')[0],
    dayName: new Date().toLocaleDateString('en-US', { weekday: 'long' })
  };

  const getPropsForState = () => {
    switch (demoState) {
      case 'loading':
        return {
          poolData: null,
          loading: true,
          error: null,
          currentTime,
          onRefresh: () => setDemoState('normal')
        };
      case 'error':
        return {
          poolData: null,
          loading: false,
          error: 'Network error: Unable to connect to the server',
          currentTime,
          onRefresh: () => setDemoState('normal')
        };
      case 'empty':
        return {
          poolData: emptyPoolData,
          loading: false,
          error: null,
          currentTime,
          onRefresh: () => setDemoState('normal')
        };
      default:
        return {
          poolData: mockPoolData,
          loading: false,
          error: null,
          currentTime,
          onRefresh: () => setDemoState('normal')
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Demo Controls */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold mb-4">TodayHighlight Component Demo</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDemoState('normal')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                demoState === 'normal'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Normal State
            </button>
            <button
              onClick={() => setDemoState('loading')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                demoState === 'loading'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Loading State
            </button>
            <button
              onClick={() => setDemoState('error')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                demoState === 'error'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Error State
            </button>
            <button
              onClick={() => setDemoState('empty')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                demoState === 'empty'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Empty Hours
            </button>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Current Demo State:</strong> {demoState}</p>
            <p><strong>Features Demonstrated:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Prominent today's date and pool hours display</li>
              <li>Visual emphasis with colored backgrounds (green when open, red when closed)</li>
              <li>Current time indicators with "NOW" and "NEXT" session highlighting</li>
              <li>Responsive design that works on mobile and desktop</li>
              <li>Clear visual hierarchy with proper typography and spacing</li>
              <li>Loading states, error handling, and empty data scenarios</li>
            </ul>
          </div>
        </div>
      </div>

      {/* TodayHighlight Component */}
      <TodayHighlight {...getPropsForState()} />
    </div>
  );
}