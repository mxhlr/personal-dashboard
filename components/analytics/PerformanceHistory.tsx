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

  const getScoreColor = (score: number) => {
    if (score === 100) return "bg-[#00E676]"; // Bright green
    if (score >= 80) return "bg-[#8B8000]"; // Gold/Olive
    if (score >= 50) return "bg-[#5C5500]"; // Darker gold
    if (score >= 1) return "bg-[#5C2200]"; // Dark red/brown
    return "bg-[#1A1A2E] dark:bg-[#1A1A2E] border border-border"; // Default background
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
    <Card className="p-6 bg-card border shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center mb-4">Performance History</h2>

        {/* Month Navigation */}
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={previousMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <span className="text-lg font-medium">
            {monthNames[month]} {year}
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="max-w-4xl mx-auto">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
            <div
              key={idx}
              className="text-center text-sm font-medium text-muted-foreground"
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
            const scoreColor = getScoreColor(score);
            const isTodayFlag = isToday(day);
            const isWeekendFlag = isWeekend(day);

            return (
              <div
                key={day}
                className={`
                  aspect-square rounded-lg flex flex-col items-center justify-center
                  ${scoreColor}
                  ${isTodayFlag ? "ring-2 ring-cyan-400" : ""}
                  ${isWeekendFlag ? "opacity-60" : ""}
                  transition-all hover:scale-105
                `}
              >
                <div className="text-base font-bold">{day}</div>
                {dayData && (
                  <div className="text-xs">{score}%</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
