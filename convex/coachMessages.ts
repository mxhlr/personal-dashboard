import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// Get all coach messages for current user
export const getMessages = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const messages = await ctx.db
      .query("coachMessages")
      .withIndex("by_user_timestamp", (q) => q.eq("userId", identity.subject))
      .order("asc")
      .collect();

    return messages;
  },
});

// Add a user message
export const addUserMessage = mutation({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const timestamp = new Date().toISOString();

    const messageId = await ctx.db.insert("coachMessages", {
      userId: identity.subject,
      role: "user",
      content: args.content,
      timestamp,
    });

    return messageId;
  },
});

// Add an assistant message
export const addAssistantMessage = mutation({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const timestamp = new Date().toISOString();

    const messageId = await ctx.db.insert("coachMessages", {
      userId: identity.subject,
      role: "assistant",
      content: args.content,
      timestamp,
    });

    return messageId;
  },
});

// Get user context for AI coach
export const getUserContext = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user profile
    const profile = await ctx.db
      .query("userProfile")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!profile) {
      return null;
    }

    // Get recent daily logs (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

    const recentLogs = await ctx.db
      .query("dailyLog")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.gte(q.field("date"), sevenDaysAgoStr))
      .collect();

    // Get tracking fields for context
    const trackingFields = await ctx.db
      .query("trackingFields")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    return {
      profile: {
        name: profile.name,
        role: profile.role,
        mainProject: profile.mainProject,
        northStars: profile.northStars,
        quarterlyMilestones: profile.quarterlyMilestones,
        coachTone: profile.coachTone,
      },
      recentLogs: recentLogs.map((log) => ({
        date: log.date,
        completed: log.completed,
        wellbeing: log.wellbeing,
        tracking: log.tracking,
      })),
      trackingFields: trackingFields.map((field) => ({
        name: field.name,
        type: field.type,
        hasStreak: field.hasStreak,
        currentStreak: field.currentStreak,
        longestStreak: field.longestStreak,
        weeklyTarget: field.weeklyTarget,
      })),
    };
  },
});

// Action to call Claude API
export const sendMessage = action({
  args: {
    userMessage: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user context
    const userContext = await ctx.runQuery(api.coachMessages.getUserContext);

    if (!userContext) {
      throw new Error("User profile not found");
    }

    // Build system prompt based on coach tone and user data
    const systemPrompt = buildSystemPrompt(userContext);

    // Get conversation history
    const messages = await ctx.runQuery(api.coachMessages.getMessages);

    // Build messages array for Claude API
    const apiMessages = messages
      .slice(-10) // Last 10 messages for context
      .map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

    // Add current user message
    apiMessages.push({
      role: "user",
      content: args.userMessage,
    });

    // Call Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: systemPrompt,
        messages: apiMessages,
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const assistantMessage = data.content[0].text;

    // Save user message
    await ctx.runMutation(api.coachMessages.addUserMessage, {
      content: args.userMessage,
    });

    // Save assistant message
    await ctx.runMutation(api.coachMessages.addAssistantMessage, {
      content: assistantMessage,
    });

    return assistantMessage;
  },
});

// Helper function to build system prompt
function buildSystemPrompt(userContext: any): string {
  const { profile, recentLogs, trackingFields } = userContext;

  let toneInstruction = "";
  switch (profile.coachTone) {
    case "Motivierend":
      toneInstruction =
        "Sei motivierend, ermutigend und enthusiastisch. Feiere Erfolge und pushe den User zu mehr.";
      break;
    case "Sachlich":
      toneInstruction =
        "Sei sachlich, datengetrieben und analytisch. Fokussiere auf Fakten und objektive Beobachtungen.";
      break;
    case "Empathisch":
      toneInstruction =
        "Sei empathisch, verständnisvoll und supportive. Zeige Mitgefühl und höre aktiv zu.";
      break;
    case "Direkt":
      toneInstruction =
        "Sei direkt, ehrlich und ohne Umschweife. Sage klar was Sache ist, auch wenn es unbequem ist.";
      break;
    default:
      toneInstruction = "Sei direkt und ehrlich.";
  }

  const prompt = `Du bist ein Personal Coach für ${profile.name}, ${profile.role}.

**Deine Aufgabe:**
- Helfe ${profile.name} dabei, ihre/seine Ziele zu erreichen
- Gib konstruktives Feedback basierend auf den Tracking-Daten
- Stelle hilfreiche Fragen, die zur Reflexion anregen
- Erkenne Muster und weise darauf hin
- Feiere Erfolge und Streaks

**Ton & Stil:**
${toneInstruction}
Nutze die Du-Form. Sei authentisch und menschlich. Halte Antworten prägnant (2-4 Sätze, max. 100 Wörter).

**Kontext zum User:**
- Name: ${profile.name}
- Rolle: ${profile.role}
- Hauptprojekt: ${profile.mainProject}

**North Stars (Jahresziele):**
- 💰 WEALTH: ${profile.northStars.wealth}
- 🏃 HEALTH: ${profile.northStars.health}
- ❤️ LOVE: ${profile.northStars.love}
- 😊 HAPPINESS: ${profile.northStars.happiness}

**Aktuelle Milestones (dieses Quartal):**
${profile.quarterlyMilestones
  .slice(0, 4)
  .map((m: any) => `- ${m.area.toUpperCase()}: ${m.milestone}`)
  .join("\n")}

**Tracking Fields & Streaks:**
${trackingFields
  .filter((f: any) => f.hasStreak)
  .map(
    (f: any) =>
      `- ${f.name}: Current Streak ${f.currentStreak || 0}, Longest ${f.longestStreak || 0}`
  )
  .join("\n")}

**Letzte 7 Tage:**
${recentLogs
  .map((log: any) => {
    const wellbeing = log.wellbeing
      ? `Energy: ${log.wellbeing.energy}, Satisfaction: ${log.wellbeing.satisfaction}, Stress: ${log.wellbeing.stress}`
      : "Keine Wellbeing Daten";
    return `- ${log.date}: ${log.completed ? "✓" : "○"} | ${wellbeing}`;
  })
  .join("\n")}

**Wichtig:**
- Beziehe dich auf konkrete Daten wenn möglich
- Stelle 1-2 spezifische Fragen statt nur Ratschläge zu geben
- Erkenne Trends (z.B. sinkende Energy, gute Streaks)
- Vermeide generische Phrasen wie "Toll gemacht!" ohne Kontext`;

  return prompt;
}

// Clear all messages (for testing/reset)
export const clearMessages = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const messages = await ctx.db
      .query("coachMessages")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    return { deleted: messages.length };
  },
});
