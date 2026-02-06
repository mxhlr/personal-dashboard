# Magic Numbers to Constants Migration Guide

This guide tracks the migration of magic numbers to constants and provides a roadmap for completing the migration.

## ✅ Completed Migrations

### 1. Constants Library Created
- **lib/constants/gamification.ts** - XP values, level calculations, streak bonuses
- **lib/constants/ui.ts** - Animation durations, timeouts, breakpoints, sizes
- **lib/constants/validation.ts** - Input limits, ranges, validation rules
- **lib/constants/dates.ts** - Date formats, week/month/quarter configs
- **lib/constants/index.ts** - Central export point
- **lib/constants/README.md** - Comprehensive documentation

### 2. Files Updated with Constants

#### convex/gamification.ts
- ✅ `XP_PER_LEVEL` (1000) - Replaced hardcoded value
- ✅ `WEEK_DAYS` (7) - Replaced hardcoded value
- Note: Constants defined locally since Convex may not import from /lib

#### components/habits/HabitItem.tsx
- ✅ `ANIMATION_DURATION.XP_FLOAT` - XP float animation (1000ms)
- ✅ `ANIMATION_DURATION.ROW_HIGHLIGHT` - Row highlight animation (800ms)
- ✅ `ANIMATION_DURATION.CHECKBOX_PULSE` - Checkbox pulse animation (600ms)
- ✅ `ANIMATION_DURATION.FAST` - Hover transitions (200ms)
- ✅ `ANIMATION_DURATION.NORMAL` - Standard transitions (300ms)
- ✅ `TIMEOUT.INPUT_DEBOUNCE` - XP value debounce (500ms)
- ✅ `NUMERIC_RANGE.XP_MIN` - Min XP value (1)
- ✅ `NUMERIC_RANGE.XP_MAX` - Max XP value (10000)

#### components/habits/SprintTimer.tsx
- ✅ `TIMEOUT.TIMER_UPDATE` - Timer update interval (1000ms)
- ✅ `TIME_MS.MINUTE` - Milliseconds per minute
- ✅ `TIME_MS.SECOND` - Milliseconds per second
- ✅ `ANIMATION_DURATION.NORMAL` - Button transitions (300ms)
- ✅ `ANIMATION_DURATION.FAST` - Dropdown transitions (200ms)

#### components/coach/CoachPanel.tsx
- ✅ `TIMEOUT.FOCUS_DELAY` - Focus delay on open (100ms)
- ✅ `ANIMATION_DURATION.NORMAL` - Panel slide animation (300ms)
- ✅ `PANEL_WIDTH.DESKTOP` - Desktop panel width (500px)
- ✅ `Z_INDEX.BACKDROP` - Backdrop z-index (40)
- ✅ `Z_INDEX.MODAL` - Modal z-index (50)
- ✅ `OPACITY.BACKDROP` - Backdrop opacity (0.5)
- ✅ `OPACITY.OVERLAY_LIGHT` - Light overlay opacity (0.03)
- ✅ `OPACITY.OVERLAY_MEDIUM` - Medium overlay opacity (0.08)
- ✅ `OPACITY.OVERLAY_STRONG` - Strong overlay opacity (0.15)
- ✅ `SIZE.AVATAR` - Avatar size (32px)

#### components/dashboard/WeeklyProgressTracker.tsx
- ✅ `WEEK.STARTS_ON` - Week starts on Monday (1)
- ✅ `WEEK.DAYS` - Days in a week (7)
- ✅ `ANIMATION_DURATION.FAST` - Transition duration (200ms)
- ✅ `SIZE.AVATAR` - Day indicator size (8px / 32/4)

## 🔄 Priority Files to Migrate

### High Priority (Frequently Used Components)

#### 1. components/habits/HabitEditDialog.tsx
Magic numbers to replace:
- Animation durations (300ms, 200ms)
- Text input limits
- XP validation ranges

#### 2. components/habits/ManageHabitsDialog.tsx
Magic numbers to replace:
- Animation durations
- Collection limits (max habits per category)
- Text limits for habit names

#### 3. components/habits/ProgressRing.tsx
Magic numbers to replace:
- Progress thresholds (25%, 50%, 75%, 100%)
- Ring size (120px)
- Animation durations

#### 4. components/habits/MilestonePopup.tsx
Magic numbers to replace:
- Progress thresholds for milestone triggers
- Animation durations
- Popup timeout durations

#### 5. components/reviews/WeeklyReviewForm.tsx
Magic numbers to replace:
- Text area character limits (2000)
- Animation durations
- Debounce timeouts

#### 6. components/reviews/MonthlyReviewForm.tsx
Magic numbers to replace:
- Same as WeeklyReviewForm
- Month-specific calculations (12 months)

#### 7. components/reviews/QuarterlyReviewForm.tsx
Magic numbers to replace:
- Quarter calculations (4 quarters)
- Milestone limits per quarter
- Text limits

#### 8. components/reviews/AnnualReviewForm.tsx
Magic numbers to replace:
- Year validation
- Text limits
- Date calculations

### Medium Priority (Backend & Data Processing)

#### 9. convex/dailyLog.ts
Magic numbers to replace:
- Week calculations (7 days)
- Date validation ranges

#### 10. convex/dailyHabits.ts
Magic numbers to replace:
- Week/month/quarter calculations
- Collection limits

#### 11. convex/analytics.ts
Magic numbers to replace:
- Percentage calculations
- Date ranges
- Statistical thresholds

#### 12. convex/habitAnalytics.ts
Magic numbers to replace:
- Skip pattern thresholds
- Completion rate calculations
- Time period ranges (7, 30, 90 days)

### Lower Priority (UI Components & Utilities)

#### 13. components/dashboard/StoicQuote.tsx
- Rotation intervals
- Animation durations

#### 14. components/analytics/AnalyticsDashboard.tsx
- Chart dimensions
- Pagination limits
- Date ranges

#### 15. components/onboarding/SetupWizard.tsx
- Step transition durations
- Validation limits
- Text limits

## 📋 Migration Checklist

For each file you migrate, follow these steps:

### 1. Identify Magic Numbers
```bash
# Search for common patterns
grep -n "\b[0-9]\{2,\}\b" filename.tsx
```

### 2. Import Constants
```typescript
import {
  ANIMATION_DURATION,
  TIMEOUT,
  NUMERIC_RANGE,
  TEXT_LIMIT,
  // ... other constants
} from '@/lib/constants';
```

### 3. Replace Magic Numbers
Before:
```typescript
setTimeout(() => setVisible(false), 3000);
if (text.length > 100) return;
```

After:
```typescript
setTimeout(() => setVisible(false), TIMEOUT.TOAST);
if (text.length > TEXT_LIMIT.HABIT_NAME) return;
```

### 4. Update Tailwind Classes
Before:
```typescript
className="transition-all duration-300"
```

After:
```typescript
className={`transition-all duration-${ANIMATION_DURATION.NORMAL}`}
```

### 5. Test Thoroughly
- Run `npm run dev` to test in development
- Run `npm run build` to verify production build
- Test affected functionality in the UI

## 🎯 Quick Wins (Easy Migrations)

These are low-risk, high-value migrations you can do quickly:

1. **All `duration-300` in Tailwind** → `duration-${ANIMATION_DURATION.NORMAL}`
2. **All `duration-200` in Tailwind** → `duration-${ANIMATION_DURATION.FAST}`
3. **All `.length > 100` checks** → `> TEXT_LIMIT.HABIT_NAME`
4. **All `.length > 2000` checks** → `> TEXT_LIMIT.REVIEW_TEXTAREA`
5. **All `setTimeout(..., 500)` debounce** → `TIMEOUT.INPUT_DEBOUNCE`
6. **All `setInterval(..., 1000)` timers** → `TIMEOUT.TIMER_UPDATE`

## 🔍 Finding Magic Numbers

Use these commands to find magic numbers in your codebase:

```bash
# Find animation durations in Tailwind classes
grep -r "duration-[0-9]" components/

# Find setTimeout/setInterval calls
grep -r "setTimeout\|setInterval" components/

# Find numeric comparisons
grep -r "\.length > [0-9]" components/

# Find hardcoded numbers in calculations
grep -r "\* [0-9]\|/ [0-9]\|+ [0-9]" components/
```

## 📊 Progress Tracking

- **Total Files Identified**: ~50
- **Files Updated**: 5 (10%)
- **Constants Created**: 4 categories (100% complete)
- **High Priority Files Remaining**: 10
- **Medium Priority Files Remaining**: 4
- **Low Priority Files Remaining**: ~31

## 🚀 Next Steps

1. **Immediate**: Migrate all high-priority habit components
2. **This Week**: Migrate review forms and analytics components
3. **This Month**: Complete all component migrations
4. **Ongoing**: Apply to all new code going forward

## 💡 Tips & Best Practices

1. **Group Related Changes**: Migrate all animation durations in a file at once
2. **Test Incrementally**: Test after each file migration
3. **Use Type Safety**: Let TypeScript catch errors with const assertions
4. **Document Context**: Add comments when the constant name isn't clear
5. **Stay Consistent**: Always use constants for values that could change

## 🐛 Common Issues & Solutions

### Issue: Tailwind classes with template literals don't work
```typescript
// ❌ This won't work - Tailwind needs complete class names
className={`duration-${ANIMATION_DURATION.NORMAL}`}

// ✅ Solution: Use inline styles for dynamic values
style={{ transitionDuration: `${ANIMATION_DURATION.NORMAL}ms` }}

// ✅ Or use predefined classes
className="duration-300" // When the value is always the same
```

### Issue: Convex functions can't import from /lib
```typescript
// ✅ Solution: Define constants locally in Convex files
const XP_PER_LEVEL = 1000;
const WEEK_DAYS = 7;
```

### Issue: Constants in calculations look verbose
```typescript
// Sometimes it's OK to keep simple calculations inline
const hoursInDay = 24; // Clear and won't change

// But use constants for app-specific values
const maxWorkHours = NUMERIC_RANGE.WORK_HOURS_MAX; // Better
```

## 📝 Adding New Constants

When you discover new magic numbers during migration:

1. Determine which category (gamification, ui, validation, dates)
2. Add to the appropriate file with JSDoc comments
3. Export from index.ts if it's a new category
4. Update README.md with examples
5. Use immediately in the code

Example:
```typescript
// In lib/constants/ui.ts
export const ANIMATION_DURATION = {
  // ... existing constants

  /** New animation for feature X */
  FEATURE_X_FADE: 400,
} as const;
```

## ✅ Definition of Done

A file is considered "migrated" when:

- [ ] All magic numbers replaced with constants
- [ ] Constants imported from @/lib/constants
- [ ] No new ESLint warnings introduced
- [ ] Build passes without errors
- [ ] Functionality tested and working
- [ ] This guide updated with completion status

---

Last Updated: 2026-02-06
Status: In Progress (10% complete)
