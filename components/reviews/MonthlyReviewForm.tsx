"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import { ProgressIndicator } from "@/components/dashboard/ProgressIndicator";
import { toast } from "sonner";

interface MonthlyReviewFormProps {
  year: number;
  month: number;
}

export function MonthlyReviewForm({ year, month }: MonthlyReviewFormProps) {
  const existingReview = useQuery(api.monthlyReview.getMonthlyReview, {
    year,
    month,
  });

  // Get OKRs from LAST month's review (these were set for THIS month)
  const previousOKRs = useQuery(api.monthlyReview.getMonthlyOKRs, {
    year,
    month,
  });

  const submitReview = useMutation(api.monthlyReview.submitMonthlyReview);

  const [formData, setFormData] = useState({
    biggestSuccess: "",
    patternToChange: "",
    learnedAboutSelf: "",
    biggestSurprise: "",
    proudOf: "",
    nextMonthFocus: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Track Key Result progress
  const [keyResultProgress, setKeyResultProgress] = useState<Record<string, number>>({});

  // OKR State
  const [nextMonthOKRs, setNextMonthOKRs] = useState<Array<{
    objective: string;
    area: string;
    keyResults: Array<{ description: string; target: number; unit: string }>;
  }>>([
    {
      objective: "",
      area: "Wealth",
      keyResults: [{ description: "", target: 0, unit: "" }],
    },
  ]);

  // Initialize key result progress tracking
  useEffect(() => {
    if (previousOKRs && previousOKRs.length > 0) {
      const initialProgress: Record<string, number> = {};
      previousOKRs.forEach((okr, okrIdx) => {
        okr.keyResults.forEach((_, krIdx) => {
          initialProgress[`${okrIdx}-${krIdx}`] = 0;
        });
      });
      setKeyResultProgress(initialProgress);
    }
  }, [previousOKRs]);

  // Load existing review data
  useEffect(() => {
    if (existingReview) {
      setFormData(existingReview.responses);
      if (existingReview.nextMonthOKRs && existingReview.nextMonthOKRs.length > 0) {
        setNextMonthOKRs(existingReview.nextMonthOKRs);
      }
      setIsReadOnly(true);
    }
  }, [existingReview]);

  const totalFields = 6;
  const filledFields = Object.values(formData).filter((val) => val.trim() !== "").length;
  const percentage = Math.round((filledFields / totalFields) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields are filled
    if (filledFields < totalFields) {
      toast.error("Bitte fülle alle Felder aus.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Filter out empty OKRs
      const validOKRs = nextMonthOKRs.filter(
        okr => okr.objective.trim() !== "" && okr.keyResults.some(kr => kr.description.trim() !== "")
      );

      await submitReview({
        year,
        month,
        responses: formData,
        nextMonthOKRs: validOKRs.length > 0 ? validOKRs : undefined,
      });
      setIsReadOnly(true);
      toast.success("Monthly Review erfolgreich gespeichert!");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Fehler beim Speichern des Reviews.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setIsReadOnly(false);
  };

  // OKR Helper Functions
  const addOKR = () => {
    if (nextMonthOKRs.length < 3) {
      setNextMonthOKRs([
        ...nextMonthOKRs,
        {
          objective: "",
          area: "Wealth",
          keyResults: [{ description: "", target: 0, unit: "" }],
        },
      ]);
    }
  };

  const removeOKR = (index: number) => {
    setNextMonthOKRs(nextMonthOKRs.filter((_, i) => i !== index));
  };

  const updateOKR = (index: number, field: "objective" | "area", value: string) => {
    const updated = [...nextMonthOKRs];
    updated[index][field] = value;
    setNextMonthOKRs(updated);
  };

  const addKeyResult = (okrIndex: number) => {
    const updated = [...nextMonthOKRs];
    if (updated[okrIndex].keyResults.length < 3) {
      updated[okrIndex].keyResults.push({ description: "", target: 0, unit: "" });
      setNextMonthOKRs(updated);
    }
  };

  const removeKeyResult = (okrIndex: number, krIndex: number) => {
    const updated = [...nextMonthOKRs];
    updated[okrIndex].keyResults = updated[okrIndex].keyResults.filter((_, i) => i !== krIndex);
    setNextMonthOKRs(updated);
  };

  const updateKeyResult = (
    okrIndex: number,
    krIndex: number,
    field: "description" | "target" | "unit",
    value: string | number
  ) => {
    const updated = [...nextMonthOKRs];
    if (field === "target") {
      updated[okrIndex].keyResults[krIndex][field] = value as number;
    } else {
      updated[okrIndex].keyResults[krIndex][field] = value as string;
    }
    setNextMonthOKRs(updated);
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
            Monthly Review
          </h1>
          <p className="text-[13px] dark:text-[#888888] text-[#666666] font-medium"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
          >
            {format(new Date(year, month - 1), "MMMM yyyy")}
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator percentage={percentage} />

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
          {/* Part 1: Previous Month OKRs Review */}
          {previousOKRs && previousOKRs.length > 0 && !isReadOnly && (
            <div className="space-y-6 pb-8">
              <div className="text-center pb-2">
                <h3 className="text-[13px] font-bold uppercase tracking-wider dark:text-[#00E5FF] text-[#0097A7]"
                  style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                  Teil 1: OKR Check
                </h3>
                <p className="text-[11px] dark:text-[#888888] text-[#666666] mt-1"
                  style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                  Trage deinen Fortschritt ein
                </p>
              </div>

              {previousOKRs.map((okr, okrIdx) => {
                const areaConfig: Record<string, { icon: string; color: string; gradient: string }> = {
                  Wealth: { icon: "💰", color: "text-yellow-400", gradient: "from-yellow-500/20 to-yellow-600/10" },
                  Health: { icon: "🏃", color: "text-green-400", gradient: "from-green-500/20 to-green-600/10" },
                  Love: { icon: "❤️", color: "text-pink-400", gradient: "from-pink-500/20 to-pink-600/10" },
                  Happiness: { icon: "😊", color: "text-purple-400", gradient: "from-purple-500/20 to-purple-600/10" },
                };

                const config = areaConfig[okr.area] || { icon: "🎯", color: "text-blue-400", gradient: "from-blue-500/20 to-blue-600/10" };

                return (
                  <div
                    key={okrIdx}
                    className={`p-6 rounded-xl bg-gradient-to-br ${config.gradient}
                      dark:border dark:border-white/[0.08] border border-black/[0.05]`}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <span className="text-2xl">{config.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold uppercase tracking-wider ${config.color}`}
                            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                            {okr.area}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold dark:text-[#E0E0E0] text-[#1A1A1A]"
                          style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                          {okr.objective}
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-3 ml-11">
                      {okr.keyResults.map((kr, krIdx) => {
                        const progressKey = `${okrIdx}-${krIdx}`;
                        const currentProgress = keyResultProgress[progressKey] || 0;
                        const progressPercentage = kr.target > 0 ? Math.min(Math.round((currentProgress / kr.target) * 100), 100) : 0;

                        return (
                          <div key={krIdx} className="p-4 rounded-lg dark:bg-white/[0.03] bg-black/[0.02]">
                            <p className="text-sm dark:text-[#E0E0E0] text-[#1A1A1A] mb-2"
                              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                              {kr.description}
                            </p>
                            <div className="flex items-center gap-3">
                              <input
                                type="number"
                                value={currentProgress}
                                onChange={(e) => {
                                  setKeyResultProgress({
                                    ...keyResultProgress,
                                    [progressKey]: Number(e.target.value)
                                  });
                                }}
                                className="w-20 px-2 py-1 rounded dark:bg-white/[0.05] bg-black/[0.03]
                                  dark:border-white/[0.1] border-black/[0.08] border
                                  dark:text-[#E0E0E0] text-[#1A1A1A] text-sm
                                  focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50"
                                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                              />
                              <span className="text-sm dark:text-[#888888] text-[#666666]"
                                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                                / {kr.target} {kr.unit}
                              </span>
                              <span className={`text-sm font-bold ml-auto ${progressPercentage >= 100 ? 'text-green-400' : progressPercentage >= 50 ? 'text-yellow-400' : 'text-red-400'}`}
                                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                                {progressPercentage}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Part 2: Reflection Questions */}
          {!isReadOnly && (
            <div className="text-center pb-4 pt-8">
              <h3 className="text-[13px] font-bold uppercase tracking-wider dark:text-[#00E5FF] text-[#0097A7]"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                Teil 2: Reflexion
              </h3>
              <p className="text-[11px] dark:text-[#888888] text-[#666666] mt-1"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                Reflektiere über deinen Monat
              </p>
            </div>
          )}

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
            <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-3"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              Was war dein größter Erfolg diesen Monat?
            </label>
            <textarea
              value={formData.biggestSuccess}
              onChange={(e) =>
                setFormData({ ...formData, biggestSuccess: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[120px] px-0 py-0 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-0
                disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
              placeholder="Beschreibe deinen größten Erfolg..."
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
            <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-3"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              Welches Muster möchtest du ändern?
            </label>
            <textarea
              value={formData.patternToChange}
              onChange={(e) =>
                setFormData({ ...formData, patternToChange: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[120px] px-0 py-0 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-0
                disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
              placeholder="Welches Verhaltensmuster möchtest du ändern?"
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
            <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-3"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              Was hast du über dich selbst gelernt?
            </label>
            <textarea
              value={formData.learnedAboutSelf}
              onChange={(e) =>
                setFormData({ ...formData, learnedAboutSelf: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[120px] px-0 py-0 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-0
                disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
              placeholder="Was hast du über dich gelernt?"
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
            <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-3"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              Was war die größte Überraschung?
            </label>
            <textarea
              value={formData.biggestSurprise}
              onChange={(e) =>
                setFormData({ ...formData, biggestSurprise: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[120px] px-0 py-0 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-0
                disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
              placeholder="Was hat dich überrascht?"
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
            <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-3"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              Worauf bist du stolz?
            </label>
            <textarea
              value={formData.proudOf}
              onChange={(e) =>
                setFormData({ ...formData, proudOf: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[120px] px-0 py-0 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-0
                disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
              placeholder="Worauf bist du stolz?"
            />
          </div>

          {/* Question 6 */}
          <div className="group dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)] dark:bg-card/50 bg-white/80
            transition-all duration-300 ease-out
            hover:shadow-xl hover:-translate-y-1 shadow-sm
            dark:hover:border-[rgba(0,229,255,0.25)] hover:border-[rgba(0,180,220,0.3)]
            dark:hover:shadow-[0_0_30px_rgba(0,229,255,0.15)] hover:shadow-[0_8px_30px_rgba(0,180,220,0.2)]
            rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.06) 0%, rgba(139, 92, 246, 0.04) 100%), rgba(26, 26, 26, 0.5)'
            }}>
            <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-3"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              Was ist dein Fokus für nächsten Monat?
            </label>
            <textarea
              value={formData.nextMonthFocus}
              onChange={(e) =>
                setFormData({ ...formData, nextMonthFocus: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[120px] px-0 py-0 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-0
                disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
              placeholder="Dein Fokus für nächsten Monat..."
            />
          </div>

          {/* Next Month OKRs Section */}
          <div className="space-y-6 pt-8">
            <div className="text-center pb-2">
              <h3 className="text-[13px] font-bold uppercase tracking-wider dark:text-[#00E5FF] text-[#0097A7]"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                Teil 3: Next Month OKRs
              </h3>
              <p className="text-[11px] dark:text-[#888888] text-[#666666] mt-1"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                Setze 1-3 Objectives mit Key Results für nächsten Monat
              </p>
            </div>

            {nextMonthOKRs.map((okr, okrIndex) => (
              <div
                key={okrIndex}
                className="dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,151,167,0.2)] border-2
                  dark:bg-[rgba(0,229,255,0.02)] bg-[rgba(0,151,167,0.03)]
                  backdrop-blur-sm rounded-xl p-6 space-y-4"
              >
                {/* OKR Header */}
                <div className="flex items-start justify-between gap-4">
                  <label className="text-[11px] font-bold uppercase tracking-wider
                    dark:text-[#00E5FF] text-[#0097A7] flex-shrink-0"
                    style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                    OKR {okrIndex + 1}
                  </label>
                  {!isReadOnly && nextMonthOKRs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOKR(okrIndex)}
                      className="text-[10px] dark:text-[#888888] text-[#666666]
                        dark:hover:text-red-400 hover:text-red-600
                        uppercase tracking-wider transition-colors"
                      style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                    >
                      Remove OKR
                    </button>
                  )}
                </div>

                {/* Objective */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider
                    dark:text-[#888888] text-[#666666] block mb-2"
                    style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                    Objective
                  </label>
                  <textarea
                    value={okr.objective}
                    onChange={(e) => updateOKR(okrIndex, "objective", e.target.value)}
                    disabled={isReadOnly}
                    className="w-full min-h-[80px] px-0 py-0 border-0 dark:bg-transparent bg-transparent resize-none
                      focus:outline-none focus:ring-0
                      disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                      dark:text-[#E0E0E0] text-[#1A1A1A]"
                    style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
                    placeholder="E.g., Launch side project MVP..."
                  />
                </div>

                {/* Area Selection */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider
                    dark:text-[#888888] text-[#666666] block mb-2"
                    style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                    North Star Area
                  </label>
                  <select
                    value={okr.area}
                    onChange={(e) => updateOKR(okrIndex, "area", e.target.value)}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 dark:bg-white/[0.03] bg-black/[0.02]
                      dark:border-white/[0.1] border-black/[0.08] border rounded-lg
                      dark:text-[#E0E0E0] text-[#1A1A1A]
                      focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50
                      disabled:cursor-not-allowed text-[13px]"
                    style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                  >
                    <option value="Wealth">💰 Wealth</option>
                    <option value="Health">🏃 Health</option>
                    <option value="Love">❤️ Love</option>
                    <option value="Happiness">😊 Happiness</option>
                  </select>
                </div>

                {/* Key Results */}
                <div className="pt-4 border-t dark:border-[rgba(0,229,255,0.1)] border-[rgba(0,151,167,0.15)]">
                  <label className="text-[10px] font-bold uppercase tracking-wider
                    dark:text-[#888888] text-[#666666] block mb-3"
                    style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                    Key Results
                  </label>

                  <div className="space-y-3">
                    {okr.keyResults.map((kr, krIndex) => (
                      <div
                        key={krIndex}
                        className="pl-4 border-l-2 dark:border-[#00E5FF]/30 border-[#0097A7]/30 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider
                            dark:text-[#666666] text-[#888888]"
                            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                            KR {krIndex + 1}
                          </span>
                          {!isReadOnly && okr.keyResults.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeKeyResult(okrIndex, krIndex)}
                              className="text-[9px] dark:text-[#666666] text-[#888888]
                                dark:hover:text-red-400 hover:text-red-600
                                uppercase tracking-wider transition-colors"
                              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <textarea
                          value={kr.description}
                          onChange={(e) =>
                            updateKeyResult(okrIndex, krIndex, "description", e.target.value)
                          }
                          disabled={isReadOnly}
                          className="w-full min-h-[60px] px-0 py-0 border-0 dark:bg-transparent bg-transparent resize-none
                            focus:outline-none focus:ring-0
                            disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                            dark:text-[#E0E0E0] text-[#1A1A1A]"
                          style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '13px', lineHeight: '1.6' }}
                          placeholder="E.g., Run 3x per week..."
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-bold uppercase tracking-wider
                              dark:text-[#666666] text-[#888888] block mb-1"
                              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                              Target
                            </label>
                            <input
                              type="number"
                              value={kr.target}
                              onChange={(e) =>
                                updateKeyResult(okrIndex, krIndex, "target", Number(e.target.value))
                              }
                              disabled={isReadOnly}
                              className="w-full px-3 py-2 dark:bg-white/[0.03] bg-black/[0.02]
                                dark:border-white/[0.1] border-black/[0.08] border rounded-lg
                                dark:text-[#E0E0E0] text-[#1A1A1A]
                                focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50
                                disabled:cursor-not-allowed text-[12px]"
                              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                              placeholder="12"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold uppercase tracking-wider
                              dark:text-[#666666] text-[#888888] block mb-1"
                              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                              Unit
                            </label>
                            <input
                              type="text"
                              value={kr.unit}
                              onChange={(e) =>
                                updateKeyResult(okrIndex, krIndex, "unit", e.target.value)
                              }
                              disabled={isReadOnly}
                              className="w-full px-3 py-2 dark:bg-white/[0.03] bg-black/[0.02]
                                dark:border-white/[0.1] border-black/[0.08] border rounded-lg
                                dark:text-[#E0E0E0] text-[#1A1A1A]
                                focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50
                                disabled:cursor-not-allowed text-[12px]"
                              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                              placeholder="runs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {!isReadOnly && okr.keyResults.length < 3 && (
                      <button
                        type="button"
                        onClick={() => addKeyResult(okrIndex)}
                        className="w-full px-4 py-2 dark:bg-white/[0.02] bg-black/[0.01]
                          dark:border dark:border-dashed dark:border-white/[0.1] border border-dashed border-black/[0.08]
                          dark:text-[#666666] text-[#888888]
                          dark:hover:bg-white/[0.04] hover:bg-black/[0.02]
                          dark:hover:border-[#00E5FF]/20 hover:border-[#0097A7]/20
                          dark:hover:text-[#888888] hover:text-[#666666]
                          uppercase tracking-wider text-[10px] font-bold transition-all duration-200 rounded-lg"
                        style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                      >
                        + Add Key Result ({okr.keyResults.length}/3)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {!isReadOnly && nextMonthOKRs.length < 3 && (
              <button
                type="button"
                onClick={addOKR}
                className="w-full px-6 py-3 dark:bg-white/[0.03] bg-black/[0.02]
                  dark:border dark:border-dashed dark:border-white/[0.15] border border-dashed border-black/[0.1]
                  dark:text-[#888888] text-[#666666]
                  dark:hover:bg-white/[0.06] hover:bg-black/[0.04]
                  dark:hover:border-[#00E5FF]/30 hover:border-[#0097A7]/30
                  dark:hover:text-[#00E5FF] hover:text-[#0097A7]
                  uppercase tracking-wider text-[11px] font-bold transition-all duration-200 rounded-lg"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              >
                + Add OKR ({nextMonthOKRs.length}/3)
              </button>
            )}
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
