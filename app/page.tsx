"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { DailyTracker } from "@/components/dashboard/DailyTracker";
import { CoachChat } from "@/components/coach/CoachChat";
import { WeeklyReviewForm } from "@/components/reviews/WeeklyReviewForm";
import { MonthlyReviewForm } from "@/components/reviews/MonthlyReviewForm";
import { QuarterlyReviewForm } from "@/components/reviews/QuarterlyReviewForm";
import { AnnualReviewForm } from "@/components/reviews/AnnualReviewForm";
import { DataView } from "@/components/data/DataView";

type ReviewType = "daily" | "weekly" | "monthly" | "quarterly" | "annual";
type TabType = "planning" | "data" | "coach";

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
  const [activeTab, setActiveTab] = useState<TabType>("planning");
  const [selectedReview, setSelectedReview] = useState<ReviewType>("daily");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Get current date info for reviews
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentWeek = getWeekNumber(now);
  const currentQuarter = getQuarter(now);

  // Redirect to setup if not completed
  useEffect(() => {
    if (hasCompletedSetup === false) {
      router.push("/setup");
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

  return (
    <div className="min-h-screen bg-background">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedReview={selectedReview}
        onReviewChange={setSelectedReview}
        onSettingsClick={() => setSettingsOpen(true)}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Tab 1: Planning & Review */}
        {activeTab === "planning" && (
          <div>
            {selectedReview === "daily" && (
              <div className="bg-card border border-border rounded-lg">
                <DailyTracker />
              </div>
            )}

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

        {/* Tab 2: Data View */}
        {activeTab === "data" && (
          <div>
            <DataView selectedView={selectedReview} />
          </div>
        )}

        {/* Tab 3: Coach */}
        {activeTab === "coach" && (
          <div>
            <CoachChat />
          </div>
        )}
      </main>

      {/* Settings Modal Placeholder */}
      {settingsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Einstellungen</h2>
            <p className="text-muted-foreground mb-4">
              Settings modal will be implemented in Phase 7...
            </p>
            <button
              onClick={() => setSettingsOpen(false)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
