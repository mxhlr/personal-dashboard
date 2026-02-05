# Habit System Migrations

This directory contains migration functions to convert existing users from the old `trackingFields` system to the new gamification/habit system.

## Overview

The new gamification system introduces:
- **Habit Categories**: Groups of related habits (Physical Foundation, Mental Clarity, Deep Work, Evening Routine)
- **Habit Templates**: Reusable habit definitions with XP values and core/extra status
- **Daily Habits**: Daily instances of habit completion with XP tracking
- **User Stats**: Level, XP, streaks, and other gamification metrics

## Files

### `seedHabitSystem.ts`
Internal mutations for seeding the habit system:
- `seedHabitSystemForUser`: Migrates a single user to the habit system
- `seedAllUsers`: Migrates all users in the system (admin function)

### `migrateUser.ts`
Public mutations for user-facing migration:
- `checkMigrationStatus`: Check if current user has been migrated
- `getMigrationPreview`: See what will be created during migration
- `migrateToHabitSystem`: Opt-in to the new habit system (user-facing)
- `resetHabitSystem`: Reset and clear all habit data (destructive!)

### `adminCommands.ts`
Admin utilities for managing migrations:
- `migrateAllUsers`: Trigger migration for all users
- `getMigrationStats`: View migration progress across all users
- `migrateUserByEmail`: Migrate a specific user by email
- `checkUserMigrationStatus`: Check migration status for a specific user

## Migration Strategy

### Default Categories Created

1. **🏃 Physical Foundation**
   - Movement (+25 XP, core)
   - Breakfast (+15 XP, core)
   - Lunch (+15 XP, core)
   - Dinner (+15 XP, core)

2. **🧠 Mental Clarity**
   - Phone Jail (+10 XP, core)
   - Vibes/Energy (+5 XP)

3. **💼 Deep Work**
   - Work Hours (+20 XP, core)
   - Work Notes (+10 XP)

4. **🌙 Evening Routine**
   - Energy Reflection (+3 XP) - wellbeing slider
   - Satisfaction Reflection (+3 XP) - wellbeing slider
   - Stress Reflection (+3 XP) - wellbeing slider

**Total Possible Daily XP**: 124 XP

## Usage

### For End Users (UI)

Users can opt-in to the new system from the UI by calling:

```typescript
// Check if migrated
const status = useQuery(api.migrations.migrateUser.checkMigrationStatus);

// See preview of what will be created
const preview = useQuery(api.migrations.migrateUser.getMigrationPreview);

// Opt-in to migration
const migrate = useMutation(api.migrations.migrateUser.migrateToHabitSystem);
await migrate();
```

### For Admins (CLI)

#### Migrate All Users
```bash
npx convex run migrations/adminCommands:migrateAllUsers
```

#### Check Migration Stats
```bash
npx convex run migrations/adminCommands:getMigrationStats
```

#### Migrate Specific User
```bash
npx convex run migrations/adminCommands:migrateUserByEmail '{"userEmail": "user@example.com"}'
```

#### Check User Status
```bash
npx convex run migrations/adminCommands:checkUserMigrationStatus '{"userId": "user_123"}'
```

### Via Convex Dashboard

1. Open the Convex Dashboard
2. Navigate to Functions
3. Find `migrations/adminCommands`
4. Select the function you want to run
5. Provide arguments if needed
6. Click "Run"

## Idempotency

All migration functions are **idempotent** - they can be safely run multiple times without duplicating data. The migrations check for existing habit categories before creating new ones.

## Safety Features

- **Existence Check**: Migrations skip users who already have habit categories
- **Transaction Safety**: All database operations are atomic
- **Error Handling**: Errors are caught and logged, not propagated to other users
- **Reversibility**: The `resetHabitSystem` mutation allows users to start over if needed

## Testing

Before running a full migration, test with a single user:

```typescript
// In the Convex dashboard or via CLI
await ctx.runMutation(
  internal.migrations.seedHabitSystem.seedHabitSystemForUser,
  { userId: "test_user_id" }
);
```

## Rollback

If you need to rollback a migration for a user:

```typescript
const reset = useMutation(api.migrations.migrateUser.resetHabitSystem);
await reset({ confirmReset: true });
```

⚠️ **Warning**: This is destructive and will delete all habit data!

## Migration Flow

```
User Profile Exists
       ↓
Check for Habit Categories
       ↓
    [None Found]
       ↓
Create UserStats (if missing)
       ↓
Create 4 Habit Categories
       ↓
Create 13 Habit Templates
       ↓
Migration Complete ✅
```

## Database Schema

The migrations create data in these tables:

- `habitCategories`: Category definitions with icons and colors
- `habitTemplates`: Reusable habit definitions with XP values
- `userStats`: User level, XP, streaks
- `dailyHabits`: Daily habit completion records (created during daily tracking)

## Notes

- The old `trackingFields` table is **not deleted** to maintain backward compatibility
- Users can continue using the old system until they opt-in to migration
- Both systems can coexist during the transition period
- Consider adding a "migration deadline" after which the old system is deprecated

## Future Enhancements

- [ ] Automatic data migration from `dailyLog.tracking` to `dailyHabits`
- [ ] Historical XP calculation based on past tracking data
- [ ] Custom category creation during migration
- [ ] Bulk import of custom habits from trackingFields
