"use client";

import { useState, useRef, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

interface HabitItemProps {
  id: string;
  name: string;
  subtitle?: string;
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
  subtitle,
  xp,
  completed,
  completedAt,
  onToggle,
  onSkip,
}: HabitItemProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isEditingXP, setIsEditingXP] = useState(false);
  const [xpValue, setXpValue] = useState(xp.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  const updateTemplate = useMutation(api.habitTemplates.updateTemplate);

  const handleToggle = () => {
    if (!completed) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
    onToggle(id);
  };

  const handleXPClick = () => {
    if (!completed) {
      setIsEditingXP(true);
      setXpValue(xp.toString());
    }
  };

  const handleXPSave = async () => {
    const newXP = parseInt(xpValue, 10);
    if (isNaN(newXP) || newXP <= 0) {
      toast.error("XP must be a positive number");
      setXpValue(xp.toString());
      setIsEditingXP(false);
      return;
    }

    if (newXP !== xp) {
      try {
        await updateTemplate({
          templateId: id as Id<"habitTemplates">,
          xpValue: newXP,
        });
        toast.success("XP value updated");
      } catch (error) {
        console.error("Failed to update XP:", error);
        toast.error("Failed to update XP");
        setXpValue(xp.toString());
      }
    }

    setIsEditingXP(false);
  };

  const handleXPKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleXPSave();
    } else if (e.key === "Escape") {
      setXpValue(xp.toString());
      setIsEditingXP(false);
    }
  };

  useEffect(() => {
    if (isEditingXP && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingXP]);

  // Format timestamp as "✓ HH:MM AM/PM"
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `✓ ${displayHours}:${displayMinutes} ${ampm}`;
  };

  return (
    <div className="group relative flex items-center gap-3 py-2 transition-all">
      <Checkbox
        checked={completed}
        onCheckedChange={handleToggle}
        className="h-5 w-5 rounded-md border-border data-[state=checked]:border-0 data-[state=checked]:bg-[#4CAF50] data-[state=checked]:text-white data-[state=checked]:rounded-[6px]"
      />

      <div className="flex-1">
        <div className={`text-sm ${completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
          {name}
        </div>
        {subtitle && (
          <div className={`text-xs text-muted-foreground/70 mt-0.5 ${completed ? "line-through" : ""}`}>
            {subtitle}
          </div>
        )}
        {completed && completedAt && (
          <div className="text-xs text-[#00FF88] mt-0.5">
            {formatTimestamp(completedAt)}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 justify-end">
        {completed ? (
          <div className="text-xl font-bold text-[#00E676]">✓</div>
        ) : (
          <>
            {isEditingXP ? (
              <Input
                ref={inputRef}
                type="number"
                min="1"
                value={xpValue}
                onChange={(e) => setXpValue(e.target.value)}
                onBlur={handleXPSave}
                onKeyDown={handleXPKeyDown}
                className="h-7 w-16 text-center text-sm font-semibold"
              />
            ) : (
              <button
                onClick={handleXPClick}
                className="cursor-pointer rounded px-1.5 py-0.5 text-sm font-semibold text-orange-500 transition-colors hover:bg-orange-500/10"
                title="Click to edit XP"
              >
                +{xp}
              </button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-[12px] text-[#999999] dark:text-[#555555] bg-transparent border-0 px-0 py-0 h-auto">
                  Skip
                </button>
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
          </>
        )}
      </div>

      {isAnimating && (
        <div className="pointer-events-none absolute right-3 top-0 animate-[slide-up_0.6s_ease-out] text-lg font-bold text-orange-500">
          +{xp}
        </div>
      )}
    </div>
  );
}
