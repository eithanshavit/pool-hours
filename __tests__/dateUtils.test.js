/**
 * Fixed tests for date utilities without complex mocking
 */

import {
  getWeekStart,
  getWeekEnd,
  getWeekBoundaries,
  getWeekDates,
  pstToUtc,
  utcToPst,
  getTimezoneAbbreviation,
  isDaylightSavingTime,
  formatDateString,
  getDayName,
  isToday,
  createPacificDateTime,
  formatPacificTime
} from '../app/utils/dateUtils';

describe('Date Utils - Fixed Tests', () => {
  describe('Week Calculation Utilities', () => {
    test('getWeekStart returns Monday for various days', () => {
      // Wednesday, January 3, 2024
      const wednesday = new Date('2024-01-03T12:00:00Z');
      const weekStart = getWeekStart(wednesday);
      
      expect(weekStart.getDay()).toBe(1); // Monday
      expect(formatDateString(weekStart)).toBe('2024-01-01');
    });

    test('getWeekEnd returns Sunday for various days', () => {
      // Wednesday, January 3, 2024
      const wednesday = new Date('2024-01-03T12:00:00Z');
      const weekEnd = getWeekEnd(wednesday);
      
      expect(weekEnd.getDay()).toBe(0); // Sunday
      expect(formatDateString(weekEnd)).toBe('2024-01-07');
    });

    test('getWeekDates returns 7 consecutive dates', () => {
      // Test by directly calculating expected dates for a known week
      const knownMonday = new Date('2024-01-01T12:00:00Z'); // Monday, Jan 1, 2024
      
      // Mock Date constructor to return a date in this week
      const originalDate = global.Date;
      const mockDate = new Date('2024-01-03T12:00:00Z'); // Wednesday in the same week
      
      global.Date = jest.fn((dateString) => {
        if (dateString) {
          return new originalDate(dateString);
        }
        return mockDate;
      });
      global.Date.UTC = originalDate.UTC;
      global.Date.parse = originalDate.parse;
      global.Date.now = jest.fn(() => mockDate.getTime());
      
      const dates = getWeekDates(0);
      
      expect(dates).toHaveLength(7);
      
      // Check that we get Monday through Sunday
      const expectedDates = [
        '2024-01-01', // Monday
        '2024-01-02', // Tuesday
        '2024-01-03', // Wednesday
        '2024-01-04', // Thursday
        '2024-01-05', // Friday
        '2024-01-06', // Saturday
        '2024-01-07'  // Sunday
      ];
      
      dates.forEach((date, index) => {
        expect(formatDateString(date)).toBe(expectedDates[index]);
      });
      
      global.Date = originalDate;
    });
  });

  describe('Timezone Conversion Utilities', () => {
    test('pstToUtc converts PST morning time correctly', () => {
      // January 15, 2024 (PST period)
      const date = new Date('2024-01-15');
      const utcDate = pstToUtc('9:00 AM', date);
      
      // 9:00 AM PST = 17:00 UTC (PST is UTC-8)
      expect(utcDate.getUTCHours()).toBe(17);
      expect(utcDate.getUTCMinutes()).toBe(0);
    });

    test('pstToUtc converts PDT morning time correctly', () => {
      // July 15, 2024 (PDT period)
      const date = new Date('2024-07-15');
      const utcDate = pstToUtc('9:00 AM', date);
      
      // 9:00 AM PDT = 16:00 UTC (PDT is UTC-7)
      expect(utcDate.getUTCHours()).toBe(16);
      expect(utcDate.getUTCMinutes()).toBe(0);
    });

    test('pstToUtc handles PM times correctly', () => {
      const date = new Date('2024-01-15');
      const utcDate = pstToUtc('2:30 PM', date);
      
      // 2:30 PM PST = 22:30 UTC
      expect(utcDate.getUTCHours()).toBe(22);
      expect(utcDate.getUTCMinutes()).toBe(30);
    });

    test('pstToUtc handles 12:00 AM correctly', () => {
      const date = new Date('2024-01-15');
      const utcDate = pstToUtc('12:00 AM', date);
      
      // 12:00 AM PST = 08:00 UTC
      expect(utcDate.getUTCHours()).toBe(8);
      expect(utcDate.getUTCMinutes()).toBe(0);
    });

    test('pstToUtc handles 12:00 PM correctly', () => {
      const date = new Date('2024-01-15');
      const utcDate = pstToUtc('12:00 PM', date);
      
      // 12:00 PM PST = 20:00 UTC
      expect(utcDate.getUTCHours()).toBe(20);
      expect(utcDate.getUTCMinutes()).toBe(0);
    });

    test('pstToUtc throws error for invalid time format', () => {
      const date = new Date('2024-01-15');
      expect(() => pstToUtc('25:00 AM', date)).toThrow('Invalid time format');
      expect(() => pstToUtc('9:00', date)).toThrow('Invalid time format');
      expect(() => pstToUtc('9 AM', date)).toThrow('Invalid time format');
    });

    test('utcToPst converts UTC to PST correctly in winter', () => {
      // January 15, 2024 17:00 UTC = 9:00 AM PST
      const utcDate = new Date('2024-01-15T17:00:00Z');
      const pstTime = utcToPst(utcDate);
      
      expect(pstTime).toBe('9:00 AM');
    });

    test('utcToPst converts UTC to PDT correctly in summer', () => {
      // July 15, 2024 16:00 UTC = 9:00 AM PDT
      const utcDate = new Date('2024-07-15T16:00:00Z');
      const pstTime = utcToPst(utcDate);
      
      expect(pstTime).toBe('9:00 AM');
    });

    test('getTimezoneAbbreviation returns correct abbreviations', () => {
      const winterDate = new Date('2024-01-15');
      const summerDate = new Date('2024-07-15');
      
      expect(getTimezoneAbbreviation(winterDate)).toBe('PST');
      expect(getTimezoneAbbreviation(summerDate)).toBe('PDT');
    });

    test('isDaylightSavingTime works correctly', () => {
      const winterDate = new Date('2024-01-15');
      const summerDate = new Date('2024-07-15');
      
      expect(isDaylightSavingTime(winterDate)).toBe(false);
      expect(isDaylightSavingTime(summerDate)).toBe(true);
    });
  });

  describe('Utility Functions', () => {
    test('formatDateString formats correctly', () => {
      const date = new Date('2024-01-03T12:00:00Z');
      expect(formatDateString(date)).toBe('2024-01-03');
    });

    test('getDayName returns correct day names', () => {
      expect(getDayName(new Date('2024-01-01T12:00:00Z'))).toBe('Monday');
      expect(getDayName(new Date('2024-01-02T12:00:00Z'))).toBe('Tuesday');
      expect(getDayName(new Date('2024-01-07T12:00:00Z'))).toBe('Sunday');
    });

    test('createPacificDateTime creates correct UTC date', () => {
      const utcDate = createPacificDateTime('2024-01-15', '9:00 AM');
      
      // 9:00 AM PST on Jan 15 = 17:00 UTC
      expect(utcDate.getUTCHours()).toBe(17);
      expect(utcDate.getUTCMinutes()).toBe(0);
    });

    test('formatPacificTime formats UTC as Pacific time', () => {
      // January 15, 2024 17:00 UTC = 9:00 AM PST
      const utcDate = new Date('2024-01-15T17:00:00Z');
      const formatted = formatPacificTime(utcDate);
      
      expect(formatted).toBe('9:00 AM');
    });
  });

  describe('Edge Cases', () => {
    test('handles DST transitions correctly', () => {
      // March 10, 2024 is when DST starts (spring forward)
      const beforeTransition = new Date('2024-03-09T12:00:00Z');
      const afterTransition = new Date('2024-03-11T12:00:00Z');
      
      expect(isDaylightSavingTime(beforeTransition)).toBe(false);
      expect(isDaylightSavingTime(afterTransition)).toBe(true);
    });

    test('handles leap year February correctly', () => {
      const leapYearDate = new Date('2024-02-29T12:00:00Z');
      const weekStart = getWeekStart(leapYearDate);
      
      expect(formatDateString(weekStart)).toBe('2024-02-26'); // Monday of that week
    });

    test('handles year boundary correctly', () => {
      // Test a date near year end
      const endOfYear = new Date('2024-12-30T12:00:00Z'); // Monday
      const weekDates = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(endOfYear);
        date.setDate(endOfYear.getDate() + i);
        weekDates.push(date);
      }
      
      expect(formatDateString(weekDates[0])).toBe('2024-12-30'); // Monday
      expect(formatDateString(weekDates[6])).toBe('2025-01-05'); // Sunday
    });
  });
});