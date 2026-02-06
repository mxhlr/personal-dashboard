"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ShieldCheck, Clock } from "lucide-react";
import { toast } from "sonner";

export function StreakProtection() {
  const freezeStatus = useQuery(api.gamification.isStreakFreezeActive);
  const useFreeze = useMutation(api.gamification.useStreakFreeze);

  const handleUseFreeze = async () => {
    try {
      const result = await useFreeze({});
      toast.success("Streak Freeze aktiviert! 🛡️", {
        description: `Dein Streak ist jetzt für 24 Stunden geschützt. Verbleibende Freezes: ${result.freezesRemaining}`,
      });
    } catch (error) {
      toast.error("Fehler beim Aktivieren", {
        description: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten",
      });
    }
  };

  if (!freezeStatus) {
    return null;
  }

  const formatTimeRemaining = (expiresAt?: number) => {
    if (!expiresAt) return "";
    const now = Date.now();
    const remaining = expiresAt - now;
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {freezeStatus.active ? (
            <ShieldCheck className="h-5 w-5 text-cyan-500" />
          ) : (
            <Shield className="h-5 w-5 text-cyan-500/60" />
          )}
          <CardTitle className="text-lg">Streak Protection</CardTitle>
        </div>
        <CardDescription>
          Schütze deinen Streak vor unerwarteten Unterbrechungen
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        {freezeStatus.active ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <ShieldCheck className="h-5 w-5 text-cyan-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-cyan-500">Freeze Aktiv</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Noch {formatTimeRemaining(freezeStatus.expiresAt)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Nutze einen Streak Freeze, um deinen Streak für 24 Stunden zu schützen.
              Perfekt für Krankheitstage oder unerwartete Ereignisse.
            </p>
          </div>
        )}

        {/* Freezes Available */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div>
            <p className="text-sm font-medium">Verfügbare Freezes</p>
            <p className="text-xs text-muted-foreground">
              Wird monatlich aufgefüllt
            </p>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 2 }).map((_, i) => (
              <Shield
                key={i}
                className={`h-5 w-5 ${
                  i < freezeStatus.freezesAvailable
                    ? "text-cyan-500 fill-cyan-500/20"
                    : "text-muted-foreground/20"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Action Button */}
        {!freezeStatus.active && (
          <Button
            onClick={handleUseFreeze}
            disabled={freezeStatus.freezesAvailable === 0}
            className="w-full"
            variant={freezeStatus.freezesAvailable > 0 ? "default" : "secondary"}
          >
            {freezeStatus.freezesAvailable > 0 ? (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Freeze aktivieren
              </>
            ) : (
              "Keine Freezes verfügbar"
            )}
          </Button>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• 2 Freezes pro Monat</p>
          <p>• Jeder Freeze schützt für 24 Stunden</p>
          <p>• Streak wird nicht unterbrochen bei fehlenden Habits</p>
        </div>
      </CardContent>
    </Card>
  );
}
