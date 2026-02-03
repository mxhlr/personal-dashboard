"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";

type ReviewType = "daily" | "weekly" | "monthly" | "quarterly" | "annual";
type TabType = "planning" | "data" | "coach";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("planning");
  const [selectedReview, setSelectedReview] = useState<ReviewType>("daily");
  const [settingsOpen, setSettingsOpen] = useState(false);

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
            <h2 className="text-2xl font-bold mb-4">
              {selectedReview === "daily" && "Evening Review"}
              {selectedReview === "weekly" && "Weekly Review"}
              {selectedReview === "monthly" && "Monthly Review"}
              {selectedReview === "quarterly" && "Quarterly Review"}
              {selectedReview === "annual" && "Annual Review"}
            </h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-muted-foreground">
                {selectedReview === "daily" && "Daily tracking form will be here..."}
                {selectedReview === "weekly" && "Weekly review form (5 questions) will be here..."}
                {selectedReview === "monthly" && "Monthly review form (6 questions) will be here..."}
                {selectedReview === "quarterly" && "Quarterly review form (milestones + 5 questions) will be here..."}
                {selectedReview === "annual" && "Annual review form (North Stars + 6 questions) will be here..."}
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Data View */}
        {activeTab === "data" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Data View</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-muted-foreground">
                Data visualization will be here...
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Coach */}
        {activeTab === "coach" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Coach</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-muted-foreground">
                AI Coach chat interface will be here...
              </p>
            </div>
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
