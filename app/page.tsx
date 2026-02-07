"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useSearchParams } from "next/navigation";
import { logger } from "@/lib/logger";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Header from "@/components/layout/Header";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { CoachToggle } from "@/components/coach/CoachToggle";
import { ReviewErrorBoundary } from "@/components/reviews/ReviewErrorBoundary";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { OKROverview } from "@/components/okr/OKROverview";
import { LoadingFallback, FullPageLoadingFallback } from "@/components/ui/LoadingFallback";

// Lazy load large components for better performance
const Visionboard = lazy(() =>
  import("@/components/visionboard/Visionboard").then((mod) => ({
    default: mod.Visionboard,
  }))
);

const CoachPanel = lazy(() =>
  import("@/components/coach/CoachPanel").then((mod) => ({
    default: mod.CoachPanel,
  }))
);

const WeeklyReviewForm = lazy(() =>
  import("@/components/reviews/WeeklyReviewForm").then((mod) => ({
    default: mod.WeeklyReviewForm,
  }))
);

const MonthlyReviewForm = lazy(() =>
  import("@/components/reviews/MonthlyReviewForm").then((mod) => ({
    default: mod.MonthlyReviewForm,
  }))
);

const QuarterlyReviewForm = lazy(() =>
  import("@/components/reviews/QuarterlyReviewForm").then((mod) => ({
    default: mod.QuarterlyReviewForm,
  }))
);

const AnnualReviewForm = lazy(() =>
  import("@/components/reviews/AnnualReviewForm").then((mod) => ({
    default: mod.AnnualReviewForm,
  }))
);

type ReviewType = "weekly" | "monthly" | "quarterly" | "annual";
type TabType = "dashboard" | "daily-log" | "visionboard" | "planning" | "data" | "okr";

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
  const searchParams = useSearchParams();
  const hasCompletedSetup = useQuery(api.userProfile.hasCompletedSetup);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [selectedReview, setSelectedReview] = useState<ReviewType>("weekly");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get("tab") as TabType | null;
    if (tab && tab !== "daily-log") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Get current date info for reviews
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentWeek = getWeekNumber(now);
  const currentQuarter = getQuarter(now);

  // Redirect to setup if not completed
  useEffect(() => {
    logger.log("Dashboard - hasCompletedSetup:", hasCompletedSetup);
    if (hasCompletedSetup === false) {
      logger.log("Redirecting to setup because hasCompletedSetup is false");
      router.push("/setup");
    } else if (hasCompletedSetup === true) {
      logger.log("Setup is completed, staying on dashboard");
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
    logger.log("Date navigation:", direction);
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
            <ErrorBoundary>
              <Suspense fallback={<FullPageLoadingFallback message="Visionboard wird geladen..." />}>
                <Visionboard />
              </Suspense>
            </ErrorBoundary>
          )}

          {/* Tab 2: Review & Planning */}
          {activeTab === "planning" && (
            <>
              {/* Review Forms */}
              {selectedReview === "weekly" && (
                <ReviewErrorBoundary reviewType="weekly">
                  <Suspense fallback={<LoadingFallback message="Wöchentliche Reflexion wird geladen..." />}>
                    <WeeklyReviewForm year={currentYear} weekNumber={currentWeek} />
                  </Suspense>
                </ReviewErrorBoundary>
              )}

              {selectedReview === "monthly" && (
                <ReviewErrorBoundary reviewType="monthly">
                  <Suspense fallback={<LoadingFallback message="Monatliche Reflexion wird geladen..." />}>
                    <MonthlyReviewForm year={currentYear} month={currentMonth} />
                  </Suspense>
                </ReviewErrorBoundary>
              )}

              {selectedReview === "quarterly" && (
                <ReviewErrorBoundary reviewType="quarterly">
                  <Suspense fallback={<LoadingFallback message="Quartalsreflexion wird geladen..." />}>
                    <QuarterlyReviewForm year={currentYear} quarter={currentQuarter} />
                  </Suspense>
                </ReviewErrorBoundary>
              )}

              {selectedReview === "annual" && (
                <ReviewErrorBoundary reviewType="annual">
                  <Suspense fallback={<LoadingFallback message="Jahresreflexion wird geladen..." />}>
                    <AnnualReviewForm year={currentYear} />
                  </Suspense>
                </ReviewErrorBoundary>
              )}
            </>
          )}

          {/* Tab 3: Data View */}
          {activeTab === "data" && (
            <AnalyticsDashboard />
          )}

          {/* Tab 4: OKR Overview */}
          {activeTab === "okr" && (
            <OKROverview />
          )}
        </main>

        {/* Coach Toggle Button */}
        <CoachToggle onClick={() => setCoachOpen(true)} />

        {/* Coach Panel */}
        <Suspense fallback={null}>
          <CoachPanel isOpen={coachOpen} onClose={() => setCoachOpen(false)} />
        </Suspense>

        {/* Settings Modal */}
        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
      </div>
    </ErrorBoundary>
  );
}
