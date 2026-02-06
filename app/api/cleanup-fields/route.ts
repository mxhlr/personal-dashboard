import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export async function POST() {
  try {
    const { getToken } = await auth();
    const token = await getToken({ template: "convex" });

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    convex.setAuth(token);

    const result = await convex.mutation(api.trackingFields.adminCleanupFields, {});

    return NextResponse.json({ success: true, result });
  } catch (error) {
    logger.error("Cleanup error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
