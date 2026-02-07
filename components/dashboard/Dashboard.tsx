"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Image as ImageIcon,
  CheckCircle2
} from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { TodaysWinCondition } from "./TodaysWinCondition";
import { StoicQuote } from "./StoicQuote";
import { ReviewNotificationBar } from "./ReviewNotificationBar";
import { WeeklyProgressTracker } from "./WeeklyProgressTracker";
import { QuickStatsBadge } from "./QuickStatsBadge";
import { VisionboardCarousel } from "./VisionboardCarousel";
import { WeeklyGoalsWidget } from "./WeeklyGoalsWidget";
import { MonthlyOKRProgress } from "./MonthlyOKRProgress";

interface DashboardProps {
  onNavigate: (tab: "daily-log" | "visionboard" | "planning" | "data" | "okr") => void;
}

// Move greeting arrays outside component to prevent recreation on every render
const MORNING_GREETINGS_TEMPLATE = [
  "Good morning", "Rise and shine", "Fresh start", "New day",
  "Seize the morning", "Conquer the day", "Your day awaits", "Make it count",
  "Own this day", "Time to build", "Begin with purpose", "Command your morning",
  "Today is yours", "Dawn of opportunity", "First light", "Early victory",
  "Morning warrior", "Sunrise mindset", "Start with strength", "Lead the day",
  "Master the morning", "Attack the day", "Rise with intent", "New chapter",
  "Morning momentum", "First move wins", "Own the dawn", "Shape your day",
  "Morning clarity", "Begin boldly", "Daybreak discipline", "Fresh energy",
  "Awake and ready", "Build your empire", "Start unstoppable", "Morning power",
  "Embrace the day", "New possibilities", "Command this day", "Morning mastery",
  "Own your hours", "Begin the conquest", "Morning focus", "Day one mindset",
  "Rise and execute", "Morning excellence", "Claim this day", "Sunrise strength",
  "Time to dominate", "Morning mission", "Start legendary", "Own the sunrise",
  "Wake and build", "Morning champion", "First light wins", "Begin victoriously",
  "Daybreak drive", "Morning control", "Start with fire", "Greet greatness",
];

const AFTERNOON_GREETINGS_TEMPLATE = [
  "Good afternoon", "Keep pushing", "Halfway there", "Making progress",
  "Stay focused", "Momentum is yours", "Keep building", "Execute your plan",
  "Power through", "Control what you can", "Strength in action", "Progress over perfection",
  "Midday strength", "Stay the course", "Maintain velocity", "Keep the fire",
  "Afternoon warrior", "Peak performance", "Discipline holds", "Stay sharp",
  "Focus forward", "Push boundaries", "Relentless progress", "Own the grind",
  "Steady power", "Execution mode", "Drive continues", "Afternoon mastery",
  "Keep moving", "No surrender", "Build momentum", "Stay hungry",
  "Afternoon focus", "Press advantage", "Control the pace", "Steady wins",
  "Lock in", "Peak hours", "Dominate now", "Stay relentless",
  "Forge ahead", "Keep climbing", "Afternoon drive", "Own this moment",
  "Maintain intensity", "Never settle", "Keep building", "Consistent effort",
  "Afternoon power", "Stay committed", "Execute flawlessly", "Own the process",
  "Keep advancing", "Afternoon excellence", "Stay in control", "Build your legacy",
  "Press on", "Own the afternoon", "Steady fire", "Keep winning",
];

const EVENING_GREETINGS_TEMPLATE = [
  "Good evening", "Finishing strong", "Winding down", "Almost there",
  "Close it out", "End with intention", "Reflect and prepare", "Tomorrow starts tonight",
  "Own the finish", "Cap the day", "Complete the circle", "Seal the victory",
  "Evening wisdom", "Final push", "Close strong", "Finish well",
  "Evening warrior", "Wrap it up", "Closing hours", "End with power",
  "Evening focus", "Final stretch", "Sunset strength", "Finish line",
  "Evening mastery", "Close the loop", "Final moves", "End game",
  "Evening clarity", "Sunset mindset", "Finish right", "Close victoriously",
  "Evening drive", "Final chapter", "End strong", "Closing power",
  "Evening excellence", "Wrap strong", "Final hours", "Close with purpose",
  "Evening control", "Finish bold", "Last light wins", "End intentionally",
  "Evening momentum", "Close complete", "Final push up", "End with fire",
  "Evening discipline", "Finish clean", "Close smart", "Evening mission",
  "Final lap", "End sharp", "Close perfect", "Evening champion",
  "Finish legendary", "Close the day", "Evening victory", "End unstoppable",
];

const NIGHT_GREETINGS_TEMPLATE = [
  "Burning midnight oil", "Late night hustle", "Night owl mode", "Still grinding",
  "Own the night", "Silent hours", "Nocturnal progress", "Rest is earned",
  "Night warrior", "Quiet power", "After hours excellence", "Moon shift activated",
  "Midnight strength", "Night grind", "Silent power", "Dark hours win",
  "Night mastery", "Moonlight hustle", "Late night focus", "Nocturnal warrior",
  "Midnight drive", "Night excellence", "Silent grind", "After dark power",
  "Night mission", "Moonlit progress", "Midnight momentum", "Night discipline",
  "Silent hours grind", "Night time wins", "Darkness works", "Midnight warrior",
  "Night shift strong", "Moon power", "Late night win", "Nocturnal drive",
  "Midnight mastery", "Night conquest", "Silent victory", "Dark hours hustle",
  "Night mode on", "Moonlight grind", "Midnight focus", "Night champion",
  "Silent strength", "After hours win", "Night legend", "Midnight mission",
  "Nocturnal excellence", "Night dominance", "Silent fire", "Moon shift power",
  "Midnight control", "Night execution", "Dark hours win", "Late night legend",
  "Nocturnal mastery", "Night finish", "Silent conquest", "Midnight victory",
];

// Weekday-specific variations (constant)
const WEEKDAY_MESSAGES: { [key: number]: string } = {
  1: "Monday momentum", // Monday
  2: "Tuesday grind", // Tuesday
  3: "Midweek power", // Wednesday
  4: "Thursday drive", // Thursday
  5: "Friday energy", // Friday
  6: "Weekend warrior", // Saturday
  0: "Sunday focus", // Sunday
};

// Dynamic greeting based on time of day and day of week
function getDynamicGreeting(name: string, currentStreak: number): { message: string; emoji: string } {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday

  // Get 2-hour block (0-11 blocks per day)
  const timeBlock = Math.floor(hour / 2);

  // Time-based emoji selection (white/subtle emojis)
  let emoji = "🤍"; // Default white heart
  let greetingsTemplate = MORNING_GREETINGS_TEMPLATE;

  if (hour >= 5 && hour < 12) {
    // Morning: 5am - 12pm
    greetingsTemplate = MORNING_GREETINGS_TEMPLATE;
    emoji = "🌅";
  } else if (hour >= 12 && hour < 18) {
    // Afternoon: 12pm - 6pm
    greetingsTemplate = AFTERNOON_GREETINGS_TEMPLATE;
    emoji = "☀️";
  } else if (hour >= 18 && hour < 23) {
    // Evening: 6pm - 11pm
    greetingsTemplate = EVENING_GREETINGS_TEMPLATE;
    emoji = "🌆";
  } else {
    // Night: 11pm - 5am
    greetingsTemplate = NIGHT_GREETINGS_TEMPLATE;
    emoji = "🌙";
  }

  // Add streak-based motivation
  if (currentStreak >= 7) {
    emoji = "🔥"; // Fire for hot streaks
  }

  // Select greeting based on 30-minute time block (changes every 30 min)
  const greetingIndex = timeBlock % greetingsTemplate.length;
  const baseGreeting = `${greetingsTemplate[greetingIndex]}, ${name}`;

  // Occasionally add weekday flavor (30% chance)
  const addWeekdayFlavor = Math.random() > 0.7;
  const message = addWeekdayFlavor
    ? `${baseGreeting}! ${WEEKDAY_MESSAGES[day]}!`
    : `${baseGreeting}!`;

  return { message, emoji };
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const profile = useQuery(api.userProfile.getUserProfile);
  const userStats = useQuery(api.gamification.getUserStats);
  const dailyHabits = useQuery(api.dailyHabits.getHabitsForDate, { date: today });
  const habitTemplates = useQuery(api.habitTemplates.listTemplates, {});
  const visionboardImages = useQuery(api.visionboard.getAllImages);

  // Memoize dynamic greeting to prevent recalculation on every render
  const greeting = useMemo(
    () => profile && userStats ? getDynamicGreeting(profile.name, userStats.currentStreak) : { message: "", emoji: "" },
    [profile, userStats]
  );

  // Memoize expensive habit calculations to avoid recomputing on every render
  const habitStats = useMemo(() => {
    if (!dailyHabits || !habitTemplates) {
      return {
        coreHabits: [],
        totalHabits: 0,
        completedHabits: 0,
        completedCore: 0,
        todayProgress: 0,
        todayXP: 0,
        coreComplete: false,
        todayComplete: false,
      };
    }

    const coreHabits = habitTemplates.filter((h) => h.isCore);
    const totalHabits = habitTemplates.length;
    const completedHabits = dailyHabits.filter((h) => h.completed).length;
    const completedCore = dailyHabits.filter(
      (h) => h.completed && habitTemplates.find(t => t._id === h.templateId)?.isCore
    ).length;
    const todayProgress = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
    const todayXP = dailyHabits.reduce((sum, h) => sum + (h.completed ? h.xpEarned : 0), 0);
    const coreComplete = completedCore === coreHabits.length && coreHabits.length > 0;
    const todayComplete = todayProgress === 100; // Core + Extra all done = PERFECT DAY (Gold)

    return {
      coreHabits,
      totalHabits,
      completedHabits,
      completedCore,
      todayProgress,
      todayXP,
      coreComplete,
      todayComplete,
    };
  }, [dailyHabits, habitTemplates]);

  // Memoize visionboard calculations
  const visionboardData = useMemo(() => {
    const visionboardPreview = visionboardImages?.slice(0, 4) || [];
    const hasVisionboardImages = visionboardImages && visionboardImages.length > 0;
    return { visionboardPreview, hasVisionboardImages };
  }, [visionboardImages]);

  // Memoize SVG circle calculations for progress ring
  const progressRingProps = useMemo(() => {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - habitStats.todayProgress / 100);
    return {
      circumference,
      strokeDashoffset,
    };
  }, [habitStats.todayProgress]);

  // Destructure for cleaner code
  const {
    totalHabits,
    completedHabits,
    todayProgress,
    todayXP,
    coreComplete,
    todayComplete,
  } = habitStats;

  const { visionboardPreview, hasVisionboardImages } = visionboardData;

  if (!profile || !userStats || !dailyHabits || !habitTemplates) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-[calc(100vh-64px)] relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, var(--daily-log-bg-start) 0%, var(--daily-log-bg-end) 100%)'
      }}
    >
      {/* Subtle grid overlay for HUD effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 229, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 229, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Animated scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          background: 'linear-gradient(transparent 40%, rgba(0, 229, 255, 0.2) 50%, transparent 60%)',
          backgroundSize: '100% 4px',
          animation: 'scanline 8s linear infinite'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-4">
        {/* Welcome Header */}
        <div className="text-center space-y-2 md:space-y-3 mb-2">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-orbitron text-white"
            style={{
              textShadow: '0 0 30px rgba(255, 255, 255, 0.2)'
            }}
          >
            {greeting.message} {greeting.emoji}
          </h1>
          <p
            className="text-sm md:text-base lg:text-lg dark:text-[#AAAAAA] text-[#525252]"
            style={{
              fontFamily: '"Courier New", "Monaco", monospace',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>

      {/* Today's Log (compact) + Quick Stats - PRIORITY #1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Today's Log - Compact Version */}
          <Card
            className={`p-6
            shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl
            ${todayComplete
              ? 'dark:border-[rgba(255,215,0,0.3)] border-[rgba(255,215,0,0.4)] dark:hover:border-[rgba(255,215,0,0.4)] hover:border-[rgba(255,215,0,0.5)] dark:hover:shadow-[0_0_40px_rgba(255,215,0,0.3)] hover:shadow-[0_8px_40px_rgba(255,215,0,0.4)] dark:bg-gradient-to-r dark:from-yellow-500/10 dark:to-green-500/10 bg-gradient-to-r from-yellow-500/5 to-green-500/5'
              : coreComplete
                ? 'dark:border-[rgba(0,230,118,0.25)] border-[rgba(76,175,80,0.3)] dark:hover:border-[rgba(0,230,118,0.35)] hover:border-[rgba(76,175,80,0.4)] dark:hover:shadow-[0_0_35px_rgba(0,230,118,0.25)] hover:shadow-[0_8_35px_rgba(76,175,80,0.3)] dark:bg-gradient-to-r dark:from-green-500/10 dark:to-cyan-500/10 bg-gradient-to-r from-green-500/5 to-cyan-500/5'
                : 'dark:border-purple-500/20 border-purple-500/10 dark:hover:border-purple-500/30 hover:border-purple-500/15 dark:hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] hover:shadow-[0_8px_30px_rgba(139,92,246,0.1)] dark:bg-gradient-to-r dark:from-purple-500/10 dark:to-cyan-500/10 bg-gradient-to-r from-purple-500/5 to-cyan-500/5'
            }`}
            style={
              !todayComplete && !coreComplete
                ? { boxShadow: '0 0 20px rgba(139, 92, 246, 0.15)' }
                : undefined
            }
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 dark:text-purple-400 text-purple-600" />
                <h3 className="font-bold font-orbitron dark:text-purple-400 text-purple-600">Today&apos;s Log</h3>
              </div>

            {todayComplete ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <CheckCircle2
                      className="h-12 w-12 dark:text-[#FFD700] text-[#FFA500]"
                      style={{
                        filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))',
                        animation: 'neon-pulse 2s ease-in-out infinite'
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium font-orbitron dark:text-[#FFD700] text-[#FFA500]"
                      style={{
                        textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
                      }}
                    >
                      PERFECT DAY ✨
                    </p>
                    <p className="text-sm dark:text-[#525252] text-[#3d3d3d]">
                      <span className="font-orbitron" style={{ fontVariantNumeric: 'tabular-nums' }}>{todayProgress}%</span>
                      {' • '}
                      <span className="font-orbitron" style={{ fontVariantNumeric: 'tabular-nums' }}>{todayXP}</span>
                      {' '}XP
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => onNavigate("daily-log")}
                  className="w-full dark:bg-gradient-to-r dark:from-[#FFD700] dark:to-[#FFA500] bg-gradient-to-r from-[#FFA500] to-[#FF8C00]
                    text-black font-bold font-orbitron uppercase tracking-wider text-xs
                    dark:shadow-[0_0_20px_rgba(255,215,0,0.4)] shadow-[0_4px_15px_rgba(255,165,0,0.4)]
                    dark:hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] hover:shadow-[0_6px_25px_rgba(255,165,0,0.6)] hover:scale-105
                    transition-all duration-300"
                >
                  Celebration Mode ✨
                </Button>
              </>
            ) : coreComplete ? (
              <>
                <div className="flex items-center gap-4">
                  <CheckCircle2 className="h-12 w-12 dark:text-[#00E676] text-[#4CAF50]"
                    style={{
                      filter: 'drop-shadow(0 0 6px rgba(0, 230, 118, 0.5))'
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium font-orbitron dark:text-[#00E676] text-[#4CAF50]">
                      SOLID DAY ✓
                    </p>
                    <p className="text-sm dark:text-[#525252] text-[#3d3d3d]">
                      Core erledigt • Extras offen
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => onNavigate("daily-log")}
                  className="w-full dark:bg-gradient-to-r dark:from-[#00E676] dark:to-[#00C853] bg-gradient-to-r from-[#4CAF50] to-[#388E3C]
                    text-black font-bold font-orbitron uppercase tracking-wider text-xs
                    dark:shadow-[0_0_15px_rgba(0,230,118,0.3)] shadow-[0_4px_12px_rgba(76,175,80,0.3)]
                    dark:hover:shadow-[0_0_25px_rgba(0,230,118,0.5)] hover:shadow-[0_6px_20px_rgba(76,175,80,0.5)] hover:scale-105
                    transition-all duration-300"
                >
                  Complete Extras →
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16">
                    {/* Simple Progress Ring with glow */}
                    <svg className="h-16 w-16 -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="dark:text-[#2a2a2a] text-[#e9ecef]"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={progressRingProps.circumference}
                        strokeDashoffset={progressRingProps.strokeDashoffset}
                        className="dark:text-[white] text-[black] transition-all duration-500"
                        style={{
                          filter: todayProgress > 50 ? 'drop-shadow(0 0 6px currentColor)' : 'none'
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold dark:text-[#E0E0E0] text-[#1A1A1A] font-orbitron">{todayProgress}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium dark:text-[#E0E0E0] text-[#1A1A1A]">
                      <span className="font-orbitron" style={{ fontVariantNumeric: 'tabular-nums' }}>{completedHabits}/{totalHabits}</span>
                      {' '}Habits erledigt
                    </p>
                    <p className="text-sm dark:text-[#525252] text-[#3d3d3d]">
                      <span className="font-orbitron" style={{ fontVariantNumeric: 'tabular-nums' }}>{todayXP}</span>
                      {' '}XP earned
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => onNavigate("daily-log")}
                  className="w-full dark:bg-gradient-to-r dark:from-white dark:to-gray-100 bg-gradient-to-r from-gray-700 to-gray-800
                    dark:text-black text-white font-bold font-orbitron uppercase tracking-wider text-xs
                    transition-all duration-300 hover:scale-105"
                >
                  Zum Daily Log →
                </Button>
              </>
            )}
          </div>
        </Card>

          {/* Quick Stats Badge */}
          <QuickStatsBadge />
        </div>

      {/* Review Notifications + Weekly Progress - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Review Notifications - Left */}
        <Card className="p-4 md:p-6 dark:bg-card/50 bg-white/80
          shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl
          dark:border-border/50 border-border/60
          dark:hover:border-border hover:border-border/80">
          <ReviewNotificationBar />
        </Card>

        {/* Weekly Progress - Right */}
        <Card className="p-4 md:p-6 dark:bg-card/50 bg-white/80
          shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl
          dark:border-border/50 border-border/60
          dark:hover:border-border hover:border-border/80">
          <WeeklyProgressTracker />
        </Card>
      </div>

      {/* Win Condition & Stoic Quote - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Stoic Quote - Left */}
        <StoicQuote />

        {/* Today's Win Condition - Right */}
        <TodaysWinCondition />
      </div>

      {/* Weekly Goals Widget */}
      <WeeklyGoalsWidget />

      {/* Monthly OKR Progress Widget */}
      <MonthlyOKRProgress />

        {/* North Stars - Gaming HUD Style */}
        <Card className="p-4 md:p-6 lg:p-8 dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)] dark:bg-card/50 bg-white/80
          shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl
          dark:hover:border-[rgba(0,229,255,0.25)] hover:border-[rgba(0,180,220,0.3)]
          dark:hover:shadow-[0_0_30px_rgba(0,229,255,0.15)] hover:shadow-[0_8px_30px_rgba(0,180,220,0.2)]
          hover:scale-[1.005]"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.06) 0%, rgba(139, 92, 246, 0.04) 100%), rgba(26, 26, 26, 0.5)'
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center md:text-left group cursor-default">
              <p className="text-[10px] md:text-xs font-bold font-orbitron uppercase tracking-widest dark:text-[#525252] text-[#3d3d3d] mb-2 md:mb-3 group-hover:dark:text-[#00E5FF] group-hover:text-[#0077B6] transition-colors duration-200">
                💰 WEALTH
              </p>
              <div className="space-y-2">
                {profile.northStars.wealth.map((goal, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-xs dark:text-[#525252] text-[#777777] mt-1">•</span>
                    <p className="text-sm md:text-base dark:text-[#E0E0E0] text-[#1A1A1A] font-semibold leading-relaxed">
                      {goal}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center md:text-left group cursor-default">
              <p className="text-[10px] md:text-xs font-bold font-orbitron uppercase tracking-widest dark:text-[#525252] text-[#3d3d3d] mb-2 md:mb-3 group-hover:dark:text-[#00E5FF] group-hover:text-[#0077B6] transition-colors duration-200">
                🏃 HEALTH
              </p>
              <div className="space-y-2">
                {profile.northStars.health.map((goal, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-xs dark:text-[#525252] text-[#777777] mt-1">•</span>
                    <p className="text-sm md:text-base dark:text-[#E0E0E0] text-[#1A1A1A] font-semibold leading-relaxed">
                      {goal}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center md:text-left group cursor-default">
              <p className="text-[10px] md:text-xs font-bold font-orbitron uppercase tracking-widest dark:text-[#525252] text-[#3d3d3d] mb-2 md:mb-3 group-hover:dark:text-[#00E5FF] group-hover:text-[#0077B6] transition-colors duration-200">
                ❤️ LOVE
              </p>
              <div className="space-y-2">
                {profile.northStars.love.map((goal, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-xs dark:text-[#525252] text-[#777777] mt-1">•</span>
                    <p className="text-sm md:text-base dark:text-[#E0E0E0] text-[#1A1A1A] font-semibold leading-relaxed">
                      {goal}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center md:text-left group cursor-default">
              <p className="text-[10px] md:text-xs font-bold font-orbitron uppercase tracking-widest dark:text-[#525252] text-[#3d3d3d] mb-2 md:mb-3 group-hover:dark:text-[#00E5FF] group-hover:text-[#0077B6] transition-colors duration-200">
                😊 HAPPINESS
              </p>
              <div className="space-y-2">
                {profile.northStars.happiness.map((goal, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-xs dark:text-[#525252] text-[#777777] mt-1">•</span>
                    <p className="text-sm md:text-base dark:text-[#E0E0E0] text-[#1A1A1A] font-semibold leading-relaxed">
                      {goal}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Visionboard Carousel - Full Width */}
        <VisionboardCarousel />

        {/* Old Visionboard kept below for reference - DELETE THIS */}
        <div className="hidden">
          <Card
            className="p-6 dark:border-[rgba(139,92,246,0.15)] border-[rgba(139,92,246,0.2)] dark:bg-card/50 bg-white/80
            shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl
            dark:hover:border-[rgba(139,92,246,0.25)] hover:border-[rgba(139,92,246,0.3)]
            dark:hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] hover:shadow-[0_8px_30px_rgba(139,92,246,0.25)]"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(26, 26, 26, 0.5) 100%)'
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 dark:text-[#8B5CF6] text-[#7C3AED]" />
                <h3 className="font-bold font-orbitron dark:text-[#8B5CF6] text-[#7C3AED]">Visionboard</h3>
              </div>
            {hasVisionboardImages ? (
              <div className="flex gap-2 overflow-hidden">
                {visionboardPreview.map((image) => (
                  <div
                    key={image._id}
                    className="w-20 h-20 rounded-lg overflow-hidden dark:bg-[#2a2a2a] bg-[#f1f3f5] relative flex-shrink-0
                      border dark:border-[rgba(139,92,246,0.2)] border-[rgba(139,92,246,0.15)]"
                  >
                    <Image
                      src={image.url}
                      alt="Vision"
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm dark:text-[#525252] text-[#3d3d3d]">No images yet</p>
            )}
              <Button
                onClick={() => onNavigate("visionboard")}
                variant="outline"
                className="w-full dark:border-[#8B5CF6]/30 border-[#7C3AED]/30 dark:text-[#8B5CF6] text-[#7C3AED]
                  dark:hover:bg-[rgba(139,92,246,0.1)] hover:bg-[rgba(124,58,237,0.1)]
                  font-orbitron uppercase tracking-wider text-xs transition-all duration-200"
              >
                {hasVisionboardImages ? "Zum Visionboard" : "Add Images"}
              </Button>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
