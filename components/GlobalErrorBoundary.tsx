"use client";

import React from "react";
import { logger } from "@/lib/logger";
import { reportError, getBreadcrumbs } from "@/lib/errors/errorReporting";
import { isAppError } from "@/lib/errors/errorTypes";

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error, resetError: () => void) => React.ReactNode;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Global error boundary component
 *
 * Catches errors anywhere in the component tree and displays a fallback UI.
 * Integrates with error reporting and breadcrumb tracking.
 */
export class GlobalErrorBoundary extends React.Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): GlobalErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error
    logger.error("GlobalErrorBoundary caught an error:", error, errorInfo);

    // Report error with context
    reportError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'GlobalErrorBoundary',
    });

    // Update state with error info
    this.setState({ errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-card border border-border rounded-lg p-8 space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-500"
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
              <h2 className="text-2xl font-bold text-foreground">
                Etwas ist schiefgelaufen
              </h2>
              <p className="text-muted-foreground">
                Ein unerwarteter Fehler ist aufgetreten. Wir haben das Problem protokolliert.
              </p>
            </div>

            {/* Error Message */}
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <p className="text-sm font-mono text-foreground break-all">
                {this.state.error.message}
              </p>
            </div>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === 'development' && this.state.error.stack && (
              <details className="bg-muted/30 rounded-lg p-4 border border-border">
                <summary className="text-sm font-medium text-foreground cursor-pointer mb-2">
                  Stack Trace
                </summary>
                <pre className="text-xs text-muted-foreground overflow-auto max-h-64 whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            {/* Component Stack (Development only) */}
            {process.env.NODE_ENV === 'development' && this.state.errorInfo?.componentStack && (
              <details className="bg-muted/30 rounded-lg p-4 border border-border">
                <summary className="text-sm font-medium text-foreground cursor-pointer mb-2">
                  Component Stack
                </summary>
                <pre className="text-xs text-muted-foreground overflow-auto max-h-64 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            {/* Breadcrumbs (Development only) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="bg-muted/30 rounded-lg p-4 border border-border">
                <summary className="text-sm font-medium text-foreground cursor-pointer mb-2">
                  Breadcrumbs ({getBreadcrumbs().length})
                </summary>
                <div className="space-y-2 mt-2 max-h-64 overflow-auto">
                  {getBreadcrumbs().map((breadcrumb, index) => (
                    <div
                      key={index}
                      className="text-xs text-muted-foreground border-l-2 border-muted pl-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{breadcrumb.category}</span>
                        <span className="text-[10px]">
                          {breadcrumb.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div>{breadcrumb.message}</div>
                      {breadcrumb.data && (
                        <pre className="mt-1 text-[10px] opacity-70">
                          {JSON.stringify(breadcrumb.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            )}

            {/* Error Code (AppError only) */}
            {isAppError(this.state.error) && (
              <div className="text-center text-xs text-muted-foreground">
                Error Code: {this.state.error.code}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.resetError}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg
                  hover:bg-primary/90 transition-colors font-medium"
              >
                Erneut versuchen
              </button>

              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-6 py-3 bg-muted text-foreground rounded-lg
                  hover:bg-muted/80 transition-colors font-medium border border-border"
              >
                Seite neu laden
              </button>

              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="flex-1 px-6 py-3 bg-muted text-foreground rounded-lg
                  hover:bg-muted/80 transition-colors font-medium border border-border"
              >
                Zum Dashboard
              </button>
            </div>

            {/* Help Text */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Wenn das Problem weiterhin besteht, versuchen Sie die Seite neu zu laden
                oder kehren Sie zum Dashboard zurück. Bei anhaltenden Problemen kontaktieren
                Sie bitte den Support.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
