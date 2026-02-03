"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FixFieldsPage() {
  const router = useRouter();
  const fixCustomFields = useMutation(api.trackingFields.fixCustomFields);
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<{ fixed: number } | null>(null);

  const handleFix = async () => {
    setIsFixing(true);
    try {
      const res = await fixCustomFields();
      setResult(res);
    } catch (error) {
      console.error("Failed to fix fields:", error);
      alert("Fehler beim Fixen der Felder");
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Custom Fields Fix</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Diese Seite behebt Custom Fields, die fälschlicherweise als Default-Felder markiert wurden.
        </p>

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
