"use client";

import React, { useState, useRef, useEffect } from "react";
import { logger } from "@/lib/logger";
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

export const HabitItem = React.memo(function HabitItem({
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
  const [showRowHighlight, setShowRowHighlight] = useState(false);
  const [isEditingXP, setIsEditingXP] = useState(false);
  const [xpValue, setXpValue] = useState(xp.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  const updateTemplate = useMutation(api.habitTemplates.updateTemplate);

  const handleToggle = () => {
    if (!completed) {
      // Trigger animations
      setIsAnimating(true);
      setShowRowHighlight(true);
      setTimeout(() => setIsAnimating(false), 1000);
      setTimeout(() => setShowRowHighlight(false), 800);
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
    if (isNaN(newXP) || newXP <= 0 || newXP > 10000) {
      toast.error("XP must be between 1 and 10,000");
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
        logger.error("Failed to update XP:", error);
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
    <div
      className={`group relative flex items-center gap-3 py-3 px-2 -mx-2 rounded-lg transition-all duration-300 ${
        showRowHighlight ? 'animate-[row-highlight_0.8s_ease-out]' : ''
      } hover:bg-foreground/[0.02]`}
      role="listitem"
    >
      {/* Enhanced Checkbox with pulse animation */}
      <Checkbox
        checked={completed}
        onCheckedChange={handleToggle}
        className={`h-6 w-6 rounded-md border-2 border-border transition-all duration-200
          hover:scale-105 hover:border-[#4CAF50]/50
          data-[state=checked]:!border-0 data-[state=checked]:!bg-[#4CAF50]
          data-[state=checked]:!text-[#FFFFFF] data-[state=checked]:!rounded-[6px]
          data-[state=checked]:!opacity-100 data-[state=checked]:scale-110
          ${isAnimating ? 'animate-[checkbox-pulse_0.6s_ease-out]' : ''}`}
        aria-label={`Mark ${name} as ${completed ? 'incomplete' : 'complete'}`}
      />

      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold font-orbitron transition-all duration-300 ${
          completed
            ? "text-muted-foreground line-through"
            : "text-foreground"
        }`}>
          {name}
        </div>
        {subtitle && (
          <div className={`text-xs text-muted-foreground/70 mt-0.5 truncate font-orbitron ${
            completed ? "line-through" : ""
          }`}>
            {subtitle}
          </div>
        )}
        {completed && completedAt && (
          <div className="text-xs text-[#00FF88] mt-0.5 font-medium font-orbitron">
            {formatTimestamp(completedAt)}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 justify-end">
        {completed ? (
          <div className="text-sm font-bold text-[#4CAF50] flex items-center gap-1 font-orbitron">
            <span className="text-[#00FF88]">✓</span>
            +{xp}
          </div>
        ) : (
          <>
            {isEditingXP ? (
              <Input
                ref={inputRef}
                type="number"
                min="1"
                max="10000"
                value={xpValue}
                onChange={(e) => setXpValue(e.target.value)}
                onBlur={handleXPSave}
                onKeyDown={handleXPKeyDown}
                className="h-7 w-16 text-center text-sm font-semibold font-orbitron"
                aria-label={`Edit XP value for ${name}`}
              />
            ) : (
              <button
                onClick={handleXPClick}
                className="cursor-pointer rounded-md px-2 py-1 text-sm font-bold font-orbitron text-[#FF9800] transition-all duration-200 hover:bg-orange-500/15 hover:scale-105"
                style={{
                  textShadow: '0 0 8px rgba(255, 152, 0, 0.5)'
                }}
                aria-label={`Edit XP value for ${name}, currently ${xp} XP`}
              >
                +{xp}
              </button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="text-[11px] font-medium font-orbitron dark:text-[#666666] text-[#999999] bg-transparent border-0 px-2 py-1 rounded-md transition-all duration-200 hover:bg-foreground/5 hover:text-foreground/60"
                  aria-label={`Skip ${name} with reason`}
                >
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

      {/* Enhanced XP Float Animation with Gaming Style */}
      {isAnimating && (
        <div
          className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 animate-[xp-float_1s_ease-out] text-xl font-bold font-orbitron text-[#FF9800]"
          style={{
            textShadow: '0 0 10px rgba(255, 152, 0, 0.8), 0 0 20px rgba(255, 152, 0, 0.5), 0 0 30px rgba(255, 152, 0, 0.3)'
          }}
        >
          +{xp} XP
        </div>
      )}
    </div>
  );
});
