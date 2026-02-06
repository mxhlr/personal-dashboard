import { internalMutation } from "../_generated/server";

/**
 * Migration: Add totalWins to existing userStats
 * Run this once to initialize totalWins for all existing users
 */
export const addTotalWinsToExistingUsers = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Get all userStats
    const allStats = await ctx.db.query("userStats").collect();

    console.log(`Found ${allStats.length} userStats to update`);

    let updated = 0;
    for (const stats of allStats) {
      // Only update if totalWins is missing
      if (stats.totalWins === undefined) {
        // Calculate totalWins from existing dailyHabits
        const allHabits = await ctx.db
          .query("dailyHabits")
          .withIndex("by_user_date", (q) => q.eq("userId", stats.userId))
          .collect();

        const completedHabits = allHabits.filter((h) => h.completed);
        const totalWins = completedHabits.length;

        await ctx.db.patch(stats._id, {
          totalWins,
        });

        updated++;
        console.log(`Updated user ${stats.userId}: totalWins = ${totalWins}`);
      }
    }

    console.log(`Migration complete. Updated ${updated} users.`);
    return { total: allStats.length, updated };
  },
});
