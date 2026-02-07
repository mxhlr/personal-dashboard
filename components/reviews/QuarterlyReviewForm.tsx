"use client";

import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProgressIndicator } from "@/components/dashboard/ProgressIndicator";
import { toast } from "sonner";

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
  const currentOKRs = useQuery(
    api.quarterlyReview.getCurrentQuarterOKRs,
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

  const [nextQuarterOKRs, setNextQuarterOKRs] = useState<Array<{
    area: string;
    objective: string;
    keyResults: Array<{ description: string; target: number; unit: string }>;
  }>>([
    {
      area: "Wealth",
      objective: "",
      keyResults: [{ description: "", target: 0, unit: "" }],
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Load existing review data
  useEffect(() => {
    if (existingReview) {
      setMilestoneReview(existingReview.milestoneReview);
      setFormData(existingReview.responses);
      setIsReadOnly(true);
    } else if (currentOKRs && currentOKRs.length > 0) {
      // Initialize milestone review with current OKRs
      setMilestoneReview(
        currentOKRs.flatMap((okr) =>
          okr.keyResults.map((kr) => ({
            area: okr.area,
            milestone: `${okr.objective} - ${kr.description}`,
            completed: false,
            notes: "",
          }))
        )
      );
    }
  }, [existingReview, currentOKRs]);

  const calculateProgress = () => {
    let totalFields = 5; // 5 reflection questions
    let filledFields = 0;

    // Check reflection questions
    if (formData.proudestMilestone.trim()) filledFields++;
    if (formData.approachDifferently.trim()) filledFields++;
    if (formData.learnedAboutGoals.trim()) filledFields++;
    if (formData.decisionDifferently.trim()) filledFields++;
    if (formData.needForNextQuarter.trim()) filledFields++;

    // Check if we have at least one complete OKR
    const hasCompleteOKR = nextQuarterOKRs.some((okr) =>
      okr.objective.trim() !== "" &&
      okr.keyResults.some((kr) => kr.description.trim() !== "")
    );
    totalFields += 1; // For the OKR planning
    if (hasCompleteOKR) filledFields++;

    return Math.round((filledFields / totalFields) * 100);
  };

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

  // OKR Helper Functions
  const addOKR = () => {
    setNextQuarterOKRs([
      ...nextQuarterOKRs,
      {
        area: "Wealth",
        objective: "",
        keyResults: [{ description: "", target: 0, unit: "" }],
      },
    ]);
  };

  const removeOKR = (index: number) => {
    setNextQuarterOKRs(nextQuarterOKRs.filter((_, i) => i !== index));
  };

  const updateOKR = (index: number, field: "objective" | "area", value: string) => {
    const updated = [...nextQuarterOKRs];
    updated[index][field] = value;
    setNextQuarterOKRs(updated);
  };

  const addKeyResult = (okrIndex: number) => {
    const updated = [...nextQuarterOKRs];
    updated[okrIndex].keyResults.push({ description: "", target: 0, unit: "" });
    setNextQuarterOKRs(updated);
  };

  const removeKeyResult = (okrIndex: number, krIndex: number) => {
    const updated = [...nextQuarterOKRs];
    updated[okrIndex].keyResults = updated[okrIndex].keyResults.filter((_, i) => i !== krIndex);
    setNextQuarterOKRs(updated);
  };

  const updateKeyResult = (
    okrIndex: number,
    krIndex: number,
    field: "description" | "target" | "unit",
    value: string | number
  ) => {
    const updated = [...nextQuarterOKRs];
    if (field === "target") {
      updated[okrIndex].keyResults[krIndex][field] = value as number;
    } else {
      updated[okrIndex].keyResults[krIndex][field] = value as string;
    }
    setNextQuarterOKRs(updated);
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
      toast.error("Bitte fülle alle Reflexionsfragen aus.");
      return;
    }

    // Validate at least one complete OKR
    const validOKRs = nextQuarterOKRs.filter(
      (okr) => okr.objective.trim() !== "" &&
               okr.keyResults.some((kr) => kr.description.trim() !== "")
    );

    if (validOKRs.length === 0) {
      toast.error("Bitte definiere mindestens ein OKR mit einem Key Result für nächstes Quartal.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert OKRs to format expected by backend (with quarter and year)
      const nextQuarter = quarter === 4 ? 1 : quarter + 1;
      const nextYear = quarter === 4 ? year + 1 : year;

      const okrsWithQuarter = validOKRs.map((okr) => ({
        ...okr,
        quarter: nextQuarter,
        year: nextYear,
      }));

      await submitReview({
        year,
        quarter,
        milestoneReview,
        responses: formData,
        nextQuarterOKRs: okrsWithQuarter,
      });
      setIsReadOnly(true);
      toast.success("Quarterly Review erfolgreich gespeichert!");
    } catch (error) {
      logger.error("Error submitting review:", error);
      toast.error("Fehler beim Speichern des Reviews.");
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

      <div className="relative max-w-4xl mx-auto px-8 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-[44px] font-bold text-white"
            style={{
              textShadow: '0 0 30px rgba(255, 255, 255, 0.2)',
              fontFamily: '"Courier New", "Monaco", monospace',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '2px'
            }}
          >
            Quarterly Review
          </h1>
          <p className="text-[13px] dark:text-[#525252] text-[#3d3d3d] font-medium"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
          >
            Q{quarter} {year}
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator percentage={calculateProgress()} />

        {/* Completion Badge */}
        {existingReview && isReadOnly && (
          <div className="flex justify-center">
            <div className="px-5 py-2 rounded-full uppercase text-[11px] font-bold tracking-wider
              dark:bg-white/[0.06] bg-black/[0.04]
              dark:border dark:border-white/[0.1] border border-black/[0.08]"
              style={{
                color: '#00E676',
                boxShadow: '0 0 15px rgba(0, 230, 118, 0.3)'
              }}
            >
              ✓ Review Complete
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Part 1: Milestone Check */}
          <div className="group dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)] dark:bg-card/50 bg-white/80
            transition-all duration-300 ease-out
            hover:shadow-xl hover:-translate-y-1 shadow-sm
            dark:hover:border-[rgba(0,229,255,0.25)] hover:border-[rgba(0,180,220,0.3)]
            dark:hover:shadow-[0_0_30px_rgba(0,229,255,0.15)] hover:shadow-[0_8px_30px_rgba(0,180,220,0.2)]
            rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.06) 0%, rgba(139, 92, 246, 0.04) 100%), rgba(26, 26, 26, 0.5)'
            }}>
            <h3 className="text-[11px] font-bold uppercase tracking-wider dark:text-[#525252] text-[#3d3d3d] mb-4"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              Teil 1: Milestone Check
            </h3>
            <p className="text-[13px] dark:text-[#525252] text-[#3d3d3d] mb-4"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              Markiere welche Milestones du erreicht hast.
            </p>

            {milestoneReview.length === 0 ? (
              <p className="dark:text-[#525252] text-[#3d3d3d]"
                style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px' }}
              >
                Keine Milestones für dieses Quartal definiert.
              </p>
            ) : (
              <div className="space-y-3">
                {milestoneReview.map((milestone, index) => (
                  <div
                    key={index}
                    className="p-4 dark:border-border/60 border-border/25 border rounded-lg
                      dark:bg-[rgba(26,26,26,0.3)] bg-white/50"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <input
                        type="checkbox"
                        checked={milestone.completed}
                        onChange={() => handleMilestoneToggle(index)}
                        disabled={isReadOnly}
                        className="mt-1 w-5 h-5 rounded dark:border-border/50 border-border/40
                          dark:checked:bg-[#00E676] checked:bg-[#00E676] transition-colors"
                      />
                      <div className="flex-1">
                        <div className="text-[11px] font-bold uppercase tracking-wider dark:text-[#525252] text-[#3d3d3d] mb-1"
                          style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                        >
                          {AREA_LABELS[milestone.area]}
                        </div>
                        <div className="font-medium dark:text-[#E0E0E0] text-[#1A1A1A]"
                          style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px' }}
                        >
                          {milestone.milestone}
                        </div>
                      </div>
                    </div>
                    <textarea
                      value={milestone.notes || ""}
                      onChange={(e) =>
                        handleMilestoneNotes(index, e.target.value)
                      }
                      disabled={isReadOnly}
                      placeholder="Optionale Notizen..."
                      className="w-full mt-2 px-0 py-0 border-0 dark:bg-transparent bg-transparent dark:text-[#E0E0E0] text-[#1A1A1A] resize-none
                        disabled:cursor-not-allowed placeholder:dark:text-[#525252]/50 placeholder:text-[#3d3d3d]/50
                        focus:outline-none focus:ring-0"
                      style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Part 2: Reflection Questions */}
          {/* Question 1 */}
          <div className="group dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)] dark:bg-card/50 bg-white/80
            transition-all duration-300 ease-out
            hover:shadow-xl hover:-translate-y-1 shadow-sm
            dark:hover:border-[rgba(0,229,255,0.25)] hover:border-[rgba(0,180,220,0.3)]
            dark:hover:shadow-[0_0_30px_rgba(0,229,255,0.15)] hover:shadow-[0_8px_30px_rgba(0,180,220,0.2)]
            rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.06) 0%, rgba(139, 92, 246, 0.04) 100%), rgba(26, 26, 26, 0.5)'
            }}>
            <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#525252] text-[#3d3d3d] mb-3"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
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
              className="w-full min-h-[120px] px-0 py-0 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-0
                disabled:cursor-not-allowed placeholder:dark:text-[#525252]/50 placeholder:text-[#3d3d3d]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
              placeholder="Welcher Milestone..."
            />
          </div>

          {/* Question 2 */}
          <div className="group dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)] dark:bg-card/50 bg-white/80
            transition-all duration-300 ease-out
            hover:shadow-xl hover:-translate-y-1 shadow-sm
            dark:hover:border-[rgba(0,229,255,0.25)] hover:border-[rgba(0,180,220,0.3)]
            dark:hover:shadow-[0_0_30px_rgba(0,229,255,0.15)] hover:shadow-[0_8px_30px_rgba(0,180,220,0.2)]
            rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.06) 0%, rgba(139, 92, 246, 0.04) 100%), rgba(26, 26, 26, 0.5)'
            }}>
            <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#525252] text-[#3d3d3d] mb-3"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
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
              className="w-full min-h-[120px] px-0 py-0 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-0
                disabled:cursor-not-allowed placeholder:dark:text-[#525252]/50 placeholder:text-[#3d3d3d]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
              placeholder="Was würdest du anders machen?"
            />
          </div>

          {/* Question 3 */}
          <div className="group dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)] dark:bg-card/50 bg-white/80
            transition-all duration-300 ease-out
            hover:shadow-xl hover:-translate-y-1 shadow-sm
            dark:hover:border-[rgba(0,229,255,0.25)] hover:border-[rgba(0,180,220,0.3)]
            dark:hover:shadow-[0_0_30px_rgba(0,229,255,0.15)] hover:shadow-[0_8px_30px_rgba(0,180,220,0.2)]
            rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.06) 0%, rgba(139, 92, 246, 0.04) 100%), rgba(26, 26, 26, 0.5)'
            }}>
            <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#525252] text-[#3d3d3d] mb-3"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
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
              className="w-full min-h-[120px] px-0 py-0 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-0
                disabled:cursor-not-allowed placeholder:dark:text-[#525252]/50 placeholder:text-[#3d3d3d]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
              placeholder="Deine Learnings..."
            />
          </div>

          {/* Question 4 */}
          <div className="group dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)] dark:bg-card/50 bg-white/80
            transition-all duration-300 ease-out
            hover:shadow-xl hover:-translate-y-1 shadow-sm
            dark:hover:border-[rgba(0,229,255,0.25)] hover:border-[rgba(0,180,220,0.3)]
            dark:hover:shadow-[0_0_30px_rgba(0,229,255,0.15)] hover:shadow-[0_8px_30px_rgba(0,180,220,0.2)]
            rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.06) 0%, rgba(139, 92, 246, 0.04) 100%), rgba(26, 26, 26, 0.5)'
            }}>
            <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#525252] text-[#3d3d3d] mb-3"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
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
              className="w-full min-h-[120px] px-0 py-0 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-0
                disabled:cursor-not-allowed placeholder:dark:text-[#525252]/50 placeholder:text-[#3d3d3d]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
              placeholder="Welche Entscheidung..."
            />
          </div>

          {/* Question 5 */}
          <div className="group dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)] dark:bg-card/50 bg-white/80
            transition-all duration-300 ease-out
            hover:shadow-xl hover:-translate-y-1 shadow-sm
            dark:hover:border-[rgba(0,229,255,0.25)] hover:border-[rgba(0,180,220,0.3)]
            dark:hover:shadow-[0_0_30px_rgba(0,229,255,0.15)] hover:shadow-[0_8px_30px_rgba(0,180,220,0.2)]
            rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.06) 0%, rgba(139, 92, 246, 0.04) 100%), rgba(26, 26, 26, 0.5)'
            }}>
            <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#525252] text-[#3d3d3d] mb-3"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
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
              className="w-full min-h-[120px] px-0 py-0 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-0
                disabled:cursor-not-allowed placeholder:dark:text-[#525252]/50 placeholder:text-[#3d3d3d]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
              placeholder="Was brauchst du..."
            />
          </div>

          {/* Part 3: Next Quarter Milestones */}
          <div className="group dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)] dark:bg-card/50 bg-white/80
            transition-all duration-300 ease-out
            hover:shadow-xl hover:-translate-y-1 shadow-sm
            dark:hover:border-[rgba(0,229,255,0.25)] hover:border-[rgba(0,180,220,0.3)]
            dark:hover:shadow-[0_0_30px_rgba(0,229,255,0.15)] hover:shadow-[0_8px_30px_rgba(0,180,220,0.2)]
            rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.06) 0%, rgba(139, 92, 246, 0.04) 100%), rgba(26, 26, 26, 0.5)'
            }}>
            <h3 className="text-[11px] font-bold uppercase tracking-wider dark:text-[#525252] text-[#3d3d3d] mb-4"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              Teil 3: OKRs für nächstes Quartal
            </h3>
            <p className="text-[13px] dark:text-[#525252] text-[#3d3d3d] mb-4"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              Definiere deine Objectives und Key Results für das nächste Quartal.
            </p>

            <div className="space-y-5">
              {nextQuarterOKRs.map((okr, okrIndex) => (
                <div key={okrIndex} className="p-4 rounded-lg border dark:border-border/50 border-border/40 space-y-4">
                  {/* Area Selection */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#525252] text-[#555555] mb-2"
                      style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                    >
                      Lebensbereich
                    </label>
                    <select
                      value={okr.area}
                      onChange={(e) => updateOKR(okrIndex, "area", e.target.value)}
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 dark:border-border/50 border-border/40
                        border rounded-lg dark:bg-transparent bg-transparent dark:text-[#E0E0E0] text-[#1A1A1A]
                        disabled:cursor-not-allowed
                        focus:outline-none focus:ring-0"
                      style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px' }}
                    >
                      <option value="Wealth">💰 Wealth</option>
                      <option value="Health">🏃 Health</option>
                      <option value="Love">❤️ Love</option>
                      <option value="Happiness">😊 Happiness</option>
                    </select>
                  </div>

                  {/* Objective */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#525252] text-[#555555] mb-2"
                      style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                    >
                      Objective
                    </label>
                    <textarea
                      value={okr.objective}
                      onChange={(e) => updateOKR(okrIndex, "objective", e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Was möchtest du erreichen?"
                      className="w-full px-3 py-2 dark:border-border/50 border-border/40
                        border rounded-lg dark:bg-transparent bg-transparent dark:text-[#E0E0E0] text-[#1A1A1A]
                        disabled:cursor-not-allowed placeholder:dark:text-[#525252]/50 placeholder:text-[#3d3d3d]/50
                        focus:outline-none focus:ring-0 min-h-[80px] resize-none"
                      style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px' }}
                    />
                  </div>

                  {/* Key Results */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#525252] text-[#555555] mb-2"
                      style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                    >
                      Key Results
                    </label>
                    <div className="space-y-3">
                      {okr.keyResults.map((kr, krIndex) => (
                        <div key={krIndex} className="flex gap-2 items-start">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={kr.description}
                              onChange={(e) => updateKeyResult(okrIndex, krIndex, "description", e.target.value)}
                              disabled={isReadOnly}
                              placeholder="Beschreibung des Key Results..."
                              className="w-full px-3 py-2 dark:border-border/50 border-border/40
                                border rounded-lg dark:bg-transparent bg-transparent dark:text-[#E0E0E0] text-[#1A1A1A]
                                disabled:cursor-not-allowed placeholder:dark:text-[#525252]/50 placeholder:text-[#3d3d3d]/50
                                focus:outline-none focus:ring-0"
                              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px' }}
                            />
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={kr.target}
                                onChange={(e) => updateKeyResult(okrIndex, krIndex, "target", Number(e.target.value))}
                                disabled={isReadOnly}
                                placeholder="Zielwert"
                                className="w-28 px-3 py-2 dark:border-border/50 border-border/40
                                  border rounded-lg dark:bg-transparent bg-transparent dark:text-[#E0E0E0] text-[#1A1A1A]
                                  disabled:cursor-not-allowed placeholder:dark:text-[#525252]/50 placeholder:text-[#3d3d3d]/50
                                  focus:outline-none focus:ring-0"
                                style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px' }}
                              />
                              <input
                                type="text"
                                value={kr.unit}
                                onChange={(e) => updateKeyResult(okrIndex, krIndex, "unit", e.target.value)}
                                disabled={isReadOnly}
                                placeholder="Einheit (z.B. kg, €, %)"
                                className="flex-1 px-3 py-2 dark:border-border/50 border-border/40
                                  border rounded-lg dark:bg-transparent bg-transparent dark:text-[#E0E0E0] text-[#1A1A1A]
                                  disabled:cursor-not-allowed placeholder:dark:text-[#525252]/50 placeholder:text-[#3d3d3d]/50
                                  focus:outline-none focus:ring-0"
                                style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px' }}
                              />
                            </div>
                          </div>
                          {!isReadOnly && okr.keyResults.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeKeyResult(okrIndex, krIndex)}
                              className="px-3 py-2 dark:border-border/50 border-border/40
                                border rounded-lg dark:hover:bg-white/[0.06] hover:bg-black/[0.05]
                                dark:text-[#E0E0E0] text-[#1A1A1A] transition-colors mt-0"
                              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => addKeyResult(okrIndex)}
                          className="text-[11px] dark:text-[#525252] text-[#3d3d3d] hover:underline font-medium"
                          style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                        >
                          + Weiteres Key Result
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Remove OKR Button */}
                  {!isReadOnly && nextQuarterOKRs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOKR(okrIndex)}
                      className="w-full px-3 py-2 dark:border-border/50 border-border/40
                        border rounded-lg dark:hover:bg-white/[0.06] hover:bg-black/[0.05]
                        dark:text-[#525252] text-[#3d3d3d] transition-colors text-[11px] font-medium"
                      style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                    >
                      OKR entfernen
                    </button>
                  )}
                </div>
              ))}

              {!isReadOnly && (
                <button
                  type="button"
                  onClick={addOKR}
                  className="w-full px-4 py-3 dark:border-border/50 border-border/40
                    border border-dashed rounded-lg dark:hover:bg-white/[0.06] hover:bg-black/[0.05]
                    dark:text-[#525252] text-[#3d3d3d] transition-colors text-[11px] font-medium"
                  style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                >
                  + Neues OKR hinzufügen ({nextQuarterOKRs.length})
                </button>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-center pt-4">
            {isReadOnly ? (
              <button
                type="button"
                onClick={handleEdit}
                className="px-12 py-3 dark:bg-white/[0.06] bg-black/[0.04]
                  dark:border dark:border-white/[0.1] border border-black/[0.08]
                  dark:text-[#E0E0E0] text-[#1A1A1A]
                  dark:hover:bg-white/[0.1] hover:bg-black/[0.06]
                  uppercase tracking-wider text-[11px] font-bold transition-all duration-200 rounded-lg
                  hover:scale-[1.02]"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              >
                Bearbeiten
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-12 py-3 bg-[#00E676] dark:text-black text-black font-bold uppercase tracking-wider text-[11px]
                  border border-[#00E676]/50 shadow-sm
                  hover:bg-[#00C853] hover:shadow-md hover:scale-[1.02]
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  transition-all duration-300 rounded-lg"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
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
