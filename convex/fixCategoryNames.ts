import { internalMutation } from "./_generated/server";

/**
 * Remove leading numbers from category names
 * This is a one-time fix to clean up category names like "1. Plan day" -> "Plan day"
 */
export const fixCategoryNames = internalMutation({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("habitCategories").collect();

    let updated = 0;

    for (const category of categories) {
      // Remove leading numbers and dots/spaces (e.g., "1. Plan day" -> "Plan day")
      const cleanName = category.name.replace(/^\d+\.\s*/, "").trim();

      if (cleanName !== category.name) {
        await ctx.db.patch(category._id, {
          name: cleanName,
          updatedAt: new Date().toISOString(),
        });
        console.log(`Updated: "${category.name}" -> "${cleanName}"`);
        updated++;
      }
    }

    return { message: `Updated ${updated} category names`, total: categories.length };
  },
});
