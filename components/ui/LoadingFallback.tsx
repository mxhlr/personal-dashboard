"use client";

import { Loader2 } from "lucide-react";

interface LoadingFallbackProps {
  message?: string;
  className?: string;
}

export function LoadingFallback({
  message = "Lädt...",
  className = ""
}: LoadingFallbackProps) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export function FullPageLoadingFallback({ message = "Lädt..." }: LoadingFallbackProps) {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
