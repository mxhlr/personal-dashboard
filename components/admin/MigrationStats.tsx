"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Users, CheckCircle2, XCircle, PlayCircle } from "lucide-react";

export function MigrationStats() {
  const [isLoading, setIsLoading] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Get migration stats
  const stats = useQuery(api.migrations.adminCommands.getMigrationStats);

  // Mutation to migrate all users
  const migrateAll = useMutation(api.migrations.adminCommands.migrateAllUsers);

  const handleMigrateAll = async () => {
    if (!confirm("Are you sure you want to migrate ALL users? This cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    setMigrationResult(null);

    try {
      const result = await migrateAll();
      setMigrationResult(result);
    } catch (error) {
      setMigrationResult({
        success: false,
        message: error instanceof Error ? error.message : "Migration failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Migration Stats...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Habit System Migration</CardTitle>
          <CardDescription>Track the progress of user migrations to the new habit system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Migration Progress</span>
              <span className="text-sm text-muted-foreground">
                {stats.migratedUsers} / {stats.totalUsers} users
              </span>
            </div>
            <Progress value={stats.migrationProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {stats.migrationProgress.toFixed(1)}% of users have been migrated
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Users</p>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Migrated</p>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <p className="text-2xl font-bold text-green-600">{stats.migratedUsers}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Not Migrated</p>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-orange-600" />
                <p className="text-2xl font-bold text-orange-600">{stats.notMigratedUsers}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">With Stats</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{stats.usersWithStats}</Badge>
              </div>
            </div>
          </div>

          {/* Data Stats */}
          <div className="border-t pt-4 space-y-2">
            <h4 className="text-sm font-medium">Data Created</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Categories</p>
                <p className="font-medium">{stats.totalHabitCategories}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Templates</p>
                <p className="font-medium">{stats.totalHabitTemplates}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Daily Habits</p>
                <p className="font-medium">{stats.totalDailyHabits}</p>
              </div>
            </div>
          </div>

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

          {/* Actions */}
          {stats.notMigratedUsers > 0 && (
            <div className="border-t pt-4">
              <Button
                onClick={handleMigrateAll}
                disabled={isLoading}
                variant="default"
                className="gap-2 w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Migrating All Users...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4" />
                    Migrate All Remaining Users ({stats.notMigratedUsers})
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
