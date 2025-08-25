'use client';

import { useState, useEffect } from 'react';
import DailyView from '../components/DailyView';

export default function DailyPage() {
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

  return (
    <div className="min-h-screen">
      <DailyView currentTime={currentTime} />
    </div>
  );
}