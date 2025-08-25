"use client";

import { useState, useEffect } from "react";
import TodayHighlight from "./TodayHighlight";
import WeeklyCalendar from "./WeeklyCalendar";

/**
 * CombinedCalendarView component for single-page layout
 * Displays today's highlight, this week, and next week in sequence
 * 
 * @param {Object} props
 * @param {Date} props.currentTime - Current time for highlighting active sessions

 * @returns {JSX.Element}
 */
export default function CombinedCalendarView({ currentTime }) {
  // State for today's data
  const [todayData, setTodayData] = useState(null);
  const [todayLoading, setTodayLoading] = useState(true);
  const [todayError, setTodayError] = useState(null);

  // State for this week's data
  const [thisWeekData, setThisWeekData] = useState(null);
  const [thisWeekLoading, setThisWeekLoading] = useState(true);
  const [thisWeekError, setThisWeekError] = useState(null);

  // State for next week's data
  const [nextWeekData, setNextWeekData] = useState(null);
  const [nextWeekLoading, setNextWeekLoading] = useState(true);
  const [nextWeekError, setNextWeekError] = useState(null);

  // Fetch today's pool hours
  const fetchTodayData = async () => {
    try {
      setTodayLoading(true);
      setTodayError(null);

      // Get today's date in client timezone
      const today = new Date();
      const todayStr = today.toLocaleDateString("en-CA"); // YYYY-MM-DD format

      const response = await fetch(`/api/pool-hours?date=${todayStr}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTodayData(data);
    } catch (error) {
      console.error("Error fetching today's data:", error);
      setTodayError(error.message);
    } finally {
      setTodayLoading(false);
    }
  };

  // Fetch weekly data for a specific week offset
  const fetchWeeklyData = async (weekOffset, setData, setLoading, setError) => {
    try {
      setLoading(true);
      setError(null);

      // Get client timezone
      const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const response = await fetch(
        `/api/weekly-hours?weekOffset=${weekOffset}&timezone=${encodeURIComponent(
          clientTimezone
        )}`
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error(`Error fetching week ${weekOffset} data:`, error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch this week's data
  const fetchThisWeekData = () => {
    fetchWeeklyData(0, setThisWeekData, setThisWeekLoading, setThisWeekError);
  };

  // Fetch next week's data
  const fetchNextWeekData = () => {
    fetchWeeklyData(1, setNextWeekData, setNextWeekLoading, setNextWeekError);
  };

  // Initial data fetch
  useEffect(() => {
    fetchTodayData();
    fetchThisWeekData();
    fetchNextWeekData();
  }, []);

  // Calculate global next opening across both weeks
  const findGlobalNextOpening = () => {
    // Only calculate if we have data for both weeks
    if (!thisWeekData?.weekData || !nextWeekData?.weekData) {
      return null;
    }
    
    const allSlots = [];
    
    // Collect all future slots from both weeks
    thisWeekData.weekData.forEach((dayData, dayIndex) => {
      if (dayData?.hours) {
        dayData.hours.forEach(slot => {
          if (new Date(slot.start) > currentTime) {
            allSlots.push({
              ...slot,
              weekOffset: 0,
              dayIndex,
              dayData
            });
          }
        });
      }
    });
    
    nextWeekData.weekData.forEach((dayData, dayIndex) => {
      if (dayData?.hours) {
        dayData.hours.forEach(slot => {
          if (new Date(slot.start) > currentTime) {
            allSlots.push({
              ...slot,
              weekOffset: 1,
              dayIndex,
              dayData
            });
          }
        });
      }
    });
    
    // Find the earliest slot
    if (allSlots.length === 0) return null;
    
    const earliestSlot = allSlots.reduce((earliest, current) => {
      return new Date(current.start) < new Date(earliest.start) ? current : earliest;
    });
    
    return {
      slot: earliestSlot,
      weekOffset: earliestSlot.weekOffset,
      dayIndex: earliestSlot.dayIndex
    };
  };

  const globalNextOpening = findGlobalNextOpening();

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTodayData();
      fetchThisWeekData();
      fetchNextWeekData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section with Inline Today Widget */}
        <div className="text-center px-2 mb-3 sm:mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            Pool Schedule
          </h1>
          <p className="text-gray-600 text-sm mb-3">
            Highlands Recreation Center
          </p>

          {/* Inline Today Widget */}
          <div className="flex justify-center mb-2">
            <TodayHighlight
              poolData={todayData}
              loading={todayLoading}
              error={todayError}
              currentTime={currentTime}
              onRefresh={fetchTodayData}
              compact={true}
            />
          </div>
        </div>

        {/* This Week Section */}
        <section className="mb-4 animate-fade-in">
          <WeeklyCalendar
            weekData={thisWeekData?.weekData}
            currentTime={currentTime}
            isCurrentWeek={true}
            loading={thisWeekLoading}
            error={thisWeekError}
            weekOffset={0}
            weekStartDate={thisWeekData?.weekStartDate}
            weekEndDate={thisWeekData?.weekEndDate}
            globalNextOpening={globalNextOpening}
          />
        </section>

        {/* Next Week Section */}
        <section className="mb-4 animate-fade-in">
          <WeeklyCalendar
            weekData={nextWeekData?.weekData}
            currentTime={currentTime}
            isCurrentWeek={false}
            loading={nextWeekLoading}
            error={nextWeekError}
            weekOffset={1}
            weekStartDate={nextWeekData?.weekStartDate}
            weekEndDate={nextWeekData?.weekEndDate}
            globalNextOpening={globalNextOpening}
          />
        </section>

        {/* Compact Footer Section */}
        <footer className="text-center py-3 px-2">
          <div className="text-xs text-gray-500">
            Updated:{" "}
            {currentTime.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
              timeZone: "America/Los_Angeles",
            })}{" "}
            PST • Auto-refresh every 5 min
          </div>
        </footer>
      </div>
    </div>
  );
}
