import { internalMutation } from "../_generated/server";

/**
 * One-time migration to remove leading numbers from category names
 * Run with: npx convex run migrations/fixCategoryNames:run
 */
export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("habitCategories").collect();

    let updated = 0;
    const changes: Array<{ old: string; new: string }> = [];
    const currentNames: Array<{ name: string; icon: string }> = [];

    for (const category of categories) {
      currentNames.push({
        name: category.name,
        icon: category.icon,
      });

      // Remove leading numbers and dots/spaces (e.g., "1. Plan day" -> "Plan day")
      const cleanName = category.name.replace(/^\d+\.\s*/, "").trim();

      if (cleanName !== category.name && cleanName.length > 0) {
        await ctx.db.patch(category._id, {
          name: cleanName,
          updatedAt: new Date().toISOString(),
        });
        changes.push({ old: category.name, new: cleanName });
        updated++;
      }
    }

    return {
      success: true,
      message: `Updated ${updated} category names`,
      total: categories.length,
      currentNames,
      changes,
    };
  },
});
