import { query } from "./_generated/server";

/**
 * Debug query to check authentication and profile status
 */
export const checkAuthAndProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return {
        authenticated: false,
        error: "No identity found - user not authenticated",
      };
    }

    const profile = await ctx.db
      .query("userProfile")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    return {
      authenticated: true,
      userId: identity.subject,
      userEmail: identity.email,
      userName: identity.name,
      profileExists: !!profile,
      setupCompleted: profile?.setupCompleted ?? false,
      profileData: profile ? {
        _id: profile._id,
        name: profile.name,
        setupCompleted: profile.setupCompleted,
        setupDate: profile.setupDate,
        createdAt: profile.createdAt,
      } : null,
    };
  },
});
