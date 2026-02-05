"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface SprintTimerProps {
  endOfDayHour?: number; // Default: 18 (6 PM)
}

export function SprintTimer({ endOfDayHour = 18 }: SprintTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState("");
  const [blockTime, setBlockTime] = useState("");
  const currentTimer = useQuery(api.categoryTimer.getCurrentTimer);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(endOfDayHour, 0, 0, 0);

      // If past end time, show 0h 0m
      if (now >= endOfDay) {
        return "0h 0m";
      }

      const diffMs = endOfDay.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      return `${hours}h ${minutes}m`;
    };

    // Update immediately
    setTimeRemaining(calculateTimeRemaining());

    // Update every minute
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 60000);

    return () => clearInterval(interval);
  }, [endOfDayHour]);

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

    // Update immediately
    updateBlockTime();

    // Update every second
    const interval = setInterval(updateBlockTime, 1000);

    return () => clearInterval(interval);
  }, [currentTimer]);

  return (
    <div className="space-y-2">
      {currentTimer && (
        <div className="text-center pb-2 border-b dark:border-white/[0.06] border-black/[0.06]">
          <p className="text-[10px] font-orbitron uppercase tracking-wider dark:text-[#666] text-[#999] mb-1">
            {currentTimer.categoryIcon} {currentTimer.categoryName}
          </p>
          <p className="text-lg font-bold font-orbitron dark:text-[#00E5FF] text-[#0077B6]"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
            {blockTime}
          </p>
        </div>
      )}
      <p className="text-sm text-center dark:text-[#999] text-[#666]">
        Sprint: <span className="font-bold dark:text-[#E0E0E0] text-[#1A1A1A]">{timeRemaining}</span>
      </p>
    </div>
  );
}
