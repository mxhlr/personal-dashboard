"use client";

import { Button } from "@/components/ui/button";

interface Step1WelcomeProps {
  onNext: () => void;
}

export default function Step1Welcome({ onNext }: Step1WelcomeProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-8 text-center">
      <div className="mb-8">
        <div className="text-6xl mb-4">👋</div>
        <h1 className="text-3xl font-bold mb-4">Willkommen!</h1>
        <p className="text-lg text-muted-foreground">
          Ich bin dein Personal Coach.
        </p>
        <p className="text-lg text-muted-foreground">
          Lass uns in 5 Minuten alles einrichten.
        </p>
      </div>

      <Button onClick={onNext} size="lg" className="px-8">
        Los geht's →
      </Button>
    </div>
  );
}
