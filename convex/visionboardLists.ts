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

// Convert default list to a real list (when renaming default list)
export const convertDefaultListToReal = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Create new list at position 0 (first position)
    const listId = await ctx.db.insert("visionboardLists", {
      userId: identity.subject,
      name: args.name,
      position: 0,
      createdAt: new Date().toISOString(),
    });

    // Get all images without listId (default list images)
    const defaultImages = await ctx.db
      .query("visionboard")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.eq(q.field("listId"), undefined))
      .collect();

    // Move all default list images to the new list
    for (const image of defaultImages) {
      await ctx.db.patch(image._id, {
        listId: listId,
      });
    }

    // Update positions of all other lists
    const otherLists = await ctx.db
      .query("visionboardLists")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    for (const list of otherLists) {
      if (list._id !== listId) {
        await ctx.db.patch(list._id, {
          position: list.position + 1,
        });
      }
    }

    return listId;
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
