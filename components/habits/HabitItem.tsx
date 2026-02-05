"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";

interface HabitItemProps {
  id: string;
  name: string;
  xp: number;
  completed: boolean;
  completedAt?: string;
  onToggle: (id: string) => void;
  onSkip: (id: string, reason: string) => void;
}

const SKIP_REASONS = [
  "Not enough time",
  "Didn't feel like it",
  "Forgot",
  "Circumstances prevented it",
  "Chose something else",
];

export function HabitItem({
  id,
  name,
  xp,
  completed,
  completedAt,
  onToggle,
  onSkip,
}: HabitItemProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    if (!completed) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
    onToggle(id);
  };

  return (
    <div className="group relative flex items-center gap-3 rounded-md border border-border/50 bg-card/30 p-3 transition-all hover:bg-card/50">
      <Checkbox
        checked={completed}
        onCheckedChange={handleToggle}
        className="h-5 w-5 data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500"
      />

      <span className={`flex-1 text-sm ${completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
        {name}
      </span>

      {completed && completedAt ? (
        <div className="flex items-center gap-2 text-xs text-green-500">
          <Check className="h-4 w-4" />
          <span>{completedAt}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-orange-500">+{xp}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs opacity-0 transition-opacity group-hover:opacity-100"
              >
                Skip
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {SKIP_REASONS.map((reason) => (
                <DropdownMenuItem
                  key={reason}
                  onClick={() => onSkip(id, reason)}
                  className="text-sm"
                >
                  {reason}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {isAnimating && (
        <div className="pointer-events-none absolute right-3 top-0 animate-[slide-up_0.6s_ease-out] text-lg font-bold text-orange-500">
          +{xp}
        </div>
      )}
    </div>
  );
}
