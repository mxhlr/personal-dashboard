import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get daily log for a specific date
export const getDailyLog = query({
  args: {
    date: v.string(), // "YYYY-MM-DD"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const log = await ctx.db
      .query("dailyLog")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", identity.subject).eq("date", args.date)
      )
      .first();

    return log;
  },
});

// Get logs for a specific week
export const getWeeklyLogs = query({
  args: {
    weekNumber: v.number(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const logs = await ctx.db
      .query("dailyLog")
      .withIndex("by_user_week", (q) =>
        q.eq("userId", identity.subject).eq("year", args.year).eq("weekNumber", args.weekNumber)
      )
      .collect();

    return logs;
  },
});

// Get logs for a date range (for weekly overview)
export const getWeekLogs = query({
  args: {
    startDate: v.string(), // "YYYY-MM-DD"
    endDate: v.string(),   // "YYYY-MM-DD"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get all logs for user and filter in memory
    const allLogs = await ctx.db
      .query("dailyLog")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    // Filter by date range (dates are already in "YYYY-MM-DD" format)
    const logs = allLogs.filter((log) => {
      return log.date >= args.startDate && log.date <= args.endDate;
    });

    return logs;
  },
});

// Create or update daily log
export const upsertDailyLog = mutation({
  args: {
    date: v.string(),
    tracking: v.object({
      movement: v.optional(v.string()),
      phoneJail: v.optional(v.boolean()),
      phoneJailNotes: v.optional(v.string()),
      vibes: v.optional(v.string()),
      breakfast: v.optional(v.string()),
      lunch: v.optional(v.string()),
      dinner: v.optional(v.string()),
      workHours: v.optional(v.number()),
      workNotes: v.optional(v.string()),
      customToggles: v.optional(
        v.array(
          v.object({
            fieldId: v.id("trackingFields"),
            value: v.boolean(),
          })
        )
      ),
      customTexts: v.optional(
        v.array(
          v.object({
            fieldId: v.id("trackingFields"),
            value: v.string(),
          })
        )
      ),
    }),
    wellbeing: v.optional(
      v.object({
        energy: v.number(),
        satisfaction: v.number(),
        stress: v.number(),
      })
    ),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Calculate week number and day of week
    const date = new Date(args.date);
    const weekNumber = getWeekNumber(date);
    const year = date.getFullYear();
    const dayOfWeek = date.toLocaleDateString("de-DE", { weekday: "long" });

    // Check if log exists
    const existingLog = await ctx.db
      .query("dailyLog")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", identity.subject).eq("date", args.date)
      )
      .first();

    const now = new Date().toISOString();

    if (existingLog) {
      // Update existing log
      await ctx.db.patch(existingLog._id, {
        tracking: args.tracking,
        wellbeing: args.wellbeing,
        completed: args.completed,
        completedAt: args.completed ? now : existingLog.completedAt,
        updatedAt: now,
      });

      // Update streaks if toggle fields changed
      if (args.tracking.customToggles) {
        await updateStreaksForToggles(
          ctx,
          identity.subject,
          args.date,
          args.tracking.customToggles
        );
      }
      if (args.tracking.phoneJail !== undefined) {
        await updatePhoneJailStreak(
          ctx,
          identity.subject,
          args.date,
          args.tracking.phoneJail
        );
      }

      return existingLog._id;
    } else {
      // Create new log
      const logId = await ctx.db.insert("dailyLog", {
        userId: identity.subject,
        date: args.date,
        year,
        weekNumber,
        dayOfWeek,
        tracking: args.tracking,
        wellbeing: args.wellbeing,
        completed: args.completed,
        completedAt: args.completed ? now : undefined,
        createdAt: now,
        updatedAt: now,
      });

      // Update streaks if toggle fields set
      if (args.tracking.customToggles) {
        await updateStreaksForToggles(
          ctx,
          identity.subject,
          args.date,
          args.tracking.customToggles
        );
      }
      if (args.tracking.phoneJail !== undefined) {
        await updatePhoneJailStreak(
          ctx,
          identity.subject,
          args.date,
          args.tracking.phoneJail
        );
      }

      return logId;
    }
  },
});

// Helper: Calculate ISO week number
function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// Helper: Update streaks for custom toggle fields
async function updateStreaksForToggles(
  ctx: any,
  userId: string,
  currentDate: string,
  toggles: Array<{ fieldId: any; value: boolean }>
) {
  for (const toggle of toggles) {
    const field = await ctx.db.get(toggle.fieldId);
    if (!field || !field.hasStreak) continue;

    if (toggle.value) {
      // Increment streak
      const yesterday = new Date(currentDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const yesterdayLog = await ctx.db
        .query("dailyLog")
        // @ts-ignore
        .withIndex("by_user_date", (q) =>
          q.eq("userId", userId).eq("date", yesterdayStr)
        )
        .first();

      let wasYesterdayTrue = false;
      if (yesterdayLog?.tracking.customToggles) {
        const yesterdayToggle = yesterdayLog.tracking.customToggles.find(
          (t: any) => t.fieldId === toggle.fieldId
        );
        wasYesterdayTrue = yesterdayToggle?.value === true;
      }

      const currentStreak = wasYesterdayTrue
        ? (field.currentStreak || 0) + 1
        : 1;
      const longestStreak = Math.max(
        currentStreak,
        field.longestStreak || 0
      );

      await ctx.db.patch(toggle.fieldId, {
        currentStreak,
        longestStreak,
      });
    } else {
      // Reset streak
      await ctx.db.patch(toggle.fieldId, {
        currentStreak: 0,
      });
    }
  }
}

// Helper: Update Phone Jail streak (default field)
async function updatePhoneJailStreak(
  ctx: any,
  userId: string,
  currentDate: string,
  phoneJail: boolean
) {
  // Find Phone Jail tracking field
  const phoneJailField = await ctx.db
    .query("trackingFields")
    // @ts-ignore
    .withIndex("by_user", (q) => q.eq("userId", userId))
    // @ts-ignore
    .filter((q) => q.eq(q.field("name"), "Phone Jail"))
    .first();

  if (!phoneJailField || !phoneJailField.hasStreak) return;

  if (phoneJail) {
    // Increment streak
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const yesterdayLog = await ctx.db
      .query("dailyLog")
      // @ts-ignore
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).eq("date", yesterdayStr)
      )
      .first();

    const wasYesterdayTrue = yesterdayLog?.tracking.phoneJail === true;

    const currentStreak = wasYesterdayTrue
      ? (phoneJailField.currentStreak || 0) + 1
      : 1;
    const longestStreak = Math.max(
      currentStreak,
      phoneJailField.longestStreak || 0
    );

    await ctx.db.patch(phoneJailField._id, {
      currentStreak,
      longestStreak,
    });
  } else {
    // Reset streak
    await ctx.db.patch(phoneJailField._id, {
      currentStreak: 0,
    });
  }
}

// Get weekly progress for toggle fields with targets
export const getWeeklyProgress = query({
  args: {
    weekNumber: v.number(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get all tracking fields with weekly targets
    const fields = await ctx.db
      .query("trackingFields")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.neq(q.field("weeklyTarget"), undefined))
      .collect();

    // Get all logs for this week
    const logs = await ctx.db
      .query("dailyLog")
      .withIndex("by_user_week", (q) =>
        q.eq("userId", identity.subject).eq("year", args.year).eq("weekNumber", args.weekNumber)
      )
      .collect();

    // Calculate progress for each field
    const progress = fields.map((field) => {
      let count = 0;

      if (field.name === "Phone Jail") {
        // Count Phone Jail days
        count = logs.filter((log) => log.tracking.phoneJail === true).length;
      } else {
        // Count custom toggle fields
        for (const log of logs) {
          if (log.tracking.customToggles) {
            const toggle = log.tracking.customToggles.find(
              (t) => t.fieldId === field._id
            );
            if (toggle?.value === true) {
              count++;
            }
          }
        }
      }

      return {
        fieldId: field._id,
        fieldName: field.name,
        current: count,
        target: field.weeklyTarget || 0,
        percentage: Math.round(
          (count / (field.weeklyTarget || 1)) * 100
        ),
      };
    });

    return progress;
  },
});
