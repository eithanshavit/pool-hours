# Implementation Plan

- [x] 1. Create weekly API endpoint foundation

  - Implement `/api/weekly-hours` route that aggregates daily pool hours for a full week
  - Add week calculation utilities for determining week start/end dates based on offset in UTC
  - Implement parallel fetching of 7 days of pool data using existing scraping logic
  - Ensure all API responses use UTC timestamps while preserving PST parsing for website data
  - Add proper error handling for partial week data failures
  - _Requirements: 1.1, 5.1, 5.2, 6.1, 6.3, 6.4_

- [ ] 2. Implement date and week calculation utilities

  - Create utility functions for calculating week boundaries (Monday to Sunday) in UTC
  - Implement week offset calculations (0 = this week, 1 = next week) using UTC dates
  - Add timezone-aware date handling that converts PST pool location times to UTC for API consistency
  - Ensure client-side date calculations properly handle PST/PDT timezone conversions
  - Write unit tests for date calculation edge cases including timezone boundaries
  - _Requirements: 1.1, 5.2, 5.3_

- [ ] 3. Create ViewToggle component for switching between daily and weekly views

  - Implement toggle component with clear visual states for daily/weekly modes
  - Add proper accessibility attributes and keyboard navigation
  - Style component to match existing design language
  - Write unit tests for view switching functionality
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 4. Implement WeekNavigation component for week switching

  - Create navigation controls for "This Week" and "Next Week" selection
  - Add visual indicators showing which week is currently selected
  - Implement proper state management for week offset changes
  - Style navigation to be responsive and accessible
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 5. Create DayColumn component for individual day display in weekly view

  - Implement vertical day column layout with day header and time slots
  - Add current day highlighting for orientation
  - Reuse existing time slot styling and logic from daily view
  - Implement responsive design for mobile and desktop layouts
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 4.1, 4.2_

- [ ] 6. Build WeeklyCalendar component for 7-day grid layout

  - Create responsive grid layout that displays all 7 day columns
  - Implement horizontal scrolling for mobile devices
  - Add proper spacing and visual hierarchy for weekly overview
  - Handle empty states when no pool hours are available for specific days
  - _Requirements: 1.1, 1.2, 1.5, 4.1, 4.2, 6.3_

- [ ] 7. Implement WeeklyView container component with data fetching

  - Create main weekly view component that manages weekly data state
  - Implement data fetching logic using the new weekly API endpoint with UTC date parameters
  - Add loading states and error handling for weekly data
  - Ensure proper timezone conversion from UTC API responses to PST display times
  - Integrate week navigation and calendar components
  - _Requirements: 5.5, 6.1, 6.2, 6.5_

- [ ] 8. Add current time indicators and session highlighting for weekly view

  - Implement logic to highlight currently active sessions across all visible days using UTC time comparisons
  - Add "NOW" and "NEXT" indicators for current day sessions only, converting UTC to PST for display
  - Ensure future weeks don't show current/next indicators inappropriately
  - Maintain existing color coding for lap vs recreational swim sessions
  - Handle timezone edge cases where UTC day boundaries differ from PST day boundaries
  - _Requirements: 3.1, 3.2, 3.3, 5.6_

- [ ] 9. Refactor main App component to support view switching

  - Extract existing daily view logic into separate DailyView component
  - Add state management for current view mode (daily/weekly)
  - Implement view switching logic that preserves date context
  - Integrate ViewToggle component with proper state handling
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 10. Implement responsive design and mobile optimization

  - Add responsive breakpoints for weekly view layout
  - Implement touch-friendly navigation for mobile devices
  - Optimize horizontal scrolling behavior for day columns
  - Ensure proper contrast and readability across all screen sizes
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 11. Add comprehensive error handling and loading states

  - Implement skeleton loading states for weekly view components
  - Add retry mechanisms for failed day data requests
  - Create user-friendly error messages for network issues
  - Handle partial data scenarios gracefully without blocking entire view
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 12. Write comprehensive tests for weekly calendar functionality
  - Create unit tests for all new utility functions and components
  - Add integration tests for weekly API endpoint
  - Implement user interaction tests for view switching and navigation
  - Add accessibility tests for keyboard navigation and screen readers
  - _Requirements: All requirements validation through testing_
