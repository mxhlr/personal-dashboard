"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type ReviewType = "daily" | "weekly" | "monthly" | "quarterly" | "annual";

interface HeaderProps {
  activeTab: "planning" | "data" | "coach";
  onTabChange: (tab: "planning" | "data" | "coach") => void;
  selectedReview: ReviewType;
  onReviewChange: (review: ReviewType) => void;
  onSettingsClick: () => void;
}

export default function Header({
  activeTab,
  onTabChange,
  selectedReview,
  onReviewChange,
  onSettingsClick,
}: HeaderProps) {
  const reviewLabels: Record<ReviewType, string> = {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    quarterly: "Quarterly",
    annual: "Annual",
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <h1 className="text-xl font-bold">Personal Coach</h1>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            {/* Planning & Review Tab with Dropdown */}
            {activeTab === "planning" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="default"
                    className="flex items-center gap-2"
                  >
                    Planning & Review
                    <span className="text-xs">▼</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onReviewChange("daily")}>
                    <span className={selectedReview === "daily" ? "font-semibold" : ""}>
                      ○ Daily
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onReviewChange("weekly")}>
                    <span className={selectedReview === "weekly" ? "font-semibold" : ""}>
                      ○ Weekly
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onReviewChange("monthly")}>
                    <span className={selectedReview === "monthly" ? "font-semibold" : ""}>
                      ○ Monthly
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onReviewChange("quarterly")}>
                    <span className={selectedReview === "quarterly" ? "font-semibold" : ""}>
                      ○ Quarterly
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onReviewChange("annual")}>
                    <span className={selectedReview === "annual" ? "font-semibold" : ""}>
                      ○ Annual
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                onClick={() => onTabChange("planning")}
              >
                Planning & Review
              </Button>
            )}

            {/* Data Tab */}
            <Button
              variant={activeTab === "data" ? "default" : "ghost"}
              onClick={() => onTabChange("data")}
            >
              Data
            </Button>

            {/* Coach Tab */}
            <Button
              variant={activeTab === "coach" ? "default" : "ghost"}
              onClick={() => onTabChange("coach")}
            >
              Coach
            </Button>

            {/* Settings Icon */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettingsClick}
              className="ml-2"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
