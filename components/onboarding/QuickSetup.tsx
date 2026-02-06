"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function QuickSetup() {
  const router = useRouter();
  const [step, setStep] = useState<"welcome" | "name" | "complete">("welcome");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createMinimalProfile = useMutation(api.userProfile.createMinimalProfile);
  const initializeUserStats = useMutation(api.gamification.initializeUserStats);

  const handleStart = () => {
    setStep("name");
  };

  const handleComplete = async () => {
    if (!name.trim()) {
      toast.error("Bitte gib deinen Namen ein");
      return;
    }

    setIsLoading(true);
    try {
      // Create minimal profile
      await createMinimalProfile({ name: name.trim() });

      // Initialize user stats
      await initializeUserStats({});

      toast.success("Willkommen! 🎉", {
        description: "Dein Dashboard wurde eingerichtet",
      });

      setStep("complete");

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error("Setup error:", error);
      toast.error("Fehler beim Einrichten", {
        description: error instanceof Error ? error.message : "Bitte versuche es erneut",
      });
      setIsLoading(false);
    }
  };

  const handleSkipToAdvanced = () => {
    router.push("/setup/advanced");
  };

  if (step === "welcome") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 dark:from-cyan-500 dark:to-blue-600 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl">Willkommen!</CardTitle>
            <CardDescription className="text-base">
              Lass uns dein persönliches Dashboard in nur 2 Minuten einrichten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleStart} className="w-full" size="lg">
              Los geht&apos;s
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={handleSkipToAdvanced}
              variant="ghost"
              className="w-full text-xs"
              size="sm"
            >
              Erweiterte Einrichtung (alle Features)
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "name") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Wie heißt du?</CardTitle>
            <CardDescription>
              Damit wir dich persönlich ansprechen können
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Input
                placeholder="Dein Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleComplete()}
                autoFocus
                className="text-lg"
              />
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleComplete}
                disabled={!name.trim() || isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Wird eingerichtet...
                  </>
                ) : (
                  <>
                    Dashboard erstellen
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Du kannst später jederzeit weitere Details hinzufügen
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Complete step
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-green-600 to-emerald-700 dark:from-green-500 dark:to-emerald-600 flex items-center justify-center animate-pulse">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl">Alles bereit! 🎉</CardTitle>
          <CardDescription className="text-base">
            Dein Dashboard wird gleich geladen...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="h-2 w-48 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-600 to-blue-700 dark:from-cyan-500 dark:to-blue-600 animate-[progress_1.5s_ease-in-out]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
