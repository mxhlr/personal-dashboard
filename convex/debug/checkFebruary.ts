import { internalQuery } from "../_generated/server";

export const checkFebruaryData = internalQuery({
  args: {},
  handler: async (ctx) => {
    // Get all users (for testing, we'll just get the first one)
    const allStats = await ctx.db.query("userStats").collect();
    if (allStats.length === 0) {
      return { error: "No users found" };
    }

    const userId = allStats[0].userId;

    const allDailyHabits = await ctx.db
      .query("dailyHabits")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .collect();

    const februaryHabits = allDailyHabits.filter((h) => {
      const [y, m] = h.date.split("-").map(Number);
      return y === 2026 && m === 2;
    });

    const dateGroups: Record<string, typeof allDailyHabits> = {};
    februaryHabits.forEach((habit) => {
      if (!dateGroups[habit.date]) {
        dateGroups[habit.date] = [];
      }
      dateGroups[habit.date].push(habit);
    });

    const templates = await ctx.db
      .query("habitTemplates")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const totalPossibleXP = templates.reduce((sum, t) => sum + t.xpValue, 0);

    const result = {
      totalPossibleXP,
      days: [] as Array<{ date: string; completedXP: number; totalXP: number; score: number; habitsCount: number; completedCount: number }>,
      avgScore: 0,
    };

    const dailyScores: number[] = [];
    Object.entries(dateGroups).forEach(([date, habits]) => {
      const completedXP = habits.reduce((sum, h) => sum + (h.completed ? h.xpEarned : 0), 0);
      const score = totalPossibleXP > 0 ? (completedXP / totalPossibleXP) * 100 : 0;

      result.days.push({
        date,
        completedXP,
        totalXP: totalPossibleXP,
        score,
        habitsCount: habits.length,
        completedCount: habits.filter(h => h.completed).length,
      });

      dailyScores.push(score);
    });

    result.avgScore = dailyScores.length > 0
      ? dailyScores.reduce((sum, s) => sum + s, 0) / dailyScores.length
      : 0;

    return result;
  },
});
