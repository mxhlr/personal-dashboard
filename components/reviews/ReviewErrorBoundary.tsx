"use client";

import { Component, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  reviewType: "weekly" | "monthly" | "quarterly" | "annual";
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ReviewErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.reviewType} review:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <Card className="p-8 max-w-md text-center space-y-4">
            <h3 className="text-lg font-bold font-orbitron dark:text-[#E0E0E0] text-[#1A1A1A]">
              Error Loading {this.props.reviewType} Review
            </h3>
            <p className="text-sm dark:text-[#999] text-[#666]">
              {this.state.error?.message || "Something went wrong"}
            </p>
            <Button
              onClick={() => this.setState({ hasError: false })}
              variant="outline"
              className="w-full"
            >
              Try Again
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
