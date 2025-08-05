import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';

/**
 * API route to scrape pool hours from Highlands Recreation District
 * 
 * The API accepts a 'date' query parameter (YYYY-MM-DD format) from the client
 * to determine which day's pool hours to return. This allows the client to specify
 * the date based on their local timezone rather than the server's timezone.
 * 
 * All time calculations are performed in GMT/UTC timezone to ensure consistency
 * regardless of the server's timezone. The client will handle local timezone conversion.
 * Website parsing assumes PST timezone since that's where the pool is located.
 * 
 * Example usage:
 * GET /api/pool-hours?date=2024-01-15
 */
export async function GET(request) {
  try {
    // Get the date from query parameters, defaulting to today if not provided
    const { searchParams } = new URL(request.url);
    const clientDate = searchParams.get('date'); // Expected format: YYYY-MM-DD
    
    const result = await scrapePoolHours(clientDate);
    
    return Response.json(result);
  } catch (error) {
    console.error('Error scraping pool hours:', error);
    return Response.json({
      hours: [],
      error: `Failed to scrape pool hours: ${error.message}`,
      timestamp: moment().utc().toISOString(),
      date: null,
      dayName: null
    }, { status: 500 });
  }
}

/**
 * Scrapes pool hours from the Highlands Recreation District website
 * @param {string} clientDate - Date string in YYYY-MM-DD format from client's timezone
 * @returns {Object} Object containing the specified day's pool hours or error
 */
async function scrapePoolHours(clientDate) {
  const url = 'https://highlandsrec.ca.gov/pool-hours-e0d65e4';
  
  try {
    // Fetch the webpage
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    
    // Use client date if provided, otherwise fall back to server's local time
    let targetDate;
    let targetDayName;
    
    if (clientDate) {
      // Parse the client date and get the day name in PST (where the pool is located)
      targetDate = moment.tz(clientDate, 'YYYY-MM-DD', 'America/Los_Angeles');
      targetDayName = targetDate.format('dddd');
    } else {
      // Fallback to server's local time if no client date provided
      targetDate = moment().tz('America/Los_Angeles');
      targetDayName = targetDate.format('dddd');
    }
    
    console.log('// DEBUG PRINT - scrapePoolHours - clientDate:', clientDate);
    console.log('// DEBUG PRINT - scrapePoolHours - targetDate:', targetDate.format('YYYY-MM-DD'));
    console.log('// DEBUG PRINT - scrapePoolHours - targetDayName:', targetDayName);
    
    // Parse lap swim hours
    const lapSwimHours = parseLapSwimHours($);
    
    // Parse rec swim hours
    const recSwimHours = parseRecSwimHours($);
    
    // Get the target day's hours
    const targetLapSwim = lapSwimHours[targetDayName] || [];
    const targetRecSwim = recSwimHours[targetDayName] || [];
    
    // Convert to machine-readable timestamps with type information
    const lapSwimTimestamps = convertToTimestamps(targetLapSwim, 'lap', targetDate);
    const recSwimTimestamps = convertToTimestamps(targetRecSwim, 'rec', targetDate);
    const timestampedHours = [...lapSwimTimestamps, ...recSwimTimestamps].sort((a, b) => {
      // Sort by start time
      return new Date(a.start) - new Date(b.start);
    });
    
    return {
      hours: timestampedHours,
      error: null,
      timestamp: moment().utc().toISOString(),
      date: targetDate.format('YYYY-MM-DD'),
      dayName: targetDayName
    };
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return {
        hours: [],
        error: 'Unable to connect to the pool website. Please check your internet connection.',
        timestamp: moment().utc().toISOString(),
        date: null,
        dayName: null
      };
    } else if (error.code === 'ENOTFOUND') {
      return {
        hours: [],
        error: 'Pool website not found. The website may be temporarily unavailable.',
        timestamp: moment().utc().toISOString(),
        date: null,
        dayName: null
      };
    } else if (error.code === 'ETIMEDOUT') {
      return {
        hours: [],
        error: 'Request timed out. The pool website is taking too long to respond.',
        timestamp: moment().utc().toISOString(),
        date: null,
        dayName: null
      };
    } else {
      return {
        hours: [],
        error: `Failed to retrieve pool hours: ${error.message}`,
        timestamp: moment().utc().toISOString(),
        date: null,
        dayName: null
      };
    }
  }
}

/**
 * Converts human-readable time strings to machine-readable timestamps in GMT
 * @param {Array} timeStrings - Array of time strings like "7:30am - 11:00am"
 * @param {string} type - Type of swim (e.g., 'lap', 'rec')
 * @param {moment} targetDate - Target date in PST timezone
 * @returns {Array} Array of objects with start and end timestamps in GMT
 */
function convertToTimestamps(timeStrings, type, targetDate) {
  // Use the target date in PST for parsing the website times, then convert to GMT
  const targetDatePST = targetDate.clone().startOf('day');
  const timestamps = [];
  
  console.log('// DEBUG PRINT - convertToTimestamps - targetDatePST:', targetDatePST.format('YYYY-MM-DD'));
  console.log('// DEBUG PRINT - convertToTimestamps - timeStrings:', timeStrings);
  console.log('// DEBUG PRINT - convertToTimestamps - type:', type);
  
  timeStrings.forEach(timeString => {
    const timeRange = parseTimeRange(timeString);
    if (timeRange) {
      const { startTime, endTime } = timeRange;
      
      console.log('// DEBUG PRINT - convertToTimestamps - parsed timeRange:', timeRange);
      
      // Create full datetime objects for the target date in PST, then convert to GMT
      const startDateTimePST = moment.tz(targetDatePST.format('YYYY-MM-DD') + ' ' + startTime, 'YYYY-MM-DD HH:mm', 'America/Los_Angeles');
      const endDateTimePST = moment.tz(targetDatePST.format('YYYY-MM-DD') + ' ' + endTime, 'YYYY-MM-DD HH:mm', 'America/Los_Angeles');
      
      // Convert to GMT
      const startDateTimeGMT = startDateTimePST.utc();
      const endDateTimeGMT = endDateTimePST.utc();
      
      console.log('// DEBUG PRINT - convertToTimestamps - startDateTimeGMT:', startDateTimeGMT.format('YYYY-MM-DD HH:mm:ss'));
      console.log('// DEBUG PRINT - convertToTimestamps - endDateTimeGMT:', endDateTimeGMT.format('YYYY-MM-DD HH:mm:ss'));
      
      timestamps.push({
        start: startDateTimeGMT.toISOString(),
        end: endDateTimeGMT.toISOString(),
        timezone: 'GMT',
        original: timeString,
        type: type // Add type information
      });
    }
  });
  
  console.log('// DEBUG PRINT - convertToTimestamps - final timestamps:', JSON.stringify(timestamps, null, 2));
  return timestamps;
}



/**
 * Parses a time range string (e.g., "7:30am - 11:00am") in PST timezone
 * @param {string} timeRange - Time range string
 * @returns {Object|null} Object with startTime and endTime in 24-hour format, or null if parsing fails
 */
function parseTimeRange(timeRange) {
  const match = timeRange.match(/(\d{1,2}:\d{2}(?:am|pm))\s*-\s*(\d{1,2}:\d{2}(?:am|pm))/i);
  if (!match) return null;
  
  const startTime = moment.tz(match[1], 'h:mma', 'America/Los_Angeles').format('HH:mm');
  const endTime = moment.tz(match[2], 'h:mma', 'America/Los_Angeles').format('HH:mm');
  
  return { startTime, endTime };
}

/**
 * Parses lap swim hours from the webpage with flexible detection
 * @param {Object} $ - Cheerio object
 * @returns {Object} Object with days as keys and time ranges as values
 */
function parseLapSwimHours($) {
  const lapSwimHours = {};
  
  // Multiple strategies to find lap swim hours
  const strategies = [
    // Strategy 1: Look for exact heading match
    () => {
      const section = $('h3:contains("Lap Swim Hours")').nextUntil('h3');
      return section.find('table').first();
    },
    // Strategy 2: Look for partial heading match
    () => {
      const section = $('h3').filter((i, el) => {
        return $(el).text().toLowerCase().includes('lap') && 
               $(el).text().toLowerCase().includes('swim');
      }).nextUntil('h3');
      return section.find('table').first();
    },
    // Strategy 3: Look for any table with "lap" in nearby text
    () => {
      return $('table').filter((i, table) => {
        const tableText = $(table).text().toLowerCase();
        const prevText = $(table).prevAll().text().toLowerCase();
        const nextText = $(table).nextAll().text().toLowerCase();
        return (tableText + prevText + nextText).includes('lap');
      }).first();
    },
    // Strategy 4: Look for tables with time patterns and day names
    () => {
      return $('table').filter((i, table) => {
        const rows = $(table).find('tr');
        let hasTimePattern = false;
        let hasDayNames = false;
        
        rows.each((j, row) => {
          const cells = $(row).find('td, th');
          cells.each((k, cell) => {
            const text = $(cell).text().trim();
            // Check for time patterns (e.g., "7:30am - 11:00am")
            if (/\d{1,2}:\d{2}(?:am|pm)\s*-\s*\d{1,2}:\d{2}(?:am|pm)/i.test(text)) {
              hasTimePattern = true;
            }
            // Check for day names
            if (/^(mon|tue|wed|thu|fri|sat|sun)/i.test(text)) {
              hasDayNames = true;
            }
          });
        });
        
        return hasTimePattern && hasDayNames;
      }).first();
    }
  ];

  let table = null;
  for (const strategy of strategies) {
    table = strategy();
    if (table.length > 0) {
      break;
    }
  }

  if (table.length === 0) {
    console.warn('Could not find lap swim hours table');
    return lapSwimHours;
  }

  // Parse the table with flexible column detection
  table.find('tr').each((index, row) => {
    const cells = $(row).find('td, th');
    
    // Skip header rows and empty rows
    if (cells.length < 2) return;
    
    // Try to identify which columns contain days and times
    let dayColumn = -1;
    let timeColumns = [];
    
    cells.each((cellIndex, cell) => {
      const text = $(cell).text().trim().toLowerCase();
      
      // Check if this looks like a day column
      if (/^(mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(text)) {
        dayColumn = cellIndex;
      }
      
      // Check if this looks like a time column (can be multiple)
      if (/\d{1,2}:\d{2}(?:am|pm)/i.test(text)) {
        timeColumns.push(cellIndex);
      }
    });
    
    // If we found day column and at least one time column, extract the data
    if (dayColumn >= 0 && timeColumns.length > 0) {
      const day = $(cells[dayColumn]).text().trim();
      
      if (day) {
        // Handle multiple days in one row (e.g., "Mon-Fri" or "Mon/Wed/Fri")
        if (day.includes('-')) {
          const [startDay, endDay] = day.split('-').map(d => d.trim());
          const dayRange = getDayRange(startDay, endDay);
          dayRange.forEach(dayName => {
            lapSwimHours[dayName] = lapSwimHours[dayName] || [];
            
            // Extract all time spans for this day
            timeColumns.forEach(timeColumnIndex => {
              const time = $(cells[timeColumnIndex]).text().trim();
              if (time && /\d{1,2}:\d{2}(?:am|pm)/i.test(time)) {
                lapSwimHours[dayName].push(time);
              }
            });
          });
        } else {
          const days = day.split(/[\/\-]/).map(d => d.trim());
          days.forEach(dayName => {
            if (dayName) {
              const fullDayName = normalizeDayName(dayName);
              if (fullDayName) {
                lapSwimHours[fullDayName] = lapSwimHours[fullDayName] || [];
                
                // Extract all time spans for this day
                timeColumns.forEach(timeColumnIndex => {
                  const time = $(cells[timeColumnIndex]).text().trim();
                  if (time && /\d{1,2}:\d{2}(?:am|pm)/i.test(time)) {
                    lapSwimHours[fullDayName].push(time);
                  }
                });
              }
            }
          });
        }
      }
    }
  });
  
  return lapSwimHours;
}

/**
 * Parses rec swim hours from the webpage with flexible detection
 * @param {Object} $ - Cheerio object
 * @returns {Object} Object with days as keys and time ranges as values
 */
function parseRecSwimHours($) {
  const recSwimHours = {};
  
  // Multiple strategies to find rec swim hours
  const strategies = [
    // Strategy 1: Look for exact heading match
    () => {
      const section = $('h3:contains("Rec Swim Hours")').nextUntil('h3');
      return section.find('table').first();
    },
    // Strategy 2: Look for partial heading match
    () => {
      const section = $('h3').filter((i, el) => {
        const text = $(el).text().toLowerCase();
        return (text.includes('rec') || text.includes('recreational')) && 
               text.includes('swim');
      }).nextUntil('h3');
      return section.find('table').first();
    },
    // Strategy 3: Look for any table with "rec" or "recreational" in nearby text
    () => {
      return $('table').filter((i, table) => {
        const tableText = $(table).text().toLowerCase();
        const prevText = $(table).prevAll().text().toLowerCase();
        const nextText = $(table).nextAll().text().toLowerCase();
        return (tableText + prevText + nextText).includes('rec') ||
               (tableText + prevText + nextText).includes('recreational');
      }).first();
    }
  ];

  let table = null;
  for (const strategy of strategies) {
    table = strategy();
    if (table.length > 0) {
      break;
    }
  }

  if (table.length === 0) {
    console.warn('Could not find rec swim hours table');
    return recSwimHours;
  }

  // Parse the table with flexible column detection (same logic as lap swim)
  table.find('tr').each((index, row) => {
    const cells = $(row).find('td, th');
    
    if (cells.length < 2) return;
    
    let dayColumn = -1;
    let timeColumns = [];
    
    cells.each((cellIndex, cell) => {
      const text = $(cell).text().trim().toLowerCase();
      
      if (/^(mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(text)) {
        dayColumn = cellIndex;
      }
      
      if (/\d{1,2}:\d{2}(?:am|pm)/i.test(text)) {
        timeColumns.push(cellIndex);
      }
    });
    
    if (dayColumn >= 0 && timeColumns.length > 0) {
      const day = $(cells[dayColumn]).text().trim();
      
      if (day) {
        // Handle multiple days in one row (e.g., "Mon-Fri")
        if (day.includes('-')) {
          const [startDay, endDay] = day.split('-').map(d => d.trim());
          const dayRange = getDayRange(startDay, endDay);
          dayRange.forEach(dayName => {
            recSwimHours[dayName] = recSwimHours[dayName] || [];
            
            // Extract all time spans for this day
            timeColumns.forEach(timeColumnIndex => {
              const time = $(cells[timeColumnIndex]).text().trim();
              if (time && /\d{1,2}:\d{2}(?:am|pm)/i.test(time)) {
                recSwimHours[dayName].push(time);
              }
            });
          });
        } else {
          const days = day.split(/[\/\-]/).map(d => d.trim());
          days.forEach(dayName => {
            if (dayName) {
              const fullDayName = normalizeDayName(dayName);
              if (fullDayName) {
                recSwimHours[fullDayName] = recSwimHours[fullDayName] || [];
                
                // Extract all time spans for this day
                timeColumns.forEach(timeColumnIndex => {
                  const time = $(cells[timeColumnIndex]).text().trim();
                  if (time && /\d{1,2}:\d{2}(?:am|pm)/i.test(time)) {
                    recSwimHours[fullDayName].push(time);
                  }
                });
              }
            }
          });
        }
      }
    }
  });
  
  return recSwimHours;
}

/**
 * Normalizes day names to full day names
 * @param {string} dayName - Short or full day name
 * @returns {string} Normalized full day name or null if invalid
 */
function normalizeDayName(dayName) {
  const dayMap = {
    'mon': 'Monday',
    'monday': 'Monday',
    'tue': 'Tuesday',
    'tuesday': 'Tuesday',
    'wed': 'Wednesday',
    'wednesday': 'Wednesday',
    'thu': 'Thursday',
    'thr': 'Thursday',
    'thursday': 'Thursday',
    'fri': 'Friday',
    'friday': 'Friday',
    'sat': 'Saturday',
    'saturday': 'Saturday',
    'sun': 'Sunday',
    'sunday': 'Sunday'
  };
  
  const normalized = dayName.toLowerCase().trim();
  return dayMap[normalized] || null;
}

/**
 * Gets the range of days between start and end day
 * @param {string} startDay - Starting day (e.g., "Mon")
 * @param {string} endDay - Ending day (e.g., "Fri")
 * @returns {Array} Array of day names
 */
function getDayRange(startDay, endDay) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Normalize the input to handle case variations
  const normalizedStartDay = startDay.trim();
  const normalizedEndDay = endDay.trim();
  
  // Try to find the day indices, handling both short and full names
  let startIndex = -1;
  let endIndex = -1;
  
  // Check short day names first
  startIndex = shortDays.findIndex(day => 
    day.toLowerCase() === normalizedStartDay.toLowerCase()
  );
  endIndex = shortDays.findIndex(day => 
    day.toLowerCase() === normalizedEndDay.toLowerCase()
  );
  
  // If not found in short days, check full day names
  if (startIndex === -1) {
    startIndex = days.findIndex(day => 
      day.toLowerCase() === normalizedStartDay.toLowerCase()
    );
  }
  if (endIndex === -1) {
    endIndex = days.findIndex(day => 
      day.toLowerCase() === normalizedEndDay.toLowerCase()
    );
  }
  
  if (startIndex === -1 || endIndex === -1) {
    // If we can't parse the range, return the original days
    return [normalizedStartDay, normalizedEndDay];
  }
  
  const result = [];
  for (let i = startIndex; i <= endIndex; i++) {
    result.push(days[i]);
  }
  
  return result;
} 

/**
 * Formats a time range string from start and end timestamps in GMT.
 * @param {string} start - Start timestamp (ISO string in GMT)
 * @param {string} end - End timestamp (ISO string in GMT)
 * @returns {string} Formatted time range string (e.g., "7:30am - 11:00am")
 */
function formatTimeRange(start, end) {
  // Parse ISO strings and format them (timestamps are already in GMT)
  const startMoment = moment.utc(start);
  const endMoment = moment.utc(end);

  const startHour = startMoment.format('h:mm');
  const startAmPm = startMoment.format('a');
  const endHour = endMoment.format('h:mm');
  const endAmPm = endMoment.format('a');

  return `${startHour}${startAmPm}-${endHour}${endAmPm}`;
} 
