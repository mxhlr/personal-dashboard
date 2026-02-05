"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Header from "@/components/layout/Header";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { HabitDashboardConnected } from "@/components/habits/HabitDashboardConnected";
import { WeeklyOverview } from "@/components/dashboard/WeeklyOverview";
import { Visionboard } from "@/components/visionboard/Visionboard";
import { CoachChat } from "@/components/coach/CoachChat";
import { WeeklyReviewForm } from "@/components/reviews/WeeklyReviewForm";
import { MonthlyReviewForm } from "@/components/reviews/MonthlyReviewForm";
import { QuarterlyReviewForm } from "@/components/reviews/QuarterlyReviewForm";
import { AnnualReviewForm } from "@/components/reviews/AnnualReviewForm";
import { DataView } from "@/components/data/DataView";
import { SettingsModal } from "@/components/settings/SettingsModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ReviewType = "daily" | "weekly" | "monthly" | "quarterly" | "annual";
type TabType = "dashboard" | "visionboard" | "planning" | "data" | "coach";
type DataViewType = "weekly" | "monthly" | "quarterly" | "annual";

// Helper function to get current week number (ISO 8601)
function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Helper function to get current quarter
function getQuarter(date: Date): number {
  return Math.floor(date.getMonth() / 3) + 1;
}

export default function DashboardPage() {
  const router = useRouter();
  const hasCompletedSetup = useQuery(api.userProfile.hasCompletedSetup);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [selectedReview, setSelectedReview] = useState<ReviewType>("daily");
  const [selectedDataView, setSelectedDataView] = useState<DataViewType>("weekly");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Get current date info for reviews
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentWeek = getWeekNumber(now);
  const currentQuarter = getQuarter(now);

  // Redirect to setup if not completed
  useEffect(() => {
    console.log("Dashboard - hasCompletedSetup:", hasCompletedSetup);
    if (hasCompletedSetup === false) {
      console.log("Redirecting to setup because hasCompletedSetup is false");
      router.push("/setup");
    } else if (hasCompletedSetup === true) {
      console.log("Setup is completed, staying on dashboard");
    }
  }, [hasCompletedSetup, router]);

  // Show loading while checking setup status
  if (hasCompletedSetup === undefined || hasCompletedSetup === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lädt...</p>
        </div>
      </div>
    );
  }

  const handleDateNavigation = (direction: "prev" | "next" | "today") => {
    // Date navigation for habit tracking (future enhancement)
    console.log("Date navigation:", direction);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSettingsClick={() => setSettingsOpen(true)}
          onDateNavigation={handleDateNavigation}
        />

        <main>
          {/* Tab 0: Dashboard */}
          {activeTab === "dashboard" && (
            <Dashboard onNavigate={setActiveTab} />
          )}

          {/* Tab 1: Visionboard */}
          {activeTab === "visionboard" && (
            <Visionboard />
          )}

          {/* Tab 2: Planning & Review */}
          {activeTab === "planning" && (
            <div className="container mx-auto px-4 py-8 space-y-6">
              {/* Dropdown for Review Selection */}
              <div className="max-w-4xl mx-auto px-6">
                <Select
                  value={selectedReview}
                  onValueChange={(value) => setSelectedReview(value as ReviewType)}
                >
                  <SelectTrigger className="w-[240px] bg-card shadow-sm">
                    <SelectValue placeholder="Select review type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily Log</SelectItem>
                    <SelectItem value="weekly">Weekly Review</SelectItem>
                    <SelectItem value="monthly">Monthly Review</SelectItem>
                    <SelectItem value="quarterly">Quarterly Review</SelectItem>
                    <SelectItem value="annual">Annual Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Review Forms */}
              {selectedReview === "daily" && <HabitDashboardConnected />}

              {selectedReview === "weekly" && (
                <WeeklyReviewForm year={currentYear} weekNumber={currentWeek} />
              )}

              {selectedReview === "monthly" && (
                <MonthlyReviewForm year={currentYear} month={currentMonth} />
              )}

              {selectedReview === "quarterly" && (
                <QuarterlyReviewForm year={currentYear} quarter={currentQuarter} />
              )}

              {selectedReview === "annual" && (
                <AnnualReviewForm year={currentYear} />
              )}
            </div>
          )}

          {/* Tab 3: Data View */}
          {activeTab === "data" && (
            <div className="container mx-auto px-4 py-8 space-y-6">
              {/* Dropdown for Data View Selection */}
              <div className="max-w-4xl mx-auto px-6">
                <Select
                  value={selectedDataView}
                  onValueChange={(value) => setSelectedDataView(value as DataViewType)}
                >
                  <SelectTrigger className="w-[240px] bg-card shadow-sm">
                    <SelectValue placeholder="Select data view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly Data</SelectItem>
                    <SelectItem value="monthly">Monthly Data</SelectItem>
                    <SelectItem value="quarterly">Quarterly Data</SelectItem>
                    <SelectItem value="annual">Annual Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Data Views */}
              {selectedDataView === "weekly" && <WeeklyOverview selectedDate={now} />}
              {selectedDataView !== "weekly" && (
                <DataView selectedView={selectedDataView as ReviewType} />
              )}
            </div>
          )}

          {/* Tab 4: Coach */}
          {activeTab === "coach" && (
            <div className="container mx-auto px-4 py-8">
              <CoachChat />
            </div>
          )}
        </main>

        {/* Settings Modal */}
        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
      </div>
    </ErrorBoundary>
  );
}
