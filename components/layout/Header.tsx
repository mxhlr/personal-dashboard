"use client";

import { useState, useEffect } from "react";
import { Settings, ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

type ReviewType = "weekly" | "monthly" | "quarterly" | "annual";

interface HeaderProps {
  activeTab: "dashboard" | "daily-log" | "visionboard" | "planning" | "data" | "okr";
  onTabChange: (tab: "dashboard" | "daily-log" | "visionboard" | "planning" | "data" | "okr") => void;
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
  selectedReview = "weekly",
  onReviewChange,
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (tab: typeof activeTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  const handleReviewChange = (review: ReviewType) => {
    onReviewChange?.(review);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b dark:border-[rgba(0,229,255,0.1)] border-[rgba(0,180,220,0.15)]
      dark:bg-[#0A0A0F]/95 bg-white/95 backdrop-blur-md
      shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_10px_rgba(0,229,255,0.03)]
      transition-all duration-300">
      <div className="container mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          {/* Mobile Menu Button - Always rendered, CSS controls visibility */}
          <Drawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden dark:hover:bg-white/5 hover:bg-black/5 dark:hover:text-[#00E5FF] hover:text-[#0077B6]"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle className="font-orbitron text-lg dark:text-[#00E5FF] text-[#0077B6]">
                    Navigation
                  </DrawerTitle>
                </DrawerHeader>
                <nav className="flex flex-col gap-2 p-4">
                  <Button
                    variant={activeTab === "dashboard" ? "default" : "ghost"}
                    onClick={() => handleTabChange("dashboard")}
                    className={`justify-start font-medium font-orbitron text-sm uppercase tracking-wider h-12
                      ${activeTab === "dashboard"
                        ? 'dark:bg-[rgba(0,229,255,0.15)] bg-[rgba(0,180,220,0.15)] dark:text-[#00E5FF] text-[#0077B6]'
                        : 'dark:text-[#888888] text-[#444444] dark:hover:text-[#00E5FF] hover:text-[#0077B6]'}`}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant={activeTab === "daily-log" ? "default" : "ghost"}
                    onClick={() => handleTabChange("daily-log")}
                    className={`justify-start font-medium font-orbitron text-sm uppercase tracking-wider h-12
                      ${activeTab === "daily-log"
                        ? 'dark:bg-[rgba(0,229,255,0.15)] bg-[rgba(0,180,220,0.15)] dark:text-[#00E5FF] text-[#0077B6]'
                        : 'dark:text-[#888888] text-[#444444] dark:hover:text-[#00E5FF] hover:text-[#0077B6]'}`}
                  >
                    Daily Log
                  </Button>
                  <Button
                    variant={activeTab === "data" ? "default" : "ghost"}
                    onClick={() => handleTabChange("data")}
                    className={`justify-start font-medium font-orbitron text-sm uppercase tracking-wider h-12
                      ${activeTab === "data"
                        ? 'dark:bg-[rgba(0,229,255,0.15)] bg-[rgba(0,180,220,0.15)] dark:text-[#00E5FF] text-[#0077B6]'
                        : 'dark:text-[#888888] text-[#444444] dark:hover:text-[#00E5FF] hover:text-[#0077B6]'}`}
                  >
                    Data
                  </Button>
                  <Button
                    variant={activeTab === "okr" ? "default" : "ghost"}
                    onClick={() => handleTabChange("okr")}
                    className={`justify-start font-medium font-orbitron text-sm uppercase tracking-wider h-12
                      ${activeTab === "okr"
                        ? 'dark:bg-[rgba(0,229,255,0.15)] bg-[rgba(0,180,220,0.15)] dark:text-[#00E5FF] text-[#0077B6]'
                        : 'dark:text-[#888888] text-[#444444] dark:hover:text-[#00E5FF] hover:text-[#0077B6]'}`}
                  >
                    OKR
                  </Button>
                  <div className="border-t dark:border-white/[0.08] border-black/[0.12] my-2" />
                  <p className="px-3 text-xs font-orbitron dark:text-[#666666] text-[#777777] uppercase tracking-wider mb-1">
                    Reviews
                  </p>
                  <Button
                    variant="ghost"
                    onClick={() => { handleTabChange("planning"); handleReviewChange("weekly"); }}
                    className="justify-start font-orbitron text-xs uppercase tracking-wide dark:text-[#888888] text-[#444444] dark:hover:text-[#00E5FF] hover:text-[#0077B6] h-11"
                  >
                    Weekly Review
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => { handleTabChange("planning"); handleReviewChange("monthly"); }}
                    className="justify-start font-orbitron text-xs uppercase tracking-wide dark:text-[#888888] text-[#444444] dark:hover:text-[#00E5FF] hover:text-[#0077B6] h-11"
                  >
                    Monthly Review
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => { handleTabChange("planning"); handleReviewChange("quarterly"); }}
                    className="justify-start font-orbitron text-xs uppercase tracking-wide dark:text-[#888888] text-[#444444] dark:hover:text-[#00E5FF] hover:text-[#0077B6] h-11"
                  >
                    Quarterly Review
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => { handleTabChange("planning"); handleReviewChange("annual"); }}
                    className="justify-start font-orbitron text-xs uppercase tracking-wide dark:text-[#888888] text-[#444444] dark:hover:text-[#00E5FF] hover:text-[#0077B6] h-11"
                  >
                    Annual Review
                  </Button>
                  <div className="border-t dark:border-white/[0.08] border-black/[0.12] my-2" />
                  <Button
                    variant={activeTab === "visionboard" ? "default" : "ghost"}
                    onClick={() => handleTabChange("visionboard")}
                    className={`justify-start font-medium font-orbitron text-sm uppercase tracking-wider h-12
                      ${activeTab === "visionboard"
                        ? 'dark:bg-[rgba(0,229,255,0.15)] bg-[rgba(0,180,220,0.15)] dark:text-[#00E5FF] text-[#0077B6]'
                        : 'dark:text-[#888888] text-[#444444] dark:hover:text-[#00E5FF] hover:text-[#0077B6]'}`}
                  >
                    Visionboard
                  </Button>
                </nav>
              </DrawerContent>
            </Drawer>

          {/* Desktop Navigation - Hidden on Mobile */}
          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              onClick={() => onTabChange("dashboard")}
              className={`font-medium font-orbitron text-[13px] uppercase tracking-wider transition-all duration-200
                ${activeTab === "dashboard"
                  ? 'dark:bg-[rgba(0,229,255,0.15)] bg-[rgba(0,180,220,0.15)] dark:text-[#00E5FF] text-[#0077B6] dark:shadow-[0_0_12px_rgba(0,229,255,0.25)] shadow-sm border-0'
                  : 'dark:text-[#888888] text-[#444444] dark:hover:text-[#00E5FF] hover:text-[#0077B6] dark:hover:bg-white/5 hover:bg-black/5'}`}
            >
              Dashboard
            </Button>
            <Button
              variant={activeTab === "daily-log" ? "default" : "ghost"}
              onClick={() => onTabChange("daily-log")}
              className={`font-medium font-orbitron text-[13px] uppercase tracking-wider transition-all duration-200
                ${activeTab === "daily-log"
                  ? 'dark:bg-[rgba(0,229,255,0.15)] bg-[rgba(0,180,220,0.15)] dark:text-[#00E5FF] text-[#0077B6] dark:shadow-[0_0_12px_rgba(0,229,255,0.25)] shadow-sm border-0'
                  : 'dark:text-[#888888] text-[#444444] dark:hover:text-[#00E5FF] hover:text-[#0077B6] dark:hover:bg-white/5 hover:bg-black/5'}`}
            >
              Daily Log
            </Button>
            <Button
              variant={activeTab === "data" ? "default" : "ghost"}
              onClick={() => onTabChange("data")}
              className={`font-medium font-orbitron text-[13px] uppercase tracking-wider transition-all duration-200
                ${activeTab === "data"
                  ? 'dark:bg-[rgba(0,229,255,0.15)] bg-[rgba(0,180,220,0.15)] dark:text-[#00E5FF] text-[#0077B6] dark:shadow-[0_0_12px_rgba(0,229,255,0.25)] shadow-sm border-0'
                  : 'dark:text-[#888888] text-[#444444] dark:hover:text-[#00E5FF] hover:text-[#0077B6] dark:hover:bg-white/5 hover:bg-black/5'}`}
            >
              Data
            </Button>
            <Button
              variant={activeTab === "okr" ? "default" : "ghost"}
              onClick={() => onTabChange("okr")}
              className={`font-medium font-orbitron text-[13px] uppercase tracking-wider transition-all duration-200
                ${activeTab === "okr"
                  ? 'dark:bg-[rgba(0,229,255,0.15)] bg-[rgba(0,180,220,0.15)] dark:text-[#00E5FF] text-[#0077B6] dark:shadow-[0_0_12px_rgba(0,229,255,0.25)] shadow-sm border-0'
                  : 'dark:text-[#888888] text-[#444444] dark:hover:text-[#00E5FF] hover:text-[#0077B6] dark:hover:bg-white/5 hover:bg-black/5'}`}
            >
              OKR
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={activeTab === "planning" ? "default" : "ghost"}
                  className={`font-medium font-orbitron text-[13px] uppercase tracking-wider gap-1.5 transition-all duration-200
                    ${activeTab === "planning"
                      ? 'dark:bg-[rgba(0,229,255,0.15)] bg-[rgba(0,180,220,0.15)] dark:text-[#00E5FF] text-[#0077B6] dark:shadow-[0_0_12px_rgba(0,229,255,0.25)] shadow-sm border-0'
                      : 'dark:text-[#888888] text-[#444444] dark:hover:text-[#00E5FF] hover:text-[#0077B6] dark:hover:bg-white/5 hover:bg-black/5'}`}
                >
                  {activeTab === "planning" ? reviewLabels[selectedReview] : "Reviews"}
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
              variant={activeTab === "visionboard" ? "default" : "ghost"}
              onClick={() => onTabChange("visionboard")}
              className={`font-medium font-orbitron text-[13px] uppercase tracking-wider transition-all duration-200
                ${activeTab === "visionboard"
                  ? 'dark:bg-[rgba(0,229,255,0.15)] bg-[rgba(0,180,220,0.15)] dark:text-[#00E5FF] text-[#0077B6] dark:shadow-[0_0_12px_rgba(0,229,255,0.25)] shadow-sm border-0'
                  : 'dark:text-[#888888] text-[#444444] dark:hover:text-[#00E5FF] hover:text-[#0077B6] dark:hover:bg-white/5 hover:bg-black/5'}`}
            >
              Visionboard
            </Button>
          </nav>

          {/* Right: Time, Theme Toggle, Settings */}
          <div className="flex items-center gap-2 md:gap-3 ml-auto">
            {/* Current Time - Hidden on very small screens */}
            <div className="hidden sm:block text-xs md:text-sm font-orbitron dark:text-[#888888] text-[#555555] tabular-nums">
              {currentTime}
            </div>

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
              className="dark:hover:bg-white/5 hover:bg-black/5 dark:hover:text-[#00E5FF] hover:text-[#0077B6] transition-all duration-200 h-9 w-9 md:h-10 md:w-10"
            >
              <Settings className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
