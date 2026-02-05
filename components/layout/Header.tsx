"use client";

import { Settings, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ReviewType = "weekly" | "monthly" | "quarterly" | "annual";

interface HeaderProps {
  activeTab: "dashboard" | "daily-log" | "visionboard" | "planning" | "data" | "coach";
  onTabChange: (tab: "dashboard" | "daily-log" | "visionboard" | "planning" | "data" | "coach") => void;
  onSettingsClick: () => void;
  onDateNavigation?: (direction: "prev" | "next" | "today") => void;
  selectedReview?: ReviewType;
  onReviewChange?: (review: ReviewType) => void;
}

const reviewLabels: Record<ReviewType, string> = {
  weekly: "Weekly Review",
  monthly: "Monthly Review",
  quarterly: "Quarterly Review",
  annual: "Annual Review",
};

export default function Header({
  activeTab,
  onTabChange,
  onSettingsClick,
  onDateNavigation,
  selectedReview = "weekly",
  onReviewChange,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b dark:border-[rgba(0,229,255,0.1)] border-[rgba(0,180,220,0.15)]
      dark:bg-[#0A0A0F]/95 bg-white/95 backdrop-blur-md
      shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_10px_rgba(0,229,255,0.03)]
      transition-all duration-300">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-8">
          {/* Left: 6 Main Tabs */}
          <nav className="flex items-center gap-1">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              onClick={() => onTabChange("dashboard")}
              className={`font-medium font-orbitron text-[13px] uppercase tracking-wider transition-all duration-200
                ${activeTab === "dashboard"
                  ? 'dark:bg-[rgba(0,229,255,0.15)] bg-[rgba(0,180,220,0.15)] dark:text-[#00E5FF] text-[#0077B6] dark:shadow-[0_0_12px_rgba(0,229,255,0.25)] shadow-sm border-0'
                  : 'dark:text-[#888888] text-[#666666] dark:hover:text-[#00E5FF] hover:text-[#0077B6] dark:hover:bg-white/5 hover:bg-black/5'}`}
            >
              Dashboard
            </Button>
            <Button
              variant={activeTab === "daily-log" ? "default" : "ghost"}
              onClick={() => onTabChange("daily-log")}
              className={`font-medium font-orbitron text-[13px] uppercase tracking-wider transition-all duration-200
                ${activeTab === "daily-log"
                  ? 'dark:bg-[rgba(0,229,255,0.15)] bg-[rgba(0,180,220,0.15)] dark:text-[#00E5FF] text-[#0077B6] dark:shadow-[0_0_12px_rgba(0,229,255,0.25)] shadow-sm border-0'
                  : 'dark:text-[#888888] text-[#666666] dark:hover:text-[#00E5FF] hover:text-[#0077B6] dark:hover:bg-white/5 hover:bg-black/5'}`}
            >
              Daily Log
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={activeTab === "planning" ? "default" : "ghost"}
                  className={`font-medium font-orbitron text-[13px] uppercase tracking-wider gap-1.5 transition-all duration-200
                    ${activeTab === "planning"
                      ? 'dark:bg-[rgba(0,229,255,0.15)] bg-[rgba(0,180,220,0.15)] dark:text-[#00E5FF] text-[#0077B6] dark:shadow-[0_0_12px_rgba(0,229,255,0.25)] shadow-sm border-0'
                      : 'dark:text-[#888888] text-[#666666] dark:hover:text-[#00E5FF] hover:text-[#0077B6] dark:hover:bg-white/5 hover:bg-black/5'}`}
                >
                  {activeTab === "planning" ? reviewLabels[selectedReview] : "Review & Planning"}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start"
                className="dark:bg-[#12121F] bg-white dark:border-[rgba(0,229,255,0.2)] border-[rgba(0,180,220,0.25)]
                  dark:shadow-[0_8px_32px_rgba(0,229,255,0.15)] shadow-lg">
                <DropdownMenuItem onClick={() => { onTabChange("planning"); onReviewChange?.("weekly"); }}
                  className="font-orbitron text-xs uppercase tracking-wide dark:hover:bg-[rgba(0,229,255,0.1)] hover:bg-[rgba(0,180,220,0.1)]">
                  Weekly Review
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { onTabChange("planning"); onReviewChange?.("monthly"); }}
                  className="font-orbitron text-xs uppercase tracking-wide dark:hover:bg-[rgba(0,229,255,0.1)] hover:bg-[rgba(0,180,220,0.1)]">
                  Monthly Review
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { onTabChange("planning"); onReviewChange?.("quarterly"); }}
                  className="font-orbitron text-xs uppercase tracking-wide dark:hover:bg-[rgba(0,229,255,0.1)] hover:bg-[rgba(0,180,220,0.1)]">
                  Quarterly Review
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { onTabChange("planning"); onReviewChange?.("annual"); }}
                  className="font-orbitron text-xs uppercase tracking-wide dark:hover:bg-[rgba(0,229,255,0.1)] hover:bg-[rgba(0,180,220,0.1)]">
                  Annual Review
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant={activeTab === "data" ? "default" : "ghost"}
              onClick={() => onTabChange("data")}
              className={`font-medium font-orbitron text-[13px] uppercase tracking-wider transition-all duration-200
                ${activeTab === "data"
                  ? 'dark:bg-[rgba(0,229,255,0.15)] bg-[rgba(0,180,220,0.15)] dark:text-[#00E5FF] text-[#0077B6] dark:shadow-[0_0_12px_rgba(0,229,255,0.25)] shadow-sm border-0'
                  : 'dark:text-[#888888] text-[#666666] dark:hover:text-[#00E5FF] hover:text-[#0077B6] dark:hover:bg-white/5 hover:bg-black/5'}`}
            >
              Data
            </Button>
            <Button
              variant={activeTab === "visionboard" ? "default" : "ghost"}
              onClick={() => onTabChange("visionboard")}
              className={`font-medium font-orbitron text-[13px] uppercase tracking-wider transition-all duration-200
                ${activeTab === "visionboard"
                  ? 'dark:bg-[rgba(0,229,255,0.15)] bg-[rgba(0,180,220,0.15)] dark:text-[#00E5FF] text-[#0077B6] dark:shadow-[0_0_12px_rgba(0,229,255,0.25)] shadow-sm border-0'
                  : 'dark:text-[#888888] text-[#666666] dark:hover:text-[#00E5FF] hover:text-[#0077B6] dark:hover:bg-white/5 hover:bg-black/5'}`}
            >
              Visionboard
            </Button>
            <Button
              variant={activeTab === "coach" ? "default" : "ghost"}
              onClick={() => onTabChange("coach")}
              className={`font-medium font-orbitron text-[13px] uppercase tracking-wider transition-all duration-200
                ${activeTab === "coach"
                  ? 'dark:bg-[rgba(0,229,255,0.15)] bg-[rgba(0,180,220,0.15)] dark:text-[#00E5FF] text-[#0077B6] dark:shadow-[0_0_12px_rgba(0,229,255,0.25)] shadow-sm border-0'
                  : 'dark:text-[#888888] text-[#666666] dark:hover:text-[#00E5FF] hover:text-[#0077B6] dark:hover:bg-white/5 hover:bg-black/5'}`}
            >
              Coach
            </Button>
          </nav>

          {/* Right: Date Navigation & Settings */}
          <div className="flex items-center gap-2">
            {/* Date Navigation (only show on Planning & Review tab) */}
            {activeTab === "planning" && onDateNavigation && (
              <div className="flex items-center gap-0 border dark:border-[rgba(0,229,255,0.2)] border-[rgba(0,180,220,0.3)] rounded-lg overflow-hidden
                dark:bg-white/5 bg-black/5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDateNavigation("prev")}
                  aria-label="Previous day"
                  className="h-8 w-8 rounded-none dark:hover:bg-[rgba(0,229,255,0.1)] hover:bg-[rgba(0,180,220,0.15)] dark:hover:text-[#00E5FF] hover:text-[#0077B6]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="h-5 w-[1px] dark:bg-[rgba(0,229,255,0.2)] bg-[rgba(0,180,220,0.3)]" />
                <Button
                  variant="ghost"
                  onClick={() => onDateNavigation("today")}
                  className="h-8 px-4 rounded-none text-xs font-bold font-orbitron uppercase tracking-wider
                    dark:hover:bg-[rgba(0,229,255,0.1)] hover:bg-[rgba(0,180,220,0.15)] dark:hover:text-[#00E5FF] hover:text-[#0077B6]"
                >
                  TODAY
                </Button>
                <div className="h-5 w-[1px] dark:bg-[rgba(0,229,255,0.2)] bg-[rgba(0,180,220,0.3)]" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDateNavigation("next")}
                  aria-label="Next day"
                  className="h-8 w-8 rounded-none dark:hover:bg-[rgba(0,229,255,0.1)] hover:bg-[rgba(0,180,220,0.15)] dark:hover:text-[#00E5FF] hover:text-[#0077B6]"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Theme Toggle */}
            <div className="dark:hover:bg-white/5 hover:bg-black/5 rounded-lg transition-colors duration-200">
              <ThemeToggle />
            </div>

            {/* Settings Icon */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettingsClick}
              aria-label="Open settings"
              className="dark:hover:bg-white/5 hover:bg-black/5 dark:hover:text-[#00E5FF] hover:text-[#0077B6] transition-all duration-200"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
