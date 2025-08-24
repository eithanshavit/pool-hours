/**
 * Date and week calculation utilities for the weekly calendar view
 * Handles UTC date calculations and PST/PDT timezone conversions using date-fns
 */

import { 
  startOfWeek, 
  endOfWeek, 
  addWeeks, 
  addDays, 
  format, 
  parseISO,
  isToday as dateFnsIsToday
} from 'date-fns';
import { 
  fromZonedTime, 
  toZonedTime, 
  format as formatTz 
} from 'date-fns-tz';

// Pacific timezone identifier
const PACIFIC_TZ = 'America/Los_Angeles';

/**
 * Get the start of the week (Monday) in UTC for a given date
 * @param {Date|string} date - The reference date
 * @returns {Date} - Monday of the week containing the given date (in UTC)
 */
export function getWeekStart(date = new Date()) {
  const inputDate = typeof date === 'string' ? parseISO(date) : date;
  return startOfWeek(inputDate, { weekStartsOn: 1 }); // 1 = Monday
}

/**
 * Get the end of the week (Sunday) in UTC for a given date
 * @param {Date|string} date - The reference date
 * @returns {Date} - Sunday of the week containing the given date (in UTC)
 */
export function getWeekEnd(date = new Date()) {
  const inputDate = typeof date === 'string' ? parseISO(date) : date;
  return endOfWeek(inputDate, { weekStartsOn: 1 }); // 1 = Monday
}

/**
 * Calculate week boundaries based on offset from current week
 * @param {number} weekOffset - Number of weeks from current week (0 = this week, 1 = next week, -1 = last week)
 * @returns {Object} - Object containing weekStart and weekEnd dates in UTC
 */
export function getWeekBoundaries(weekOffset = 0) {
  const now = new Date();
  const currentWeekStart = getWeekStart(now);
  const targetWeekStart = addWeeks(currentWeekStart, weekOffset);
  const targetWeekEnd = getWeekEnd(targetWeekStart);
  
  return {
    weekStart: targetWeekStart,
    weekEnd: targetWeekEnd
  };
}

/**
 * Generate array of dates for a week based on offset
 * @param {number} weekOffset - Number of weeks from current week
 * @returns {Array<Date>} - Array of 7 dates (Monday to Sunday) in UTC
 */
export function getWeekDates(weekOffset = 0) {
  const { weekStart } = getWeekBoundaries(weekOffset);
  const dates = [];
  
  for (let i = 0; i < 7; i++) {
    dates.push(addDays(weekStart, i));
  }
  
  return dates;
}

/**
 * Convert PST/PDT time string to UTC Date object
 * @param {string} timeString - Time string in format "HH:MM AM/PM" (PST/PDT)
 * @param {Date|string} date - The date for the time (used for timezone calculation)
 * @returns {Date} - UTC Date object
 */
export function pstToUtc(timeString, date = new Date()) {
  // Parse the time string (e.g., "6:00 AM", "10:30 PM")
  const timeMatch = timeString.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!timeMatch) {
    throw new Error(`Invalid time format: ${timeString}`);
  }
  
  let hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);
  const period = timeMatch[3].toUpperCase();
  
  // Validate hours and minutes
  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time format: ${timeString}`);
  }
  
  // Convert to 24-hour format
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  // Create a date object with the parsed time
  const inputDate = typeof date === 'string' ? parseISO(date) : date;
  const dateWithTime = new Date(inputDate);
  dateWithTime.setHours(hours, minutes, 0, 0);
  
  // Convert from Pacific timezone to UTC
  return fromZonedTime(dateWithTime, PACIFIC_TZ);
}

/**
 * Convert UTC Date to PST/PDT time string
 * @param {Date} utcDate - UTC Date object
 * @returns {string} - Time string in PST/PDT format "HH:MM AM/PM"
 */
export function utcToPst(utcDate) {
  // Convert UTC to Pacific timezone
  const pacificDate = toZonedTime(utcDate, PACIFIC_TZ);
  
  // Format as time string
  let hours = pacificDate.getHours();
  const minutes = pacificDate.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  
  if (hours > 12) {
    hours -= 12;
  } else if (hours === 0) {
    hours = 12;
  }
  
  const minutesStr = minutes.toString().padStart(2, '0');
  return `${hours}:${minutesStr} ${period}`;
}

/**
 * Get timezone abbreviation (PST or PDT) for a given date
 * @param {Date} date - Date to check
 * @returns {string} - "PST" or "PDT"
 */
export function getTimezoneAbbreviation(date = new Date()) {
  // Use date-fns-tz to get the timezone abbreviation
  return formatTz(date, 'zzz', { timeZone: PACIFIC_TZ });
}

/**
 * Determine if a given date is in Daylight Saving Time (PDT) for Pacific timezone
 * @param {Date} date - Date to check
 * @returns {boolean} - True if in DST (PDT), false if in standard time (PST)
 */
export function isDaylightSavingTime(date) {
  return getTimezoneAbbreviation(date) === 'PDT';
}

/**
 * Format date as YYYY-MM-DD string
 * @param {Date} date - Date to format
 * @returns {string} - Date string in YYYY-MM-DD format
 */
export function formatDateString(date) {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get day name for a given date
 * @param {Date} date - Date to get day name for
 * @returns {string} - Day name (e.g., "Monday", "Tuesday")
 */
export function getDayName(date) {
  return format(date, 'EEEE');
}

/**
 * Check if a date is today
 * @param {Date} date - Date to check
 * @returns {boolean} - True if the date is today
 */
export function isToday(date) {
  const today = new Date();
  return formatDateString(date) === formatDateString(today);
}

/**
 * Create a Date object from date string and time string in Pacific timezone
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @param {string} timeString - Time string in "HH:MM AM/PM" format
 * @returns {Date} - UTC Date object
 */
export function createPacificDateTime(dateString, timeString) {
  const date = parseISO(dateString);
  return pstToUtc(timeString, date);
}

/**
 * Format a UTC date as Pacific time string
 * @param {Date} utcDate - UTC Date object
 * @param {string} formatString - Format string (default: 'h:mm a')
 * @returns {string} - Formatted time string in Pacific timezone
 */
export function formatPacificTime(utcDate, formatString = 'h:mm a') {
  const pacificDate = toZonedTime(utcDate, PACIFIC_TZ);
  return format(pacificDate, formatString);
}