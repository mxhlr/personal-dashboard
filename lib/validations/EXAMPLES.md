# Validation Examples

Real-world examples of using Zod validation schemas in the personal dashboard.

## Example 1: Habit Creation Form with React Hook Form

```typescript
"use client";

import { useForm } from "@/lib/validations/formHelpers";
import { habitTemplateSchema, type HabitTemplate } from "@/lib/validations";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateHabitForm() {
  const createHabit = useMutation(api.habitTemplates.create);

  const form = useForm(habitTemplateSchema, {
    defaultValues: {
      name: "",
      subtitle: "",
      categoryId: "",
      xpValue: 10,
      isExtra: false,
    },
  });

  const onSubmit = form.handleSubmit(async (data: HabitTemplate) => {
    try {
      await createHabit(data);
      toast.success("Habit created successfully!");
      form.reset();
    } catch (error) {
      toast.error("Failed to create habit");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Habit Name</Label>
        <Input
          id="name"
          {...form.register("name")}
          placeholder="e.g., Morning Exercise"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="subtitle">Subtitle (Optional)</Label>
        <Input
          id="subtitle"
          {...form.register("subtitle")}
          placeholder="e.g., 30 minutes"
        />
        {form.formState.errors.subtitle && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.subtitle.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="xpValue">XP Value</Label>
        <Input
          id="xpValue"
          type="number"
          {...form.register("xpValue", { valueAsNumber: true })}
        />
        {form.formState.errors.xpValue && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.xpValue.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Creating..." : "Create Habit"}
      </Button>
    </form>
  );
}
```

## Example 2: Runtime Prop Validation in Component

```typescript
"use client";

import React from "react";
import { validateProps } from "@/lib/validations/utils";
import { habitItemPropsSchema, type HabitItemProps } from "@/lib/validations";
import { Checkbox } from "@/components/ui/checkbox";

export function HabitItem(props: HabitItemProps) {
  // Validate props in development mode only
  if (process.env.NODE_ENV === "development") {
    validateProps(habitItemPropsSchema, props, "HabitItem");
  }

  const { id, name, subtitle, xp, completed, completedAt, onToggle, onSkip } = props;

  return (
    <div className="flex items-center gap-3">
      <Checkbox
        checked={completed}
        onCheckedChange={() => onToggle(id)}
      />

      <div className="flex-1">
        <div className={completed ? "line-through" : ""}>
          {name}
        </div>
        {subtitle && (
          <div className="text-sm text-muted-foreground">
            {subtitle}
          </div>
        )}
      </div>

      <div className="text-sm font-bold">
        +{xp} XP
      </div>
    </div>
  );
}
```

## Example 3: Weekly Review Form with Validation

```typescript
"use client";

import { useState } from "react";
import { useForm } from "@/lib/validations/formHelpers";
import {
  weeklyReviewResponsesSchema,
  weeklyGoalSchema,
  type WeeklyReviewResponses,
  type WeeklyGoal,
} from "@/lib/validations";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export function WeeklyReviewForm({ year, weekNumber }: { year: number; weekNumber: number }) {
  const submitReview = useMutation(api.weeklyReview.submitWeeklyReview);

  const form = useForm(weeklyReviewResponsesSchema, {
    defaultValues: {
      biggestSuccess: "",
      mostFrustrating: "",
      differentlyNextTime: "",
      learned: "",
      nextWeekFocus: "",
    },
  });

  const [nextWeekGoals, setNextWeekGoals] = useState<WeeklyGoal[]>([
    { goal: "", category: "Wealth" },
  ]);

  const onSubmit = form.handleSubmit(async (responses: WeeklyReviewResponses) => {
    try {
      // Validate goals separately
      const validGoals = nextWeekGoals
        .filter(g => g.goal.trim() !== "")
        .map(goal => {
          const result = weeklyGoalSchema.safeParse(goal);
          if (!result.success) {
            throw new Error(`Invalid goal: ${result.error.errors[0].message}`);
          }
          return result.data;
        });

      await submitReview({
        year,
        weekNumber,
        responses,
        nextWeekGoals: validGoals,
      });

      toast.success("Weekly Review submitted!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit review");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label>What was your biggest success this week?</label>
        <textarea
          {...form.register("biggestSuccess")}
          className="w-full mt-2 p-2 border rounded"
          rows={3}
        />
        {form.formState.errors.biggestSuccess && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.biggestSuccess.message}
          </p>
        )}
      </div>

      <div>
        <label>What was most frustrating?</label>
        <textarea
          {...form.register("mostFrustrating")}
          className="w-full mt-2 p-2 border rounded"
          rows={3}
        />
        {form.formState.errors.mostFrustrating && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.mostFrustrating.message}
          </p>
        )}
      </div>

      {/* Add remaining fields... */}

      <button type="submit" disabled={form.formState.isSubmitting}>
        Submit Review
      </button>
    </form>
  );
}
```

## Example 4: Profile Update with Partial Validation

```typescript
"use client";

import { useForm } from "@/lib/validations/formHelpers";
import { profileUpdateSchema, type ProfileUpdate } from "@/lib/validations";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export function ProfileSettingsForm({ currentProfile }: { currentProfile: any }) {
  const updateProfile = useMutation(api.userProfile.update);

  const form = useForm(profileUpdateSchema, {
    defaultValues: {
      name: currentProfile.name,
      role: currentProfile.role,
      mainProject: currentProfile.mainProject,
      coachTone: currentProfile.coachTone,
    },
  });

  const onSubmit = form.handleSubmit(async (data: ProfileUpdate) => {
    try {
      // Only send fields that changed
      const changedFields = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== currentProfile[key]) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      if (Object.keys(changedFields).length === 0) {
        toast.info("No changes to save");
        return;
      }

      await updateProfile(changedFields);
      toast.success("Profile updated!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Form fields... */}
    </form>
  );
}
```

## Example 5: Validating API Responses

```typescript
import { dailyLogSchema } from "@/lib/validations";
import { assertValid } from "@/lib/validations/utils";

export async function fetchDailyLog(date: string) {
  const response = await fetch(`/api/daily-log?date=${date}`);
  const data = await response.json();

  // Validate the response matches our schema
  const validLog = assertValid(
    dailyLogSchema,
    data,
    "Invalid daily log data from API"
  );

  return validLog;
}
```

## Example 6: Convex Mutation with Validation

```typescript
// In convex/habitTemplates.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    subtitle: v.optional(v.string()),
    categoryId: v.id("habitCategories"),
    xpValue: v.number(),
    isExtra: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Additional server-side validation with Zod
    // (Import from lib/validations if needed)

    const userId = await getUserId(ctx);

    return await ctx.db.insert("habitTemplates", {
      ...args,
      userId,
      createdAt: new Date().toISOString(),
    });
  },
});
```

## Example 7: Custom Validation Logic

```typescript
import { z } from "zod";
import { habitTemplateSchema } from "@/lib/validations";

// Extend base schema with custom validation
const advancedHabitSchema = habitTemplateSchema.extend({
  // Add custom field
  tags: z.array(z.string()).optional(),
}).refine(
  (data) => {
    // Custom validation: Extra habits should have lower XP
    if (data.isExtra && data.xpValue > 50) {
      return false;
    }
    return true;
  },
  {
    message: "Extra habits should have XP ≤ 50",
    path: ["xpValue"],
  }
);

// Use the extended schema
const result = advancedHabitSchema.safeParse(habitData);
```

## Example 8: Array Validation

```typescript
import { z } from "zod";
import { habitItemSchema } from "@/lib/validations";

const habitListSchema = z.array(habitItemSchema).min(1, "At least one habit required");

function validateHabitList(habits: unknown) {
  const result = habitListSchema.safeParse(habits);

  if (!result.success) {
    console.error("Invalid habits:", result.error.errors);
    return null;
  }

  return result.data;
}
```

## Example 9: Testing with Validation Schemas

```typescript
import { describe, it, expect } from "vitest";
import { habitTemplateSchema } from "@/lib/validations";

describe("Habit Template Validation", () => {
  it("accepts valid habit template", () => {
    const validHabit = {
      name: "Morning Meditation",
      subtitle: "10 minutes",
      categoryId: "cat_123",
      xpValue: 15,
      isExtra: false,
    };

    expect(() => habitTemplateSchema.parse(validHabit)).not.toThrow();
  });

  it("rejects habit with XP > 10000", () => {
    const invalidHabit = {
      name: "Test",
      categoryId: "cat_123",
      xpValue: 15000,
      isExtra: false,
    };

    expect(() => habitTemplateSchema.parse(invalidHabit)).toThrow();
  });

  it("requires name to be non-empty", () => {
    const invalidHabit = {
      name: "",
      categoryId: "cat_123",
      xpValue: 10,
      isExtra: false,
    };

    const result = habitTemplateSchema.safeParse(invalidHabit);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain("name");
    }
  });
});
```

## Example 10: Form with Dynamic Fields

```typescript
import { z } from "zod";
import { useForm } from "@/lib/validations/formHelpers";
import { quarterlyMilestoneSchema } from "@/lib/validations";

// Create schema for multiple milestones
const milestonesFormSchema = z.object({
  milestones: z.array(quarterlyMilestoneSchema).min(1, "Add at least one milestone"),
});

export function MilestonesForm() {
  const form = useForm(milestonesFormSchema, {
    defaultValues: {
      milestones: [
        {
          quarter: 1,
          year: 2024,
          area: "wealth" as const,
          milestone: "",
          completed: false,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "milestones",
  });

  return (
    <form onSubmit={form.handleSubmit((data) => console.log(data))}>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...form.register(`milestones.${index}.milestone`)} />
          {form.formState.errors.milestones?.[index]?.milestone && (
            <p className="error">
              {form.formState.errors.milestones[index]?.milestone?.message}
            </p>
          )}
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          append({
            quarter: 1,
            year: 2024,
            area: "wealth",
            milestone: "",
            completed: false,
          })
        }
      >
        Add Milestone
      </button>

      <button type="submit">Save Milestones</button>
    </form>
  );
}
```

## Best Practices Demonstrated

1. **Always use `safeParse` for external data** - Prevents unexpected crashes
2. **Use `parse` when you control the data** - Simpler error handling
3. **Validate at boundaries** - API responses, user input, external sources
4. **Provide user-friendly error messages** - Custom messages in schemas
5. **Type safety everywhere** - Use inferred types from schemas
6. **Partial updates** - Use `.partial()` for optional update fields
7. **Array validation** - Validate entire lists with `.array()`
8. **Custom refinements** - Add business logic validation with `.refine()`
9. **Testing** - Write tests using the same schemas
10. **Development-only validation** - Skip expensive checks in production
