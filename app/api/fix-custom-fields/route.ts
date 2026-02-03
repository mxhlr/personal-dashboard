import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export async function POST() {
  try {
    const { getToken } = await auth();

    // Get the Clerk JWT token for Convex authentication
    const token = await getToken({ template: "convex" });

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Create authenticated Convex client
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    convex.setAuth(token);

    // Call the fixCustomFields mutation
    const result = await convex.mutation(api.trackingFields.fixCustomFields, {});

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Fix custom fields error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
