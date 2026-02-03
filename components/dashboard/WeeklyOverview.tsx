"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WeeklyOverviewProps {
  selectedDate?: Date;
}

export function WeeklyOverview({ selectedDate = new Date() }: WeeklyOverviewProps) {
  // Get all tracking fields
  const trackingFields = useQuery(api.trackingFields.getActiveTrackingFields);

  // Get week boundaries (Saturday to Friday)
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 6 }); // 6 = Saturday
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 6 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Get all daily logs for the week
  const dailyLogs = useQuery(api.dailyLog.getWeekLogs, {
    startDate: weekStart.toISOString(),
    endDate: weekEnd.toISOString(),
  });

  if (!trackingFields || !dailyLogs) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading weekly overview...</p>
      </div>
    );
  }

  // Calculate goal progress
  const movementGoal = {
    completed: dailyLogs.filter(log => log.movement && log.movement.trim() !== "").length,
    target: 5,
  };

  const phoneJailGoal = {
    completed: dailyLogs.filter(log => log.phoneJail === true).length,
    target: 5,
  };

  // Calculate daily progress
  const getDailyProgress = (date: Date) => {
    const log = dailyLogs.find(
      (l) => format(new Date(l.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );

    if (!log) return { data: {}, progress: 0 };

    const fields = trackingFields?.length || 1;
    let filled = 0;

    if (log.movement) filled++;
    if (log.phoneJail !== undefined) filled++;
    if (log.vibes) filled++;
    if (log.breakfast || log.lunch || log.dinner) filled++;
    if (log.work) filled++;

    const progress = Math.round((filled / fields) * 100);

    return {
      data: log,
      progress,
    };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold">Weekly Overview</h2>
        <p className="text-muted-foreground">Performance & Consistency</p>
      </div>

      {/* Goal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Movement Goal */}
        <Card className="p-6 bg-card border shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Movement Goal
              </h4>
              <p className="text-2xl font-semibold">
                {movementGoal.completed} / {movementGoal.target} Days
              </p>
            </div>
            <div className="text-3xl font-light text-muted-foreground">
              {Math.round((movementGoal.completed / movementGoal.target) * 100)}%
            </div>
          </div>
        </Card>

        {/* Phone Jail Goal */}
        <Card className="p-6 bg-card border shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Phone Jail Goal
              </h4>
              <p className="text-2xl font-semibold">
                {phoneJailGoal.completed} / {phoneJailGoal.target} Days
              </p>
            </div>
            <div className="text-3xl font-light text-muted-foreground">
              {Math.round((phoneJailGoal.completed / phoneJailGoal.target) * 100)}%
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Table */}
      <Card className="overflow-hidden border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Day</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Movement</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Phone Jail</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Vibes</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Meals</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Work</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-right">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {daysInWeek.map((day) => {
              const { data, progress } = getDailyProgress(day);
              const mealsCompleted = [data.breakfast, data.lunch, data.dinner].filter(Boolean).length;

              return (
                <TableRow key={day.toISOString()} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="font-medium">{format(day, "EEE")}</div>
                      <div className="text-xs text-muted-foreground">{format(day, "d")}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {data.movement ? "✓" : "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {data.phoneJail === true ? "✓" : data.phoneJail === false ? "✗" : "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {data.vibes ? "✓" : "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={data.breakfast ? "text-foreground" : "text-muted-foreground/40"}>B</span>
                      <span className={data.lunch ? "text-foreground" : "text-muted-foreground/40"}>L</span>
                      <span className={data.dinner ? "text-foreground" : "text-muted-foreground/40"}>D</span>
                      <span className="text-muted-foreground">{mealsCompleted}/3</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {data.work ? "✓" : "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="text-sm font-medium">{progress}%</div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
