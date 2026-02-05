"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Play, Square } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export function BlockTimerButton() {
  const categories = useQuery(api.habitTemplates.listCategories);
  const currentTimer = useQuery(api.categoryTimer.getCurrentTimer);
  const startTimer = useMutation(api.categoryTimer.startCategoryTimer);
  const stopTimer = useMutation(api.categoryTimer.stopCategoryTimer);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const handleStart = async (categoryId: Id<"habitCategories">) => {
    setIsStarting(true);
    try {
      await startTimer({ categoryId });
      toast.success("Block timer started");
    } catch (error) {
      console.error("Start timer error:", error);
      toast.error("Failed to start timer");
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = async () => {
    setIsStopping(true);
    try {
      const result = await stopTimer();
      toast.success(`Block completed: ${result.durationMinutes} minutes`);
    } catch (error) {
      console.error("Stop timer error:", error);
      toast.error("Failed to stop timer");
    } finally {
      setIsStopping(false);
    }
  };

  // If timer is running, show STOP BLOCK button
  if (currentTimer) {
    return (
      <Button
        onClick={handleStop}
        disabled={isStopping}
        className="w-full dark:bg-gradient-to-r dark:from-[#FF4444] dark:to-[#CC0000] bg-gradient-to-r from-[#F44336] to-[#D32F2F]
          text-white font-bold font-orbitron uppercase tracking-wider text-xs
          dark:border-[#FF4444]/30 border-[#F44336]/30
          dark:shadow-[0_0_15px_rgba(255,68,68,0.3)] shadow-[0_4px_12px_rgba(244,67,54,0.3)]
          dark:hover:shadow-[0_0_25px_rgba(255,68,68,0.5)] hover:shadow-[0_6px_20px_rgba(244,67,54,0.5)]
          hover:scale-105 transition-all duration-300"
      >
        <Square className="h-3 w-3 mr-2" />
        {isStopping ? "Stopping..." : "Stop Block"}
      </Button>
    );
  }

  // Show START BLOCK dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={isStarting || !categories || categories.length === 0}
          className="w-full dark:bg-gradient-to-r dark:from-[#00E5FF] dark:to-[#00B8D4] bg-gradient-to-r from-[#0077B6] to-[#005F8F]
            text-white font-bold font-orbitron uppercase tracking-wider text-xs
            dark:border-[#00E5FF]/30 border-[#0077B6]/30
            dark:shadow-[0_0_15px_rgba(0,229,255,0.3)] shadow-[0_4px_12px_rgba(0,119,182,0.3)]
            dark:hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] hover:shadow-[0_6px_20px_rgba(0,119,182,0.5)]
            hover:scale-105 transition-all duration-300"
        >
          <Play className="h-3 w-3 mr-2" />
          {isStarting ? "Starting..." : "Start Block"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="w-56 dark:bg-[#12121F] bg-white dark:border-[rgba(0,229,255,0.2)] border-[rgba(0,180,220,0.25)]
          dark:shadow-[0_8px_32px_rgba(0,229,255,0.15)] shadow-lg"
      >
        {categories?.map((category) => (
          <DropdownMenuItem
            key={category._id}
            onClick={() => handleStart(category._id)}
            className="font-orbitron text-xs uppercase tracking-wide dark:hover:bg-[rgba(0,229,255,0.1)] hover:bg-[rgba(0,180,220,0.1)]
              cursor-pointer dark:text-[#E0E0E0] text-[#1A1A1A]"
          >
            {category.icon} {category.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
