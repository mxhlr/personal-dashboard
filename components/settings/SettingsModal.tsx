"use client";

import { useState, useEffect } from "react";

// PWA BeforeInstallPromptEvent type
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}
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
import { X, Settings, Download, Smartphone, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ManageHabitsDialog } from "@/components/habits/ManageHabitsDialog";
import { VisionBoardSettings } from "@/components/settings/VisionBoardSettings";
import { usePWAInstallPrompt } from "@/lib/pwa-install-handler";

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

  // PWA Installation state
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Get PWA handler at component level
  const pwaHandler = usePWAInstallPrompt();

  // Listen for PWA install prompt
  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Get current prompt if already available
    const currentPrompt = pwaHandler.getDeferredPrompt();
    if (currentPrompt) {
      setDeferredPrompt(currentPrompt);
    }

    // Subscribe to future changes
    const unsubscribe = pwaHandler.subscribe((prompt: BeforeInstallPromptEvent | null) => {
      setDeferredPrompt(prompt);
    });

    // Listen for Service Worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
                toast.info('Update verfügbar! Klick auf &quot;Update installieren&quot; in Settings → App');
              }
            });
          }
        });

        // Check for updates on mount
        registration.update();
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [pwaHandler]);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      toast.error("Installation nicht verfügbar. Nutze den Browser-Button in der URL-Leiste.");
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        toast.success("App wird installiert!");
        setIsInstalled(true);
      }

      // Clear global prompt
      pwaHandler.clearPrompt();
      setDeferredPrompt(null);
    } catch (error) {
      logger.error("PWA installation error:", error);
      toast.error("Installation fehlgeschlagen");
    }
  };

  const handleCheckForUpdate = async () => {
    if (!('serviceWorker' in navigator)) {
      toast.error("Service Worker nicht verfügbar");
      return;
    }

    setIsCheckingUpdate(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();

      // Check if update is available
      setTimeout(() => {
        if (!updateAvailable) {
          toast.success("App ist aktuell! ✓");
        }
        setIsCheckingUpdate(false);
      }, 1000);
    } catch (error) {
      logger.error("Failed to check for update:", error);
      toast.error("Fehler beim Prüfen");
      setIsCheckingUpdate(false);
    }
  };

  const handleInstallUpdate = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      toast.success("Update wird installiert...");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    role: "",
    mainProject: "",
  });

  // North Stars form state
  const [northStarsForm, setNorthStarsForm] = useState({
    wealth: [""],
    health: [""],
    love: [""],
    happiness: [""],
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
      setNorthStarsForm({
        wealth: profile.northStars.wealth.length > 0 ? profile.northStars.wealth : [""],
        health: profile.northStars.health.length > 0 ? profile.northStars.health : [""],
        love: profile.northStars.love.length > 0 ? profile.northStars.love : [""],
        happiness: profile.northStars.happiness.length > 0 ? profile.northStars.happiness : [""],
      });
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
    // Filter out empty strings
    const cleanedNorthStars = {
      wealth: northStarsForm.wealth.filter(g => g.trim() !== ""),
      health: northStarsForm.health.filter(g => g.trim() !== ""),
      love: northStarsForm.love.filter(g => g.trim() !== ""),
      happiness: northStarsForm.happiness.filter(g => g.trim() !== ""),
    };

    if (!cleanedNorthStars.wealth.length || !cleanedNorthStars.health.length ||
        !cleanedNorthStars.love.length || !cleanedNorthStars.happiness.length) {
      toast.error("Bitte füge mindestens ein Ziel pro Kategorie hinzu");
      return;
    }

    setIsSaving(true);
    try {
      await updateNorthStars({ northStars: cleanedNorthStars });
      toast.success("North Stars gespeichert!");
    } catch (error) {
      logger.error("Failed to save North Stars:", error);
      toast.error("Fehler beim Speichern");
    } finally {
      setIsSaving(false);
    }
  };

  const addNorthStar = (category: 'wealth' | 'health' | 'love' | 'happiness') => {
    setNorthStarsForm(prev => ({
      ...prev,
      [category]: [...prev[category], ""]
    }));
  };

  const removeNorthStar = (category: 'wealth' | 'health' | 'love' | 'happiness', index: number) => {
    setNorthStarsForm(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  const updateNorthStar = (category: 'wealth' | 'health' | 'love' | 'happiness', index: number, value: string) => {
    setNorthStarsForm(prev => {
      const updated = [...prev[category]];
      updated[index] = value;
      return { ...prev, [category]: updated };
    });
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
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-card border-2 border-gray-300 dark:border-border rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-300 dark:border-border">
          <h2 className="text-2xl font-bold">Einstellungen</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="northstars">North Stars</TabsTrigger>
              <TabsTrigger value="habits">Habits</TabsTrigger>
              <TabsTrigger value="visionboard">Vision Board</TabsTrigger>
              <TabsTrigger value="coach">Coach</TabsTrigger>
              <TabsTrigger value="app">App</TabsTrigger>
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
              <p className="text-sm text-gray-600 dark:text-muted-foreground mb-4">
                Deine Jahresziele für die 4 Lebensbereiche
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>💰 WEALTH (Geld, Karriere, Business)</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addNorthStar('wealth')}
                    className="h-7 text-xs"
                  >
                    + Hinzufügen
                  </Button>
                </div>
                <div className="space-y-2">
                  {northStarsForm.wealth.map((goal, index) => (
                    <div key={index} className="flex gap-2">
                      <Textarea
                        value={goal}
                        onChange={(e) => updateNorthStar('wealth', index, e.target.value)}
                        placeholder="z.B. SaaS auf 10k MRR"
                        rows={2}
                        className="flex-1"
                      />
                      {northStarsForm.wealth.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNorthStar('wealth', index)}
                          className="h-auto px-3"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>🏃 HEALTH (Körper, Fitness, Ernährung)</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addNorthStar('health')}
                    className="h-7 text-xs"
                  >
                    + Hinzufügen
                  </Button>
                </div>
                <div className="space-y-2">
                  {northStarsForm.health.map((goal, index) => (
                    <div key={index} className="flex gap-2">
                      <Textarea
                        value={goal}
                        onChange={(e) => updateNorthStar('health', index, e.target.value)}
                        placeholder="z.B. Halbmarathon laufen"
                        rows={2}
                        className="flex-1"
                      />
                      {northStarsForm.health.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNorthStar('health', index)}
                          className="h-auto px-3"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>❤️ LOVE (Beziehungen, Familie, Freunde)</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addNorthStar('love')}
                    className="h-7 text-xs"
                  >
                    + Hinzufügen
                  </Button>
                </div>
                <div className="space-y-2">
                  {northStarsForm.love.map((goal, index) => (
                    <div key={index} className="flex gap-2">
                      <Textarea
                        value={goal}
                        onChange={(e) => updateNorthStar('love', index, e.target.value)}
                        placeholder="z.B. Weekly Date Night etablieren"
                        rows={2}
                        className="flex-1"
                      />
                      {northStarsForm.love.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNorthStar('love', index)}
                          className="h-auto px-3"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>😊 HAPPINESS (Erfüllung, Hobbies, Sinn)</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addNorthStar('happiness')}
                    className="h-7 text-xs"
                  >
                    + Hinzufügen
                  </Button>
                </div>
                <div className="space-y-2">
                  {northStarsForm.happiness.map((goal, index) => (
                    <div key={index} className="flex gap-2">
                      <Textarea
                        value={goal}
                        onChange={(e) => updateNorthStar('happiness', index, e.target.value)}
                        placeholder="z.B. Meditation täglich"
                        rows={2}
                        className="flex-1"
                      />
                      {northStarsForm.happiness.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNorthStar('happiness', index)}
                          className="h-auto px-3"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
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
              <p className="text-sm text-gray-600 dark:text-muted-foreground mb-4">
                Verwalte dein gamifiziertes Habit-Tracking System
              </p>

              <div className="space-y-4">
                <div className="rounded-lg border-2 border-gray-300 dark:border-border bg-card p-4">
                  <h3 className="font-semibold mb-2">Habits verwalten</h3>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground mb-4">
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
                <div className="rounded-lg border-2 border-gray-300 dark:border-border bg-card p-4">
                  <h3 className="font-semibold mb-2">Habit System zurücksetzen & neu initialisieren</h3>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground mb-4">
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

                <div className="rounded-lg border-2 border-gray-300 dark:border-border bg-card p-4">
                  <h3 className="font-semibold mb-2">Info: Neue Standard-Kategorien</h3>
                  <ul className="text-sm text-gray-600 dark:text-muted-foreground space-y-1">
                    <li>• <strong>Keine Wellbeing-Sliders mehr</strong> - Evening Routine wurde entfernt</li>
                    <li>• <strong>115 XP pro Tag</strong> wenn alle Habits completed</li>
                    <li>• Du kannst alles nach der Initialisierung anpassen (XP, Namen, etc.)</li>
                  </ul>
                </div>

                <div className="rounded-lg border-2 border-red-400 dark:border-destructive/50 bg-red-50 dark:bg-destructive/5 p-4">
                  <h3 className="font-semibold mb-2 text-destructive">Alle Daten zurücksetzen</h3>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground mb-4">
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

            {/* App Tab */}
            <TabsContent value="app" className="space-y-4 mt-6">
              <div className="space-y-4">
                {/* PWA Installation */}
                <div className="rounded-lg border-2 border-gray-300 dark:border-border bg-card p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Smartphone className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        App installieren
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-muted-foreground mb-4">
                        Installiere das Dashboard als eigenständige App auf deinem Gerät.
                        Funktioniert offline und erscheint in deiner App-Liste.
                      </p>

                      {isDevelopment ? (
                        <div className="space-y-3">
                          <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-500/10 border-2 border-yellow-400 dark:border-yellow-500/20">
                            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-500 mb-2">
                              Development Mode
                            </p>
                            <p className="text-xs text-gray-600 dark:text-muted-foreground">
                              PWA Installation ist im Development Mode deaktiviert.
                              Nutze die Browser-Installation direkt:
                            </p>
                          </div>
                          <ul className="list-disc list-inside space-y-2 text-sm">
                            <li><strong>Chrome/Edge (Desktop):</strong> Klick auf das ⊕ Icon in der URL-Leiste</li>
                            <li><strong>iOS Safari:</strong> Teilen → &quot;Zum Home-Bildschirm&quot;</li>
                            <li><strong>Android Chrome:</strong> Menü → &quot;App installieren&quot;</li>
                          </ul>
                        </div>
                      ) : isInstalled ? (
                        <div className="flex items-center gap-2 text-green-500">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="font-medium">App ist installiert!</span>
                        </div>
                      ) : (
                        <>
                          <Button
                            onClick={handleInstallPWA}
                            disabled={!deferredPrompt}
                            className="gap-2"
                          >
                            <Download className="h-4 w-4" />
                            {deferredPrompt ? "Jetzt installieren" : "Installation verfügbar im Browser"}
                          </Button>

                          {!deferredPrompt && (
                            <div className="mt-4 text-sm text-gray-600 dark:text-muted-foreground space-y-2">
                              <p className="font-medium">Alternative Installation:</p>
                              <ul className="list-disc list-inside space-y-1 text-xs">
                                <li><strong>Chrome/Edge:</strong> Klick auf das ⊕ Icon in der URL-Leiste</li>
                                <li><strong>iOS Safari:</strong> Teilen → &quot;Zum Home-Bildschirm&quot;</li>
                                <li><strong>Android Chrome:</strong> Menü → &quot;App installieren&quot;</li>
                              </ul>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* App Updates */}
                <div className="rounded-lg border-2 border-gray-300 dark:border-border bg-card p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <RefreshCw className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        App Updates
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-muted-foreground mb-4">
                        Prüfe nach neuen Updates und installiere sie sofort.
                      </p>

                      {updateAvailable ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-primary">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="font-medium">Neues Update verfügbar!</span>
                          </div>
                          <Button
                            onClick={handleInstallUpdate}
                            variant="default"
                            className="gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Update jetzt installieren
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={handleCheckForUpdate}
                          disabled={isCheckingUpdate}
                          variant="outline"
                          className="gap-2"
                        >
                          <RefreshCw className={`h-4 w-4 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                          {isCheckingUpdate ? "Prüfe..." : "Nach Updates suchen"}
                        </Button>
                      )}

                      <p className="text-xs text-gray-600 dark:text-muted-foreground mt-3">
                        Aktuelle Version wird automatisch bei jedem App-Start geprüft.
                      </p>
                    </div>
                  </div>
                </div>

                {/* App Info */}
                <div className="rounded-lg border-2 border-gray-300 dark:border-border bg-card p-6">
                  <h3 className="font-semibold mb-4">App Features</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Eigene App</span>
                        <p className="text-gray-600 dark:text-muted-foreground">Erscheint in App-Liste & Launchpad</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Offline-fähig</span>
                        <p className="text-gray-600 dark:text-muted-foreground">Funktioniert auch ohne Internet</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Native Feel</span>
                        <p className="text-gray-600 dark:text-muted-foreground">Kein Browser-Chrome, eigenes Fenster</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Schnell starten</span>
                        <p className="text-gray-600 dark:text-muted-foreground">Cmd+Space → &quot;Dashboard&quot; → Enter</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* Coach Tab */}
            <TabsContent value="coach" className="space-y-4 mt-6">
              <p className="text-sm text-gray-600 dark:text-muted-foreground mb-4">
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
                        <div className="text-xs text-gray-600 dark:text-muted-foreground">
                          Ermutigend und enthusiastisch
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="Sachlich">
                      <div>
                        <div className="font-medium">Sachlich</div>
                        <div className="text-xs text-gray-600 dark:text-muted-foreground">
                          Datengetrieben und analytisch
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="Empathisch">
                      <div>
                        <div className="font-medium">Empathisch</div>
                        <div className="text-xs text-gray-600 dark:text-muted-foreground">
                          Verständnisvoll und supportive
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="Direkt">
                      <div>
                        <div className="font-medium">Direkt</div>
                        <div className="text-xs text-gray-600 dark:text-muted-foreground">
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
