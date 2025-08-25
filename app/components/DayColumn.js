"use client";

/**
 * DayColumn component for displaying individual day in weekly view
 *
 * @param {Object} props
 * @param {Object} props.dayData - Day data containing date, dayName, hours, and isToday flag
 * @param {Date} props.currentTime - Current time for highlighting active sessions
 * @param {boolean} props.isCurrentWeek - Whether this day is in the current week
 * @param {boolean} props.loading - Loading state for this day
 * @param {string} props.error - Error message if day failed to load
 * @returns {JSX.Element}
 */
export default function DayColumn({
  dayData,
  currentTime,
  isCurrentWeek = false,
  loading = false,
  error = null,
  nextOpeningInfo = null,
  dayIndex = 0,
}) {
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

    // If current time is within the slot and it's today, it's current
    if (dayData?.isToday && currentTime >= slotStart && currentTime <= slotEnd) {
      return "current";
    }

    // Check if this is the next slot across the entire week
    if (nextOpeningInfo && nextOpeningInfo.slot) {
      const nextSlot = nextOpeningInfo.slot;
      if (
        slot.start === nextSlot.start &&
        slot.type === nextSlot.type &&
        dayIndex === nextOpeningInfo.dayIndex
      ) {
        return "next";
      }
    }

    // For today only, also check if this is the next slot within today
    if (dayData?.isToday) {
      const nextSlot = findNextSlot(dayData?.hours || []);
      if (
        nextSlot &&
        slot.start === nextSlot.start &&
        slot.type === nextSlot.type
      ) {
        return "next";
      }
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

  const formatDate = (dateString) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full min-w-0 bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-2.5 responsive-transition overflow-hidden">
        {/* Day header skeleton */}
        <div className="text-center mb-2 pb-1.5 border-b border-gray-200">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-10 mx-auto"></div>
        </div>

        {/* Time slots skeleton */}
        <div className="space-y-1.5">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-10 bg-gray-100 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full min-w-0 bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-2.5 responsive-transition contrast-enhanced overflow-hidden">
        {/* Day header */}
        <div className="text-center mb-2 pb-1.5 border-b border-gray-200">
          <div className="font-bold text-gray-900 text-sm">
            {dayData?.dayName || "Unknown"}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {dayData?.date ? formatDate(dayData.date) : ""}
          </div>
        </div>

        {/* Error message */}
        <div className="text-center py-2">
          <div className="text-red-500 text-xs font-medium mb-1">Error</div>
          <div className="text-gray-400 text-xs break-words">{error}</div>
        </div>
      </div>
    );
  }

  // No data state
  if (!dayData) {
    return (
      <div className="w-full min-w-0 bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-2.5 responsive-transition overflow-hidden">
        <div className="text-center py-4">
          <div className="text-gray-400 text-xs">No data</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full min-w-0 bg-white rounded-lg shadow-sm border transition-all duration-200 px-2 py-2.5 responsive-transition contrast-enhanced overflow-hidden ${
        dayData.isToday
          ? "border-blue-400 shadow-md ring-2 ring-blue-100"
          : "border-gray-200 hover:shadow-md"
      }`}
    >
      {/* Day Header */}
      <div className="text-center mb-2 pb-1.5 border-b border-gray-200">
        <div
          className={`font-bold text-sm ${
            dayData.isToday ? "text-blue-600" : "text-gray-900"
          }`}
        >
          {dayData.dayName.slice(0, 3)}
        </div>
        <div
          className={`text-xs mt-1 ${
            dayData.isToday ? "text-blue-500" : "text-gray-500"
          }`}
        >
          {formatDate(dayData.date)}
        </div>
        {dayData.isToday && (
          <div className="text-xs mt-1 text-blue-600 font-medium">
            Today
          </div>
        )}
      </div>

      {/* Time Slots */}
      {dayData.hours && dayData.hours.length > 0 ? (
        <div className="space-y-1.5">
          {dayData.hours.map((slot, index) => {
            const slotStatus = isCurrentOrNextSlot(slot);
            const isHighlighted =
              slotStatus === "current" || slotStatus === "next";
            const isPast =
              slotStatus === null &&
              new Date(slot.end) < currentTime;
            const isLap = slot.type === "lap";

            return (
              <div
                key={index}
                className={`px-1.5 py-1.5 rounded-lg text-xs transition-all duration-200 touch-manipulation ${
                  isHighlighted
                    ? "bg-green-100 border-2 border-green-400 shadow-sm transform scale-105"
                    : isPast
                    ? "bg-gray-50 opacity-60 border border-gray-200"
                    : isLap
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-orange-50 border border-orange-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                      isHighlighted
                        ? "bg-green-600 text-white"
                        : isPast
                        ? "bg-gray-400 text-white"
                        : isLap
                        ? "bg-blue-600 text-white"
                        : "bg-orange-500 text-white"
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
                  className={`text-center font-medium text-xs ${
                    isHighlighted
                      ? "text-green-800"
                      : isPast
                      ? "text-gray-500"
                      : isLap
                      ? "text-blue-700"
                      : "text-orange-700"
                  }`}
                >
                  <div className="font-semibold truncate">
                    {formatTime(slot.start)} - {formatTime(slot.end)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-3">
          <div className="text-gray-400 text-xs font-medium mb-1">No Hours</div>
          <div className="text-gray-300 text-xs">Pool Closed</div>
        </div>
      )}
    </div>
  );
}
