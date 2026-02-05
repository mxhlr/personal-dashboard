"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle2, XCircle, Sparkles, Trophy, Target, Zap } from "lucide-react";

interface HabitMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HabitMigrationModal({ isOpen, onClose }: HabitMigrationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Check migration status
  const status = useQuery(api.migrations.migrateUser.checkMigrationStatus);
  const preview = useQuery(api.migrations.migrateUser.getMigrationPreview);

  // Migration mutation
  const migrate = useMutation(api.migrations.migrateUser.migrateToHabitSystem);

  const handleMigrate = async () => {
    setIsLoading(true);
    setMigrationResult(null);

    try {
      const result = await migrate();
      setMigrationResult(result);

      if (result.success) {
        // Close modal after a short delay on success
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      setMigrationResult({
        success: false,
        message: error instanceof Error ? error.message : "Migration failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If already migrated, show success state
  if (status?.isMigrated) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Already Migrated
            </DialogTitle>
            <DialogDescription>
              You have already been migrated to the new habit system.
            </DialogDescription>
          </DialogHeader>

          {status.stats && (
            <div className="space-y-3 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Level</span>
                <Badge variant="secondary">Level {status.stats.level}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total XP</span>
                <Badge variant="secondary">{status.stats.totalXP} XP</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Streak</span>
                <Badge variant="secondary">{status.stats.currentStreak} days</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Longest Streak</span>
                <Badge variant="secondary">{status.stats.longestStreak} days</Badge>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={onClose} variant="default">
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Upgrade to the New Habit System
          </DialogTitle>
          <DialogDescription>
            Transform your daily tracking into a gamified experience with levels, XP, and streaks.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Benefits */}
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <Trophy className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium">Earn XP and Level Up</p>
                <p className="text-sm text-muted-foreground">
                  Gain experience points for completing habits and watch your level grow
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Build Streaks</p>
                <p className="text-sm text-muted-foreground">
                  Track consecutive days of completion and beat your personal best
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Organized Categories</p>
                <p className="text-sm text-muted-foreground">
                  Your habits grouped into meaningful categories for better focus
                </p>
              </div>
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-medium mb-3">What will be created:</h4>
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {preview.categories.map((category, idx) => (
                    <div key={idx}>
                      <p className="font-medium text-sm mb-1">
                        {category.icon} {category.name}
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-0.5 ml-6">
                        {category.habits.map((habit, habitIdx) => (
                          <li key={habitIdx}>• {habit}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Possible Daily XP:</span>
                  <Badge variant="secondary">{preview.totalPossibleXP} XP</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Migration Result */}
          {migrationResult && (
            <div
              className={`rounded-lg p-4 ${
                migrationResult.success
                  ? "bg-green-50 text-green-900 border border-green-200"
                  : "bg-red-50 text-red-900 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {migrationResult.success ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
                <p className="font-medium">{migrationResult.message}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button onClick={onClose} variant="outline" disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleMigrate}
            disabled={isLoading || migrationResult?.success}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Migrating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Upgrade Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
