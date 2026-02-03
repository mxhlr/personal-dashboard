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
