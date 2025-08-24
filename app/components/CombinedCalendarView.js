'use client';

import { useState, useEffect } from 'react';
import TodayHighlight from './TodayHighlight';
import WeeklyCalendar from './WeeklyCalendar';

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
      
      const response = await fetch('/api/pool-hours');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTodayData(data);
    } catch (error) {
      console.error('Error fetching today\'s data:', error);
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
      
      const response = await fetch(`/api/weekly-hours?weekOffset=${weekOffset}`);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Pool Schedule
          </h1>
          <p className="text-gray-600 text-lg">
            Highlands Recreation Center
          </p>
          
          {/* Refresh Button */}
          <div className="mt-4">
            <button
              onClick={refreshAllData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
              disabled={todayLoading || thisWeekLoading || nextWeekLoading}
            >
              <svg 
                className={`w-4 h-4 ${(todayLoading || thisWeekLoading || nextWeekLoading) ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh All
            </button>
          </div>
        </div>

        {/* Today's Highlight Section */}
        <section className="space-y-4">
          <TodayHighlight
            poolData={todayData}
            loading={todayLoading}
            error={todayError}
            currentTime={currentTime}
            onRefresh={fetchTodayData}
          />
        </section>

        {/* Visual Separator */}
        <div className="flex items-center justify-center">
          <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          <div className="px-4 text-gray-500 text-sm font-medium">Weekly Schedule</div>
          <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </div>

        {/* This Week Section */}
        <section className="space-y-6">
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

        {/* Visual Separator */}
        <div className="flex items-center justify-center">
          <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          <div className="px-4 text-gray-500 text-sm font-medium">Next Week</div>
          <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </div>

        {/* Next Week Section */}
        <section className="space-y-6">
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

        {/* Footer Section */}
        <footer className="text-center py-8">
          <div className="text-sm text-gray-500 space-y-2">
            <div>
              Last updated: {currentTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
                timeZone: 'America/Los_Angeles'
              })} PST
            </div>
            <div>
              Data refreshes automatically every 5 minutes
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}