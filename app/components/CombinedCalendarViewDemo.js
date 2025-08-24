'use client';

import { useState, useEffect } from 'react';
import CombinedCalendarView from './CombinedCalendarView';

/**
 * Demo component for CombinedCalendarView
 * Shows the combined calendar view with live current time updates
 */
export default function CombinedCalendarViewDemo() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for live updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    console.log('Refresh triggered from CombinedCalendarView');
    // Additional refresh logic can be added here if needed
  };

  return (
    <div>
      <CombinedCalendarView 
        currentTime={currentTime}
        onRefresh={handleRefresh}
      />
    </div>
  );
}