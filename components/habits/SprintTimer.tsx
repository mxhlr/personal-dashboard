"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function SprintTimer() {
  const [blockTime, setBlockTime] = useState("");
  const currentTimer = useQuery(api.categoryTimer.getCurrentTimer);

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

  if (!currentTimer) {
    return (
      <p className="text-sm text-center dark:text-[#666] text-[#999] font-orbitron">
        No active sprint
      </p>
    );
  }

  return (
    <div className="text-center">
      <p className="text-[10px] font-orbitron uppercase tracking-wider dark:text-[#666] text-[#999] mb-1">
        {currentTimer.categoryIcon} {currentTimer.categoryName}
      </p>
      <p className="text-2xl font-bold font-orbitron dark:text-[#00E5FF] text-[#0077B6]"
        style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
        {blockTime}
      </p>
    </div>
  );
}
