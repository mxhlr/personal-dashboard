"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface MilestonePopupProps {
  progress: number;
}

type Milestone = 25 | 50 | 75 | 100;

const MILESTONE_CONTENT = {
  25: {
    icon: "🔥",
    title: "WARMING UP",
    description: "25% locked. Keep pushing.",
  },
  50: {
    icon: "⚡",
    title: "HALFWAY",
    description: "50% locked. You're rolling.",
  },
  75: {
    icon: "⚡",
    title: "WIN",
    description: "75%+ locked.",
  },
  100: {
    icon: "🏆",
    title: "DOMINATION",
    description: "100% locked. Perfect day.",
  },
};

export function MilestonePopup({ progress }: MilestonePopupProps) {
  const [showMilestone, setShowMilestone] = useState<Milestone | null>(null);
  const [shownToday, setShownToday] = useState<Set<Milestone>>(new Set());

  useEffect(() => {
    // Get today's date as key
    const today = new Date().toDateString();
    const storedKey = `milestones_${today}`;

    // Load shown milestones for today
    const stored = localStorage.getItem(storedKey);
    if (stored) {
      setShownToday(new Set(JSON.parse(stored)));
    }

    // Clean up old milestone data (keep only today)
    const allKeys = Object.keys(localStorage).filter(k => k.startsWith("milestones_"));
    allKeys.forEach(key => {
      if (key !== storedKey) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  useEffect(() => {
    // Determine which milestone should be shown
    let milestone: Milestone | null = null;

    if (progress >= 100 && !shownToday.has(100)) {
      milestone = 100;
    } else if (progress >= 75 && !shownToday.has(75)) {
      milestone = 75;
    } else if (progress >= 50 && !shownToday.has(50)) {
      milestone = 50;
    } else if (progress >= 25 && !shownToday.has(25)) {
      milestone = 25;
    }

    if (milestone && milestone !== showMilestone) {
      setShowMilestone(milestone);
    }
  }, [progress, shownToday, showMilestone]);

  const handleContinue = () => {
    if (showMilestone) {
      const today = new Date().toDateString();
      const storedKey = `milestones_${today}`;

      // Mark this milestone as shown
      const newShown = new Set(shownToday);
      newShown.add(showMilestone);
      setShownToday(newShown);

      // Save to localStorage
      localStorage.setItem(storedKey, JSON.stringify(Array.from(newShown)));

      setShowMilestone(null);
    }
  };

  if (!showMilestone) return null;

  const content = MILESTONE_CONTENT[showMilestone];
  const showConfetti = showMilestone === 75 || showMilestone === 100;

  return (
    <>
      {showMilestone && (
        <div className="fixed inset-0 z-50 bg-black/70" onClick={handleContinue} />
      )}
      <Dialog open={!!showMilestone} onOpenChange={() => handleContinue()}>
        <DialogContent
          className="max-w-md p-8 bg-[#FFFFFF] dark:bg-[#1A1A2E] rounded-2xl border-0 z-[60]"
          showCloseButton={false}
        >
        <div className="flex flex-col items-center space-y-6 text-center">
          {/* Icon */}
          <div className="text-6xl">
            {content.icon}
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-[#00E676]">
            {content.title}
          </h2>

          {/* Description */}
          <p className="text-base text-[#666666] dark:text-[#999999]">
            {content.description}
          </p>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            className="bg-[#00E5FF] hover:bg-[#00D4EE] text-[#000000] font-semibold rounded-full px-10 py-6 text-base"
          >
            Continue
          </Button>
        </div>

        {/* Optional Confetti Animation */}
        {showConfetti && (
          <div className="confetti-container pointer-events-none absolute inset-0">
            {/* Simple confetti effect - can be enhanced with a library */}
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
