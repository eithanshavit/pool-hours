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
    return isOpen ? 'bg-green-400' : 'bg-red-500';
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">Error loading pool hours</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getBackgroundColor(poolData?.isOpenNow)} transition-colors duration-500 flex items-center justify-center`}>
      <div className="max-w-md mx-auto px-4">
        {/* Timeline */}
        {poolData?.hours && poolData.hours.length > 0 && (
          <div className="space-y-3">
            {poolData.hours.map((slot, index) => {
              const slotStatus = isCurrentOrNextSlot(slot);
              const isHighlighted = slotStatus === 'current' || slotStatus === 'next';
              const isPast = slotStatus === null;
              
              return (
                <div 
                  key={index} 
                  className={`flex items-center justify-between bg-white rounded-lg p-6 transition-all duration-300 ${
                    isHighlighted 
                      ? 'shadow-2xl border-2 border-blue-400' 
                      : isPast
                      ? 'shadow-lg opacity-40'
                      : 'shadow-lg'
                  }`}
                >
                  <div className="flex items-center min-w-0 flex-1 mr-4">
                    <div className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${
                      slot.type === 'lap' ? 'bg-blue-500' : 'bg-green-500'
                    }`}></div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800 capitalize truncate">
                        {slot.type} Swim
                      </span>
                      {isHighlighted && (
                        <span className="text-xs text-blue-600 font-medium">
                          {slotStatus === 'current' ? 'Current' : 'Next'}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900 flex-shrink-0">
                    {formatTime(slot.start)} - {formatTime(slot.end)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 
