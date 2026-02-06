"use client";

import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Id } from "@/convex/_generated/dataModel";

export function SprintTimer() {
  const [blockTime, setBlockTime] = useState("");
  const currentTimer = useQuery(api.categoryTimer.getCurrentTimer);
  const categories = useQuery(api.habitCategories.listCategories);
  const startTimer = useMutation(api.categoryTimer.startCategoryTimer);
  const stopTimer = useMutation(api.categoryTimer.stopCategoryTimer);

  // Update block timer every second
  useEffect(() => {
    if (!currentTimer) {
      setBlockTime("");
      return;
    }

    const updateBlockTime = () => {
      const now = new Date();
      const startTime = new Date(currentTimer.startedAt);
      const diffMs = now.getTime() - startTime.getTime();
      const minutes = Math.floor(diffMs / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setBlockTime(`${minutes}m ${seconds}s`);
    };

    updateBlockTime();
    const interval = setInterval(updateBlockTime, 1000);
    return () => clearInterval(interval);
  }, [currentTimer]);

  const handleStartBlock = async (categoryId: Id<"habitCategories">) => {
    try {
      await startTimer({ categoryId });
    } catch (error) {
      logger.error("Failed to start timer:", error);
    }
  };

  const handleStopBlock = async () => {
    try {
      await stopTimer({});
    } catch (error) {
      logger.error("Failed to stop timer:", error);
    }
  };

  // Show running timer
  if (currentTimer) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="text-center">
          <p className="text-[10px] font-orbitron uppercase tracking-wider dark:text-[#666] text-[#999] mb-1">
            {currentTimer.categoryIcon} {currentTimer.categoryName}
          </p>
          <p className="text-2xl font-bold font-orbitron dark:text-[#00E5FF] text-[#0077B6]"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
            {blockTime}
          </p>
        </div>
        <Button
          onClick={handleStopBlock}
          className="px-6 py-2 bg-[#EF5350] dark:bg-[#EF5350] text-white font-bold font-orbitron uppercase tracking-wider text-xs
            border border-[#EF5350]/50 shadow-sm
            hover:bg-[#E53935] hover:shadow-md hover:scale-[1.02]
            transition-all duration-300"
        >
          STOP BLOCK
        </Button>
      </div>
    );
  }

  // Show NOT STARTED button with dropdown
  return (
    <div className="flex justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="px-6 py-2 bg-[#424242] dark:bg-[#424242] text-white font-bold font-orbitron uppercase tracking-wider text-xs
              border border-[#616161] shadow-sm
              hover:bg-[#616161] hover:shadow-md hover:scale-[1.02]
              transition-all duration-300"
          >
            START BLOCK
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="center"
          className="dark:bg-[#1A1A2E] bg-white border dark:border-[#00E5FF]/20 border-[#0077B6]/20 rounded-xl shadow-lg min-w-[200px]"
        >
          {categories?.map((category) => (
            <DropdownMenuItem
              key={category._id}
              onClick={() => handleStartBlock(category._id)}
              className="font-orbitron text-sm dark:text-[#E0E0E0] text-[#1A1A1A] cursor-pointer
                dark:hover:bg-[#00E5FF]/10 hover:bg-[#0077B6]/10
                transition-colors duration-200"
            >
              {category.icon} {category.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
