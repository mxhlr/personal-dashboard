"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HabitItem } from "./HabitItem";
import { ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface Habit {
  id: string;
  name: string;
  subtitle?: string;
  xp: number;
  completed: boolean;
  completedAt?: string;
  isExtra?: boolean;
}

interface HabitCategoryProps {
  icon: string;
  name: string;
  habits: Habit[];
  categoryNumber: number;
  onHabitToggle: (categoryId: string, habitId: string) => void;
  onHabitSkip: (categoryId: string, habitId: string, reason: string) => void;
}

export function HabitCategory({
  icon,
  name,
  habits,
  categoryNumber,
  onHabitToggle,
  onHabitSkip,
}: HabitCategoryProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const coreHabits = habits.filter((h) => !h.isExtra);
  const extraHabits = habits.filter((h) => h.isExtra);
  const completedCore = coreHabits.filter((h) => h.completed).length;
  const completedExtra = extraHabits.filter((h) => h.completed).length;
  const completedTotal = habits.filter((h) => h.completed).length;
  const totalXP = habits.reduce((sum, h) => sum + (h.completed ? h.xp : 0), 0);
  const maxXP = habits.reduce((sum, h) => sum + h.xp, 0);
  const progress = maxXP > 0 ? (totalXP / maxXP) * 100 : 0;
  const isComplete = completedTotal === habits.length;
  const coreComplete = completedCore === coreHabits.length && coreHabits.length > 0;

  // Check if icon is a hex color (starts with #) or an emoji
  const isColor = icon?.startsWith("#");
  const categoryColor = isColor ? icon : "#888888";

  // Helper to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Skip color tint if gray is selected
  const isGray = categoryColor === "#888888";
  const bgColor = isGray ? undefined : hexToRgba(categoryColor, 0.06);
  const bgColorLight = isGray ? undefined : hexToRgba(categoryColor, 0.04);
  const borderColor = isGray ? undefined : hexToRgba(categoryColor, 0.15);
  const borderColorLight = isGray ? undefined : hexToRgba(categoryColor, 0.1);

  const handleToggle = (habitId: string) => {
    onHabitToggle(name, habitId);

    const habit = habits.find((h) => h.id === habitId);
    if (habit && !habit.completed) {
      const newCompletedTotal = completedTotal + 1;
      if (newCompletedTotal === habits.length) {
        toast.success(`✓ ${name} complete!`, {
          position: "top-center",
          duration: 2000,
        });
      }
    }
  };

  return (
    <Card
      className="group dark:border-border/50 border-border/30 dark:bg-card/50 bg-white/80 shadow-sm transition-colors dark:hover:border-border hover:border-border/50"
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        // Light mode overrides via CSS variable if needed
        ...(bgColorLight && { '--bg-light': bgColorLight } as React.CSSProperties),
        ...(borderColorLight && { '--border-light': borderColorLight } as React.CSSProperties),
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 text-left"
          >
            <span className="text-lg font-bold dark:text-[#E0E0E0] text-[#333333]">
              {categoryNumber}
            </span>
            <div>
              <h3 className="text-base font-semibold">{name}</h3>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[13px] dark:text-[#888888] text-[#666666]">
              {completedTotal}/{habits.length}
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[10px] dark:text-[#666666] text-[#999999]"
            >
              {isExpanded ? "▼" : "▶"}
            </button>
          </div>
        </div>
        <Progress
          value={progress}
          className="mt-3 h-2 dark:bg-[#2A2A2E] bg-[#E5E5E5]"
          indicatorClassName={isComplete ? "bg-[#00FF88]" : "bg-[#00E5FF]"}
        />
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 pt-0">
          {/* Core Habits Section */}
          {coreHabits.length > 0 && (
            <div className="space-y-0 divide-y dark:divide-white/[0.06] divide-black/[0.06]">
              {coreHabits.map((habit) => (
                <HabitItem
                  key={habit.id}
                  {...habit}
                  onToggle={handleToggle}
                  onSkip={(id, reason) => onHabitSkip(name, id, reason)}
                />
              ))}
            </div>
          )}

          {/* Extra Habits Collapse Section */}
          {extraHabits.length > 0 && (
            <div className="space-y-0 border-t dark:border-white/[0.06] border-black/[0.06] pt-4">
              {!coreComplete ? (
                <div className="flex w-full items-center gap-2 px-1 py-2 text-xs opacity-60">
                  <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                  <span className="text-muted-foreground/60">
                    Complete core to unlock
                  </span>
                  <div className="flex-1" />
                  <span className="text-[13px] dark:text-[#555555] text-[#999999]">
                    {completedExtra}/{extraHabits.length}
                  </span>
                </div>
              ) : (
                <div className="space-y-0 rounded-lg border dark:border-[#00E5FF]/30 border-[#00E5FF]/20 dark:bg-[rgba(0,229,255,0.03)] bg-[rgba(0,180,220,0.04)] p-3">
                  <div className="flex w-full items-center gap-2 px-1 py-2 text-xs">
                    <ChevronDown className="h-3 w-3 text-cyan-500" />
                    <span className="text-cyan-600 dark:text-cyan-400 font-medium">
                      Extras unlocked
                    </span>
                    <div className="flex-1" />
                    <span className="text-[13px] dark:text-[#555555] text-[#999999]">
                      {completedExtra}/{extraHabits.length}
                    </span>
                  </div>

                  {/* Extra Habits List - always shown when unlocked */}
                  <div className="space-y-0 divide-y dark:divide-white/[0.06] divide-black/[0.06]">
                    {extraHabits.map((habit) => (
                      <HabitItem
                        key={habit.id}
                        {...habit}
                        onToggle={handleToggle}
                        onSkip={(id, reason) => onHabitSkip(name, id, reason)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
