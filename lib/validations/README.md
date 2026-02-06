# Validation Schemas Documentation

This directory contains Zod validation schemas for all data structures in the personal dashboard application.

## Overview

All validation schemas are organized by domain:

- **habitSchemas.ts** - Habit items, categories, templates, and XP tracking
- **reviewSchemas.ts** - Weekly, monthly, quarterly, and annual reviews
- **profileSchemas.ts** - User profiles, north stars, milestones, and onboarding
- **trackingSchemas.ts** - Daily tracking, wellbeing metrics, and custom fields
- **utils.ts** - Validation utilities and helpers
- **formHelpers.ts** - React Hook Form integration helpers

## Installation

Required packages (already installed):

```bash
npm install zod react-hook-form @hookform/resolvers
```

## Basic Usage

### Import Schemas

```typescript
import { habitItemSchema, type HabitItem } from '@/lib/validations';
```

### Validate Data

```typescript
// Safe parse (returns result object)
const result = habitItemSchema.safeParse(data);
if (result.success) {
  console.log(result.data); // Typed as HabitItem
} else {
  console.error(result.error.errors);
}

// Direct parse (throws on error)
try {
  const validData = habitItemSchema.parse(data);
} catch (error) {
  // Handle validation error
}
```

## Form Validation

### Using React Hook Form

```typescript
import { useForm } from '@/lib/validations/formHelpers';
import { habitTemplateSchema } from '@/lib/validations';

function HabitForm() {
  const form = useForm(habitTemplateSchema, {
    defaultValues: {
      name: '',
      categoryId: '',
      xpValue: 10,
      isExtra: false,
    }
  });

  const onSubmit = form.handleSubmit(async (data) => {
    // data is fully typed and validated
    await createHabit(data);
  });

  return (
    <form onSubmit={onSubmit}>
      <input {...form.register('name')} />
      {form.formState.errors.name && (
        <span className="error">{form.formState.errors.name.message}</span>
      )}

      <input
        type="number"
        {...form.register('xpValue', { valueAsNumber: true })}
      />
      {form.formState.errors.xpValue && (
        <span className="error">{form.formState.errors.xpValue.message}</span>
      )}

      <button type="submit">Create Habit</button>
    </form>
  );
}
```

### Validation with User Feedback

```typescript
import { validateWithFeedback } from '@/lib/validations';
import { toast } from 'sonner';

const result = validateWithFeedback(habitTemplateSchema, formData);

if (!result.success) {
  // Show first error as toast
  toast.error(result.errors[0]);

  // Or show field-specific errors
  if (result.fieldErrors) {
    Object.entries(result.fieldErrors).forEach(([field, errors]) => {
      console.log(`${field}: ${errors.join(', ')}`);
    });
  }
} else {
  // Data is valid, proceed
  await submitHabit(result.data);
}
```

## Runtime Prop Validation

Validate component props in development mode:

```typescript
import { validateProps } from '@/lib/validations/utils';
import { habitItemPropsSchema, type HabitItemProps } from '@/lib/validations';

export function HabitItem(props: HabitItemProps) {
  // Validates props in development, skipped in production
  if (process.env.NODE_ENV === 'development') {
    validateProps(habitItemPropsSchema, props, 'HabitItem');
  }

  // Component logic...
  return <div>{props.name}</div>;
}
```

## Utility Functions

### Safe Parse with Default

```typescript
import { safeParseWithDefault } from '@/lib/validations/utils';

const userPreferences = safeParseWithDefault(
  preferencesSchema,
  localStorage.getItem('preferences'),
  { theme: 'dark', language: 'en' }
);
```

### Assert Valid (Throws on Error)

```typescript
import { assertValid } from '@/lib/validations/utils';

try {
  const validHabit = assertValid(
    habitTemplateSchema,
    untrustedData,
    'Invalid habit data'
  );
  await saveHabit(validHabit);
} catch (error) {
  logger.error('Validation failed:', error);
}
```

### Validated Mutations

```typescript
import { createValidatedMutation } from '@/lib/validations/utils';

const createHabit = createValidatedMutation(
  habitTemplateSchema,
  async (data) => {
    return await api.habits.create(data);
  }
);

// Automatically validates before executing
await createHabit(formData); // Throws if validation fails
```

## Schema Examples

### Habit Schemas

```typescript
import {
  habitItemSchema,
  habitCategorySchema,
  habitTemplateSchema,
  type HabitItem
} from '@/lib/validations';

// Validate a habit item
const habit: HabitItem = {
  id: '123',
  name: 'Morning Exercise',
  subtitle: '30 minutes',
  xp: 25,
  completed: false,
  isExtra: false,
};

habitItemSchema.parse(habit); // ✓ Valid

// Invalid XP value
const invalidHabit = { ...habit, xp: 15000 };
habitItemSchema.parse(invalidHabit); // ✗ Throws: XP cannot exceed 10,000
```

### Review Schemas

```typescript
import {
  weeklyReviewSubmissionSchema,
  type WeeklyReviewSubmission
} from '@/lib/validations';

const review: WeeklyReviewSubmission = {
  year: 2024,
  weekNumber: 5,
  responses: {
    biggestSuccess: 'Completed major project milestone',
    mostFrustrating: 'Technical issues with deployment',
    differentlyNextTime: 'Start testing earlier',
    learned: 'Importance of backup strategies',
    nextWeekFocus: 'Performance optimization',
  },
  nextWeekGoals: [
    { goal: 'Launch new feature', category: 'Wealth' },
    { goal: 'Exercise daily', category: 'Health' },
  ],
};

weeklyReviewSubmissionSchema.parse(review); // ✓ Valid
```

### Profile Schemas

```typescript
import {
  userProfileSchema,
  onboardingDataSchema,
  type UserProfile
} from '@/lib/validations';

const profile: UserProfile = {
  userId: 'user_123',
  name: 'John Doe',
  role: 'Gründer',
  mainProject: 'SaaS Startup',
  northStars: {
    wealth: 'Build a sustainable 7-figure business',
    health: 'Maintain peak physical condition',
    love: 'Strengthen family relationships',
    happiness: 'Find work-life balance',
  },
  quarterlyMilestones: [
    {
      quarter: 1,
      year: 2024,
      area: 'wealth',
      milestone: 'Reach $10k MRR',
      completed: false,
    },
  ],
  coachTone: 'Motivierend',
  setupCompleted: true,
  setupDate: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

userProfileSchema.parse(profile); // ✓ Valid
```

### Tracking Schemas

```typescript
import {
  dailyLogSchema,
  wellbeingSchema,
  type DailyLog
} from '@/lib/validations';

const dailyLog: DailyLog = {
  userId: 'user_123',
  date: '2024-02-06',
  weekNumber: 6,
  year: 2024,
  dayOfWeek: 'Tuesday',
  tracking: {
    movement: 'Morning run, 5km',
    phoneJail: true,
    phoneJailNotes: 'Used only for urgent calls',
    vibes: 'Productive and focused',
    breakfast: 'Oatmeal with berries',
    lunch: 'Chicken salad',
    dinner: 'Grilled salmon',
    workHours: 8,
    workNotes: 'Completed sprint planning',
  },
  wellbeing: {
    energy: 8,
    satisfaction: 9,
    stress: 3,
  },
  completed: true,
  completedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

dailyLogSchema.parse(dailyLog); // ✓ Valid
```

## Best Practices

### 1. Always Use Type Inference

```typescript
// ✓ Good - Use inferred types
import { habitItemSchema, type HabitItem } from '@/lib/validations';
const habit: HabitItem = { ... };

// ✗ Bad - Don't manually define types
interface HabitItem { ... } // Duplication!
```

### 2. Validate at Boundaries

```typescript
// Validate when data enters your system
async function createHabit(data: unknown) {
  const validData = habitTemplateSchema.parse(data); // Validate here
  return await db.habits.create(validData); // Safe to use
}
```

### 3. Use Safe Parse for External Data

```typescript
// ✓ Good - Handle errors gracefully
const result = schema.safeParse(externalData);
if (!result.success) {
  return { error: result.error };
}

// ✗ Bad - May throw unexpectedly
const data = schema.parse(externalData); // Could throw!
```

### 4. Provide User-Friendly Error Messages

```typescript
// Custom error messages in schemas
const schema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  xp: z.number().min(1, "XP must be positive").max(10000, "XP is too high"),
});
```

### 5. Use Schemas in Convex Functions

```typescript
// In Convex mutations
import { mutation } from './_generated/server';
import { habitTemplateSchema } from '@/lib/validations';

export const createHabit = mutation({
  handler: async (ctx, args) => {
    // Validate input
    const validData = habitTemplateSchema.parse(args);

    // Safe to use
    return await ctx.db.insert('habits', validData);
  },
});
```

## Testing with Schemas

```typescript
import { describe, it, expect } from 'vitest';
import { habitItemSchema } from '@/lib/validations';

describe('habitItemSchema', () => {
  it('validates correct habit data', () => {
    const validHabit = {
      id: '123',
      name: 'Test Habit',
      xp: 10,
      completed: false,
    };

    expect(() => habitItemSchema.parse(validHabit)).not.toThrow();
  });

  it('rejects invalid XP values', () => {
    const invalidHabit = {
      id: '123',
      name: 'Test Habit',
      xp: 15000, // Too high
      completed: false,
    };

    expect(() => habitItemSchema.parse(invalidHabit)).toThrow();
  });
});
```

## Performance Considerations

1. **Production Builds**: Runtime prop validation is automatically skipped in production
2. **Memoization**: Schemas are defined once and reused
3. **Lazy Validation**: Use `.safeParse()` to avoid throwing errors
4. **Partial Schemas**: Use `.partial()` for optional updates

```typescript
// Full schema for creation
const createSchema = habitTemplateSchema;

// Partial schema for updates
const updateSchema = habitTemplateSchema.partial();
```

## Migration Guide

### Replacing Existing Validation

#### Before (Manual Validation)

```typescript
function validateHabit(habit: any) {
  if (!habit.name || habit.name.length > 100) {
    throw new Error('Invalid name');
  }
  if (habit.xp < 1 || habit.xp > 10000) {
    throw new Error('Invalid XP');
  }
  // ... more validation
}
```

#### After (Zod Schema)

```typescript
import { habitItemSchema } from '@/lib/validations';

function validateHabit(habit: unknown) {
  return habitItemSchema.parse(habit); // All validation in one line!
}
```

## Additional Resources

- [Zod Documentation](https://zod.dev/)
- [React Hook Form + Zod](https://react-hook-form.com/get-started#SchemaValidation)
- [TypeScript Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html)
