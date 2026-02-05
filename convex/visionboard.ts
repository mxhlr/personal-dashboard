import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate upload URL for image
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

// Add image to visionboard
export const addImage = mutation({
  args: {
    storageId: v.id("_storage"),
    width: v.number(),
    height: v.number(),
    subtitle: v.optional(v.string()),
    listId: v.optional(v.id("visionboardLists")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get current max position for this list
    const query = args.listId
      ? ctx.db
          .query("visionboard")
          .withIndex("by_user_list", (q) =>
            q.eq("userId", identity.subject).eq("listId", args.listId)
          )
      : ctx.db
          .query("visionboard")
          .withIndex("by_user", (q) => q.eq("userId", identity.subject))
          .filter((q) => q.eq(q.field("listId"), undefined));

    const existingImages = await query.collect();

    const maxPosition = existingImages.length > 0
      ? Math.max(...existingImages.map(img => img.position ?? 0))
      : -1;

    const imageId = await ctx.db.insert("visionboard", {
      userId: identity.subject,
      listId: args.listId,
      storageId: args.storageId,
      width: args.width,
      height: args.height,
      subtitle: args.subtitle,
      position: maxPosition + 1,
      createdAt: new Date().toISOString(),
    });

    return imageId;
  },
});

// Get images for a specific list
export const getImagesForList = query({
  args: {
    listId: v.optional(v.id("visionboardLists")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const query = args.listId
      ? ctx.db
          .query("visionboard")
          .withIndex("by_user_list", (q) =>
            q.eq("userId", identity.subject).eq("listId", args.listId)
          )
      : ctx.db
          .query("visionboard")
          .withIndex("by_user", (q) => q.eq("userId", identity.subject))
          .filter((q) => q.eq(q.field("listId"), undefined));

    const images = await query.collect();

    // Sort by position
    const sortedImages = images.sort((a, b) => {
      const posA = a.position ?? 999999;
      const posB = b.position ?? 999999;
      return posA - posB;
    });

    // Get URLs for all images
    const imagesWithUrls = await Promise.all(
      sortedImages.map(async (image) => {
        const url = await ctx.storage.getUrl(image.storageId);
        return {
          _id: image._id,
          url: url || "",
          subtitle: image.subtitle,
          width: image.width ?? 800,
          height: image.height ?? 600,
          position: image.position ?? 0,
          listId: image.listId,
          createdAt: image.createdAt,
        };
      })
    );

    return imagesWithUrls;
  },
});

// Update subtitle for an image
export const updateSubtitle = mutation({
  args: {
    imageId: v.id("visionboard"),
    subtitle: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const image = await ctx.db.get(args.imageId);
    if (!image) {
      throw new Error("Image not found");
    }

    if (image.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.imageId, {
      subtitle: args.subtitle,
    });
  },
});

// Reorder images (update positions after drag & drop)
export const reorderImages = mutation({
  args: {
    imageIds: v.array(v.id("visionboard")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Update position for each image
    await Promise.all(
      args.imageIds.map(async (imageId, index) => {
        const image = await ctx.db.get(imageId);
        if (!image || image.userId !== identity.subject) {
          return;
        }
        await ctx.db.patch(imageId, { position: index });
      })
    );
  },
});

// Move image to a different list
export const moveImageToList = mutation({
  args: {
    imageId: v.id("visionboard"),
    targetListId: v.optional(v.id("visionboardLists")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const image = await ctx.db.get(args.imageId);
    if (!image || image.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    // Get max position in target list
    const query = args.targetListId
      ? ctx.db
          .query("visionboard")
          .withIndex("by_user_list", (q) =>
            q.eq("userId", identity.subject).eq("listId", args.targetListId)
          )
      : ctx.db
          .query("visionboard")
          .withIndex("by_user", (q) => q.eq("userId", identity.subject))
          .filter((q) => q.eq(q.field("listId"), undefined));

    const targetListImages = await query.collect();
    const maxPosition = targetListImages.length > 0
      ? Math.max(...targetListImages.map(img => img.position ?? 0))
      : -1;

    // Move image to target list with new position
    await ctx.db.patch(args.imageId, {
      listId: args.targetListId,
      position: maxPosition + 1,
    });
  },
});

// Get all images from all lists (for dashboard preview)
export const getAllImages = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get all images for this user, regardless of list
    const images = await ctx.db
      .query("visionboard")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    // Sort by createdAt (newest first) to show most recent images
    const sortedImages = images.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    // Get URLs for all images
    const imagesWithUrls = await Promise.all(
      sortedImages.map(async (image) => {
        const url = await ctx.storage.getUrl(image.storageId);
        return {
          _id: image._id,
          url: url || "",
          subtitle: image.subtitle,
          width: image.width ?? 800,
          height: image.height ?? 600,
          position: image.position ?? 0,
          listId: image.listId,
          createdAt: image.createdAt,
        };
      })
    );

    return imagesWithUrls;
  },
});

// Delete image from visionboard
export const deleteImage = mutation({
  args: {
    imageId: v.id("visionboard"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const image = await ctx.db.get(args.imageId);
    if (!image) {
      throw new Error("Image not found");
    }

    if (image.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    // Delete from storage
    await ctx.storage.delete(image.storageId);

    // Delete from database
    await ctx.db.delete(args.imageId);
  },
});
