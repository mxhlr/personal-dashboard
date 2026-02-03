"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import SetupWizard from "@/components/onboarding/SetupWizard";

export default function SetupPage() {
  const router = useRouter();
  const hasCompletedSetup = useQuery(api.userProfile.hasCompletedSetup);

  // Redirect to dashboard if setup is already completed
  useEffect(() => {
    if (hasCompletedSetup === true) {
      console.log("Setup already completed, redirecting to dashboard");
      router.push("/");
      router.refresh();
    }
  }, [hasCompletedSetup, router]);

  // Show loading while checking
  if (hasCompletedSetup === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lädt...</p>
        </div>
      </div>
    );
  }

  // If setup is completed, don't show the wizard (redirect will happen)
  if (hasCompletedSetup === true) {
    return null;
  }

  return <SetupWizard />;
}
