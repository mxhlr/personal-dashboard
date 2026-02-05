"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Header from "@/components/layout/Header";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Visionboard } from "@/components/visionboard/Visionboard";
import { CoachChat } from "@/components/coach/CoachChat";
import { WeeklyReviewForm } from "@/components/reviews/WeeklyReviewForm";
import { MonthlyReviewForm } from "@/components/reviews/MonthlyReviewForm";
import { QuarterlyReviewForm } from "@/components/reviews/QuarterlyReviewForm";
import { AnnualReviewForm } from "@/components/reviews/AnnualReviewForm";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

type ReviewType = "weekly" | "monthly" | "quarterly" | "annual";
type TabType = "dashboard" | "daily-log" | "visionboard" | "planning" | "data" | "coach";

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
  const [selectedReview, setSelectedReview] = useState<ReviewType>("weekly");
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

  const handleTabChange = (tab: TabType) => {
    if (tab === "daily-log") {
      router.push("/daily-log");
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Header
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onSettingsClick={() => setSettingsOpen(true)}
          onDateNavigation={handleDateNavigation}
          selectedReview={selectedReview}
          onReviewChange={setSelectedReview}
        />

        <main>
          {/* Tab 0: Dashboard */}
          {activeTab === "dashboard" && (
            <Dashboard onNavigate={handleTabChange} />
          )}

          {/* Tab 1: Visionboard */}
          {activeTab === "visionboard" && (
            <Visionboard />
          )}

          {/* Tab 2: Review & Planning */}
          {activeTab === "planning" && (
            <div className="min-h-[calc(100vh-64px)]">
              {/* Review Forms */}
              {selectedReview === "weekly" && (
                <div className="container mx-auto px-4 py-8">
                  <WeeklyReviewForm year={currentYear} weekNumber={currentWeek} />
                </div>
              )}

              {selectedReview === "monthly" && (
                <div className="container mx-auto px-4 py-8">
                  <MonthlyReviewForm year={currentYear} month={currentMonth} />
                </div>
              )}

              {selectedReview === "quarterly" && (
                <div className="container mx-auto px-4 py-8">
                  <QuarterlyReviewForm year={currentYear} quarter={currentQuarter} />
                </div>
              )}

              {selectedReview === "annual" && (
                <div className="container mx-auto px-4 py-8">
                  <AnnualReviewForm year={currentYear} />
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Data View */}
          {activeTab === "data" && (
            <AnalyticsDashboard />
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
