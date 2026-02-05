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
  xp: number;
  completed: boolean;
  completedAt?: string;
  isExtra?: boolean;
}

interface HabitCategoryProps {
  icon: string;
  name: string;
  habits: Habit[];
  onHabitToggle: (categoryId: string, habitId: string) => void;
  onHabitSkip: (categoryId: string, habitId: string, reason: string) => void;
}

export function HabitCategory({
  icon,
  name,
  habits,
  onHabitToggle,
  onHabitSkip,
}: HabitCategoryProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const coreHabits = habits.filter((h) => !h.isExtra);
  const extraHabits = habits.filter((h) => h.isExtra);
  const completedCore = coreHabits.filter((h) => h.completed).length;
  const completedTotal = habits.filter((h) => h.completed).length;
  const totalXP = habits.reduce((sum, h) => sum + (h.completed ? h.xp : 0), 0);
  const maxXP = habits.reduce((sum, h) => sum + h.xp, 0);
  const progress = maxXP > 0 ? (totalXP / maxXP) * 100 : 0;
  const isComplete = completedTotal === habits.length;
  const coreComplete = completedCore === coreHabits.length;

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
    <Card className="group border-border/50 bg-card/50 shadow-sm transition-colors hover:border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex flex-1 items-center gap-3 text-left"
          >
            <span className="text-2xl">{icon}</span>
            <div>
              <h3 className="text-base font-semibold">{name}</h3>
              <p className="text-xs text-muted-foreground">
                {completedTotal}/{habits.length} completed · {totalXP}/{maxXP} XP
              </p>
            </div>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1"
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>
        <Progress
          value={progress}
          className={`mt-3 h-2 ${isComplete ? "bg-green-950" : "bg-muted/30"}`}
          indicatorClassName={isComplete ? "bg-green-500" : "bg-cyan-500"}
        />
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 pt-0">
          {/* Core Habits Section */}
          {coreHabits.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <span>Core Habits</span>
                <div className="h-px flex-1 bg-border/50" />
              </div>
              <div className="space-y-2">
                {coreHabits.map((habit) => (
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

          {/* Extra Habits Section */}
          {extraHabits.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <div className="h-px flex-1 bg-border/50" />
                <span>Extra Habits</span>
                <div className="h-px flex-1 bg-border/50" />
              </div>
              {!coreComplete ? (
                <div className="py-6 text-center">
                  <p className="text-sm text-muted-foreground/80">
                    Complete core to unlock
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {extraHabits.map((habit) => (
                    <HabitItem
                      key={habit.id}
                      {...habit}
                      onToggle={handleToggle}
                      onSkip={(id, reason) => onHabitSkip(name, id, reason)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
