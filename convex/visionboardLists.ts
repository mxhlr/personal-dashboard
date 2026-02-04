import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all lists for user
export const getLists = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const lists = await ctx.db
      .query("visionboardLists")
      .withIndex("by_user_position", (q) => q.eq("userId", identity.subject))
      .order("asc")
      .collect();

    return lists;
  },
});

// Create a new list
export const createList = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get current max position
    const existingLists = await ctx.db
      .query("visionboardLists")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const maxPosition = existingLists.length > 0
      ? Math.max(...existingLists.map(list => list.position))
      : -1;

    const listId = await ctx.db.insert("visionboardLists", {
      userId: identity.subject,
      name: args.name,
      position: maxPosition + 1,
      createdAt: new Date().toISOString(),
    });

    return listId;
  },
});

// Update list name
export const updateListName = mutation({
  args: {
    listId: v.id("visionboardLists"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const list = await ctx.db.get(args.listId);
    if (!list) {
      throw new Error("List not found");
    }

    if (list.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.listId, {
      name: args.name,
    });
  },
});

// Delete a list (and all its images)
export const deleteList = mutation({
  args: {
    listId: v.id("visionboardLists"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const list = await ctx.db.get(args.listId);
    if (!list) {
      throw new Error("List not found");
    }

    if (list.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    // Delete all images in this list
    const images = await ctx.db
      .query("visionboard")
      .withIndex("by_user_list", (q) =>
        q.eq("userId", identity.subject).eq("listId", args.listId)
      )
      .collect();

    for (const image of images) {
      await ctx.storage.delete(image.storageId);
      await ctx.db.delete(image._id);
    }

    // Delete the list
    await ctx.db.delete(args.listId);
  },
});
