"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PerformanceHistoryProps {
  dailyScores: Record<string, { score: number; xp: number }>;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function PerformanceHistory({
  dailyScores,
  selectedDate,
  onDateChange,
}: PerformanceHistoryProps) {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  // Get days in month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Get first day of week (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDay.getDay();

  // Create calendar grid
  const calendarDays: (number | null)[] = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1); i++) {
    calendarDays.push(null);
  }

  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const getScoreColor = (score: number, isWeekendFlag: boolean, hasData: boolean) => {
    // Weekends without data: completely light/dark, no border
    if (isWeekendFlag && !hasData) {
      return "dark:bg-[#0a0a0a] bg-[#dee2e6] border-0";
    }

    // Days with no data: subtle gray in both modes
    if (!hasData || score === 0) {
      return "dark:bg-[#1A1A2E] bg-[#ced4da] dark:border-[rgba(0,229,255,0.1)] border-[rgba(0,180,220,0.6)] border";
    }

    // Completion-based color scheme
    if (score === 100) return "dark:bg-[#00E676] bg-[#4CAF50]"; // Gaming green
    if (score >= 85) return "dark:bg-[#FFD700] bg-[#FFC107]"; // Gold
    if (score < 85) return "dark:bg-[#FF9800] bg-[#F57C00]"; // Orange

    return "dark:bg-[#1A1A2E] bg-[#ced4da] dark:border-[rgba(0,229,255,0.1)] border-[rgba(0,180,220,0.6)] border"; // Default fallback
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isWeekend = (day: number) => {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  };

  const getDayScore = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return dailyScores[dateStr];
  };

  const previousMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    onDateChange(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    onDateChange(newDate);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <Card className="p-6 dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.6)] dark:bg-card/50 bg-white/80
      shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl
      dark:hover:border-[rgba(0,229,255,0.25)] hover:border-[rgba(0,180,220,0.8)]">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-sm font-bold font-orbitron uppercase tracking-wider dark:text-[#00E5FF] text-[#0077B6] mb-4">
          📅 PERFORMANCE HISTORY
        </h3>

        {/* Month Navigation */}
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={previousMonth}
            aria-label="Previous month"
            className="dark:hover:bg-[rgba(0,229,255,0.1)] hover:bg-[rgba(0,180,220,0.1)] transition-colors"
          >
            <ChevronLeft className="h-5 w-5 dark:text-[#00E5FF] text-[#0077B6]" />
          </Button>

          <span
            className="text-lg font-medium dark:text-[#E0E0E0] text-[#1A1A1A]"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
          >
            {monthNames[month]} {year}
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            aria-label="Next month"
            className="dark:hover:bg-[rgba(0,229,255,0.1)] hover:bg-[rgba(0,180,220,0.1)] transition-colors"
          >
            <ChevronRight className="h-5 w-5 dark:text-[#00E5FF] text-[#0077B6]" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="w-full">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
            <div
              key={idx}
              className="text-center text-xs font-bold font-orbitron dark:text-[#888888] text-[#495057] uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }

            const dayData = getDayScore(day);
            const score = dayData?.score || 0;
            const hasData = !!dayData;
            const isTodayFlag = isToday(day);
            const isWeekendFlag = isWeekend(day);
            const scoreColor = getScoreColor(score, isWeekendFlag, hasData);

            return (
              <div
                key={day}
                className={`
                  aspect-square rounded-lg flex flex-col items-center justify-center
                  ${scoreColor}
                  ${isTodayFlag ? "dark:ring-2 ring-2 dark:ring-[#00E5FF] ring-[#0077B6]" : ""}
                  transition-all hover:scale-105 hover:shadow-lg
                `}
              >
                <div
                  className="text-lg font-bold dark:text-white text-[#1A1A1A]"
                  style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                >
                  {day}
                </div>
                {hasData && (
                  <div
                    className="text-xs dark:text-white text-[#1A1A1A]"
                    style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                  >
                    {score}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
