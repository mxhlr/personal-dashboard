"use client";

import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Settings } from "lucide-react";
import { toast } from "sonner";
import { ManageHabitsDialog } from "@/components/habits/ManageHabitsDialog";
import { VisionBoardSettings } from "@/components/settings/VisionBoardSettings";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const profile = useQuery(api.settings.getProfile);

  const updateProfile = useMutation(api.settings.updateProfile);
  const updateNorthStars = useMutation(api.settings.updateNorthStars);
  const updateCoachTone = useMutation(api.settings.updateCoachTone);
  const seedHabitSystem = useMutation(api.migrations.migrateUser.migrateToHabitSystem);
  const resetHabitSystem = useMutation(api.migrations.migrateUser.resetHabitSystem);
  const resetAllData = useMutation(api.gamification.resetAllData);

  const [isSaving, setIsSaving] = useState(false);
  const [manageHabitsOpen, setManageHabitsOpen] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    role: "",
    mainProject: "",
  });

  // North Stars form state
  const [northStarsForm, setNorthStarsForm] = useState({
    wealth: "",
    health: "",
    love: "",
    happiness: "",
  });

  // Coach tone state
  const [coachTone, setCoachTone] = useState("");

  // Initialize forms when profile loads
  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name,
        role: profile.role,
        mainProject: profile.mainProject,
      });
      setNorthStarsForm(profile.northStars);
      setCoachTone(profile.coachTone);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile(profileForm);
      toast.success("Profil gespeichert!");
    } catch (error) {
      logger.error("Failed to save profile:", error);
      toast.error("Fehler beim Speichern");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNorthStars = async () => {
    setIsSaving(true);
    try {
      await updateNorthStars({ northStars: northStarsForm });
      toast.success("North Stars gespeichert!");
    } catch (error) {
      logger.error("Failed to save North Stars:", error);
      toast.error("Fehler beim Speichern");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCoachTone = async () => {
    setIsSaving(true);
    try {
      await updateCoachTone({ coachTone });
      toast.success("Coach Ton gespeichert!");
    } catch (error) {
      logger.error("Failed to save coach tone:", error);
      toast.error("Fehler beim Speichern");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  if (profile === undefined) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold">Einstellungen</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="northstars">North Stars</TabsTrigger>
              <TabsTrigger value="habits">Habits</TabsTrigger>
              <TabsTrigger value="visionboard">Vision Board</TabsTrigger>
              <TabsTrigger value="coach">Coach</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  placeholder="Dein Name"
                />
              </div>

              <div className="space-y-2">
                <Label>Rolle</Label>
                <Select
                  value={profileForm.role}
                  onValueChange={(value) =>
                    setProfileForm({ ...profileForm, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
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

              <div className="space-y-2">
                <Label>Hauptprojekt</Label>
                <Input
                  value={profileForm.mainProject}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      mainProject: e.target.value,
                    })
                  }
                  placeholder="z.B. Mein SaaS-Startup"
                />
              </div>

              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? "Speichert..." : "Speichern"}
              </Button>
            </TabsContent>

            {/* North Stars Tab */}
            <TabsContent value="northstars" className="space-y-4 mt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Deine Jahresziele für die 4 Lebensbereiche
              </p>

              <div className="space-y-2">
                <Label>💰 WEALTH (Geld, Karriere, Business)</Label>
                <Textarea
                  value={northStarsForm.wealth}
                  onChange={(e) =>
                    setNorthStarsForm({
                      ...northStarsForm,
                      wealth: e.target.value,
                    })
                  }
                  placeholder="z.B. SaaS auf 10k MRR"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>🏃 HEALTH (Körper, Fitness, Ernährung)</Label>
                <Textarea
                  value={northStarsForm.health}
                  onChange={(e) =>
                    setNorthStarsForm({
                      ...northStarsForm,
                      health: e.target.value,
                    })
                  }
                  placeholder="z.B. Halbmarathon laufen"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>❤️ LOVE (Beziehungen, Familie, Freunde)</Label>
                <Textarea
                  value={northStarsForm.love}
                  onChange={(e) =>
                    setNorthStarsForm({
                      ...northStarsForm,
                      love: e.target.value,
                    })
                  }
                  placeholder="z.B. Weekly Date Night etablieren"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>😊 HAPPINESS (Erfüllung, Hobbies, Sinn)</Label>
                <Textarea
                  value={northStarsForm.happiness}
                  onChange={(e) =>
                    setNorthStarsForm({
                      ...northStarsForm,
                      happiness: e.target.value,
                    })
                  }
                  placeholder="z.B. Meditation täglich"
                  rows={2}
                />
              </div>

              <Button onClick={handleSaveNorthStars} disabled={isSaving}>
                {isSaving ? "Speichert..." : "Speichern"}
              </Button>
            </TabsContent>

            {/* Vision Board Tab */}
            <TabsContent value="visionboard" className="space-y-4 mt-6">
              <VisionBoardSettings />
            </TabsContent>

            {/* Tracking Fields Tab */}
            {/* Habits Tab */}
            <TabsContent value="habits" className="space-y-4 mt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Verwalte dein gamifiziertes Habit-Tracking System
              </p>

              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="font-semibold mb-2">Habits verwalten</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Erstelle, bearbeite und organisiere deine Habit-Kategorien und einzelne Habits.
                  </p>
                  <Button
                    onClick={() => setManageHabitsOpen(true)}
                    className="gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Manage Habits
                  </Button>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="font-semibold mb-2">Habit System zurücksetzen & neu initialisieren</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Setzt dein Habit-System komplett zurück und erstellt die neuen Standard-Kategorien:
                    <br />• 🏃 Physical Foundation (Movement, Breakfast, Lunch, Dinner)
                    <br />• 🧠 Mental Clarity (Phone Jail, Vibes/Energy)
                    <br />• 💼 Deep Work (Work Hours, Work Notes)
                    <br /><br />
                    <strong className="text-destructive">Achtung:</strong> Löscht alle bestehenden Kategorien, Habits und History!
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        if (!confirm("Wirklich ALLES löschen und neu starten? Diese Aktion kann nicht rückgängig gemacht werden!")) {
                          return;
                        }
                        try {
                          await resetHabitSystem({ confirmReset: true });
                          await seedHabitSystem();
                          toast.success("System zurückgesetzt und neu initialisiert!");
                          window.location.reload(); // Reload to fetch new data
                        } catch (error) {
                          logger.error("Failed to reset:", error);
                          toast.error("Fehler beim Zurücksetzen");
                        }
                      }}
                    >
                      Alles löschen & neu starten
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="font-semibold mb-2">Info: Neue Standard-Kategorien</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Keine Wellbeing-Sliders mehr</strong> - Evening Routine wurde entfernt</li>
                    <li>• <strong>115 XP pro Tag</strong> wenn alle Habits completed</li>
                    <li>• Du kannst alles nach der Initialisierung anpassen (XP, Namen, etc.)</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                  <h3 className="font-semibold mb-2 text-destructive">Alle Daten zurücksetzen</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Setzt alle Gamification-Daten zurück: Total XP auf 0, Level auf 0, Streak auf 0, und löscht alle abgehakten Habits.
                    <br /><br />
                    <strong className="text-destructive">Achtung:</strong> Diese Aktion kann nicht rückgängig gemacht werden!
                  </p>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      if (!confirm("Bist du sicher? Alle Fortschritte werden gelöscht.")) {
                        return;
                      }
                      try {
                        await resetAllData();
                        toast.success("Alle Daten wurden zurückgesetzt!");
                        window.location.reload();
                      } catch (error) {
                        logger.error("Failed to reset data:", error);
                        toast.error("Fehler beim Zurücksetzen");
                      }
                    }}
                  >
                    Alle Daten zurücksetzen
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Coach Tab */}
            <TabsContent value="coach" className="space-y-4 mt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Wähle den Ton deines Personal Coaches
              </p>

              <div className="space-y-2">
                <Label>Coach Ton</Label>
                <Select value={coachTone} onValueChange={setCoachTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Motivierend">
                      <div>
                        <div className="font-medium">Motivierend</div>
                        <div className="text-xs text-muted-foreground">
                          Ermutigend und enthusiastisch
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="Sachlich">
                      <div>
                        <div className="font-medium">Sachlich</div>
                        <div className="text-xs text-muted-foreground">
                          Datengetrieben und analytisch
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="Empathisch">
                      <div>
                        <div className="font-medium">Empathisch</div>
                        <div className="text-xs text-muted-foreground">
                          Verständnisvoll und supportive
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="Direkt">
                      <div>
                        <div className="font-medium">Direkt</div>
                        <div className="text-xs text-muted-foreground">
                          Ehrlich ohne Umschweife
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveCoachTone} disabled={isSaving}>
                {isSaving ? "Speichert..." : "Speichern"}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Manage Habits Dialog */}
      <ManageHabitsDialog
        open={manageHabitsOpen}
        onOpenChange={setManageHabitsOpen}
      />
    </div>
  );
}
