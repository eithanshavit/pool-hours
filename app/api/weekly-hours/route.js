import moment from 'moment-timezone';

/**
 * API route to aggregate pool hours for a full week
 * 
 * The API accepts a 'weekOffset' query parameter to determine which week to return:
 * - 0 (default): Current week (Monday to Sunday containing today)
 * - 1: Next week (Monday to Sunday of the following week)
 * 
 * All calculations are performed in UTC timezone for consistency.
 * The client will handle local timezone conversion for display.
 * 
 * Example usage:
 * GET /api/weekly-hours?weekOffset=0  (this week)
 * GET /api/weekly-hours?weekOffset=1  (next week)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const weekOffset = parseInt(searchParams.get('weekOffset') || '0');
    
    console.log('// DEBUG PRINT - weekly-hours - weekOffset:', weekOffset);
    
    const result = await aggregateWeeklyPoolHours(weekOffset);
    
    return Response.json(result);
  } catch (error) {
    console.error('Error aggregating weekly pool hours:', error);
    return Response.json({
      weekData: [],
      weekStartDate: null,
      weekEndDate: null,
      weekOffset: 0,
      error: `Failed to aggregate weekly pool hours: ${error.message}`,
      timestamp: moment().utc().toISOString()
    }, { status: 500 });
  }
}

/**
 * Aggregates pool hours for a full week by fetching data for each day
 * @param {number} weekOffset - Number of weeks from current week (0 = this week, 1 = next week)
 * @returns {Object} Object containing weekly pool data
 */
async function aggregateWeeklyPoolHours(weekOffset) {
  const { weekStart, weekEnd } = getWeekBoundaries(weekOffset);
  
  console.log('// DEBUG PRINT - aggregateWeeklyPoolHours - weekStart:', weekStart.format('YYYY-MM-DD'));
  console.log('// DEBUG PRINT - aggregateWeeklyPoolHours - weekEnd:', weekEnd.format('YYYY-MM-DD'));
  
  // Create array of promises for parallel fetching
  const dayPromises = [];
  
  for (let i = 0; i < 7; i++) {
    const currentDay = weekStart.clone().add(i, 'days');
    const dateString = currentDay.format('YYYY-MM-DD');
    
    console.log('// DEBUG PRINT - aggregateWeeklyPoolHours - fetching day:', dateString);
    
    // Import the scraping function from the existing API
    const dayPromise = scrapePoolHoursForDate(dateString)
      .then(dayData => ({
        date: dateString,
        dayName: currentDay.format('dddd'),
        hours: dayData.hours || [],
        error: dayData.error,
        isToday: currentDay.isSame(moment().utc(), 'day')
      }))
      .catch(error => ({
        date: dateString,
        dayName: currentDay.format('dddd'),
        hours: [],
        error: `Failed to fetch data for ${dateString}: ${error.message}`,
        isToday: currentDay.isSame(moment().utc(), 'day')
      }));
    
    dayPromises.push(dayPromise);
  }
  
  // Wait for all day data to be fetched in parallel
  const weekData = await Promise.all(dayPromises);
  
  // Check if we have any successful data
  const hasAnyData = weekData.some(day => day.hours.length > 0);
  const hasAllErrors = weekData.every(day => day.error !== null);
  
  let weekError = null;
  if (hasAllErrors) {
    weekError = 'Failed to fetch data for all days of the week';
  } else if (!hasAnyData) {
    weekError = 'No pool hours data available for this week';
  }
  
  return {
    weekData,
    weekStartDate: weekStart.format('YYYY-MM-DD'),
    weekEndDate: weekEnd.format('YYYY-MM-DD'),
    weekOffset,
    error: weekError,
    timestamp: moment().utc().toISOString()
  };
}

/**
 * Calculates week boundaries (Monday to Sunday) in UTC based on offset
 * @param {number} weekOffset - Number of weeks from current week
 * @returns {Object} Object with weekStart and weekEnd moment objects in UTC
 */
function getWeekBoundaries(weekOffset) {
  // Start with current UTC date
  const now = moment().utc();
  
  // Calculate the start of the target week (Monday)
  // moment.js uses 0=Sunday, 1=Monday, so we need to adjust
  const currentDayOfWeek = now.day(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  const daysToMonday = currentDayOfWeek === 0 ? -6 : -(currentDayOfWeek - 1);
  
  const weekStart = now.clone()
    .add(weekOffset, 'weeks')
    .add(daysToMonday, 'days')
    .startOf('day');
  
  const weekEnd = weekStart.clone().add(6, 'days').endOf('day');
  
  console.log('// DEBUG PRINT - getWeekBoundaries - now:', now.format('YYYY-MM-DD dddd'));
  console.log('// DEBUG PRINT - getWeekBoundaries - currentDayOfWeek:', currentDayOfWeek);
  console.log('// DEBUG PRINT - getWeekBoundaries - daysToMonday:', daysToMonday);
  console.log('// DEBUG PRINT - getWeekBoundaries - weekStart:', weekStart.format('YYYY-MM-DD dddd'));
  console.log('// DEBUG PRINT - getWeekBoundaries - weekEnd:', weekEnd.format('YYYY-MM-DD dddd'));
  
  return { weekStart, weekEnd };
}

/**
 * Scrapes pool hours for a specific date by reusing existing scraping logic
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Promise<Object>} Promise resolving to day's pool hours data
 */
async function scrapePoolHoursForDate(dateString) {
  // Import the scraping function from the existing pool-hours API
  // We'll use dynamic import to avoid circular dependencies
  try {
    const { scrapePoolHours } = await import('../pool-hours/scraping-utils.js');
    return await scrapePoolHours(dateString);
  } catch (importError) {
    console.error('Failed to import scraping utilities:', importError);
    
    // Fallback: make an internal API call to the existing endpoint
    try {
      const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/pool-hours?date=${dateString}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (fetchError) {
      console.error('Failed to fetch from pool-hours API:', fetchError);
      throw new Error(`Unable to fetch pool hours for ${dateString}: ${fetchError.message}`);
    }
  }
}