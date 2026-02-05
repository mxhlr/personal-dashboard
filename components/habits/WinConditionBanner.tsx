"use client";

import { Input } from "@/components/ui/input";

export function WinConditionBanner() {
  return (
    <div className="relative overflow-hidden rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-950/20 via-purple-900/10 to-purple-950/20 dark:from-purple-950/20 dark:via-purple-900/10 dark:to-purple-950/20 bg-purple-50 p-6 shadow-lg backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5" />
      <div className="relative space-y-3">
        <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
          Win Condition
        </h3>
        <Input
          placeholder="What's the ONE thing you want to accomplish today?"
          className="border-purple-500/30 bg-white dark:bg-black/40 text-base placeholder:text-muted-foreground/60 focus:border-purple-500/50 focus:ring-purple-500/20"
        />
      </div>
    </div>
  );
}
