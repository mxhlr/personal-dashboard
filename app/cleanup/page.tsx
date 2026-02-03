"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CleanupPage() {
  const router = useRouter();
  const adminCleanupFields = useMutation(api.trackingFields.adminCleanupFields);
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCleanup = async () => {
    setIsFixing(true);
    try {
      const res = await adminCleanupFields();
      setResult(res);
    } catch (error) {
      console.error("Failed to cleanup:", error);
      alert("Fehler beim Cleanup");
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Cleanup Duplicate Fields</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Entfernt doppelte "steps" Felder und setzt isDefault korrekt.
        </p>

        {result ? (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-sm font-semibold mb-2">✓ Cleanup abgeschlossen!</p>
              <p className="text-xs">Felder repariert: {result.fixed}</p>
              <p className="text-xs">Duplikate gelöscht: {result.deleted}</p>
              {result.duplicatesRemoved.length > 0 && (
                <p className="text-xs mt-2">
                  Entfernt: {result.duplicatesRemoved.join(", ")}
                </p>
              )}
              {result.fieldsFixed.length > 0 && (
                <p className="text-xs">
                  Repariert: {result.fieldsFixed.join(", ")}
                </p>
              )}
            </div>
            <Button onClick={() => router.push("/")} className="w-full">
              Zum Dashboard
            </Button>
          </div>
        ) : (
          <Button onClick={handleCleanup} disabled={isFixing} className="w-full">
            {isFixing ? "Cleanup läuft..." : "Jetzt Cleanup starten"}
          </Button>
        )}
      </div>
    </div>
  );
}
