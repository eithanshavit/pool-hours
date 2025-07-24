import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';

/**
 * API route to scrape pool hours from Highlands Recreation District
 */
export async function GET() {
  try {
    const result = await scrapePoolHours();
    
    return Response.json(result);
  } catch (error) {
    console.error('Error scraping pool hours:', error);
    return Response.json({
      hours: [],
      prettified: 'Close - Unable to retrieve pool hours',
      isOpenNow: false,
      error: `Failed to scrape pool hours: ${error.message}`,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Scrapes pool hours from the Highlands Recreation District website
 * @returns {Object} Object containing today's pool hours or error
 */
async function scrapePoolHours() {
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
    const today = moment().tz('America/Los_Angeles').format('dddd'); // Get current day name in PST
    
    // Parse lap swim hours
    const lapSwimHours = parseLapSwimHours($);
    
    // Parse rec swim hours
    const recSwimHours = parseRecSwimHours($);
    
    // Get today's hours
    const todayLapSwim = lapSwimHours[today] || [];
    const todayRecSwim = recSwimHours[today] || [];
    
    // Convert to machine-readable timestamps with type information
    const lapSwimTimestamps = convertToTimestamps(todayLapSwim, 'lap');
    const recSwimTimestamps = convertToTimestamps(todayRecSwim, 'rec');
    const timestampedHours = [...lapSwimTimestamps, ...recSwimTimestamps];
    
    // Check if pool is currently open
    const isOpenNow = checkIfOpenNow(timestampedHours);
    
    // Create prettified string of today's hours from the timestamped spans
    const prettifiedHours = createPrettifiedHoursStringFromSpans(timestampedHours, isOpenNow);
    
    return {
      hours: timestampedHours,
      prettified: prettifiedHours,
      isOpenNow: isOpenNow,
      error: null,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return {
        hours: [],
        prettified: 'Unable to connect to pool website',
        isOpenNow: false,
        error: 'Unable to connect to the pool website. Please check your internet connection.',
        timestamp: new Date().toISOString()
      };
    } else if (error.code === 'ENOTFOUND') {
      return {
        hours: [],
        prettified: 'Pool website temporarily unavailable',
        isOpenNow: false,
        error: 'Pool website not found. The website may be temporarily unavailable.',
        timestamp: new Date().toISOString()
      };
    } else if (error.code === 'ETIMEDOUT') {
      return {
        hours: [],
        prettified: 'Close - Pool website is taking too long to respond',
        isOpenNow: false,
        error: 'Request timed out. The pool website is taking too long to respond.',
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        hours: [],
        prettified: 'Close - Unable to retrieve pool hours',
        isOpenNow: false,
        error: `Failed to retrieve pool hours: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }
}

/**
 * Converts human-readable time strings to machine-readable timestamps
 * @param {Array} timeStrings - Array of time strings like "7:30am - 11:00am"
 * @param {string} type - Type of swim (e.g., 'lap', 'rec')
 * @returns {Array} Array of objects with start and end timestamps
 */
function convertToTimestamps(timeStrings, type) {
  const today = moment().tz('America/Los_Angeles').startOf('day');
  const timestamps = [];
  
  console.log('// DEBUG PRINT - convertToTimestamps - today:', today.format('YYYY-MM-DD'));
  console.log('// DEBUG PRINT - convertToTimestamps - timeStrings:', timeStrings);
  console.log('// DEBUG PRINT - convertToTimestamps - type:', type);
  
  timeStrings.forEach(timeString => {
    const timeRange = parseTimeRange(timeString);
    if (timeRange) {
      const { startTime, endTime } = timeRange;
      
      console.log('// DEBUG PRINT - convertToTimestamps - parsed timeRange:', timeRange);
      
      // Create full datetime objects for today
      const startDateTime = moment.tz(today.format('YYYY-MM-DD') + ' ' + startTime, 'YYYY-MM-DD HH:mm', 'America/Los_Angeles');
      const endDateTime = moment.tz(today.format('YYYY-MM-DD') + ' ' + endTime, 'YYYY-MM-DD HH:mm', 'America/Los_Angeles');
      
      console.log('// DEBUG PRINT - convertToTimestamps - startDateTime:', startDateTime.format('YYYY-MM-DD HH:mm:ss'));
      console.log('// DEBUG PRINT - convertToTimestamps - endDateTime:', endDateTime.format('YYYY-MM-DD HH:mm:ss'));
      
      timestamps.push({
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        timezone: 'America/Los_Angeles',
        original: timeString,
        type: type // Add type information
      });
    }
  });
  
  console.log('// DEBUG PRINT - convertToTimestamps - final timestamps:', JSON.stringify(timestamps, null, 2));
  return timestamps;
}

/**
 * Creates a prettified string representation of today's pool hours from timestamped spans
 * @param {Array} timestampedHours - Array of timestamped hour objects with type information
 * @param {boolean} isOpenNow - Whether the pool is currently open
 * @returns {string} Formatted string of today's hours
 */
function createPrettifiedHoursStringFromSpans(timestampedHours, isOpenNow) {
  if (!timestampedHours || timestampedHours.length === 0) {
    return `[Closed] No hours available today`;
  }

  // Determine open/close status
  const status = isOpenNow ? '[Open]' : '[Closed]';

  // Group spans by type
  const lapSpans = timestampedHours.filter(span => span.type === 'lap');
  const recSpans = timestampedHours.filter(span => span.type === 'rec');

  // Format lap swim times from timestamps
  const lapSwimString = lapSpans.length > 0 ? 
    `Lap ${lapSpans.map(span => formatTimeRange(span.start, span.end)).join(', ')}` : '';

  // Format rec swim times from timestamps
  const recSwimString = recSpans.length > 0 ? 
    `Rec ${recSpans.map(span => formatTimeRange(span.start, span.end)).join(', ')}` : '';

  // Combine the parts with forward slash separator
  const parts = [status];
  if (lapSwimString) parts.push(lapSwimString);
  if (lapSwimString && recSwimString) parts.push('/');
  if (recSwimString) parts.push(recSwimString);

  return parts.join(' ');
}

/**
 * Parses a time range string (e.g., "7:30am - 11:00am")
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
 * Checks if the pool is currently open based on the provided timestamped hours.
 * This function iterates through the timestamped hours and checks if the current time
 * falls within any of the time slots for the current day.
 * @param {Array} timestampedHours - Array of timestamped hours objects.
 * @returns {boolean} True if the pool is open, false otherwise.
 */
function checkIfOpenNow(timestampedHours) {
  const currentTime = moment().tz('America/Los_Angeles');
  const currentDay = moment().tz('America/Los_Angeles').format('dddd');

  console.log('// DEBUG PRINT - checkIfOpenNow - currentTime:', currentTime.format('YYYY-MM-DD HH:mm:ss'));
  console.log('// DEBUG PRINT - checkIfOpenNow - currentDay:', currentDay);
  console.log('// DEBUG PRINT - checkIfOpenNow - timestampedHours:', JSON.stringify(timestampedHours, null, 2));

  // Find the time slots for the current day
  const todaySlots = timestampedHours.filter(slot => {
    const slotDay = moment(slot.start).tz('America/Los_Angeles').format('dddd');
    return slotDay === currentDay;
  });

  console.log('// DEBUG PRINT - checkIfOpenNow - todaySlots:', JSON.stringify(todaySlots, null, 2));

  if (todaySlots.length === 0) {
    console.log('// DEBUG PRINT - checkIfOpenNow - No hours for today');
    return false; // No hours for today
  }

  // Check if the current time falls within any of the time slots
  for (const slot of todaySlots) {
    const slotStartTime = moment(slot.start).tz('America/Los_Angeles');
    const slotEndTime = moment(slot.end).tz('America/Los_Angeles');

    console.log('// DEBUG PRINT - checkIfOpenNow - slotStartTime:', slotStartTime.format('YYYY-MM-DD HH:mm:ss'));
    console.log('// DEBUG PRINT - checkIfOpenNow - slotEndTime:', slotEndTime.format('YYYY-MM-DD HH:mm:ss'));
    console.log('// DEBUG PRINT - checkIfOpenNow - isBetween:', currentTime.isBetween(slotStartTime, slotEndTime, 'minute', '[]'));

    if (currentTime.isBetween(slotStartTime, slotEndTime, 'minute', '[]')) {
      console.log('// DEBUG PRINT - checkIfOpenNow - Pool is OPEN');
      return true; // Current time is within a time slot
    }
  }

  console.log('// DEBUG PRINT - checkIfOpenNow - Pool is CLOSED');
  return false; // Current time is not within any time slot
} 

/**
 * Formats a time range string from start and end timestamps.
 * @param {string} start - Start timestamp (ISO string)
 * @param {string} end - End timestamp (ISO string)
 * @returns {string} Formatted time range string (e.g., "7:30am - 11:00am")
 */
function formatTimeRange(start, end) {
  // Parse ISO strings and convert to PST
  const startMoment = moment(start).tz('America/Los_Angeles');
  const endMoment = moment(end).tz('America/Los_Angeles');

  const startHour = startMoment.format('h:mm');
  const startAmPm = startMoment.format('a');
  const endHour = endMoment.format('h:mm');
  const endAmPm = endMoment.format('a');

  return `${startHour}${startAmPm}-${endHour}${endAmPm}`;
} 
