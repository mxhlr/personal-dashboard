"use client";

import React from "react";
import { logger } from "@/lib/logger";
import { reportError } from "@/lib/errors/errorReporting";

interface ReviewErrorBoundaryProps {
  children: React.ReactNode;
  reviewType?: "weekly" | "monthly" | "quarterly" | "annual";
}

interface ReviewErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ReviewErrorBoundary extends React.Component<
  ReviewErrorBoundaryProps,
  ReviewErrorBoundaryState
> {
  constructor(props: ReviewErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ReviewErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error("ReviewErrorBoundary caught an error:", error, errorInfo);

    // Report error with context
    reportError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'ReviewErrorBoundary',
      reviewType: this.props.reviewType,
    });
  }

  render() {
    if (this.state.hasError) {
      const reviewTypeLabel = this.props.reviewType
        ? `${this.props.reviewType.charAt(0).toUpperCase()}${this.props.reviewType.slice(1)} Review`
        : "Review";

      return (
        <div
          className="min-h-[calc(100vh-64px)] relative overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at center, var(--daily-log-bg-start) 0%, var(--daily-log-bg-end) 100%)'
          }}
        >
          {/* Subtle grid overlay for HUD effect */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.015]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 229, 255, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 229, 255, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />

          {/* Animated scanline effect */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              background: 'linear-gradient(transparent 40%, rgba(0, 229, 255, 0.2) 50%, transparent 60%)',
              backgroundSize: '100% 4px',
              animation: 'scanline 8s linear infinite'
            }}
          />

          <div className="relative max-w-4xl mx-auto px-8 py-8 flex items-center justify-center min-h-[calc(100vh-64px)]">
            <div className="w-full max-w-lg">
              {/* Error Card */}
              <div
                className="group dark:border-[rgba(255,82,82,0.3)] border-[rgba(239,68,68,0.3)] dark:bg-card/50 bg-white/80
                  shadow-xl rounded-2xl p-8 space-y-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 82, 82, 0.08) 0%, rgba(239, 68, 68, 0.06) 100%), rgba(26, 26, 26, 0.5)',
                  borderWidth: '2px'
                }}
              >
                {/* Error Icon */}
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full dark:bg-red-500/10 bg-red-50 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 dark:text-red-400 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Error Title */}
                <div className="text-center space-y-2">
                  <h2
                    className="text-[28px] font-bold dark:text-[#E0E0E0] text-[#1A1A1A]"
                    style={{
                      fontFamily: '"Courier New", "Monaco", monospace',
                      letterSpacing: '1px'
                    }}
                  >
                    Oops! Etwas ist schiefgelaufen
                  </h2>
                  <p
                    className="text-[13px] dark:text-[#525252] text-[#3d3d3d]"
                    style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                  >
                    Beim Laden des {reviewTypeLabel} ist ein Fehler aufgetreten
                  </p>
                </div>

                {/* Error Details */}
                {this.state.error && (
                  <div className="dark:bg-white/[0.03] bg-black/[0.02] rounded-lg p-4 border dark:border-white/[0.08] border-black/[0.05]">
                    <p
                      className="text-xs dark:text-[#525252] text-[#3d3d3d] font-mono break-all"
                      style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                    >
                      {this.state.error.message}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full px-6 py-3 bg-[#00E676] dark:text-black text-black font-bold uppercase tracking-wider text-[11px]
                      border border-[#00E676]/50 shadow-sm
                      hover:bg-[#00C853] hover:shadow-md hover:scale-[1.02]
                      transition-all duration-300 rounded-lg"
                    style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                  >
                    Seite neu laden
                  </button>

                  <button
                    onClick={() => {
                      window.location.href = '/';
                    }}
                    className="w-full px-6 py-3 dark:bg-white/[0.06] bg-black/[0.04]
                      dark:border dark:border-white/[0.1] border border-black/[0.08]
                      dark:text-[#E0E0E0] text-[#1A1A1A]
                      dark:hover:bg-white/[0.1] hover:bg-black/[0.06]
                      uppercase tracking-wider text-[11px] font-bold transition-all duration-200 rounded-lg
                      hover:scale-[1.02]"
                    style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                  >
                    Zurück zum Dashboard
                  </button>
                </div>

                {/* Help Text */}
                <div className="pt-4 border-t dark:border-white/[0.08] border-black/[0.05]">
                  <p
                    className="text-[11px] dark:text-[#3d3d3d] text-[#525252] text-center"
                    style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                  >
                    Wenn das Problem weiterhin besteht, versuche die Seite neu zu laden
                    oder kehre zum Dashboard zurück.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
