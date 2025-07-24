'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [poolData, setPoolData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPoolHours = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pool-hours');
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

  useEffect(() => {
    fetchPoolHours();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchPoolHours, 5 * 60 * 1000);
    return () => clearInterval(interval);
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
    const now = new Date();
    const slotStart = new Date(slot.start);
    const slotEnd = new Date(slot.end);
    
    // If current time is within the slot, it's current
    if (now >= slotStart && now <= slotEnd) {
      return 'current';
    }
    
    // If current time is before the slot start, it's next
    if (now < slotStart) {
      return 'next';
    }
    
    return null;
  };

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
      <div className={`w-[300px] h-[300px] ${getBackgroundColor(poolData?.isOpenNow)} rounded-3xl shadow-lg transition-colors duration-500 p-6 overflow-y-auto`}>
        <div className={getTextColor(poolData?.isOpenNow)}>
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
                    className={`p-2 rounded-xl border-l-4 ${
                      isHighlighted 
                        ? poolData?.isOpenNow
                          ? `bg-white bg-opacity-70 ${isLap ? 'border-l-blue-500' : 'border-l-orange-500'} font-bold text-xl text-gray-900` 
                          : `bg-white bg-opacity-20 ${isLap ? 'border-l-blue-400' : 'border-l-orange-400'} font-bold text-xl`
                        : isPast 
                        ? poolData?.isOpenNow
                          ? `bg-white bg-opacity-20 ${isLap ? 'border-l-blue-300' : 'border-l-orange-300'} opacity-50 text-base text-gray-700`
                          : `bg-white bg-opacity-10 ${isLap ? 'border-l-blue-200' : 'border-l-orange-200'} opacity-50 text-base`
                        : isLap
                        ? poolData?.isOpenNow
                          ? 'bg-white bg-opacity-30 border-l-blue-600 font-medium text-base text-gray-900'
                          : 'bg-blue-600 bg-opacity-30 border-l-blue-500 font-medium text-base'
                        : poolData?.isOpenNow
                          ? 'bg-white bg-opacity-30 border-l-orange-600 font-medium text-base text-gray-900'
                          : 'bg-orange-500 bg-opacity-30 border-l-orange-400 font-medium text-base'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="capitalize font-bold">
                        {slot.type === 'lap' ? 'LAP' : 'REC'}
                      </span>
                      <span>{formatTime(slot.start)}-{formatTime(slot.end)}</span>
                    </div>
                    {isHighlighted && (
                      <div className="text-center mt-1">
                        <span className={`font-bold text-sm ${
                          poolData?.isOpenNow ? 'text-yellow-700' : 'text-yellow-200'
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
