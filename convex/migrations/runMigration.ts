import { mutation } from "../_generated/server";

/**
 * Public mutation to migrate North Stars from string to array format
 * Run this once: npx convex run migrations/runMigration:migrateNorthStars
 */
export const migrateNorthStars = mutation({
  args: {},
  handler: async (ctx) => {
    // Don't require auth for this migration

    // Migrate User Profiles
    const profiles = await ctx.db.query("userProfile").collect();
    let profilesMigrated = 0;
    let profilesSkipped = 0;

    for (const profile of profiles) {
      // Check if already migrated (northStars.wealth is an array)
      const isAlreadyArray = Array.isArray(profile.northStars.wealth);

      if (isAlreadyArray) {
        profilesSkipped++;
        continue;
      }

      // Migrate from string to array
      const migratedNorthStars = {
        wealth: [(profile.northStars.wealth as any) as string],
        health: [(profile.northStars.health as any) as string],
        love: [(profile.northStars.love as any) as string],
        happiness: [(profile.northStars.happiness as any) as string],
      };

      await ctx.db.patch(profile._id, {
        northStars: migratedNorthStars,
        updatedAt: new Date().toISOString(),
      });

      profilesMigrated++;
    }

    // Migrate Annual Reviews
    const reviews = await ctx.db.query("annualReview").collect();
    let reviewsMigrated = 0;
    let reviewsSkipped = 0;

    for (const review of reviews) {
      // Check if already migrated
      const isAlreadyArray = Array.isArray(
        review.responses.nextYearNorthStars.wealth
      );

      if (isAlreadyArray) {
        reviewsSkipped++;
        continue;
      }

      // Migrate nextYearNorthStars from string to array
      const migratedNextYearNorthStars = {
        wealth: [(review.responses.nextYearNorthStars.wealth as any) as string],
        health: [(review.responses.nextYearNorthStars.health as any) as string],
        love: [(review.responses.nextYearNorthStars.love as any) as string],
        happiness: [
          (review.responses.nextYearNorthStars.happiness as any) as string,
        ],
      };

      await ctx.db.patch(review._id, {
        responses: {
          ...review.responses,
          nextYearNorthStars: migratedNextYearNorthStars,
        },
      });

      reviewsMigrated++;
    }

    return {
      success: true,
      profiles: {
        migrated: profilesMigrated,
        skipped: profilesSkipped,
        total: profiles.length,
      },
      reviews: {
        migrated: reviewsMigrated,
        skipped: reviewsSkipped,
        total: reviews.length,
      },
    };
  },
});
