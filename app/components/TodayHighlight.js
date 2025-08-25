"use client";

import { useState, useEffect } from "react";

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
export default function TodayHighlight({
  poolData,
  loading,
  error,
  currentTime,
  onRefresh,
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

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm px-3 py-2.5 responsive-transition">
          <div className="text-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm font-medium">
              Loading today's hours...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm px-3 py-2.5 responsive-transition contrast-enhanced">
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
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Compact Today's Highlight Card */}
      <div
        className={`${getBackgroundColor(
          isOpenNow
        )} rounded-lg shadow-sm transition-all duration-500 px-3 py-2.5 border-2 border-white responsive-transition contrast-enhanced`}
      >
        <div className={getTextColor(isOpenNow)}>
          {/* Compact Header Section */}
          <div className="text-center mb-2">
            <div className="flex flex-col xs:flex-row items-center justify-center gap-1 xs:gap-2">
              <h1 className="text-base xs:text-lg sm:text-xl font-bold">
                TODAY
              </h1>
              <div className="text-xs xs:text-sm sm:text-base font-semibold">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
            <div className="mt-0.5 text-xs sm:text-sm font-medium opacity-90">
              {isOpenNow ? "Pool is OPEN" : "Pool is CLOSED"}
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
  );
}
