"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Plus, X } from "lucide-react";

interface EditQuarterlyOKRsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  quarter: number;
}

interface KeyResult {
  description: string;
  target: number;
  unit: string;
  current?: number;
}

interface QuarterlyOKR {
  area: string;
  objective: string;
  keyResults: KeyResult[];
}

export function EditQuarterlyOKRsDialog({ isOpen, onClose, year, quarter }: EditQuarterlyOKRsDialogProps) {
  const profile = useQuery(api.userProfile.getUserProfile);
  const updateQuarterlyOKRs = useMutation(api.userProfile.updateQuarterlyOKRs);

  const [okrs, setOkrs] = useState<QuarterlyOKR[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with current OKRs
  useEffect(() => {
    if (profile && isOpen) {
      const currentOKRs = profile.quarterlyOKRs?.filter(
        (okr) => okr.year === year && okr.quarter === quarter
      ) || [];

      if (currentOKRs.length > 0) {
        setOkrs(currentOKRs.map(okr => ({
          area: okr.area || "Wealth",
          objective: okr.objective,
          keyResults: okr.keyResults.map(kr => ({
            description: kr.description,
            target: kr.target,
            unit: kr.unit,
            current: kr.current
          }))
        })));
      } else {
        setOkrs([{
          area: "Wealth",
          objective: "",
          keyResults: [{ description: "", target: 1, unit: "", current: 0 }]
        }]);
      }
    }
  }, [profile, isOpen, year, quarter]);

  const addOKR = () => {
    setOkrs((prev) => [...prev, {
      area: "Wealth",
      objective: "",
      keyResults: [{ description: "", target: 1, unit: "", current: 0 }]
    }]);
  };

  const removeOKR = (index: number) => {
    setOkrs((prev) => prev.filter((_, i) => i !== index));
  };

  const updateOKR = (index: number, field: "area" | "objective", value: string) => {
    setOkrs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addKeyResult = (okrIndex: number) => {
    setOkrs((prev) => {
      const updated = [...prev];
      updated[okrIndex].keyResults.push({ description: "", target: 1, unit: "", current: 0 });
      return updated;
    });
  };

  const removeKeyResult = (okrIndex: number, krIndex: number) => {
    setOkrs((prev) => {
      const updated = [...prev];
      updated[okrIndex].keyResults = updated[okrIndex].keyResults.filter((_, i) => i !== krIndex);
      return updated;
    });
  };

  const updateKeyResult = (okrIndex: number, krIndex: number, field: keyof KeyResult, value: string | number) => {
    setOkrs((prev) => {
      const updated = [...prev];
      updated[okrIndex].keyResults[krIndex] = {
        ...updated[okrIndex].keyResults[krIndex],
        [field]: value
      };
      return updated;
    });
  };

  const handleSave = async () => {
    const validOKRs = okrs.filter(okr =>
      okr.objective.trim() !== "" &&
      okr.keyResults.some(kr => kr.description.trim() !== "")
    ).map(okr => ({
      ...okr,
      keyResults: okr.keyResults.filter(kr => kr.description.trim() !== "")
    }));

    if (validOKRs.length === 0) {
      toast.error("Add at least one OKR with objectives and key results");
      return;
    }

    setIsSaving(true);
    try {
      // Get all existing OKRs for other quarters
      const otherOKRs = profile?.quarterlyOKRs?.filter(
        (okr) => !(okr.year === year && okr.quarter === quarter)
      ) || [];

      // Combine with new OKRs for this quarter
      const allOKRs = [
        ...otherOKRs,
        ...validOKRs.map(okr => ({
          area: okr.area,
          objective: okr.objective,
          keyResults: okr.keyResults,
          year,
          quarter
        }))
      ];

      await updateQuarterlyOKRs({ okrs: allOKRs });
      toast.success(`Q${quarter} ${year} OKRs updated!`);
      onClose();
    } catch (error) {
      console.error("Failed to update OKRs:", error);
      toast.error("Failed to update OKRs");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-orbitron">
            Edit Q{quarter} {year} OKRs
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {okrs.map((okr, okrIndex) => (
            <div key={okrIndex} className="p-4 border rounded-lg space-y-4 dark:border-white/[0.08] border-black/[0.08]">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-3">
                  <Select
                    value={okr.area || "Wealth"}
                    onValueChange={(value) => updateOKR(okrIndex, "area", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Wealth">💰 Wealth</SelectItem>
                      <SelectItem value="Health">🏃 Health</SelectItem>
                      <SelectItem value="Love">❤️ Love</SelectItem>
                      <SelectItem value="Happiness">😊 Happiness</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    value={okr.objective}
                    onChange={(e) => updateOKR(okrIndex, "objective", e.target.value)}
                    placeholder="Objective (e.g., 'Build strong fitness foundation')"
                  />

                  <div className="space-y-2 pl-4 border-l-2 dark:border-white/[0.08] border-black/[0.08]">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Key Results</Label>
                    {okr.keyResults.map((kr, krIndex) => (
                      <div key={krIndex} className="flex gap-2 items-start">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <Input
                            value={kr.description}
                            onChange={(e) => updateKeyResult(okrIndex, krIndex, "description", e.target.value)}
                            placeholder="Description"
                            className="sm:col-span-2"
                          />
                          <div className="flex gap-1">
                            <Input
                              type="number"
                              value={kr.target}
                              onChange={(e) => updateKeyResult(okrIndex, krIndex, "target", parseInt(e.target.value) || 0)}
                              placeholder="Target"
                              className="w-20"
                            />
                            <Input
                              value={kr.unit}
                              onChange={(e) => updateKeyResult(okrIndex, krIndex, "unit", e.target.value)}
                              placeholder="Unit"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeKeyResult(okrIndex, krIndex)}
                          disabled={okr.keyResults.length === 1}
                          className="h-9 w-9"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addKeyResult(okrIndex)}
                      className="w-full"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Key Result
                    </Button>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOKR(okrIndex)}
                  disabled={okrs.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addOKR}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add OKR
          </Button>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSaving} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
