"use client";

import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CleanupNowPage() {
  const router = useRouter();
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<{ fixed: number; deleted: number } | null>(null);

  const handleCleanup = async () => {
    setIsFixing(true);
    try {
      const res = await fetch("/api/cleanup-fields", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed");
      }

      setResult(data.result);
      
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 2000);
    } catch (error) {
      logger.error("Failed:", error);
      alert("Fehler: " + (error instanceof Error ? error.message : "Unknown"));
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Duplikate entfernen</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Entfernt doppelte Felder wie Phone Jail.
        </p>

        {result ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p className="text-sm font-semibold">Fertig!</p>
            <p className="text-xs mt-2">Repariert: {result.fixed}</p>
            <p className="text-xs">Gelöscht: {result.deleted}</p>
          </div>
        ) : (
          <Button onClick={handleCleanup} disabled={isFixing} className="w-full">
            {isFixing ? "Läuft..." : "Cleanup starten"}
          </Button>
        )}
      </div>
    </div>
  );
}
