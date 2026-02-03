"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OnboardingData } from "./SetupWizard";

interface Step2AboutYouProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2AboutYou({
  data,
  onUpdate,
  onNext,
  onBack,
}: Step2AboutYouProps) {
  const canProceed = data.name && data.role && data.mainProject;

  return (
    <div className="bg-card border border-border rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6">Schritt 1/5: Über dich</h2>

      <div className="space-y-6">
        <div>
          <Label htmlFor="name">Wie heißt du?</Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Dein Name"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="role">Was beschreibt dich am besten?</Label>
          <Select value={data.role} onValueChange={(value) => onUpdate({ role: value })}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Wähle eine Rolle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Gründer">Gründer</SelectItem>
              <SelectItem value="Executive">Executive</SelectItem>
              <SelectItem value="Freelancer">Freelancer</SelectItem>
              <SelectItem value="Student">Student</SelectItem>
              <SelectItem value="Angestellt">Angestellt</SelectItem>
              <SelectItem value="Selbstständig">Selbstständig</SelectItem>
              <SelectItem value="Andere">Andere</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="mainProject">Was ist dein Hauptprojekt gerade?</Label>
          <Input
            id="mainProject"
            value={data.mainProject}
            onChange={(e) => onUpdate({ mainProject: e.target.value })}
            placeholder="z.B. Mein SaaS-Startup"
            className="mt-2"
          />
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack}>
          ← Zurück
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Weiter →
        </Button>
      </div>
    </div>
  );
}
