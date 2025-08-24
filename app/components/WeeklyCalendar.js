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
        <div className="mb-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mx-auto"></div>
        </div>
        
        {/* Day columns skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-2 px-2">
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
        <div className="text-center mb-2">
          <h2 className="text-base font-bold text-gray-900 mb-1">
            {formatWeekHeader()}
          </h2>
        </div>
        
        {/* Error message */}
        <div className="text-center py-4">
          <div className="bg-red-50 border border-red-200 rounded p-3 max-w-sm mx-auto">
            <div className="text-red-600 font-medium mb-1 text-sm">Unable to Load Week</div>
            <div className="text-red-500 text-xs">{error}</div>
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
      {/* Mobile-Optimized Week Header */}
      <div className="text-center mb-4 px-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2 responsive-transition">
          {formatWeekHeader()}
        </h2>
        {weekOffset === 0 && (
          <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full inline-block">
            Current Week
          </div>
        )}
        {weekOffset === 1 && (
          <div className="text-xs text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded-full inline-block">
            Upcoming Week
          </div>
        )}
      </div>

      {/* Compact 7-Day Grid Layout */}
      <div className="relative">
        {/* Responsive grid container */}
        <div className="px-3">
          {/* Mobile: Flowing grid layout */}
          <div className="sm:hidden">
            <div className="grid grid-cols-2 gap-3 mb-4">
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
          </div>

          {/* Tablet and Desktop: Grid layout */}
          <div className="hidden sm:block">
            {/* Tablet: 2x4 grid (2 rows, 4 columns) with Sunday separate */}
            <div className="sm:block lg:hidden">
              <div className="grid grid-cols-4 gap-3 mb-3">
                {fullWeekData.slice(0, 4).map((dayData, index) => (
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
              <div className="grid grid-cols-3 gap-3">
                {fullWeekData.slice(4).map((dayData, index) => (
                  <DayColumn
                    key={dayData.date || (index + 4)}
                    dayData={dayData}
                    currentTime={currentTime}
                    isCurrentWeek={isCurrentWeek}
                    loading={false}
                    error={dayData.error}
                  />
                ))}
              </div>
            </div>

            {/* Large Desktop: Single row */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-7 gap-4">
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
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}