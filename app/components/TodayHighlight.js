'use client';

import { useState, useEffect } from 'react';

/**
 * TodayHighlight component for displaying today's pool hours prominently
 * 
 * @param {Object} props
 * @param {Object} props.poolData - Today's pool data from API
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message if any
 * @param {Date} props.currentTime - Current time for highlighting active sessions
 * @param {Function} props.onRefresh - Callback to refresh data
 * @returns {JSX.Element}
 */
export default function TodayHighlight({ poolData, loading, error, currentTime, onRefresh }) {
  // Calculate if pool is currently open based on the time slots
  const calculateIsOpen = (hours) => {
    if (!hours || hours.length === 0) return false;
    
    const now = currentTime || new Date();
    
    // Check if current time falls within any time slot
    return hours.some(slot => {
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);
      return now >= slotStart && now <= slotEnd;
    });
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

  // Calculate if pool is open based on current time and available slots
  const isOpenNow = poolData?.hours ? calculateIsOpen(poolData.hours) : false;

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading today's hours...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="text-center">
            <div className="text-red-600 font-bold text-xl mb-2">Error Loading Today's Hours</div>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      {/* Today's Highlight Card */}
      <div className={`${getBackgroundColor(isOpenNow)} rounded-2xl shadow-lg transition-colors duration-500 p-6 border-4 border-white`}>
        <div className={getTextColor(isOpenNow)}>
          {/* Header Section */}
          <div className="text-center mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <h1 className="text-3xl sm:text-4xl font-bold">
                TODAY
              </h1>
              <div className="text-xl sm:text-2xl font-semibold">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
            <div className="mt-2 text-lg sm:text-xl font-medium opacity-90">
              {isOpenNow ? 'Pool is OPEN' : 'Pool is CLOSED'}
            </div>
          </div>

          {/* Pool Hours Section */}
          {poolData?.hours && poolData.hours.length > 0 ? (
            <div className="grid gap-3 sm:gap-4">
              {poolData.hours.map((slot, index) => {
                const slotStatus = isCurrentOrNextSlot(slot);
                const isHighlighted = slotStatus === 'current' || slotStatus === 'next';
                const isPast = slotStatus === null && new Date(slot.end) < currentTime;
                const isLap = slot.type === 'lap';
                
                return (
                  <div 
                    key={index} 
                    className={`p-4 sm:p-5 rounded-xl transition-all duration-300 ${
                      isHighlighted 
                        ? 'bg-white bg-opacity-90 shadow-lg transform scale-105' 
                        : isPast 
                        ? 'bg-white bg-opacity-20 opacity-60'
                        : isLap
                        ? 'bg-blue-600 bg-opacity-40'
                        : 'bg-orange-500 bg-opacity-40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          isHighlighted 
                            ? 'bg-gray-800 text-white' 
                            : 'bg-black bg-opacity-30 text-white'
                        }`}>
                          {slot.type === 'lap' ? 'LAP SWIM' : 'RECREATIONAL'}
                        </span>
                        {isHighlighted && (
                          <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                            {slotStatus === 'current' ? 'NOW' : 'NEXT'}
                          </span>
                        )}
                      </div>
                      <div className={`text-lg sm:text-xl font-semibold ${
                        isHighlighted ? 'text-gray-900' : ''
                      }`}>
                        {formatTime(slot.start)} - {formatTime(slot.end)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-xl font-semibold mb-2">No pool hours available</div>
              <div className="text-lg opacity-80">Check back later for updates</div>
            </div>
          )}

          {/* Current Time Display */}
          <div className="mt-6 text-center">
            <div className="text-sm opacity-75 mb-1">Current Time</div>
            <div className="text-lg font-semibold">
              {currentTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
                timeZone: 'America/Los_Angeles'
              })} PST
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}