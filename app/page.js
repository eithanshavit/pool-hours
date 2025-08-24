'use client';

import { useState, useEffect } from 'react';
import ViewToggle from './components/ViewToggle';
import DailyView from './components/DailyView';
import CombinedCalendarView from './components/CombinedCalendarView';

export default function Home() {
  // State management for current view mode
  const [currentView, setCurrentView] = useState('daily');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => {
      clearInterval(timeInterval);
    };
  }, []);

  // View switching logic
  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen">
      {/* View Toggle - positioned at top of screen */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <ViewToggle
          currentView={currentView}
          onViewChange={handleViewChange}
        />
      </div>

      {/* Content based on current view - with top padding to avoid toggle overlap */}
      <div 
        id={`${currentView}-view`} 
        role="tabpanel" 
        aria-labelledby={`${currentView}-tab`}
        className="pt-16 sm:pt-20"
      >
        {currentView === 'daily' ? (
          <DailyView
            currentTime={currentTime}
          />
        ) : (
          <CombinedCalendarView
            currentTime={currentTime}
          />
        )}
      </div>
    </div>
  );
} 
