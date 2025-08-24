# Implementation Plan

- [x] 1. Create weekly API endpoint foundation

  - Implement `/api/weekly-hours` route that aggregates daily pool hours for a full week
  - Add week calculation utilities for determining week start/end dates based on offset in UTC
  - Implement parallel fetching of 7 days of pool data using existing scraping logic
  - Ensure all API responses use UTC timestamps while preserving PST parsing for website data
  - Add proper error handling for partial week data failures
  - _Requirements: 1.1, 5.1, 5.2, 6.1, 6.3, 6.4_

- [x] 2. Implement date and week calculation utilities

  - Create utility functions for calculating week boundaries (Monday to Sunday) in UTC
  - Implement week offset calculations (0 = this week, 1 = next week) using UTC dates
  - Add timezone-aware date handling that converts PST pool location times to UTC for API consistency
  - Ensure client-side date calculations properly handle PST/PDT timezone conversions
  - Write unit tests for date calculation edge cases including timezone boundaries
  - _Requirements: 1.1, 5.2, 5.3_

- [x] 3. Create ViewToggle component for switching between daily and weekly views

  - Implement toggle component with clear visual states for daily/weekly modes
  - Add proper accessibility attributes and keyboard navigation
  - Style component to match existing design language
  - Write unit tests for view switching functionality
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 4. Create TodayHighlight component for current day display

  - Implement prominent display of today's date and pool hours at the top of the page
  - Add visual emphasis to distinguish today from weekly calendar sections
  - Include current time indicators and session highlighting for today only
  - Style component with clear visual hierarchy and responsive design
  - _Requirements: 3.1, 3.2, 3.3, 5.1_

- [x] 5. Create DayColumn component for individual day display in weekly view

  - Implement vertical day column layout with day header and time slots
  - Add current day highlighting for orientation
  - Reuse existing time slot styling and logic from daily view
  - Implement responsive design for mobile and desktop layouts
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 4.1, 4.2_

- [x] 6. Build WeeklyCalendar component for 7-day grid layout

  - Create responsive grid layout that displays all 7 day columns for a single week
  - Implement horizontal scrolling for mobile devices
  - Add proper spacing and visual hierarchy for weekly overview
  - Handle empty states when no pool hours are available for specific days
  - Add week header to distinguish "This Week" vs "Next Week" sections
  - _Requirements: 1.1, 1.2, 1.5, 4.1, 4.2, 6.3_

- [x] 7. Create CombinedCalendarView component for single-page layout

  - Implement main container that displays today's highlight, this week, and next week in sequence
  - Manage data fetching for today's data plus both weeks using the weekly API endpoint
  - Add section headers and visual separators between today, this week, and next week
  - Implement proper loading states and error handling for all three data sections
  - Ensure responsive layout that works on mobile and desktop
  - _Requirements: 1.1, 5.1, 5.2, 6.1, 6.2, 6.5_

- [x] 8. Add current time indicators and session highlighting

  - Implement logic to highlight currently active sessions for today's section only
  - Add "NOW" and "NEXT" indicators for current day sessions, converting UTC to PST for display
  - Ensure this week and next week sections don't show current/next indicators inappropriately
  - Maintain existing color coding for lap vs recreational swim sessions
  - Handle timezone edge cases where UTC day boundaries differ from PST day boundaries
  - _Requirements: 3.1, 3.2, 3.3, 5.6_

- [x] 9. Refactor main App component to support view switching

  - Extract existing daily view logic into separate DailyView component
  - Add state management for current view mode (daily/combined weekly)
  - Implement view switching logic between daily and combined weekly views
  - Integrate ViewToggle component with proper state handling
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 10. Implement responsive design and mobile optimization

  - Add responsive breakpoints for combined view layout (today + two weeks)
  - Implement touch-friendly scrolling for the full page and individual week sections
  - Optimize horizontal scrolling behavior for day columns within each week
  - Ensure proper contrast and readability across all screen sizes
  - Add smooth scrolling between sections (today, this week, next week)
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 11. Add comprehensive error handling and loading states

  - Implement skeleton loading states for today section and both weekly sections
  - Add retry mechanisms for failed data requests with section-specific error handling
  - Create user-friendly error messages for network issues
  - Handle partial data scenarios gracefully (e.g., today loads but weeks fail)
  - Add progressive loading where sections appear as data becomes available
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 12. Write comprehensive tests for combined calendar functionality
  - Create unit tests for all new utility functions and components
  - Add integration tests for the combined view data fetching
  - Implement user interaction tests for view switching between daily and combined views
  - Add accessibility tests for keyboard navigation and screen readers
  - Test responsive behavior across different screen sizes
  - _Requirements: All requirements validation through testing_
