'use client';

import DayColumn from './DayColumn';

/**
 * WeeklyCalendar component for displaying a 7-day grid layout
 * 
 * @param {Object} props
 * @param {Array} props.weekData - Array of 7 day objects with pool hours data
 * @param {Date} props.currentTime - Current time for highlighting active sessions
 * @param {boolean} props.isCurrentWeek - Whether this is the current week (affects current/next indicators)
 * @param {boolean} props.loading - Loading state for the entire week
 * @param {string} props.error - Error message if week failed to load
 * @param {number} props.weekOffset - Week offset (0 = this week, 1 = next week)
 * @param {string} props.weekStartDate - Start date of the week (YYYY-MM-DD)
 * @param {string} props.weekEndDate - End date of the week (YYYY-MM-DD)
 * @returns {JSX.Element}
 */
export default function WeeklyCalendar({ 
  weekData = [], 
  currentTime, 
  isCurrentWeek = false, 
  loading = false, 
  error = null,
  weekOffset = 0,
  weekStartDate = null,
  weekEndDate = null
}) {
  
  const formatWeekHeader = () => {
    if (!weekStartDate || !weekEndDate) {
      return weekOffset === 0 ? 'This Week' : 'Next Week';
    }
    
    const startDate = new Date(weekStartDate + 'T00:00:00');
    const endDate = new Date(weekEndDate + 'T00:00:00');
    
    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    
    const weekLabel = weekOffset === 0 ? 'This Week' : 'Next Week';
    
    if (startMonth === endMonth) {
      return `${weekLabel} • ${startMonth} ${startDay}-${endDay}`;
    } else {
      return `${weekLabel} • ${startMonth} ${startDay} - ${endMonth} ${endDay}`;
    }
  };

  // Loading state for entire week
  if (loading) {
    return (
      <div className="w-full">
        {/* Week header skeleton */}
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-48 mx-auto"></div>
        </div>
        
        {/* Day columns skeleton */}
        <div className="flex gap-3 overflow-x-auto pb-4 px-4 sm:px-0">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <DayColumn 
              key={i}
              dayData={null}
              currentTime={currentTime}
              isCurrentWeek={isCurrentWeek}
              loading={true}
            />
          ))}
        </div>
      </div>
    );
  }

  // Error state for entire week
  if (error && (!weekData || weekData.length === 0)) {
    return (
      <div className="w-full">
        {/* Week header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {formatWeekHeader()}
          </h2>
        </div>
        
        {/* Error message */}
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-red-600 font-medium mb-2">Unable to Load Week</div>
            <div className="text-red-500 text-sm">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  // Ensure we have 7 days of data (fill missing days with empty data)
  const fullWeekData = [];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  for (let i = 0; i < 7; i++) {
    const existingDay = weekData && weekData[i];
    if (existingDay) {
      fullWeekData.push(existingDay);
    } else {
      // Create placeholder for missing day
      fullWeekData.push({
        date: null,
        dayName: dayNames[i],
        hours: [],
        error: 'No data available',
        isToday: false
      });
    }
  }

  return (
    <div className="w-full">
      {/* Week Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {formatWeekHeader()}
        </h2>
        {weekOffset === 0 && (
          <div className="text-sm text-blue-600 font-medium">
            Current Week
          </div>
        )}
        {weekOffset === 1 && (
          <div className="text-sm text-gray-600 font-medium">
            Upcoming Week
          </div>
        )}
      </div>

      {/* 7-Day Grid Layout */}
      <div className="relative">
        {/* Mobile: Horizontal scrolling container */}
        <div className="flex gap-3 overflow-x-auto pb-4 px-4 sm:px-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {fullWeekData.map((dayData, index) => (
            <DayColumn
              key={dayData.date || index}
              dayData={dayData}
              currentTime={currentTime}
              isCurrentWeek={isCurrentWeek}
              loading={false}
              error={dayData.error}
            />
          ))}
        </div>
        
        {/* Scroll hint for mobile */}
        <div className="sm:hidden text-center mt-2">
          <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Scroll to see all days
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Week Summary (optional) */}
      {weekData && weekData.length > 0 && (
        <div className="mt-6 text-center">
          <div className="text-xs text-gray-500">
            {weekData.filter(day => day.hours && day.hours.length > 0).length} of 7 days have pool hours
          </div>
        </div>
      )}
    </div>
  );
}