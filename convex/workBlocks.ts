import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * List all work blocks for the authenticated user, sorted by order
 */
export const listWorkBlocks = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const blocks = await ctx.db
      .query("workBlocks")
      .withIndex("by_user_order", (q) => q.eq("userId", identity.subject))
      .order("asc")
      .collect();

    return blocks;
  },
});

/**
 * Create a new work block
 */
export const createWorkBlock = mutation({
  args: {
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get the current highest order number for this user
    const existingBlocks = await ctx.db
      .query("workBlocks")
      .withIndex("by_user_order", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(1);

    const nextOrder = existingBlocks.length > 0 ? existingBlocks[0].order + 1 : 0;

    const blockId = await ctx.db.insert("workBlocks", {
      userId: identity.subject,
      name: args.name,
      color: args.color,
      order: nextOrder,
      createdAt: new Date().toISOString(),
    });

    return blockId;
  },
});

/**
 * Update a work block's name and/or color
 */
export const updateWorkBlock = mutation({
  args: {
    blockId: v.id("workBlocks"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Verify the block belongs to the user
    const block = await ctx.db.get(args.blockId);
    if (!block) throw new Error("Work block not found");
    if (block.userId !== identity.subject) throw new Error("Unauthorized");

    // Build update object with only provided fields
    const updates: {
      name?: string;
      color?: string;
    } = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.color !== undefined) updates.color = args.color;

    await ctx.db.patch(args.blockId, updates);
    return args.blockId;
  },
});

/**
 * Delete a work block (only if no sessions exist)
 */
export const deleteWorkBlock = mutation({
  args: {
    blockId: v.id("workBlocks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Verify the block belongs to the user
    const block = await ctx.db.get(args.blockId);
    if (!block) throw new Error("Work block not found");
    if (block.userId !== identity.subject) throw new Error("Unauthorized");

    // Check if any sessions exist for this block
    const sessions = await ctx.db
      .query("blockTimeSessions")
      .withIndex("by_block", (q) => q.eq("blockId", args.blockId))
      .take(1);

    if (sessions.length > 0) {
      throw new Error("Cannot delete work block with existing time sessions");
    }

    await ctx.db.delete(args.blockId);
    return null;
  },
});

/**
 * Reorder work blocks
 */
export const reorderWorkBlocks = mutation({
  args: {
    blockOrders: v.array(
      v.object({
        blockId: v.id("workBlocks"),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Verify all blocks belong to the user and update their order
    for (const { blockId, order } of args.blockOrders) {
      const block = await ctx.db.get(blockId);
      if (!block) throw new Error(`Work block ${blockId} not found`);
      if (block.userId !== identity.subject) throw new Error("Unauthorized");

      await ctx.db.patch(blockId, { order });
    }

    return null;
  },
});

/**
 * Start a new timer session for a work block
 * Automatically stops any currently running timer
 */
export const startBlockTimer = mutation({
  args: {
    blockId: v.id("workBlocks"),
    date: v.string(), // "YYYY-MM-DD"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Verify the block belongs to the user
    const block = await ctx.db.get(args.blockId);
    if (!block) throw new Error("Work block not found");
    if (block.userId !== identity.subject) throw new Error("Unauthorized");

    // Check if there's a running timer (completedAt is null)
    const runningSession = await ctx.db
      .query("blockTimeSessions")
      .withIndex("by_user_running", (q) =>
        q.eq("userId", identity.subject).eq("completedAt", undefined)
      )
      .first();

    // If there's a running timer, stop it first
    if (runningSession) {
      const completedAt = new Date().toISOString();
      const startTime = new Date(runningSession.startedAt).getTime();
      const endTime = new Date(completedAt).getTime();
      const durationMinutes = Math.floor((endTime - startTime) / (1000 * 60));

      await ctx.db.patch(runningSession._id, {
        completedAt,
        durationMinutes,
      });
    }

    // Start new timer session
    const now = new Date().toISOString();
    const sessionId = await ctx.db.insert("blockTimeSessions", {
      userId: identity.subject,
      date: args.date,
      blockId: args.blockId,
      durationMinutes: 0,
      startedAt: now,
      createdAt: now,
    });

    return sessionId;
  },
});

/**
 * Stop the currently running timer
 */
export const stopBlockTimer = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Find the running session (completedAt is null)
    const runningSession = await ctx.db
      .query("blockTimeSessions")
      .withIndex("by_user_running", (q) =>
        q.eq("userId", identity.subject).eq("completedAt", undefined)
      )
      .first();

    if (!runningSession) {
      throw new Error("No running timer found");
    }

    // Calculate duration and stop the timer
    const completedAt = new Date().toISOString();
    const startTime = new Date(runningSession.startedAt).getTime();
    const endTime = new Date(completedAt).getTime();
    const durationMinutes = Math.floor((endTime - startTime) / (1000 * 60));

    await ctx.db.patch(runningSession._id, {
      completedAt,
      durationMinutes,
    });

    return runningSession._id;
  },
});

/**
 * Get the currently running timer with block information
 */
export const getCurrentTimer = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Find the running session (completedAt is null)
    const runningSession = await ctx.db
      .query("blockTimeSessions")
      .withIndex("by_user_running", (q) =>
        q.eq("userId", identity.subject).eq("completedAt", undefined)
      )
      .first();

    if (!runningSession) {
      return null;
    }

    // Get the block information
    const block = await ctx.db.get(runningSession.blockId);
    if (!block) throw new Error("Work block not found");

    return {
      sessionId: runningSession._id,
      blockId: block._id,
      blockName: block.name,
      blockColor: block.color,
      startedAt: runningSession.startedAt,
      date: runningSession.date,
    };
  },
});

/**
 * Calculate average duration per block for the authenticated user
 * Only includes completed sessions
 */
export const getAverageBlockTimes = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get all blocks for the user
    const blocks = await ctx.db
      .query("workBlocks")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    // Calculate averages for each block
    const averages = await Promise.all(
      blocks.map(async (block) => {
        // Get all completed sessions for this block
        const sessions = await ctx.db
          .query("blockTimeSessions")
          .withIndex("by_user_block", (q) =>
            q.eq("userId", identity.subject).eq("blockId", block._id)
          )
          .collect();

        // Filter only completed sessions
        const completedSessions = sessions.filter(
          (session) => session.completedAt !== undefined
        );

        if (completedSessions.length === 0) {
          return {
            blockName: block.name,
            blockColor: block.color,
            avgMinutes: 0,
            sessionCount: 0,
          };
        }

        // Calculate average
        const totalMinutes = completedSessions.reduce(
          (sum, session) => sum + session.durationMinutes,
          0
        );
        const avgMinutes = Math.round(totalMinutes / completedSessions.length);

        return {
          blockName: block.name,
          blockColor: block.color,
          avgMinutes,
          sessionCount: completedSessions.length,
        };
      })
    );

    return averages;
  },
});

/**
 * Get all completed sessions for a specific date
 */
export const getSessionsForDate = query({
  args: {
    date: v.string(), // "YYYY-MM-DD"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const sessions = await ctx.db
      .query("blockTimeSessions")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", identity.subject).eq("date", args.date)
      )
      .collect();

    // Enrich with block information
    const enrichedSessions = await Promise.all(
      sessions.map(async (session) => {
        const block = await ctx.db.get(session.blockId);
        if (!block) throw new Error("Work block not found");

        return {
          sessionId: session._id,
          blockId: block._id,
          blockName: block.name,
          blockColor: block.color,
          durationMinutes: session.durationMinutes,
          startedAt: session.startedAt,
          completedAt: session.completedAt,
          isRunning: session.completedAt === undefined,
        };
      })
    );

    return enrichedSessions;
  },
});
