"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface QuarterlyReviewFormProps {
  year: number;
  quarter: number;
}

const AREA_LABELS: Record<string, string> = {
  wealth: "💰 WEALTH",
  health: "🏃 HEALTH",
  love: "❤️ LOVE",
  happiness: "😊 HAPPINESS",
};

export function QuarterlyReviewForm({
  year,
  quarter,
}: QuarterlyReviewFormProps) {
  const existingReview = useQuery(api.quarterlyReview.getQuarterlyReview, {
    year,
    quarter,
  });
  const currentMilestones = useQuery(
    api.quarterlyReview.getCurrentQuarterMilestones,
    { year, quarter }
  );
  const submitReview = useMutation(api.quarterlyReview.submitQuarterlyReview);

  const [milestoneReview, setMilestoneReview] = useState<
    Array<{
      area: string;
      milestone: string;
      completed: boolean;
      notes?: string;
    }>
  >([]);

  const [formData, setFormData] = useState({
    proudestMilestone: "",
    approachDifferently: "",
    learnedAboutGoals: "",
    decisionDifferently: "",
    needForNextQuarter: "",
  });

  const [nextQuarterMilestones, setNextQuarterMilestones] = useState<
    Record<string, string[]>
  >({
    wealth: [""],
    health: [""],
    love: [""],
    happiness: [""],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Load existing review data
  useEffect(() => {
    if (existingReview) {
      setMilestoneReview(existingReview.milestoneReview);
      setFormData(existingReview.responses);

      // Organize next quarter milestones by area
      const organized: Record<string, string[]> = {
        wealth: [],
        health: [],
        love: [],
        happiness: [],
      };
      existingReview.nextQuarterMilestones.forEach((m) => {
        organized[m.area].push(m.milestone);
      });
      // Ensure at least one empty field per area
      Object.keys(organized).forEach((area) => {
        if (organized[area].length === 0) {
          organized[area] = [""];
        }
      });
      setNextQuarterMilestones(organized);
      setIsReadOnly(true);
    } else if (currentMilestones) {
      // Initialize milestone review with current milestones
      setMilestoneReview(
        currentMilestones.map((m) => ({
          area: m.area,
          milestone: m.milestone,
          completed: m.completed,
          notes: "",
        }))
      );
    }
  }, [existingReview, currentMilestones]);

  const handleMilestoneToggle = (index: number) => {
    const updated = [...milestoneReview];
    updated[index].completed = !updated[index].completed;
    setMilestoneReview(updated);
  };

  const handleMilestoneNotes = (index: number, notes: string) => {
    const updated = [...milestoneReview];
    updated[index].notes = notes;
    setMilestoneReview(updated);
  };

  const handleNextMilestoneChange = (
    area: string,
    index: number,
    value: string
  ) => {
    const updated = { ...nextQuarterMilestones };
    updated[area][index] = value;
    setNextQuarterMilestones(updated);
  };

  const addNextMilestone = (area: string) => {
    const updated = { ...nextQuarterMilestones };
    updated[area].push("");
    setNextQuarterMilestones(updated);
  };

  const removeNextMilestone = (area: string, index: number) => {
    const updated = { ...nextQuarterMilestones };
    updated[area].splice(index, 1);
    if (updated[area].length === 0) {
      updated[area] = [""];
    }
    setNextQuarterMilestones(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all reflection questions are filled
    if (
      !formData.proudestMilestone.trim() ||
      !formData.approachDifferently.trim() ||
      !formData.learnedAboutGoals.trim() ||
      !formData.decisionDifferently.trim() ||
      !formData.needForNextQuarter.trim()
    ) {
      alert("Bitte fülle alle Reflexionsfragen aus.");
      return;
    }

    // Validate at least one milestone per area for next quarter
    const nextMilestones = Object.entries(nextQuarterMilestones).flatMap(
      ([area, milestones]) =>
        milestones
          .filter((m) => m.trim())
          .map((milestone) => ({ area, milestone }))
    );

    const areas = ["wealth", "health", "love", "happiness"];
    for (const area of areas) {
      const hasArea = nextMilestones.some((m) => m.area === area);
      if (!hasArea) {
        alert(
          `Bitte definiere mindestens einen Milestone für ${AREA_LABELS[area]}.`
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await submitReview({
        year,
        quarter,
        milestoneReview,
        responses: formData,
        nextQuarterMilestones: nextMilestones,
      });
      setIsReadOnly(true);
      alert("Quarterly Review erfolgreich gespeichert!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Fehler beim Speichern des Reviews.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setIsReadOnly(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Quarterly Review</h2>
          <p className="text-muted-foreground">
            Q{quarter} {year}
          </p>
        </div>

        {existingReview && isReadOnly ? (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <p className="text-green-800 dark:text-green-200">
              ✓ Review abgeschlossen am{" "}
              {new Date(existingReview.completedAt).toLocaleDateString("de-DE")}
            </p>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Part 1: Milestone Check */}
          <div>
            <h3 className="text-xl font-bold mb-4">
              Teil 1: Milestone Check
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Markiere welche Milestones du erreicht hast.
            </p>

            {milestoneReview.length === 0 ? (
              <p className="text-muted-foreground">
                Keine Milestones für dieses Quartal definiert.
              </p>
            ) : (
              <div className="space-y-4">
                {milestoneReview.map((milestone, index) => (
                  <div
                    key={index}
                    className="p-4 border border-border rounded-md"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <input
                        type="checkbox"
                        checked={milestone.completed}
                        onChange={() => handleMilestoneToggle(index)}
                        disabled={isReadOnly}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-muted-foreground mb-1">
                          {AREA_LABELS[milestone.area]}
                        </div>
                        <div className="font-medium">{milestone.milestone}</div>
                      </div>
                    </div>
                    <textarea
                      value={milestone.notes || ""}
                      onChange={(e) =>
                        handleMilestoneNotes(index, e.target.value)
                      }
                      disabled={isReadOnly}
                      placeholder="Optionale Notizen..."
                      className="w-full mt-2 px-3 py-2 text-sm border border-border rounded-md bg-background disabled:bg-muted disabled:cursor-not-allowed"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Part 2: Reflection Questions */}
          <div>
            <h3 className="text-xl font-bold mb-4">
              Teil 2: Reflexionsfragen
            </h3>

            <div className="space-y-6">
              {/* Question 1 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Welcher Milestone macht dich am stolzesten?
                </label>
                <textarea
                  value={formData.proudestMilestone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      proudestMilestone: e.target.value,
                    })
                  }
                  disabled={isReadOnly}
                  className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background disabled:bg-muted disabled:cursor-not-allowed"
                  placeholder="Welcher Milestone..."
                />
              </div>

              {/* Question 2 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Welches Ziel hättest du anders angehen sollen?
                </label>
                <textarea
                  value={formData.approachDifferently}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      approachDifferently: e.target.value,
                    })
                  }
                  disabled={isReadOnly}
                  className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background disabled:bg-muted disabled:cursor-not-allowed"
                  placeholder="Was würdest du anders machen?"
                />
              </div>

              {/* Question 3 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Was hast du über deine Zielsetzung gelernt?
                </label>
                <textarea
                  value={formData.learnedAboutGoals}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      learnedAboutGoals: e.target.value,
                    })
                  }
                  disabled={isReadOnly}
                  className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background disabled:bg-muted disabled:cursor-not-allowed"
                  placeholder="Deine Learnings..."
                />
              </div>

              {/* Question 4 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Welche Entscheidung würdest du anders treffen?
                </label>
                <textarea
                  value={formData.decisionDifferently}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      decisionDifferently: e.target.value,
                    })
                  }
                  disabled={isReadOnly}
                  className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background disabled:bg-muted disabled:cursor-not-allowed"
                  placeholder="Welche Entscheidung..."
                />
              </div>

              {/* Question 5 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Was brauchst du, um nächstes Quartal erfolgreicher zu sein?
                </label>
                <textarea
                  value={formData.needForNextQuarter}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      needForNextQuarter: e.target.value,
                    })
                  }
                  disabled={isReadOnly}
                  className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background disabled:bg-muted disabled:cursor-not-allowed"
                  placeholder="Was brauchst du..."
                />
              </div>
            </div>
          </div>

          {/* Part 3: Next Quarter Milestones */}
          <div>
            <h3 className="text-xl font-bold mb-4">
              Teil 3: Milestones für nächstes Quartal
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Definiere mindestens einen Milestone pro Lebensbereich.
            </p>

            <div className="space-y-6">
              {Object.entries(AREA_LABELS).map(([area, label]) => (
                <div key={area}>
                  <label className="block text-sm font-bold mb-2">
                    {label}
                  </label>
                  <div className="space-y-2">
                    {nextQuarterMilestones[area].map((milestone, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={milestone}
                          onChange={(e) =>
                            handleNextMilestoneChange(
                              area,
                              index,
                              e.target.value
                            )
                          }
                          disabled={isReadOnly}
                          placeholder="Milestone..."
                          className="flex-1 px-3 py-2 border border-border rounded-md bg-background disabled:bg-muted disabled:cursor-not-allowed"
                        />
                        {!isReadOnly && nextQuarterMilestones[area].length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeNextMilestone(area, index)}
                            className="px-3 py-2 border border-border rounded-md hover:bg-muted"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => addNextMilestone(area)}
                        className="text-sm text-primary hover:underline"
                      >
                        + Weiterer Milestone
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {isReadOnly ? (
              <button
                type="button"
                onClick={handleEdit}
                className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
              >
                Bearbeiten
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Speichert..." : "Speichern"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
