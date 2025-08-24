# Design Document

## Overview

The weekly calendar view feature will extend the existing pool hours application to display a comprehensive weekly schedule alongside the current daily view. The design leverages the existing API infrastructure while adding new components for weekly data aggregation, view switching, and week navigation. The solution maintains the current visual design language while adapting it for a multi-day layout.

## Architecture

### High-Level Architecture

The weekly calendar feature builds upon the existing Next.js application architecture:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer      │    │   Data Source   │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ /api/pool-hours  │    │ Highlands Rec   │
│ │ Daily View  │ │◄──►│                  │◄──►│ Website         │
│ └─────────────┘ │    │ (existing)       │    │                 │
│ ┌─────────────┐ │    │                  │    │                 │
│ │ Weekly View │ │◄──►│ /api/weekly-hours│    │                 │
│ └─────────────┘ │    │ (new)            │    │                 │
│ ┌─────────────┐ │    │                  │    │                 │
│ │ View Toggle │ │    │                  │    │                 │
│ └─────────────┘ │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Component Architecture

```
App (page.js)
├── ViewToggle (new)
├── DailyView (refactored from existing)
└── WeeklyView (new)
    ├── WeekNavigation (new)
    └── WeeklyCalendar (new)
        └── DayColumn (new)
            └── TimeSlot (shared)
```

## Components and Interfaces

### 1. ViewToggle Component

**Purpose:** Allows users to switch between daily and weekly views

**Props:**
```typescript
interface ViewToggleProps {
  currentView: 'daily' | 'weekly';
  onViewChange: (view: 'daily' | 'weekly') => void;
}
```

**Design:** Simple toggle buttons with clear visual states

### 2. WeeklyView Component

**Purpose:** Main container for the weekly calendar interface

**Props:**
```typescript
interface WeeklyViewProps {
  currentTime: Date;
}
```

**State Management:**
- Current week offset (0 for this week, 1 for next week)
- Weekly pool data for all 7 days
- Loading and error states

### 3. WeekNavigation Component

**Purpose:** Navigation controls for switching between weeks

**Props:**
```typescript
interface WeekNavigationProps {
  currentWeekOffset: number;
  onWeekChange: (offset: number) => void;
  weekStartDate: Date;
}
```

**Design:** "This Week" / "Next Week" buttons with current week indicator

### 4. WeeklyCalendar Component

**Purpose:** Grid layout displaying all 7 days of the week

**Props:**
```typescript
interface WeeklyCalendarProps {
  weekData: DayData[];
  currentTime: Date;
  isCurrentWeek: boolean;
}

interface DayData {
  date: string;
  dayName: string;
  hours: PoolHour[];
  isToday: boolean;
}
```

### 5. DayColumn Component

**Purpose:** Individual day column within the weekly grid

**Props:**
```typescript
interface DayColumnProps {
  dayData: DayData;
  currentTime: Date;
  isCurrentWeek: boolean;
}
```

**Design:** Vertical column with day header and time slots

## Data Models

### Extended API Response

The new weekly API endpoint will return:

```typescript
interface WeeklyPoolHoursResponse {
  weekData: DayData[];
  weekStartDate: string;
  weekEndDate: string;
  weekOffset: number;
  error: string | null;
  timestamp: string;
}

interface DayData {
  date: string; // YYYY-MM-DD
  dayName: string; // Monday, Tuesday, etc.
  hours: PoolHour[];
  error: string | null;
}

interface PoolHour {
  start: string; // ISO timestamp
  end: string; // ISO timestamp
  type: 'lap' | 'rec';
  timezone: string;
  original: string;
}
```

### State Management

```typescript
interface AppState {
  view: 'daily' | 'weekly';
  currentTime: Date;
  
  // Daily view state
  dailyData: PoolHoursResponse | null;
  dailyLoading: boolean;
  dailyError: string | null;
  
  // Weekly view state
  weeklyData: WeeklyPoolHoursResponse | null;
  weeklyLoading: boolean;
  weeklyError: string | null;
  currentWeekOffset: number; // 0 = this week, 1 = next week
}
```

## API Design

### New Weekly Hours Endpoint

**Endpoint:** `GET /api/weekly-hours`

**Query Parameters:**
- `weekOffset` (optional): Number of weeks from current week (0 = this week, 1 = next week)

**Implementation Strategy:**
The weekly endpoint will internally make multiple calls to the existing scraping logic for each day of the requested week, then aggregate the results.

```javascript
// Pseudo-code for weekly endpoint
export async function GET(request) {
  const weekOffset = parseInt(searchParams.get('weekOffset') || '0');
  const weekStart = getWeekStart(weekOffset);
  
  const weekData = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    const dayData = await scrapePoolHours(date.toISOString().split('T')[0]);
    weekData.push({
      date: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      hours: dayData.hours,
      error: dayData.error
    });
  }
  
  return Response.json({
    weekData,
    weekStartDate: weekStart.toISOString().split('T')[0],
    weekEndDate: addDays(weekStart, 6).toISOString().split('T')[0],
    weekOffset,
    error: null,
    timestamp: moment().utc().toISOString()
  });
}
```

## Visual Design

### Layout Strategy

**Mobile-First Approach:**
- Weekly view uses horizontal scrolling on mobile
- Each day column has minimum width for readability
- Compact time slot representation

**Desktop Layout:**
- 7-column grid layout
- Fixed column widths with responsive adjustments
- Larger time slot cards for better readability

### Color Scheme

Maintains existing color patterns:
- **Current/Active Sessions:** Green background (`bg-green-300`)
- **Inactive/Closed:** Red background (`bg-red-300`)
- **Lap Swimming:** Blue accent (`bg-blue-600`)
- **Recreational Swimming:** Orange accent (`bg-orange-500`)

### Typography and Spacing

- **Day Headers:** Bold, larger text for day names and dates
- **Time Slots:** Consistent with existing daily view styling
- **Current Day Highlight:** Subtle border or background emphasis
- **Responsive Text:** Smaller text on mobile, larger on desktop

### Visual Hierarchy

1. **Week Navigation:** Top-level controls
2. **Day Headers:** Clear day identification
3. **Current Time Indicators:** Prominent highlighting
4. **Time Slots:** Organized by type (lap/rec)

## Error Handling

### Partial Data Scenarios

When some days fail to load:
- Display available days normally
- Show error state for failed days
- Provide retry mechanism for individual days
- Don't block entire weekly view for partial failures

### Network Error Handling

- **Loading States:** Skeleton loaders for each day column
- **Error Messages:** Clear, actionable error descriptions
- **Retry Logic:** Automatic retry with exponential backoff
- **Offline Handling:** Cache last successful weekly data

### Data Validation

- Validate date ranges for week calculations
- Handle timezone edge cases
- Validate pool hour data structure
- Graceful degradation for malformed data

## Testing Strategy

### Unit Tests

1. **Date Calculation Functions**
   - Week start/end calculations
   - Week offset handling
   - Timezone conversions

2. **Component Logic**
   - View switching functionality
   - Week navigation state management
   - Time slot highlighting logic

3. **API Integration**
   - Weekly data aggregation
   - Error handling scenarios
   - Response data validation

### Integration Tests

1. **API Endpoint Testing**
   - Weekly hours endpoint functionality
   - Multiple day data aggregation
   - Error response handling

2. **Component Integration**
   - View toggle interaction
   - Week navigation flow
   - Data loading states

### User Experience Tests

1. **Responsive Design**
   - Mobile layout functionality
   - Touch interaction testing
   - Horizontal scrolling behavior

2. **Accessibility**
   - Keyboard navigation
   - Screen reader compatibility
   - Color contrast validation

3. **Performance**
   - Multiple API call optimization
   - Loading time measurements
   - Memory usage monitoring

## Performance Considerations

### Data Fetching Optimization

- **Parallel API Calls:** Fetch all 7 days simultaneously
- **Caching Strategy:** Cache weekly data for 5-minute intervals
- **Incremental Loading:** Show days as they load rather than waiting for all

### Rendering Optimization

- **Component Memoization:** Prevent unnecessary re-renders
- **Virtual Scrolling:** For mobile horizontal scroll performance
- **Lazy Loading:** Load next week data only when requested

### Bundle Size Management

- **Code Splitting:** Separate weekly view components
- **Tree Shaking:** Remove unused utilities
- **Dependency Optimization:** Reuse existing moment.js and styling

## Migration Strategy

### Backward Compatibility

- Existing daily view remains unchanged
- New weekly view is additive feature
- Shared components maintain existing interfaces
- API endpoints are non-breaking additions

### Rollout Plan

1. **Phase 1:** Implement weekly API endpoint
2. **Phase 2:** Create weekly view components
3. **Phase 3:** Add view toggle functionality
4. **Phase 4:** Implement week navigation
5. **Phase 5:** Polish and optimization