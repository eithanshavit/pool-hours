'use client';

import { useState, useEffect } from 'react';

/**
 * DailyView component for displaying today's pool hours
 * Extracted from the original App component logic
 * 
 * @param {Object} props
 * @param {Date} props.currentTime - Current time for highlighting active sessions

 * @returns {JSX.Element}
 */
export default function DailyView({ currentTime }) {
  const [poolData, setPoolData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPoolHours = async () => {
    try {
      setLoading(true);
      // Get current date in YYYY-MM-DD format for the API (using local time, not UTC)
      const today = new Date().toLocaleDateString('en-CA'); // en-CA format is YYYY-MM-DD
      const response = await fetch(`/api/pool-hours?date=${today}`);
      const data = await response.json();
      
      if (response.ok) {
        setPoolData(data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch pool hours');
      }
    } catch (err) {
      setError('Network error: Unable to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  // Calculate if pool is currently open based on the time slots
  const calculateIsOpen = (hours) => {
    if (!hours || hours.length === 0) return false;
    
    const now = new Date();
    
    // Check if current time falls within any time slot
    return hours.some(slot => {
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);
      return now >= slotStart && now <= slotEnd;
    });
  };

  useEffect(() => {
    fetchPoolHours();
    
    // Refresh pool hours every 5 minutes
    const dataInterval = setInterval(fetchPoolHours, 5 * 60 * 1000);
    
    return () => {
      clearInterval(dataInterval);
    };
  }, []);



  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Los_Angeles'
    });
  };

  const getBackgroundColor = (isOpen) => {
    return isOpen ? 'bg-green-300' : 'bg-red-300';
  };

  const getTextColor = (isOpen) => {
    return isOpen ? 'text-gray-800' : 'text-white';
  };

  const isCurrentOrNextSlot = (slot) => {
    const slotStart = new Date(slot.start);
    const slotEnd = new Date(slot.end);
    
    // If current time is within the slot, it's current
    if (currentTime >= slotStart && currentTime <= slotEnd) {
      return 'current';
    }
    
    // Check if this is the next slot (the first future slot)
    const nextSlot = findNextSlot(poolData?.hours || []);
    if (nextSlot && slot.start === nextSlot.start && slot.type === nextSlot.type) {
      return 'next';
    }
    
    return null;
  };

  // Find the next slot that hasn't started yet
  const findNextSlot = (hours) => {
    if (!hours || hours.length === 0) return null;
    
    // Sort slots by start time
    const sortedSlots = [...hours].sort((a, b) => new Date(a.start) - new Date(b.start));
    
    // Find the first slot that starts after current time
    const nextSlot = sortedSlots.find(slot => new Date(slot.start) > currentTime);
    
    return nextSlot;
  };

  // Calculate if pool is open based on current time and available slots
  const isOpenNow = poolData?.hours ? calculateIsOpen(poolData.hours) : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-[300px] h-[300px] bg-white rounded-3xl shadow-lg flex items-center justify-center p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-[300px] h-[300px] bg-white rounded-3xl shadow-lg flex items-center justify-center p-6">
          <div className="text-center px-4">
            <p className="text-red-600 font-bold text-xl mb-2">Error</p>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className={`w-[300px] h-[300px] ${getBackgroundColor(isOpenNow)} rounded-3xl shadow-lg transition-colors duration-500 p-2 overflow-y-auto`}>
        <div className={getTextColor(isOpenNow)}>
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
            </h1>
          </div>
          {poolData?.hours && poolData.hours.length > 0 && (
            <div className="space-y-2">
              {poolData.hours.map((slot, index) => {
                const slotStatus = isCurrentOrNextSlot(slot);
                const isHighlighted = slotStatus === 'current' || slotStatus === 'next';
                const isPast = slotStatus === null;
                const isLap = slot.type === 'lap';
                
                return (
                  <div 
                    key={index} 
                    className={`p-3 rounded-xl ${
                      isHighlighted 
                        ? isOpenNow
                          ? `bg-white bg-opacity-70 font-bold text-xl text-gray-900` 
                          : `bg-white bg-opacity-20 font-bold text-xl`
                        : isPast 
                        ? isOpenNow
                          ? `bg-white bg-opacity-20 opacity-50 text-base text-gray-700`
                          : `bg-white bg-opacity-10 opacity-50 text-base`
                        : isLap
                        ? isOpenNow
                          ? 'bg-white bg-opacity-30 font-medium text-base text-gray-900'
                          : 'bg-blue-600 bg-opacity-30 font-medium text-base'
                        : isOpenNow
                          ? 'bg-white bg-opacity-30 font-medium text-base text-gray-900'
                          : 'bg-orange-500 bg-opacity-30 font-medium text-base'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="capitalize font-bold text-black/70">
                        {slot.type === 'lap' ? 'LAP' : 'REC'}
                      </span>
                      <span>{formatTime(slot.start)}-{formatTime(slot.end)}</span>
                    </div>
                    {isHighlighted && (
                      <div className="text-start mt-0">
                        <span className={`font-bold text-sm ${
                          isOpenNow ? 'text-red-500' : 'text-red-500'
                        }`}>
                          {slotStatus === 'current' ? 'NOW' : 'NEXT'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}