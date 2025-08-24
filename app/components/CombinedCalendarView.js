"use client";

import { useState, useEffect, useRef } from "react";
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
  // Refs for smooth scrolling to sections
  const todayRef = useRef(null);
  const thisWeekRef = useRef(null);
  const nextWeekRef = useRef(null);
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

      const response = await fetch("/api/pool-hours");
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

      const response = await fetch(
        `/api/weekly-hours?weekOffset=${weekOffset}`
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

  // Refresh all data
  const refreshAllData = () => {
    fetchTodayData();
    fetchThisWeekData();
    fetchNextWeekData();
  };

  // Smooth scroll to section
  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTodayData();
    fetchThisWeekData();
    fetchNextWeekData();
  }, []);

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
        {/* Compact Header Section */}
        <div className="text-center px-2 mb-3 sm:mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            Pool Schedule
          </h1>
          <p className="text-gray-600 text-sm">Highlands Recreation Center</p>

          {/* Compact Navigation & Refresh */}
        </div>

        {/* Today's Highlight Section */}
        <section ref={todayRef} className="px-2 mb-4 animate-fade-in">
          <TodayHighlight
            poolData={todayData}
            loading={todayLoading}
            error={todayError}
            currentTime={currentTime}
            onRefresh={fetchTodayData}
          />
        </section>

        {/* This Week Section */}
        <section ref={thisWeekRef} className="mb-4 animate-fade-in">
          <WeeklyCalendar
            weekData={thisWeekData?.weekData}
            currentTime={currentTime}
            isCurrentWeek={true}
            loading={thisWeekLoading}
            error={thisWeekError}
            weekOffset={0}
            weekStartDate={thisWeekData?.weekStartDate}
            weekEndDate={thisWeekData?.weekEndDate}
          />
        </section>

        {/* Next Week Section */}
        <section ref={nextWeekRef} className="mb-4 animate-fade-in">
          <WeeklyCalendar
            weekData={nextWeekData?.weekData}
            currentTime={currentTime}
            isCurrentWeek={false}
            loading={nextWeekLoading}
            error={nextWeekError}
            weekOffset={1}
            weekStartDate={nextWeekData?.weekStartDate}
            weekEndDate={nextWeekData?.weekEndDate}
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
