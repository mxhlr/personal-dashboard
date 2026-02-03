"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "sonner";

export default function DebugPage() {
  const { user, isLoaded } = useUser();
  const debugInfo = useQuery(api.debug.checkAuthAndProfile);
  const hasCompletedSetup = useQuery(api.userProfile.hasCompletedSetup);
  const forceCompleteSetup = useMutation(api.admin.forceCompleteSetup);
  const [isForcing, setIsForcing] = useState(false);

  const handleForceComplete = async () => {
    if (!confirm("Are you sure you want to force mark setup as completed? This should only be used if you have a profile but setupCompleted is false.")) {
      return;
    }

    setIsForcing(true);
    try {
      await forceCompleteSetup({});
      toast.success("Setup marked as completed! Redirecting...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      console.error("Failed to force complete setup:", error);
      toast.error(error instanceof Error ? error.message : "Failed to force complete setup");
    } finally {
      setIsForcing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Debug Information</h1>

        {/* Clerk Auth Status */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Clerk Authentication</h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Loaded:</span>
              <span className={isLoaded ? "text-green-500" : "text-red-500"}>
                {isLoaded ? "✓ Yes" : "✗ No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID:</span>
              <span className="text-foreground">{user?.id || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="text-foreground">{user?.primaryEmailAddress?.emailAddress || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="text-foreground">{user?.fullName || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Convex Auth Status */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Convex Authentication</h2>
          {debugInfo ? (
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Authenticated:</span>
                <span className={debugInfo.authenticated ? "text-green-500" : "text-red-500"}>
                  {debugInfo.authenticated ? "✓ Yes" : "✗ No"}
                </span>
              </div>
              {debugInfo.authenticated && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">User ID:</span>
                    <span className="text-foreground">{debugInfo.userId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="text-foreground">{debugInfo.userEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="text-foreground">{debugInfo.userName}</span>
                  </div>
                </>
              )}
              {!debugInfo.authenticated && (
                <div className="text-red-500 mt-2">
                  Error: {debugInfo.error}
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Loading...</p>
          )}
        </div>

        {/* Profile Status */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Profile Status</h2>
          {debugInfo ? (
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profile Exists:</span>
                <span className={debugInfo.profileExists ? "text-green-500" : "text-red-500"}>
                  {debugInfo.profileExists ? "✓ Yes" : "✗ No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Setup Completed:</span>
                <span className={debugInfo.setupCompleted ? "text-green-500" : "text-red-500"}>
                  {debugInfo.setupCompleted ? "✓ Yes" : "✗ No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">hasCompletedSetup Query:</span>
                <span className={hasCompletedSetup ? "text-green-500" : "text-red-500"}>
                  {hasCompletedSetup === undefined
                    ? "Loading..."
                    : hasCompletedSetup
                      ? "✓ True"
                      : "✗ False"}
                </span>
              </div>
              {debugInfo.profileData && (
                <>
                  <div className="mt-4 pt-4 border-t border-border">
                    <h3 className="font-semibold mb-2 text-foreground">Profile Data:</h3>
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto text-foreground">
                      {JSON.stringify(debugInfo.profileData, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Loading...</p>
          )}
        </div>

        {/* Environment Info */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Environment</h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Convex URL:</span>
              <span className="text-foreground text-xs">
                {process.env.NEXT_PUBLIC_CONVEX_URL || "Not set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Node ENV:</span>
              <span className="text-foreground">{process.env.NODE_ENV}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = "/"}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => window.location.href = "/setup"}
              className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Go to Setup
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/90 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>

        {/* Emergency Fix */}
        {debugInfo?.profileExists && !debugInfo?.setupCompleted && (
          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2 text-yellow-500">Emergency Fix Available</h2>
            <p className="text-sm text-muted-foreground mb-4">
              You have a profile but setupCompleted is false. This can happen if setup was interrupted.
              Click below to force mark setup as completed.
            </p>
            <button
              onClick={handleForceComplete}
              disabled={isForcing}
              className="w-full px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isForcing ? "Fixing..." : "Force Complete Setup"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
