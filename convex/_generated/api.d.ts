/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminFix from "../adminFix.js";
import type * as analytics from "../analytics.js";
import type * as annualReview from "../annualReview.js";
import type * as coachMessages from "../coachMessages.js";
import type * as dailyHabits from "../dailyHabits.js";
import type * as dailyLog from "../dailyLog.js";
import type * as gamification from "../gamification.js";
import type * as habitAnalytics from "../habitAnalytics.js";
import type * as habitCategories from "../habitCategories.js";
import type * as habitTemplates from "../habitTemplates.js";
import type * as migrations_adminCommands from "../migrations/adminCommands.js";
import type * as migrations_migrateUser from "../migrations/migrateUser.js";
import type * as migrations_seedHabitSystem from "../migrations/seedHabitSystem.js";
import type * as monthlyReview from "../monthlyReview.js";
import type * as quarterlyReview from "../quarterlyReview.js";
import type * as settings from "../settings.js";
import type * as trackingFields from "../trackingFields.js";
import type * as userProfile from "../userProfile.js";
import type * as visionboard from "../visionboard.js";
import type * as visionboardLists from "../visionboardLists.js";
import type * as weeklyReview from "../weeklyReview.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adminFix: typeof adminFix;
  analytics: typeof analytics;
  annualReview: typeof annualReview;
  coachMessages: typeof coachMessages;
  dailyHabits: typeof dailyHabits;
  dailyLog: typeof dailyLog;
  gamification: typeof gamification;
  habitAnalytics: typeof habitAnalytics;
  habitCategories: typeof habitCategories;
  habitTemplates: typeof habitTemplates;
  "migrations/adminCommands": typeof migrations_adminCommands;
  "migrations/migrateUser": typeof migrations_migrateUser;
  "migrations/seedHabitSystem": typeof migrations_seedHabitSystem;
  monthlyReview: typeof monthlyReview;
  quarterlyReview: typeof quarterlyReview;
  settings: typeof settings;
  trackingFields: typeof trackingFields;
  userProfile: typeof userProfile;
  visionboard: typeof visionboard;
  visionboardLists: typeof visionboardLists;
  weeklyReview: typeof weeklyReview;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
