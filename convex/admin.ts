import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Force complete setup for user (emergency fix)
export const forceCompleteSetup = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    mainProject: v.string(),
    northStars: v.object({
      wealth: v.string(),
      health: v.string(),
      love: v.string(),
      happiness: v.string(),
    }),
    coachTone: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = new Date().toISOString();

    // Check if profile exists
    const existingProfile = await ctx.db
      .query("userProfile")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (existingProfile) {
      // Update existing profile
      await ctx.db.patch(existingProfile._id, {
        name: args.name,
        role: args.role,
        mainProject: args.mainProject,
        northStars: args.northStars,
        coachTone: args.coachTone,
        setupCompleted: true,
        updatedAt: now,
      });
      return { created: false, profileId: existingProfile._id };
    }

    // Create new profile
    const profileId = await ctx.db.insert("userProfile", {
      userId: identity.subject,
      name: args.name,
      role: args.role,
      mainProject: args.mainProject,
      northStars: args.northStars,
      quarterlyMilestones: [],
      coachTone: args.coachTone,
      setupCompleted: true,
      setupDate: now,
      createdAt: now,
      updatedAt: now,
    });

    return { created: true, profileId };
  },
});
