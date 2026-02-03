"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FixPage() {
  const router = useRouter();
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<{ fixed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFix = async () => {
    setIsFixing(true);
    setError(null);
    try {
      const res = await fetch("/api/fix-custom-fields", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fix fields");
      }

      setResult(data.result);
    } catch (err) {
      console.error("Failed to fix fields:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Custom Fields Fix</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Diese Seite repariert Custom Fields, die fälschlicherweise als Default-Felder markiert wurden.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {result ? (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-sm">
                ✓ {result.fixed} Felder wurden repariert!
              </p>
            </div>
            <Button onClick={() => router.push("/")} className="w-full">
              Zum Dashboard
            </Button>
          </div>
        ) : (
          <Button onClick={handleFix} disabled={isFixing} className="w-full">
            {isFixing ? "Repariere..." : "Custom Fields Reparieren"}
          </Button>
        )}
      </div>
    </div>
  );
}
