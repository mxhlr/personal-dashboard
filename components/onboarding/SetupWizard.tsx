"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Step1Welcome from "./Step1Welcome";
import Step2AboutYou from "./Step2AboutYou";
import Step3NorthStars from "./Step3NorthStars";
import Step4Milestones from "./Step4Milestones";
import Step5Tracking from "./Step5Tracking";
import Step6Coach from "./Step6Coach";
import Step7Done from "./Step7Done";

export interface OnboardingData {
  // Step 2
  name: string;
  role: string;
  mainProject: string;

  // Step 3
  northStars: {
    wealth: string;
    health: string;
    love: string;
    happiness: string;
  };

  // Step 4
  milestones: {
    wealth: string[];
    health: string[];
    love: string[];
    happiness: string[];
  };

  // Step 5
  trackingFields: {
    name: string;
    type: string;
    hasStreak: boolean;
    weeklyTarget?: number;
  }[];

  // Step 6
  coachTone: string;
}

export default function SetupWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    name: "",
    role: "",
    mainProject: "",
    northStars: {
      wealth: "",
      health: "",
      love: "",
      happiness: "",
    },
    milestones: {
      wealth: [],
      health: [],
      love: [],
      happiness: [],
    },
    trackingFields: [],
    coachTone: "Direkt",
  });

  const createUserProfile = useMutation(api.userProfile.createUserProfile);
  const createTrackingFields = useMutation(api.trackingFields.createDefaultTrackingFields);

  const updateData = (newData: Partial<OnboardingData>) => {
    setData({ ...data, ...newData });
  };

  const nextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeSetup = async () => {
    try {
      console.log("Starting setup...");
      const currentYear = new Date().getFullYear();
      const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);

      // Prepare quarterly milestones
      const quarterlyMilestones = [
        ...data.milestones.wealth.map(m => ({
          quarter: currentQuarter,
          year: currentYear,
          area: "wealth",
          milestone: m,
          completed: false,
        })),
        ...data.milestones.health.map(m => ({
          quarter: currentQuarter,
          year: currentYear,
          area: "health",
          milestone: m,
          completed: false,
        })),
        ...data.milestones.love.map(m => ({
          quarter: currentQuarter,
          year: currentYear,
          area: "love",
          milestone: m,
          completed: false,
        })),
        ...data.milestones.happiness.map(m => ({
          quarter: currentQuarter,
          year: currentYear,
          area: "happiness",
          milestone: m,
          completed: false,
        })),
      ];

      console.log("Creating user profile...");
      console.log("Profile data:", {
        name: data.name,
        role: data.role,
        mainProject: data.mainProject,
        northStars: data.northStars,
        quarterlyMilestones,
        coachTone: data.coachTone,
      });

      // Create user profile
      await createUserProfile({
        name: data.name,
        role: data.role,
        mainProject: data.mainProject,
        northStars: data.northStars,
        quarterlyMilestones,
        coachTone: data.coachTone,
      });

      console.log("User profile created successfully");

      // Create tracking fields
      console.log("Creating tracking fields...");
      console.log("Tracking fields:", data.trackingFields);

      await createTrackingFields({
        selectedFields: data.trackingFields,
      });

      console.log("Tracking fields created successfully");

      // Show success step
      nextStep();

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error("Setup error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      alert(`Fehler beim Speichern: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}. Bitte versuche es erneut.`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        {currentStep < 7 && (
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Schritt {currentStep} von 6
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 6) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Steps */}
        {currentStep === 1 && <Step1Welcome onNext={nextStep} />}
        {currentStep === 2 && (
          <Step2AboutYou
            data={data}
            onUpdate={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {currentStep === 3 && (
          <Step3NorthStars
            data={data}
            onUpdate={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {currentStep === 4 && (
          <Step4Milestones
            data={data}
            onUpdate={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {currentStep === 5 && (
          <Step5Tracking
            data={data}
            onUpdate={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {currentStep === 6 && (
          <Step6Coach
            data={data}
            onUpdate={updateData}
            onComplete={completeSetup}
            onBack={prevStep}
          />
        )}
        {currentStep === 7 && <Step7Done northStars={data.northStars} />}
      </div>
    </div>
  );
}
