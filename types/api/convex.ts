/**
 * Convex Function Return Types
 *
 * Type definitions for all Convex queries, mutations, and actions
 */

import { Id } from "@/convex/_generated/dataModel";

// ============================================
// USER PROFILE TYPES
// ============================================

export interface NorthStars {
  wealth: string;
  health: string;
  love: string;
  happiness: string;
}

export interface QuarterlyMilestone {
  quarter: number; // 1-4
  year: number;
  area: "wealth" | "health" | "love" | "happiness";
  milestone: string;
  completed: boolean;
}

export interface UserProfile {
  _id: Id<"userProfile">;
  _creationTime: number;
  userId: string;
  name: string;
  role: string;
  mainProject: string;
  northStars: NorthStars;
  quarterlyMilestones: QuarterlyMilestone[];
  coachTone: string;
  setupCompleted: boolean;
  setupDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserProfileResponse = UserProfile | null;
export type HasCompletedSetupResponse = boolean;
export type CreateUserProfileResponse = Id<"userProfile">;

// ============================================
// HABIT CATEGORY TYPES
// ============================================

export interface HabitCategory {
  _id: Id<"habitCategories">;
  _creationTime: number;
  userId: string;
  name: string;
  icon: string;
  order: number;
  requiresCoreCompletion: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ListCategoriesResponse = HabitCategory[];
export type CreateCategoryResponse = Id<"habitCategories">;

export interface FixCategoryNamesResponse {
  message: string;
  total: number;
}

// ============================================
// HABIT TEMPLATE TYPES
// ============================================

export interface HabitTemplate {
  _id: Id<"habitTemplates">;
  _creationTime: number;
  userId: string;
  categoryId: Id<"habitCategories">;
  name: string;
  description?: string;
  icon?: string;
  xpValue: number;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitTemplateWithCategory extends HabitTemplate {
  category: HabitCategory | null;
}

export type ListTemplatesResponse = HabitTemplate[];
export type GetTemplateResponse = HabitTemplate | null;
export type CreateTemplateResponse = Id<"habitTemplates">;

// ============================================
// DAILY HABITS TYPES
// ============================================

export interface DailyHabit {
  _id: Id<"dailyHabits">;
  _creationTime: number;
  userId: string;
  templateId: Id<"habitTemplates">;
  date: string; // "YYYY-MM-DD"
  completed: boolean;
  skipped: boolean;
  skipReason?: string;
  notes?: string;
  completedAt?: string;
  xpEarned: number;
  createdAt: string;
  updatedAt: string;
}

export interface EnrichedDailyHabit extends DailyHabit {
  template: HabitTemplate | null;
}

export type GetHabitsForDateResponse = EnrichedDailyHabit[];
export type GetTodayHabitsResponse = EnrichedDailyHabit[];

export interface PatternIntelligenceResponse {
  period: {
    startDate: string;
    endDate: string;
    daysAnalyzed: number;
  };
  overall: {
    totalHabits: number;
    completedHabits: number;
    skippedHabits: number;
    completionRate: number;
  };
  topSkipReasons: Array<{
    reason: string;
    count: number;
  }>;
  habitPerformance: Array<{
    templateId: string;
    name: string;
    total: number;
    completed: number;
    skipped: number;
    completionRate: number;
  }>;
  dayOfWeekPatterns: Array<{
    day: string;
    total: number;
    completed: number;
    completionRate: number;
  }>;
}

export interface HabitHistoryResponse {
  template: HabitTemplate;
  habits: DailyHabit[];
  stats: {
    total: number;
    completed: number;
    skipped: number;
  };
}

// ============================================
// GAMIFICATION TYPES
// ============================================

export interface UserStats {
  _id: Id<"userStats">;
  _creationTime: number;
  userId: string;
  totalXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type GetUserStatsResponse = UserStats | null;

export interface LevelUpResponse {
  leveledUp: boolean;
  newLevel?: number;
  xpToNext?: number;
}

export interface StreakInfoResponse {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
}

// ============================================
// TRACKING FIELDS TYPES (LEGACY)
// ============================================

export interface TrackingField {
  _id: Id<"trackingFields">;
  _creationTime: number;
  userId: string;
  name: string;
  type: "text" | "toggle" | "meals" | "work";
  hasStreak: boolean;
  isDefault: boolean;
  isActive: boolean;
  order: number;
  currentStreak?: number;
  longestStreak?: number;
  weeklyTarget?: number;
  createdAt: string;
}

export type ListTrackingFieldsResponse = TrackingField[];
export type CreateTrackingFieldResponse = Id<"trackingFields">;

// ============================================
// DAILY LOG TYPES
// ============================================

export interface CustomFieldValue {
  fieldId: Id<"trackingFields">;
  value: string | boolean | number;
}

export interface DailyLog {
  _id: Id<"dailyLog">;
  _creationTime: number;
  userId: string;
  date: string; // "YYYY-MM-DD"
  weekNumber: number;
  year: number;
  dayOfWeek: string;
  mood?: number;
  energy?: number;
  customFields?: CustomFieldValue[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type GetDailyLogResponse = DailyLog | null;
export type CreateDailyLogResponse = Id<"dailyLog">;

// ============================================
// REVIEW TYPES
// ============================================

export interface WeeklyReview {
  _id: Id<"weeklyReview">;
  _creationTime: number;
  userId: string;
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  wins?: string[];
  challenges?: string[];
  learnings?: string[];
  nextWeekFocus?: string;
  habitStats?: Record<string, number>;
  goalProgress?: Array<{
    goalId: string;
    progress: number;
    notes?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export type GetWeeklyReviewResponse = WeeklyReview | null;
export type CreateWeeklyReviewResponse = Id<"weeklyReview">;

export interface MonthlyReview {
  _id: Id<"monthlyReview">;
  _creationTime: number;
  userId: string;
  month: number;
  year: number;
  highlights?: string[];
  challenges?: string[];
  keyLearnings?: string[];
  nextMonthGoals?: string[];
  habitAnalysis?: Record<string, unknown>;
  goalProgress?: Array<{
    goalId: string;
    progress: number;
    notes?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export type GetMonthlyReviewResponse = MonthlyReview | null;
export type CreateMonthlyReviewResponse = Id<"monthlyReview">;

export interface QuarterlyReview {
  _id: Id<"quarterlyReview">;
  _creationTime: number;
  userId: string;
  quarter: number;
  year: number;
  majorWins?: string[];
  obstacles?: string[];
  keyInsights?: string[];
  nextQuarterFocus?: string[];
  milestoneProgress?: Array<{
    milestoneId: string;
    completed: boolean;
    notes?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export type GetQuarterlyReviewResponse = QuarterlyReview | null;
export type CreateQuarterlyReviewResponse = Id<"quarterlyReview">;

export interface AnnualReview {
  _id: Id<"annualReview">;
  _creationTime: number;
  userId: string;
  year: number;
  yearHighlights?: string[];
  biggestChallenges?: string[];
  transformationalLearnings?: string[];
  nextYearVision?: string;
  northStarAlignment?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type GetAnnualReviewResponse = AnnualReview | null;
export type CreateAnnualReviewResponse = Id<"annualReview">;

// ============================================
// COACH MESSAGES TYPES
// ============================================

export interface CoachMessage {
  _id: Id<"coachMessages">;
  _creationTime: number;
  userId: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export type GetCoachMessagesResponse = CoachMessage[];
export type SendCoachMessageResponse = Id<"coachMessages">;

// ============================================
// VISION BOARD TYPES
// ============================================

export interface VisionBoardItem {
  _id: Id<"visionboard">;
  _creationTime: number;
  userId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type GetVisionBoardResponse = VisionBoardItem[];
export type CreateVisionBoardItemResponse = Id<"visionboard">;

export interface VisionBoardList {
  _id: Id<"visionboardLists">;
  _creationTime: number;
  userId: string;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type GetVisionBoardListsResponse = VisionBoardList[];
export type CreateVisionBoardListResponse = Id<"visionboardLists">;

// ============================================
// ANALYTICS TYPES
// ============================================

export interface HabitAnalyticsResponse {
  completionRate: number;
  totalHabits: number;
  completedHabits: number;
  streakData: Array<{
    date: string;
    completed: number;
    total: number;
  }>;
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    completionRate: number;
    count: number;
  }>;
}

export interface TimeTrackingStats {
  totalMinutes: number;
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    minutes: number;
    percentage: number;
  }>;
  dailyAverage: number;
  weeklyTotal: number;
}

// ============================================
// SETTINGS TYPES
// ============================================

export interface UserSettings {
  _id: string;
  _creationTime: number;
  userId: string;
  theme?: "light" | "dark" | "system";
  notifications?: {
    dailyReminder?: boolean;
    weeklyReview?: boolean;
    achievements?: boolean;
  };
  preferences?: {
    startOfWeek?: "monday" | "sunday";
    dateFormat?: string;
    timeFormat?: "12h" | "24h";
  };
  createdAt: string;
  updatedAt: string;
}

export type GetSettingsResponse = UserSettings | null;
export type UpdateSettingsResponse = string;
