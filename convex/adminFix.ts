import { internalMutation, action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Admin-only mutation to fix tracking fields without requiring auth
export const fixAllTrackingFields = internalMutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const defaultFieldNames = [
      "Movement",
      "Phone Jail",
      "Vibes",
      "Breakfast",
      "Lunch",
      "Dinner",
      "Work Hours",
      "Work Notes",
    ];

    // Get all fields for this user
    const fields = await ctx.db
      .query("trackingFields")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const results = {
      totalFields: fields.length,
      fixed: 0,
      deleted: 0,
      duplicatesRemoved: [] as string[],
      fieldsFixed: [] as string[],
      details: [] as Array<{ name: string; wasDefault: boolean; nowDefault: boolean }>,
    };

    // Group fields by name to find duplicates
    const fieldsByName = new Map<string, typeof fields>();
    for (const field of fields) {
      const existing = fieldsByName.get(field.name);
      if (!existing) {
        fieldsByName.set(field.name, [field]);
      } else {
        existing.push(field);
      }
    }

    // Process each field group
    for (const [name, fieldsWithName] of Array.from(fieldsByName.entries())) {
      const isDefaultField = defaultFieldNames.includes(name);

      if (fieldsWithName.length > 1) {
        // Handle duplicates - keep the oldest one, delete the rest
        const sorted = fieldsWithName.sort((a, b) => a._creationTime - b._creationTime);
        const keepField = sorted[0];
        const deleteFields = sorted.slice(1);

        // Fix the isDefault flag on the kept field
        if (keepField.isDefault !== isDefaultField) {
          await ctx.db.patch(keepField._id, { isDefault: isDefaultField });
          results.fixed++;
          results.fieldsFixed.push(name);
          results.details.push({
            name,
            wasDefault: keepField.isDefault,
            nowDefault: isDefaultField,
          });
        }

        // Delete duplicates
        for (const field of deleteFields) {
          await ctx.db.delete(field._id);
          results.deleted++;
          results.duplicatesRemoved.push(name);
        }
      } else {
        // Single field - just fix isDefault if needed
        const field = fieldsWithName[0];
        if (field.isDefault !== isDefaultField) {
          await ctx.db.patch(field._id, { isDefault: isDefaultField });
          results.fixed++;
          results.fieldsFixed.push(name);
          results.details.push({
            name,
            wasDefault: field.isDefault,
            nowDefault: isDefaultField,
          });
        }
      }
    }

    return results;
  },
});

// Public action wrapper to call the internal mutation
export const runFix = action({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    return await ctx.runMutation(internal.adminFix.fixAllTrackingFields, {
      userId: args.userId,
    });
  },
});

// Admin function to create a test custom field
export const createTestField = internalMutation({
  args: {
    userId: v.string(),
    name: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    // Get current max order
    const fields = await ctx.db
      .query("trackingFields")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const maxOrder = fields.length > 0
      ? Math.max(...fields.map(f => f.order))
      : -1;

    const now = new Date().toISOString();

    const fieldId = await ctx.db.insert("trackingFields", {
      userId: args.userId,
      name: args.name,
      type: args.type,
      hasStreak: false,
      isDefault: false, // IMPORTANT: Custom fields must have isDefault: false
      isActive: true,
      order: maxOrder + 1,
      createdAt: now,
    });

    return { fieldId, message: `Created custom field: ${args.name}` };
  },
});

// Action wrapper for createTestField
export const createTestFieldAction = action({
  args: {
    userId: v.string(),
    name: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    return await ctx.runMutation(internal.adminFix.createTestField, {
      userId: args.userId,
      name: args.name,
      type: args.type,
    });
  },
});

// Admin function to remove leading numbers from category names
export const fixCategoryNames = internalMutation({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("habitCategories").collect();

    let updated = 0;
    const changes: Array<{ old: string; new: string }> = [];

    for (const category of categories) {
      // Remove leading numbers and dots/spaces (e.g., "1. Plan day" -> "Plan day")
      const cleanName = category.name.replace(/^\d+\.\s*/, "").trim();

      if (cleanName !== category.name) {
        await ctx.db.patch(category._id, {
          name: cleanName,
          updatedAt: new Date().toISOString(),
        });
        changes.push({ old: category.name, new: cleanName });
        updated++;
      }
    }

    return {
      message: `Updated ${updated} category names`,
      total: categories.length,
      changes
    };
  },
});

// Action wrapper for fixCategoryNames
export const fixCategoryNamesAction = action({
  args: {},
  handler: async (ctx): Promise<any> => {
    return await ctx.runMutation(internal.adminFix.fixCategoryNames);
  },
});

// Migrate North Stars from string to array format
export const migrateNorthStars = action({
  args: {},
  handler: async (ctx): Promise<any> => {
    return await ctx.runMutation(internal.adminFix.migrateNorthStarsInternal);
  },
});

export const migrateNorthStarsInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
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
