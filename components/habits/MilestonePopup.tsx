"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";

interface MilestonePopupProps {
  progress: number;
}

type Milestone = 25 | 50 | 75 | 100;

const MILESTONE_CONTENT = {
  25: {
    icon: "🔥",
    title: "WARMING UP",
    description: "25% locked. Keep pushing.",
    color: "#FF9800",
    glowColor: "rgba(255, 152, 0, 0.4)",
  },
  50: {
    icon: "⚡",
    title: "HALFWAY",
    description: "50% locked. You're rolling.",
    color: "#00E5FF",
    glowColor: "rgba(0, 229, 255, 0.4)",
  },
  75: {
    icon: "💪",
    title: "WIN",
    description: "75%+ locked. Almost there!",
    color: "#00E5FF",
    glowColor: "rgba(0, 229, 255, 0.4)",
  },
  100: {
    icon: "🏆",
    title: "DOMINATION",
    description: "100% locked. Perfect day.",
    color: "#00E676",
    glowColor: "rgba(0, 230, 118, 0.5)",
  },
};

// Confetti colors
const CONFETTI_COLORS = ["#00E676", "#00E5FF", "#FFD700", "#FF9800", "#E040FB", "#FF4081"];

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

  // Generate confetti particles once when milestone shown
  const confettiParticles = useMemo(() => {
    if (!showMilestone || (showMilestone !== 75 && showMilestone !== 100)) return [];
    return [...Array(showMilestone === 100 ? 50 : 30)].map((_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.5}s`,
      duration: `${2 + Math.random() * 2}s`,
      rotation: Math.random() * 360,
      size: showMilestone === 100 ? (4 + Math.random() * 6) : (3 + Math.random() * 4),
    }));
  }, [showMilestone]);

  if (!showMilestone) return null;

  const content = MILESTONE_CONTENT[showMilestone];
  const showConfetti = showMilestone === 75 || showMilestone === 100;

  return (
    <>
      {showMilestone && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={handleContinue} />
      )}

      {/* Confetti Layer - Outside Dialog for full screen effect */}
      {showConfetti && (
        <div className="fixed inset-0 z-[55] pointer-events-none overflow-hidden">
          {confettiParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute animate-[confetti-fall_3s_ease-out_forwards]"
              style={{
                left: particle.left,
                top: '-20px',
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                transform: `rotate(${particle.rotation}deg)`,
                animationDelay: particle.delay,
                animationDuration: particle.duration,
              }}
            />
          ))}
        </div>
      )}

      <Dialog open={!!showMilestone} onOpenChange={() => handleContinue()}>
        <DialogContent
          className="max-w-md p-8 dark:bg-[#1A1A2E] bg-white rounded-2xl border-0 z-[60] animate-[milestone-scale-in_0.4s_ease-out]"
          showCloseButton={false}
          style={{
            boxShadow: `0 0 60px ${content.glowColor}, 0 0 100px ${content.glowColor}`,
          }}
        >
        <div className="flex flex-col items-center space-y-6 text-center">
          {/* Icon with pulse animation */}
          <div
            className="text-7xl animate-[icon-bounce_0.6s_ease-out]"
            style={{
              filter: `drop-shadow(0 0 20px ${content.glowColor})`,
            }}
          >
            {content.icon}
          </div>

          {/* Title with glow */}
          <h2
            className="text-4xl font-bold tracking-wide"
            style={{
              color: content.color,
              textShadow: `0 0 20px ${content.glowColor}`,
            }}
          >
            {content.title}
          </h2>

          {/* Progress badge */}
          <div
            className="px-4 py-1.5 rounded-full text-sm font-bold"
            style={{
              backgroundColor: `${content.color}20`,
              color: content.color,
              border: `1px solid ${content.color}40`,
            }}
          >
            {showMilestone}% COMPLETE
          </div>

          {/* Description */}
          <p className="text-base dark:text-[#AAAAAA] text-[#555555]">
            {content.description}
          </p>

          {/* Continue Button with glow */}
          <Button
            onClick={handleContinue}
            className="font-bold rounded-full px-12 py-6 text-base transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: content.color,
              color: showMilestone === 100 ? '#000' : '#000',
              boxShadow: `0 0 20px ${content.glowColor}`,
            }}
          >
            {showMilestone === 100 ? "CELEBRATE!" : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
