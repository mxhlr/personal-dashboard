# Constants Directory

This directory contains all application-wide constants organized by category. Using constants instead of magic numbers improves code maintainability, readability, and makes it easier to update values across the entire application.

## Structure

```
lib/constants/
├── index.ts            # Central export point for all constants
├── gamification.ts     # XP, levels, streaks, progress thresholds
├── ui.ts              # Animations, timeouts, breakpoints, sizes
├── validation.ts      # Input limits, ranges, validation rules
├── dates.ts           # Date formats, week/month/quarter configs
└── README.md          # This file
```

## Categories

### 1. Gamification (`gamification.ts`)

XP values, level calculations, streak bonuses, and achievement thresholds.

**Exports:**
- `XP` - Experience point system (per level, min/max values)
- `STREAK` - Streak calculations and bonuses
- `LEVELS` - Level milestones and thresholds
- `PROGRESS_THRESHOLDS` - Progress percentage milestones (25%, 50%, 75%, 100%)
- `WEEK_SCORE` - Weekly completion scoring (0-7 days)

**Example usage:**
```ts
import { XP, PROGRESS_THRESHOLDS } from '@/lib/constants';

function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / XP.PER_LEVEL);
}

function showMilestone(progress: number) {
  if (progress >= PROGRESS_THRESHOLDS.HALF) {
    // Show "halfway there" popup
  }
}
```

### 2. UI (`ui.ts`)

Animation durations, timeouts, breakpoints, and UI-related values.

**Exports:**
- `ANIMATION_DURATION` - Animation timing (instant, fast, normal, etc.)
- `TIMEOUT` - Debounce/throttle delays, timer intervals
- `BREAKPOINT` - Responsive design breakpoints
- `PANEL_WIDTH` - Panel and modal widths
- `Z_INDEX` - Layering order for overlays and modals
- `SCROLL` - Scroll behavior and scrollbar settings
- `SIZE` - Icon, avatar, and component sizes
- `OPACITY` - Standard opacity values for states and overlays

**Example usage:**
```ts
import { ANIMATION_DURATION, TIMEOUT, SIZE } from '@/lib/constants';

// Animation timing
setTimeout(() => setIsAnimating(false), ANIMATION_DURATION.XP_FLOAT);

// Debounced input
const debouncedUpdate = debounce(handleUpdate, TIMEOUT.INPUT_DEBOUNCE);

// Icon size
<Icon className={`w-${SIZE.ICON_MD} h-${SIZE.ICON_MD}`} />
```

### 3. Validation (`validation.ts`)

Input limits, min/max values, and validation rules for forms.

**Exports:**
- `TEXT_LIMIT` - Maximum character lengths for text inputs
- `NUMERIC_RANGE` - Min/max values for numeric inputs
- `DATE_VALIDATION` - Date range constraints
- `COLLECTION_LIMIT` - Array and collection size limits
- `FILE_UPLOAD` - File upload constraints and allowed types
- `PASSWORD` - Password requirements (reference only, using Clerk)
- `PAGINATION` - Page size configurations

**Example usage:**
```ts
import { TEXT_LIMIT, NUMERIC_RANGE } from '@/lib/constants';

// Input validation
if (habitName.length > TEXT_LIMIT.HABIT_NAME) {
  throw new Error(`Name must be under ${TEXT_LIMIT.HABIT_NAME} characters`);
}

// XP validation
if (xpValue < NUMERIC_RANGE.XP_MIN || xpValue > NUMERIC_RANGE.XP_MAX) {
  toast.error(`XP must be between ${NUMERIC_RANGE.XP_MIN} and ${NUMERIC_RANGE.XP_MAX}`);
}
```

### 4. Dates (`dates.ts`)

Date formatting patterns, week calculations, and time constants.

**Exports:**
- `DATE_FORMAT` - Date format strings for date-fns
- `TIME_FORMAT` - Time format strings
- `DATETIME_FORMAT` - Combined date/time formats
- `WEEK` - Week configuration (days, start day, weekend)
- `MONTH` - Month numbers and names
- `QUARTER` - Quarter configuration and month mappings
- `TIME_MS` - Time units in milliseconds
- `DAYS` - Common time periods in days

**Example usage:**
```ts
import { DATE_FORMAT, WEEK, TIME_MS } from '@/lib/constants';
import { format, startOfWeek } from 'date-fns';

// Format a date
const dateString = format(new Date(), DATE_FORMAT.ISO);

// Get start of week
const weekStart = startOfWeek(today, { weekStartsOn: WEEK.STARTS_ON });

// Time calculations
const oneWeekAgo = Date.now() - TIME_MS.WEEK;
```

## Usage Guidelines

### 1. Import from the index

Always import from the main index file:

```ts
// ✅ Good
import { XP, ANIMATION_DURATION, TEXT_LIMIT } from '@/lib/constants';

// ❌ Avoid (unless you need only one category)
import { XP } from '@/lib/constants/gamification';
```

### 2. Use TypeScript const assertions

All constants are defined with `as const` to ensure type safety and prevent accidental modifications.

### 3. Document your usage

When using a constant, add a comment if the purpose isn't immediately clear:

```ts
// Wait for XP float animation to complete before removing element
setTimeout(() => cleanup(), ANIMATION_DURATION.XP_FLOAT);
```

### 4. Adding new constants

When adding new constants:

1. Choose the appropriate category file
2. Add the constant to the relevant export object
3. Add JSDoc comments explaining the constant
4. Update the index.ts if adding a new category
5. Update this README with examples

### 5. Naming conventions

- Use SCREAMING_SNAKE_CASE for constant objects
- Use camelCase for properties within constant objects
- Use descriptive names that indicate purpose and units

```ts
// ✅ Good
export const ANIMATION_DURATION = {
  FAST: 200, // milliseconds
} as const;

// ❌ Avoid
export const times = {
  t1: 200,
} as const;
```

## Benefits of Using Constants

1. **Single Source of Truth**: Change a value once, update everywhere
2. **Type Safety**: TypeScript knows the exact values at compile time
3. **Discoverability**: IDE autocomplete shows all available constants
4. **Documentation**: Clear names explain what magic numbers represent
5. **Consistency**: Ensures the same values are used across the app
6. **Maintainability**: Easy to find and update related values

## Migration from Magic Numbers

When replacing magic numbers with constants:

1. Search for the magic number in the codebase
2. Replace with the appropriate constant
3. Verify the change doesn't break functionality
4. Remove any old comments that explained the magic number

**Example:**
```ts
// Before
setTimeout(() => setIsAnimating(false), 1000); // Animation takes 1 second

// After
import { ANIMATION_DURATION } from '@/lib/constants';
setTimeout(() => setIsAnimating(false), ANIMATION_DURATION.XP_FLOAT);
```

## Related Files

- `/lib/performance.ts` - Uses `TIMEOUT` constants for debounce/throttle
- `/convex/gamification.ts` - Uses `XP` and `STREAK` constants
- `/components/habits/HabitItem.tsx` - Uses `ANIMATION_DURATION` and `TIMEOUT`
- Date/time utilities - Use `DATE_FORMAT` and `TIME_FORMAT` constants
