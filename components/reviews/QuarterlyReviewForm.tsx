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
    <div
      className="min-h-[calc(100vh-64px)] relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, var(--daily-log-bg-start) 0%, var(--daily-log-bg-end) 100%)'
      }}
    >
      {/* Subtle grid overlay for HUD effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 229, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 229, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Animated scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          background: 'linear-gradient(transparent 40%, rgba(0, 229, 255, 0.2) 50%, transparent 60%)',
          backgroundSize: '100% 4px',
          animation: 'scanline 8s linear infinite'
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 py-8">
        <div className="p-8 dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)] dark:bg-card/50 bg-white/80
          shadow-sm rounded-2xl border">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold font-orbitron text-white mb-2"
              style={{
                textShadow: '0 0 30px rgba(255, 255, 255, 0.2)'
              }}
            >
              Quarterly Review
            </h2>
            <p className="dark:text-[#AAAAAA] text-[#888888]">
              Q{quarter} {year}
            </p>
          </div>

          {existingReview && isReadOnly ? (
            <div className="mb-6 p-4 dark:bg-[rgba(0,230,118,0.1)] bg-[rgba(76,175,80,0.1)]
              dark:border-[rgba(0,230,118,0.3)] border-[rgba(76,175,80,0.3)] border rounded-lg">
              <p className="dark:text-[#00E676] text-[#4CAF50] font-medium">
                ✓ Review abgeschlossen am{" "}
                {new Date(existingReview.completedAt).toLocaleDateString("de-DE")}
              </p>
            </div>
          ) : null}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Part 1: Milestone Check */}
          <div>
            <h3 className="text-xl font-bold font-orbitron dark:text-[#00E5FF] text-[#0077B6] mb-4">
              Teil 1: Milestone Check
            </h3>
            <p className="text-sm dark:text-[#888888] text-[#666666] mb-4">
              Markiere welche Milestones du erreicht hast.
            </p>

            {milestoneReview.length === 0 ? (
              <p className="dark:text-[#888888] text-[#666666]">
                Keine Milestones für dieses Quartal definiert.
              </p>
            ) : (
              <div className="space-y-4">
                {milestoneReview.map((milestone, index) => (
                  <div
                    key={index}
                    className="p-4 dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)] border rounded-xl
                      dark:bg-[rgba(26,26,26,0.3)] bg-white/50"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <input
                        type="checkbox"
                        checked={milestone.completed}
                        onChange={() => handleMilestoneToggle(index)}
                        disabled={isReadOnly}
                        className="mt-1 w-5 h-5 rounded dark:border-[rgba(0,229,255,0.3)] border-[rgba(0,180,220,0.3)]
                          dark:checked:bg-[#00E5FF] checked:bg-[#0077B6] transition-colors"
                      />
                      <div className="flex-1">
                        <div className="text-xs font-bold font-orbitron uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-1">
                          {AREA_LABELS[milestone.area]}
                        </div>
                        <div className="font-medium dark:text-[#E0E0E0] text-[#1A1A1A]">{milestone.milestone}</div>
                      </div>
                    </div>
                    <textarea
                      value={milestone.notes || ""}
                      onChange={(e) =>
                        handleMilestoneNotes(index, e.target.value)
                      }
                      disabled={isReadOnly}
                      placeholder="Optionale Notizen..."
                      className="w-full mt-2 px-3 py-2 text-sm dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)]
                        border rounded-lg dark:bg-transparent bg-transparent dark:text-[#E0E0E0] text-[#1A1A1A]
                        disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                        focus:outline-none focus:ring-2 focus:ring-[rgba(0,229,255,0.3)]"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Part 2: Reflection Questions */}
          <div>
            <h3 className="text-xl font-bold font-orbitron dark:text-[#00E5FF] text-[#0077B6] mb-4">
              Teil 2: Reflexionsfragen
            </h3>

            <div className="space-y-6">
              {/* Question 1 */}
              <div>
                <label className="block text-sm font-bold font-orbitron uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-2">
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
                  className="w-full min-h-[100px] px-3 py-2 dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)]
                    border rounded-lg dark:bg-transparent bg-transparent dark:text-[#E0E0E0] text-[#1A1A1A]
                    disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                    focus:outline-none focus:ring-2 focus:ring-[rgba(0,229,255,0.3)]"
                  placeholder="Welcher Milestone..."
                />
              </div>

              {/* Question 2 */}
              <div>
                <label className="block text-sm font-bold font-orbitron uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-2">
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
                  className="w-full min-h-[100px] px-3 py-2 dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)]
                    border rounded-lg dark:bg-transparent bg-transparent dark:text-[#E0E0E0] text-[#1A1A1A]
                    disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                    focus:outline-none focus:ring-2 focus:ring-[rgba(0,229,255,0.3)]"
                  placeholder="Was würdest du anders machen?"
                />
              </div>

              {/* Question 3 */}
              <div>
                <label className="block text-sm font-bold font-orbitron uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-2">
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
                  className="w-full min-h-[100px] px-3 py-2 dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)]
                    border rounded-lg dark:bg-transparent bg-transparent dark:text-[#E0E0E0] text-[#1A1A1A]
                    disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                    focus:outline-none focus:ring-2 focus:ring-[rgba(0,229,255,0.3)]"
                  placeholder="Deine Learnings..."
                />
              </div>

              {/* Question 4 */}
              <div>
                <label className="block text-sm font-bold font-orbitron uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-2">
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
                  className="w-full min-h-[100px] px-3 py-2 dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)]
                    border rounded-lg dark:bg-transparent bg-transparent dark:text-[#E0E0E0] text-[#1A1A1A]
                    disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                    focus:outline-none focus:ring-2 focus:ring-[rgba(0,229,255,0.3)]"
                  placeholder="Welche Entscheidung..."
                />
              </div>

              {/* Question 5 */}
              <div>
                <label className="block text-sm font-bold font-orbitron uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-2">
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
                  className="w-full min-h-[100px] px-3 py-2 dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)]
                    border rounded-lg dark:bg-transparent bg-transparent dark:text-[#E0E0E0] text-[#1A1A1A]
                    disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                    focus:outline-none focus:ring-2 focus:ring-[rgba(0,229,255,0.3)]"
                  placeholder="Was brauchst du..."
                />
              </div>
            </div>
          </div>

          {/* Part 3: Next Quarter Milestones */}
          <div>
            <h3 className="text-xl font-bold font-orbitron dark:text-[#00E5FF] text-[#0077B6] mb-4">
              Teil 3: Milestones für nächstes Quartal
            </h3>
            <p className="text-sm dark:text-[#888888] text-[#666666] mb-4">
              Definiere mindestens einen Milestone pro Lebensbereich.
            </p>

            <div className="space-y-6">
              {Object.entries(AREA_LABELS).map(([area, label]) => (
                <div key={area}>
                  <label className="block text-sm font-bold font-orbitron uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-2">
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
                          className="flex-1 px-3 py-2 dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)]
                            border rounded-lg dark:bg-transparent bg-transparent dark:text-[#E0E0E0] text-[#1A1A1A]
                            disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                            focus:outline-none focus:ring-2 focus:ring-[rgba(0,229,255,0.3)]"
                        />
                        {!isReadOnly && nextQuarterMilestones[area].length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeNextMilestone(area, index)}
                            className="px-3 py-2 dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)]
                              border rounded-lg dark:hover:bg-[rgba(0,229,255,0.1)] hover:bg-[rgba(0,180,220,0.1)]
                              dark:text-[#E0E0E0] text-[#1A1A1A] transition-colors"
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
                        className="text-sm dark:text-[#00E5FF] text-[#0077B6] hover:underline font-medium"
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
          <div className="flex gap-3 justify-center">
            {isReadOnly ? (
              <button
                type="button"
                onClick={handleEdit}
                className="px-8 py-3 dark:border-[#00E5FF]/30 border-[#0077B6]/30 border-2
                  dark:text-[#00E5FF] text-[#0077B6] dark:bg-transparent bg-transparent
                  dark:hover:bg-[rgba(0,229,255,0.1)] hover:bg-[rgba(0,180,220,0.1)]
                  font-orbitron uppercase tracking-wider text-xs font-bold transition-all duration-200 rounded-lg"
              >
                Bearbeiten
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 dark:bg-gradient-to-r dark:from-[#00E5FF] dark:to-[#00B8D4]
                  bg-gradient-to-r from-[#0077B6] to-[#005F8F]
                  text-white font-bold font-orbitron uppercase tracking-wider text-xs
                  dark:border-[#00E5FF]/30 border-[#0077B6]/30 border-2
                  dark:shadow-[0_0_15px_rgba(0,229,255,0.3)] shadow-[0_4px_12px_rgba(0,119,182,0.3)]
                  dark:hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] hover:shadow-[0_6px_20px_rgba(0,119,182,0.5)]
                  hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  transition-all duration-300 rounded-lg"
              >
                {isSubmitting ? "Speichert..." : "Speichern"}
              </button>
            )}
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
