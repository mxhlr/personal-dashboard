/**
 * Centralized validation schemas using Zod
 *
 * This module exports all validation schemas and their TypeScript types
 * for use across the application.
 *
 * Usage:
 * ```ts
 * import { habitItemSchema, type HabitItem } from '@/lib/validations';
 *
 * const result = habitItemSchema.safeParse(data);
 * if (result.success) {
 *   const validData: HabitItem = result.data;
 * }
 * ```
 */

// Export all habit-related schemas and types
export {
  habitItemSchema,
  habitCategorySchema,
  habitTemplateSchema,
  habitCategoryFormSchema,
  xpUpdateSchema,
  skipReasonSchema,
  habitSkipSchema,
  type HabitItem,
  type HabitItemProps,
  type HabitCategory,
  type HabitCategoryProps,
  type HabitTemplate,
  type HabitCategoryForm,
  type XPUpdate,
  type SkipReason,
  type HabitSkip,
} from "./habitSchemas";

// Export all review-related schemas and types
export {
  weeklyReviewResponsesSchema,
  weeklyGoalSchema,
  weeklyReviewSubmissionSchema,
  monthlyReviewResponsesSchema,
  monthlyReviewSubmissionSchema,
  quarterlyReviewResponsesSchema,
  quarterlyReviewSubmissionSchema,
  annualReviewResponsesSchema,
  annualReviewSubmissionSchema,
  goalCompletionSchema,
  reviewFormPropsSchema,
  type WeeklyReviewResponses,
  type WeeklyGoal,
  type WeeklyReviewSubmission,
  type MonthlyReviewResponses,
  type MonthlyReviewSubmission,
  type QuarterlyReviewResponses,
  type QuarterlyReviewSubmission,
  type AnnualReviewResponses,
  type AnnualReviewSubmission,
  type GoalCompletion,
  type ReviewFormProps,
} from "./reviewSchemas";

// Export all profile-related schemas and types
export {
  northStarsSchema,
  lifeAreaSchema,
  quarterlyMilestoneSchema,
  coachToneSchema,
  profileBasicsSchema,
  userProfileSchema,
  profileUpdateSchema,
  onboardingDataSchema,
  milestoneFormSchema,
  milestoneCompletionSchema,
  userRoleSchema,
  type NorthStars,
  type LifeArea,
  type QuarterlyMilestone,
  type CoachTone,
  type ProfileBasics,
  type UserProfile,
  type ProfileUpdate,
  type OnboardingData,
  type MilestoneForm,
  type MilestoneCompletion,
  type UserRole,
} from "./profileSchemas";

// Export all tracking-related schemas and types
export {
  wellbeingSchema,
  customToggleSchema,
  customTextSchema,
  trackingDataSchema,
  dailyLogSchema,
  trackingFieldSchema,
  trackingFieldFormSchema,
  dailyLogUpdateSchema,
  mealSchema,
  workTrackingSchema,
  phoneJailSchema,
  streakSchema,
  trackingSummarySchema,
  dateRangeSchema,
  dayOfWeekSchema,
  type Wellbeing,
  type CustomToggle,
  type CustomText,
  type TrackingData,
  type DailyLog,
  type TrackingField,
  type TrackingFieldForm,
  type DailyLogUpdate,
  type Meal,
  type WorkTracking,
  type PhoneJail,
  type Streak,
  type TrackingSummary,
  type DateRange,
  type DayOfWeek,
} from "./trackingSchemas";

// Re-export common validation utilities
export { validateProps, validateWithFeedback } from "./utils";
