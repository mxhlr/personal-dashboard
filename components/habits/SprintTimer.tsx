"use client";

import { useState, useEffect } from "react";

interface SprintTimerProps {
  endOfDayHour?: number; // Default: 18 (6 PM)
}

export function SprintTimer({ endOfDayHour = 18 }: SprintTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState("");

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

  return (
    <p className="text-sm text-muted-foreground">
      Sprint: <span className="font-mono">{timeRemaining}</span>
    </p>
  );
}
