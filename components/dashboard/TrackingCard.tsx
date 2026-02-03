"use client";

import { ReactNode } from "react";

interface TrackingCardProps {
  label: string;
  children: ReactNode;
}

export function TrackingCard({ label, children }: TrackingCardProps) {
  return (
    <div className="bg-card rounded-lg shadow-sm p-6 border border-border transition-shadow duration-200 hover:shadow-md">
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </label>
        <div>{children}</div>
      </div>
    </div>
  );
}
