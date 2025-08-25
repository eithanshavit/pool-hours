"use client";



/**
 * TodayHighlight component for displaying today's pool hours prominently
 *
 * @param {Object} props
 * @param {Object} props.poolData - Today's pool data from API
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message if any
 * @param {Date} props.currentTime - Current time for highlighting active sessions
 * @param {Function} props.onRefresh - Callback to refresh data
 * @param {boolean} props.compact - Whether to show compact widget mode
 * @returns {JSX.Element}
 */
export default function TodayHighlight({
  poolData,
  loading,
  error,
  currentTime,
  onRefresh,
  compact = false,
}) {
  // Calculate if pool is currently open based on the time slots
  const calculateIsOpen = (hours) => {
    if (!hours || hours.length === 0) return false;

    const now = currentTime || new Date();

    // Check if current time falls within any time slot
    return hours.some((slot) => {
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);
      return now >= slotStart && now <= slotEnd;
    });
  };

  // Find the next slot that hasn't started yet
  const findNextSlot = (hours) => {
    if (!hours || hours.length === 0) return null;

    // Sort slots by start time
    const sortedSlots = [...hours].sort(
      (a, b) => new Date(a.start) - new Date(b.start)
    );

    // Find the first slot that starts after current time
    const nextSlot = sortedSlots.find(
      (slot) => new Date(slot.start) > currentTime
    );

    return nextSlot;
  };

  const isCurrentOrNextSlot = (slot) => {
    const slotStart = new Date(slot.start);
    const slotEnd = new Date(slot.end);

    // If current time is within the slot, it's current
    if (currentTime >= slotStart && currentTime <= slotEnd) {
      return "current";
    }

    // Check if this is the next slot (the first future slot)
    const nextSlot = findNextSlot(poolData?.hours || []);
    if (
      nextSlot &&
      slot.start === nextSlot.start &&
      slot.type === nextSlot.type
    ) {
      return "next";
    }

    return null;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Los_Angeles",
    });
  };

  const getBackgroundColor = (isOpen) => {
    return isOpen ? "bg-green-300" : "bg-red-300";
  };

  const getTextColor = (isOpen) => {
    return isOpen ? "text-gray-800" : "text-white";
  };

  // Calculate if pool is open based on current time and available slots
  const isOpenNow = poolData?.hours ? calculateIsOpen(poolData.hours) : false;

  // Compact widget mode
  if (compact) {
    if (loading) {
      return (
        <div className="inline-flex items-center gap-2 bg-white rounded-full px-3 py-1.5 shadow-sm border">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
          <span className="text-xs text-gray-600">Loading today...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="inline-flex items-center gap-2 bg-red-50 rounded-full px-3 py-1.5 shadow-sm border border-red-200">
          <span className="text-xs text-red-600">Error loading today</span>
        </div>
      );
    }

    // Find current or next slot for compact display
    const currentSlot = poolData?.hours?.find(slot => {
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);
      return currentTime >= slotStart && currentTime <= slotEnd;
    });

    const nextSlot = findNextSlot(poolData?.hours || []);
    const displaySlot = currentSlot || nextSlot;

    return (
      <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 shadow-sm border-2 border-white ${
        isOpenNow ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold">TODAY</span>
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
            isOpenNow ? 'bg-green-200' : 'bg-red-200'
          }`}>
            {isOpenNow ? 'OPEN' : 'CLOSED'}
          </span>
        </div>
        {displaySlot && (
          <>
            <div className="w-px h-3 bg-gray-300"></div>
            <div className="flex items-center gap-1">
              <span className={`text-xs px-1 py-0.5 rounded font-bold ${
                displaySlot.type === 'lap' ? 'bg-blue-200 text-blue-800' : 'bg-orange-200 text-orange-800'
              }`}>
                {displaySlot.type === 'lap' ? 'LAP' : 'REC'}
              </span>
              <span className="text-xs font-medium">
                {formatTime(displaySlot.start)} - {formatTime(displaySlot.end)}
              </span>
              {currentSlot && (
                <span className="text-xs bg-red-500 text-white px-1 py-0.5 rounded font-bold animate-pulse">
                  NOW
                </span>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="px-3">
          <div className="bg-white rounded-lg shadow-sm px-3 py-3 responsive-transition max-w-4xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm font-medium">
                Loading today's hours...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="px-3">
          <div className="bg-white rounded-lg shadow-sm px-3 py-3 responsive-transition contrast-enhanced max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-red-600 font-bold text-sm mb-1">
                Error Loading Today's Hours
              </div>
              <p className="text-gray-600 text-xs mb-2">{error}</p>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors focus-enhanced"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Today's Highlight Card */}
      <div className="px-3">
        <div
          className={`${getBackgroundColor(
            isOpenNow
          )} rounded-lg shadow-sm transition-all duration-500 px-3 py-3 border-2 border-white responsive-transition contrast-enhanced max-w-4xl mx-auto`}
        >
        <div className={getTextColor(isOpenNow)}>
          {/* Inline Header Section */}
          <div className="text-center mb-2">
            <div className="flex items-center justify-center gap-2 mb-1">
              <h2 className="text-sm sm:text-base font-bold">
                Today
              </h2>
              <span className="text-xs sm:text-sm font-medium opacity-80">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isOpenNow 
                  ? "bg-white bg-opacity-90 text-green-700" 
                  : "bg-white bg-opacity-90 text-red-700"
              }`}>
                {isOpenNow ? "OPEN" : "CLOSED"}
              </span>
            </div>
          </div>

          {/* Compact Pool Hours Section */}
          {poolData?.hours && poolData.hours.length > 0 ? (
            <div className="grid gap-1.5">
              {poolData.hours.map((slot, index) => {
                const slotStatus = isCurrentOrNextSlot(slot);
                const isHighlighted =
                  slotStatus === "current" || slotStatus === "next";
                const isPast =
                  slotStatus === null && new Date(slot.end) < currentTime;
                const isLap = slot.type === "lap";

                return (
                  <div
                    key={index}
                    className={`px-2 py-4 rounded-lg transition-all duration-300 ${
                      isHighlighted
                        ? "bg-white bg-opacity-90 shadow-sm transform scale-105"
                        : isPast
                        ? "bg-white bg-opacity-20 opacity-60"
                        : isLap
                        ? "bg-blue-600 bg-opacity-40"
                        : "bg-orange-500 bg-opacity-40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                            isHighlighted
                              ? "bg-gray-800 text-white"
                              : "bg-black bg-opacity-30 text-white"
                          }`}
                        >
                          {slot.type === "lap" ? "LAP" : "REC"}
                        </span>
                        {isHighlighted && (
                          <span className="px-1 py-0.5 bg-red-500 text-white text-xs font-bold rounded animate-pulse">
                            {slotStatus === "current" ? "NOW" : "NEXT"}
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-xs font-semibold ${
                          isHighlighted ? "text-gray-900" : ""
                        }`}
                      >
                        {formatTime(slot.start)} - {formatTime(slot.end)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-3">
              <div className="text-xs font-semibold mb-1">
                No pool hours available
              </div>
              <div className="text-xs opacity-80">
                Check back later for updates
              </div>
            </div>
          )}

          {/* Compact Current Time Display */}
          <div className="mt-2 text-center">
            <div className="text-xs opacity-75">
              Current:{" "}
              {currentTime.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
                timeZone: "America/Los_Angeles",
              })}{" "}
              PST
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
