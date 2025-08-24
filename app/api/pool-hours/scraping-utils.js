import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';

/**
 * Scrapes pool hours from the Highlands Recreation District website
 * @param {string} clientDate - Date string in YYYY-MM-DD format from client's timezone
 * @returns {Object} Object containing the specified day's pool hours or error
 */
export async function scrapePoolHours(clientDate) {
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
    

    
    // Parse all pool hours (both lap and recreational)
    const allPoolHours = parseAllPoolHours($);
    
    // Get the target day's hours
    const targetDayHours = allPoolHours[targetDayName] || [];
    
    // Convert to machine-readable timestamps (type is already determined during parsing)
    const timestampedHours = [];
    targetDayHours.forEach(session => {
      const timeRange = parseTimeRange(session.time);
      if (timeRange) {
        const { startTime, endTime } = timeRange;
        
        // Create full datetime objects for the target date in PST, then convert to GMT
        const startDateTimePST = moment.tz(targetDate.format('YYYY-MM-DD') + ' ' + startTime, 'YYYY-MM-DD HH:mm', 'America/Los_Angeles');
        const endDateTimePST = moment.tz(targetDate.format('YYYY-MM-DD') + ' ' + endTime, 'YYYY-MM-DD HH:mm', 'America/Los_Angeles');
        
        // Convert to GMT
        const startDateTimeGMT = startDateTimePST.utc();
        const endDateTimeGMT = endDateTimePST.utc();
        
        timestampedHours.push({
          start: startDateTimeGMT.toISOString(),
          end: endDateTimeGMT.toISOString(),
          timezone: 'GMT',
          original: session.time,
          type: session.type
        });
      }
    });
    
    // Sort by start time
    timestampedHours.sort((a, b) => new Date(a.start) - new Date(b.start));
    
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
 * Parses all pool hours (both lap and recreational) from the webpage
 * @param {Object} $ - Cheerio object
 * @returns {Object} Object with days as keys and arrays of {time, type} objects as values
 */
function parseAllPoolHours($) {
  const allHours = {};
  
  // First, find all section headers and their positions in the document
  const sectionHeaders = [];
  $('*').each((i, element) => {
    const text = $(element).text().toLowerCase().trim();
    if (text.includes('lap swim hours')) {
      sectionHeaders.push({ type: 'lap', element: $(element), position: i });
    } else if (text.includes('rec swim hours')) {
      sectionHeaders.push({ type: 'rec', element: $(element), position: i });
    }
  });
  
  // Look for all tables that contain pool hours
  $('table').each((tableIndex, table) => {
    const $table = $(table);
    const tableText = $table.text().toLowerCase();
    const prevText = $table.prevAll().text().toLowerCase();
    const nextText = $table.nextAll().text().toLowerCase();
    const combinedText = tableText + prevText + nextText;
    
    // Check if this table contains pool hours (has time patterns and day names)
    const hasTimePattern = /\d{1,2}:\d{2}(?:am|pm)\s*-\s*\d{1,2}:\d{2}(?:am|pm)/i.test(combinedText);
    const hasDayNames = /(mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(combinedText);
    
    if (!hasTimePattern || !hasDayNames) {
      return; // Skip this table
    }
    
    // Determine the session type for this entire table based on section headers
    let tableSessionType = 'rec'; // Default to recreational
    
    // Find the table's position in the document
    let tablePosition = -1;
    $('*').each((i, element) => {
      if (element === table) {
        tablePosition = i;
        return false; // Break
      }
    });
    
    // Find the most recent section header before this table
    let mostRecentHeader = null;
    for (const header of sectionHeaders) {
      if (header.position < tablePosition) {
        if (!mostRecentHeader || header.position > mostRecentHeader.position) {
          mostRecentHeader = header;
        }
      }
    }
    
    if (mostRecentHeader) {
      tableSessionType = mostRecentHeader.type;
    }
    
    // Fallback: check the entire document text before this table
    if (!mostRecentHeader) {
      const documentText = $('body').text().toLowerCase();
      const tableHtml = $table.prop('outerHTML');
      const tableIndex = documentText.indexOf($table.text().toLowerCase().substring(0, 50));
      
      if (tableIndex > 0) {
        const textBeforeTable = documentText.substring(0, tableIndex);
        const lastLapIndex = textBeforeTable.lastIndexOf('lap swim hours');
        const lastRecIndex = textBeforeTable.lastIndexOf('rec swim hours');
        
        if (lastLapIndex > lastRecIndex) {
          tableSessionType = 'lap';
        } else if (lastRecIndex > lastLapIndex) {
          tableSessionType = 'rec';
        }
      }
    }
    
    // Parse each row in the table
    $table.find('tr').each((rowIndex, row) => {
      const cells = $(row).find('td, th');
      
      if (cells.length < 2) return; // Skip rows with insufficient columns
      
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
        const dayText = $(cells[dayColumn]).text().trim();
        
        if (dayText) {
          // Handle multiple days in one row (e.g., "Mon-Fri")
          let dayNames = [];
          if (dayText.includes('-')) {
            const [startDay, endDay] = dayText.split('-').map(d => d.trim());
            dayNames = getDayRange(startDay, endDay);
          } else {
            const days = dayText.split(/[\/\-]/).map(d => d.trim());
            dayNames = days.map(dayName => normalizeDayName(dayName)).filter(Boolean);
          }
          
          // Extract all time spans for these days
          timeColumns.forEach(timeColumnIndex => {
            const timeText = $(cells[timeColumnIndex]).text().trim();
            if (timeText && /\d{1,2}:\d{2}(?:am|pm)/i.test(timeText)) {
              
              // Use the table-level session type determined above
              let sessionType = tableSessionType;
              
              // Only override if there are specific indicators in the cell text itself
              const cellText = $(cells[timeColumnIndex]).text().toLowerCase();
              const rowText = $(row).text().toLowerCase();
              
              // Override to lap if cell specifically mentions lap swimming
              if (cellText.includes('lap swim') || rowText.includes('lap swim')) {
                sessionType = 'lap';
              }
              
              // Override to rec if cell specifically mentions recreational swimming
              if (cellText.includes('rec swim') || 
                  cellText.includes('recreational swim') ||
                  cellText.includes('open swim') ||
                  cellText.includes('family swim') ||
                  rowText.includes('rec swim') ||
                  rowText.includes('recreational swim') ||
                  rowText.includes('open swim') ||
                  rowText.includes('family swim')) {
                sessionType = 'rec';
              }
              
              // Add to all matching days
              dayNames.forEach(dayName => {
                if (!allHours[dayName]) {
                  allHours[dayName] = [];
                }
                allHours[dayName].push({
                  time: timeText,
                  type: sessionType
                });
              });
            }
          });
        }
      }
    });
  });
  
  return allHours;
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