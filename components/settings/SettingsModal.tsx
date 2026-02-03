"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
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
import { X } from "lucide-react";
import { toast } from "sonner";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const profile = useQuery(api.settings.getProfile);
  const trackingFields = useQuery(api.trackingFields.getActiveTrackingFields);

  const updateProfile = useMutation(api.settings.updateProfile);
  const updateNorthStars = useMutation(api.settings.updateNorthStars);
  const updateCoachTone = useMutation(api.settings.updateCoachTone);
  const toggleFieldActive = useMutation(api.trackingFields.toggleFieldActive);
  const updateWeeklyTarget = useMutation(api.trackingFields.updateWeeklyTarget);
  const deleteTrackingField = useMutation(api.trackingFields.deleteTrackingField);

  const [isSaving, setIsSaving] = useState(false);

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
  useState(() => {
    if (profile) {
      setProfileForm({
        name: profile.name,
        role: profile.role,
        mainProject: profile.mainProject,
      });
      setNorthStarsForm(profile.northStars);
      setCoachTone(profile.coachTone);
    }
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile(profileForm);
      toast.success("Profil gespeichert!");
    } catch (error) {
      console.error("Failed to save profile:", error);
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
      console.error("Failed to save North Stars:", error);
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
      console.error("Failed to save coach tone:", error);
      toast.error("Fehler beim Speichern");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleField = async (fieldId: Id<"trackingFields">, isActive: boolean) => {
    try {
      await toggleFieldActive({ fieldId, isActive });
    } catch (error) {
      console.error("Failed to toggle field:", error);
      toast.error("Fehler beim Aktivieren/Deaktivieren");
    }
  };

  const handleUpdateWeeklyTarget = async (fieldId: Id<"trackingFields">, target: number) => {
    try {
      await updateWeeklyTarget({ fieldId, target });
    } catch (error) {
      console.error("Failed to update weekly target:", error);
      toast.error("Fehler beim Speichern");
    }
  };

  const handleDeleteField = async (fieldId: Id<"trackingFields">) => {
    if (!confirm("Möchtest du dieses Feld wirklich löschen?")) return;

    try {
      await deleteTrackingField({ fieldId });
      toast.success("Feld gelöscht!");
    } catch (error) {
      console.error("Failed to delete field:", error);
      toast.error("Fehler beim Löschen");
    }
  };

  if (!isOpen) return null;

  if (profile === undefined || trackingFields === undefined) {
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="northstars">North Stars</TabsTrigger>
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
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

            {/* Tracking Fields Tab */}
            <TabsContent value="tracking" className="space-y-4 mt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Verwalte deine täglichen Tracking-Felder
              </p>

              <div className="space-y-3">
                {trackingFields.map((field) => (
                  <div
                    key={field._id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{field.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({field.type})
                        </span>
                        {field.isDefault && (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      {field.hasStreak && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Streak: {field.currentStreak || 0} | Longest:{" "}
                          {field.longestStreak || 0}
                        </p>
                      )}
                      {field.weeklyTarget && (
                        <div className="flex items-center gap-2 mt-2">
                          <Label className="text-xs">Weekly Target:</Label>
                          <Input
                            type="number"
                            min={1}
                            max={7}
                            value={field.weeklyTarget}
                            onChange={(e) =>
                              handleUpdateWeeklyTarget(
                                field._id,
                                parseInt(e.target.value)
                              )
                            }
                            className="w-16 h-7 text-xs"
                          />
                          <span className="text-xs text-muted-foreground">
                            Tage/Woche
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={field.isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          handleToggleField(field._id, !field.isActive)
                        }
                      >
                        {field.isActive ? "Aktiv" : "Inaktiv"}
                      </Button>
                      {!field.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteField(field._id)}
                        >
                          Löschen
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
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
    </div>
  );
}
