import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get the win condition for a specific date
 */
export const getWinCondition = query({
  args: {
    date: v.string(), // "YYYY-MM-DD"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const winCondition = await ctx.db
      .query("winConditions")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", identity.subject).eq("date", args.date)
      )
      .first();

    return winCondition;
  },
});

/**
 * Save or update the win condition for a specific date
 */
export const saveWinCondition = mutation({
  args: {
    date: v.string(), // "YYYY-MM-DD"
    winCondition: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Check if win condition already exists for this date
    const existing = await ctx.db
      .query("winConditions")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", identity.subject).eq("date", args.date)
      )
      .first();

    const now = new Date().toISOString();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        winCondition: args.winCondition,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new
      return await ctx.db.insert("winConditions", {
        userId: identity.subject,
        date: args.date,
        winCondition: args.winCondition,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});
