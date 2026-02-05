"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Target,
  Calendar,
  TrendingUp,
  MessageSquare,
  Image as ImageIcon,
  CheckCircle2
} from "lucide-react";
import Image from "next/image";

interface DashboardProps {
  onNavigate: (tab: "visionboard" | "planning" | "data" | "coach") => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const profile = useQuery(api.userProfile.getUserProfile);
  const todayLog = useQuery(api.dailyLog.getDailyLog, {
    date: format(new Date(), "yyyy-MM-dd"),
  });
  const weeklyProgress = useQuery(api.dailyLog.getWeeklyProgress, {
    weekNumber: getWeekNumber(new Date()),
    year: new Date().getFullYear(),
  });
  const visionboardImages = useQuery(api.visionboard.getAllImages);

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const todayComplete = todayLog?.completed || false;
  const visionboardPreview = visionboardImages?.slice(0, 4) || [];
  const hasVisionboardImages = visionboardImages && visionboardImages.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">
          Welcome back, {profile.name}! 👋
        </h1>
        <p className="text-lg text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* North Stars */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Your North Stars</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                💰 Wealth
              </p>
              <p className="text-sm">{profile.northStars.wealth}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                🏃 Health
              </p>
              <p className="text-sm">{profile.northStars.health}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                ❤️ Love
              </p>
              <p className="text-sm">{profile.northStars.love}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                😊 Happiness
              </p>
              <p className="text-sm">{profile.northStars.happiness}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Today's Log Status */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Today&apos;s Log</h3>
              </div>
              {todayComplete && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {todayComplete
                ? "✅ Completed! Great job!"
                : "⏳ Not completed yet"}
            </p>
            <Button
              onClick={() => onNavigate("planning")}
              className="w-full"
              variant={todayComplete ? "outline" : "default"}
            >
              {todayComplete ? "View" : "Fill Out"}
            </Button>
          </div>
        </Card>

        {/* Weekly Progress */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Weekly Progress</h3>
            </div>
            {weeklyProgress && weeklyProgress.length > 0 ? (
              <div className="space-y-2">
                {weeklyProgress.slice(0, 2).map((progress) => (
                  <div key={progress.fieldId} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{progress.fieldName}</span>
                    <span className="font-medium">{progress.current}/{progress.target}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No goals tracked this week</p>
            )}
            <Button
              onClick={() => onNavigate("data")}
              variant="outline"
              className="w-full"
            >
              View All Data
            </Button>
          </div>
        </Card>

        {/* Visionboard Preview */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Visionboard</h3>
            </div>
            {hasVisionboardImages ? (
              <div className="flex gap-2 overflow-hidden">
                {visionboardPreview.map((image) => (
                  <div
                    key={image._id}
                    className="w-20 h-20 rounded-lg overflow-hidden bg-muted relative flex-shrink-0"
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
              <p className="text-sm text-muted-foreground">No images yet</p>
            )}
            <Button
              onClick={() => onNavigate("visionboard")}
              variant="outline"
              className="w-full"
            >
              {hasVisionboardImages ? "Zum Visionboard" : "Add Images"}
            </Button>
          </div>
        </Card>

        {/* Coach Quick Access */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">AI Coach</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Get personalized guidance and support
            </p>
            <Button
              onClick={() => onNavigate("coach")}
              variant="outline"
              className="w-full"
            >
              Start Chat
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Helper function to get current week number (ISO 8601)
function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
