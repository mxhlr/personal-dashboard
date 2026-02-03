"use client";

import { Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  activeTab: "visionboard" | "planning" | "data" | "coach";
  onTabChange: (tab: "visionboard" | "planning" | "data" | "coach") => void;
  onSettingsClick: () => void;
  onDateNavigation?: (direction: "prev" | "next" | "today") => void;
}

export default function Header({
  activeTab,
  onTabChange,
  onSettingsClick,
  onDateNavigation,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card backdrop-blur-sm shadow-sm transition-shadow duration-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Left: 4 Main Tabs */}
          <nav className="flex items-center gap-1">
            <Button
              variant={activeTab === "visionboard" ? "default" : "ghost"}
              onClick={() => onTabChange("visionboard")}
              className="font-medium"
            >
              Visionboard
            </Button>
            <Button
              variant={activeTab === "planning" ? "default" : "ghost"}
              onClick={() => onTabChange("planning")}
              className="font-medium"
            >
              Planning & Review
            </Button>
            <Button
              variant={activeTab === "data" ? "default" : "ghost"}
              onClick={() => onTabChange("data")}
              className="font-medium"
            >
              Data
            </Button>
            <Button
              variant={activeTab === "coach" ? "default" : "ghost"}
              onClick={() => onTabChange("coach")}
              className="font-medium"
            >
              Coach
            </Button>
          </nav>

          {/* Right: Date Navigation & Settings */}
          <div className="flex items-center gap-2">
            {/* Date Navigation (only show on Planning & Review tab) */}
            {activeTab === "planning" && onDateNavigation && (
              <div className="flex items-center gap-2 border border-border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDateNavigation("prev")}
                  aria-label="Previous day"
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => onDateNavigation("today")}
                  className="h-8 px-3 text-sm font-medium"
                >
                  TODAY
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDateNavigation("next")}
                  aria-label="Next day"
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Settings Icon */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettingsClick}
              aria-label="Open settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
