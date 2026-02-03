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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const imageId = await ctx.db.insert("visionboard", {
      userId: identity.subject,
      storageId: args.storageId,
      createdAt: new Date().toISOString(),
    });

    return imageId;
  },
});

// Get all visionboard images for user
export const getVisionboardImages = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const images = await ctx.db
      .query("visionboard")
      .withIndex("by_user_created", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    // Get URLs for all images
    const imagesWithUrls = await Promise.all(
      images.map(async (image) => {
        const url = await ctx.storage.getUrl(image.storageId);
        return {
          _id: image._id,
          url: url || "",
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
