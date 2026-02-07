"use client";

import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProgressIndicator } from "@/components/dashboard/ProgressIndicator";
import { toast } from "sonner";

interface WeeklyReviewFormProps {
  year: number;
  weekNumber: number;
}

export function WeeklyReviewForm({ year, weekNumber }: WeeklyReviewFormProps) {
  const existingReview = useQuery(api.weeklyReview.getWeeklyReview, {
    year,
    weekNumber,
  });

  // Get goals from LAST week's review (these were set for THIS week)
  const previousGoals = useQuery(api.weeklyReview.getWeeklyGoals, {
    year,
    weekNumber,
  });

  const submitReview = useMutation(api.weeklyReview.submitWeeklyReview);

  const [formData, setFormData] = useState({
    biggestSuccess: "",
    mostFrustrating: "",
    differentlyNextTime: "",
    learned: "",
    nextWeekFocus: "",
  });

  const [nextWeekGoals, setNextWeekGoals] = useState<Array<{ goal: string; category: string }>>([
    { goal: "", category: "Wealth" },
  ]);

  const [goalCompletionStatus, setGoalCompletionStatus] = useState<Record<number, boolean>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Initialize goal completion status when previous goals are loaded
  useEffect(() => {
    if (previousGoals && previousGoals.length > 0) {
      const initialStatus: Record<number, boolean> = {};
      previousGoals.forEach((_, index) => {
        initialStatus[index] = false;
      });
      setGoalCompletionStatus(initialStatus);
    }
  }, [previousGoals]);

  // Load existing review data
  useEffect(() => {
    if (existingReview) {
      setFormData(existingReview.responses);
      if (existingReview.nextWeekGoals && existingReview.nextWeekGoals.length > 0) {
        setNextWeekGoals(existingReview.nextWeekGoals);
      }
      setIsReadOnly(true);
    }
  }, [existingReview]);

  const totalFields = 5;
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
      // Filter out empty goals
      const validGoals = nextWeekGoals.filter(g => g.goal.trim() !== "");

      await submitReview({
        year,
        weekNumber,
        responses: formData,
        nextWeekGoals: validGoals.length > 0 ? validGoals : undefined,
      });
      setIsReadOnly(true);
      toast.success("Weekly Review erfolgreich gespeichert!");
    } catch (error) {
      logger.error("Error submitting review:", error);
      toast.error("Fehler beim Speichern des Reviews.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addGoal = () => {
    setNextWeekGoals([...nextWeekGoals, { goal: "", category: "Wealth" }]);
  };

  const removeGoal = (index: number) => {
    setNextWeekGoals(nextWeekGoals.filter((_, i) => i !== index));
  };

  const updateGoal = (index: number, field: "goal" | "category", value: string) => {
    const updated = [...nextWeekGoals];
    updated[index][field] = value;
    setNextWeekGoals(updated);
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
          <h1
            className="font-[family-name:var(--font-orbitron)] text-[44px] font-bold"
            style={{
              color: '#00E5FF',
              textShadow: '0 0 40px rgba(0, 229, 255, 0.5)',
              letterSpacing: '3px'
            }}
          >
            WEEKLY REVIEW
          </h1>
          <p className="text-[14px] dark:text-[#00E5FF]/70 text-[#0097A7]/80 font-medium"
            style={{ fontFamily: '"Courier New", "Monaco", monospace', letterSpacing: '1px' }}
          >
            Week {weekNumber}, {year}
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
          {/* Part 1: Previous Week Goals Review */}
          {previousGoals && previousGoals.length > 0 && !isReadOnly && (
            <div className="space-y-4 pb-8">
              <div className="text-center pb-4">
                <h3 className="text-[14px] font-bold uppercase tracking-wider dark:text-[#00E5FF] text-[#0097A7]"
                  style={{ fontFamily: '"Courier New", "Monaco", monospace', letterSpacing: '2px' }}>
                  ◢ Teil 1: Goal Check ◣
                </h3>
                <p className="text-[12px] dark:text-[#B0B0B0] text-[#666666] mt-2"
                  style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                  Markiere welche Goals du erreicht hast
                </p>
              </div>

              {previousGoals.map((goal, index) => {
                const categoryConfig: Record<string, { icon: string; color: string; glow: string }> = {
                  Wealth: { icon: "💰", color: "text-yellow-400", glow: "rgba(251, 191, 36, 0.3)" },
                  Health: { icon: "🏃", color: "text-green-400", glow: "rgba(74, 222, 128, 0.3)" },
                  Love: { icon: "❤️", color: "text-pink-400", glow: "rgba(244, 114, 182, 0.3)" },
                  Happiness: { icon: "😊", color: "text-purple-400", glow: "rgba(192, 132, 252, 0.3)" },
                };

                const config = categoryConfig[goal.category] || { icon: "🎯", color: "text-cyan-400", glow: "rgba(0, 229, 255, 0.3)" };

                return (
                  <div
                    key={index}
                    className="group dark:border-[rgba(0,229,255,0.25)] border-[rgba(0,151,167,0.3)] border-2
                      backdrop-blur-sm rounded-xl p-6 transition-all duration-300
                      hover:dark:border-[rgba(0,229,255,0.4)] hover:border-[rgba(0,151,167,0.4)]
                      hover:shadow-[0_0_20px_rgba(0,229,255,0.2)]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.08) 0%, rgba(139, 92, 246, 0.06) 100%)'
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={goalCompletionStatus[index] || false}
                        onChange={(e) => {
                          setGoalCompletionStatus({
                            ...goalCompletionStatus,
                            [index]: e.target.checked
                          });
                        }}
                        className="mt-1 w-5 h-5 rounded border-2 dark:border-[#00E5FF]/30 border-[#0097A7]/40
                          dark:bg-white/[0.03] bg-black/[0.03]
                          checked:dark:bg-[#00E5FF] checked:bg-[#0097A7]
                          checked:dark:border-[#00E5FF] checked:border-[#0097A7]
                          focus:ring-2 focus:ring-[#00E5FF]/50
                          cursor-pointer transition-all"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{config.icon}</span>
                          <span className={`text-xs font-bold uppercase tracking-wider ${config.color}`}
                            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                            {goal.category}
                          </span>
                        </div>
                        <p className="dark:text-[#FFFFFF] text-[#1A1A1A] leading-relaxed font-medium"
                          style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '15px' }}>
                          {goal.goal}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="text-center pt-2">
                <p className="text-sm dark:text-[#00E5FF]/80 text-[#0097A7] font-bold"
                  style={{ fontFamily: '"Courier New", "Monaco", monospace', letterSpacing: '1px' }}>
                  {Object.values(goalCompletionStatus).filter(Boolean).length} / {previousGoals.length} ERREICHT
                </p>
              </div>
            </div>
          )}

          {/* Part 2: Reflection Questions */}
          {!isReadOnly && (
            <div className="text-center pb-6 pt-8">
              <h3 className="text-[14px] font-bold uppercase tracking-wider dark:text-[#00E5FF] text-[#0097A7]"
                style={{ fontFamily: '"Courier New", "Monaco", monospace', letterSpacing: '2px' }}>
                ◢ Teil 2: Reflexion ◣
              </h3>
              <p className="text-[12px] dark:text-[#B0B0B0] text-[#666666] mt-2"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                Reflektiere über deine Woche
              </p>
            </div>
          )}

          {/* Question 1 */}
          <div className="group dark:border-[rgba(0,229,255,0.3)] border-[rgba(0,180,220,0.35)] border-2
            transition-all duration-300 ease-out
            hover:shadow-[0_0_30px_rgba(0,229,255,0.25)] hover:-translate-y-1 shadow-sm
            dark:hover:border-[rgba(0,229,255,0.5)] hover:border-[rgba(0,180,220,0.5)]
            rounded-xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.10) 0%, rgba(139, 92, 246, 0.08) 100%)'
            }}>
            <label className="block text-[12px] font-bold uppercase tracking-wider dark:text-[#00E5FF] text-[#0097A7] mb-4"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', letterSpacing: '1.5px' }}
            >
              → Was war dein größter Erfolg diese Woche?
            </label>
            <textarea
              value={formData.biggestSuccess}
              onChange={(e) =>
                setFormData({ ...formData, biggestSuccess: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[120px] px-4 py-3 border-2 dark:border-[rgba(0,229,255,0.2)] border-[rgba(0,180,220,0.25)]
                dark:bg-[rgba(0,229,255,0.05)] bg-[rgba(0,180,220,0.08)] rounded-lg resize-none
                focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 focus:border-[rgba(0,229,255,0.4)]
                disabled:cursor-not-allowed placeholder:dark:text-[#A0A0A0] placeholder:text-[#888888]
                dark:text-[#FFFFFF] text-[#1A1A1A] transition-all"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '15px', lineHeight: '1.7' }}
              placeholder="Beschreibe deinen größten Erfolg..."
            />
          </div>

          {/* Question 2 */}
          <div className="group dark:border-[rgba(0,229,255,0.3)] border-[rgba(0,180,220,0.35)] border-2
            transition-all duration-300 ease-out
            hover:shadow-[0_0_30px_rgba(0,229,255,0.25)] hover:-translate-y-1 shadow-sm
            dark:hover:border-[rgba(0,229,255,0.5)] hover:border-[rgba(0,180,220,0.5)]
            rounded-xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.10) 0%, rgba(139, 92, 246, 0.08) 100%)'
            }}>
            <label className="block text-[12px] font-bold uppercase tracking-wider dark:text-[#00E5FF] text-[#0097A7] mb-4"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', letterSpacing: '1.5px' }}
            >
              → Was hat dich am meisten frustriert?
            </label>
            <textarea
              value={formData.mostFrustrating}
              onChange={(e) =>
                setFormData({ ...formData, mostFrustrating: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[120px] px-4 py-3 border-2 dark:border-[rgba(0,229,255,0.2)] border-[rgba(0,180,220,0.25)]
                dark:bg-[rgba(0,229,255,0.05)] bg-[rgba(0,180,220,0.08)] rounded-lg resize-none
                focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 focus:border-[rgba(0,229,255,0.4)]
                disabled:cursor-not-allowed placeholder:dark:text-[#A0A0A0] placeholder:text-[#888888]
                dark:text-[#FFFFFF] text-[#1A1A1A] transition-all"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '15px', lineHeight: '1.7' }}
              placeholder="Was war frustrierend?"
            />
          </div>

          {/* Question 3 */}
          <div className="group dark:border-[rgba(0,229,255,0.3)] border-[rgba(0,180,220,0.35)] border-2
            transition-all duration-300 ease-out
            hover:shadow-[0_0_30px_rgba(0,229,255,0.25)] hover:-translate-y-1 shadow-sm
            dark:hover:border-[rgba(0,229,255,0.5)] hover:border-[rgba(0,180,220,0.5)]
            rounded-xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.10) 0%, rgba(139, 92, 246, 0.08) 100%)'
            }}>
            <label className="block text-[12px] font-bold uppercase tracking-wider dark:text-[#00E5FF] text-[#0097A7] mb-4"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', letterSpacing: '1.5px' }}
            >
              → Was hättest du anders gemacht?
            </label>
            <textarea
              value={formData.differentlyNextTime}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  differentlyNextTime: e.target.value,
                })
              }
              disabled={isReadOnly}
              className="w-full min-h-[120px] px-4 py-3 border-2 dark:border-[rgba(0,229,255,0.2)] border-[rgba(0,180,220,0.25)]
                dark:bg-[rgba(0,229,255,0.05)] bg-[rgba(0,180,220,0.08)] rounded-lg resize-none
                focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 focus:border-[rgba(0,229,255,0.4)]
                disabled:cursor-not-allowed placeholder:dark:text-[#A0A0A0] placeholder:text-[#888888]
                dark:text-[#FFFFFF] text-[#1A1A1A] transition-all"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '15px', lineHeight: '1.7' }}
              placeholder="Was würdest du beim nächsten Mal anders machen?"
            />
          </div>

          {/* Question 4 */}
          <div className="group dark:border-[rgba(0,229,255,0.3)] border-[rgba(0,180,220,0.35)] border-2
            transition-all duration-300 ease-out
            hover:shadow-[0_0_30px_rgba(0,229,255,0.25)] hover:-translate-y-1 shadow-sm
            dark:hover:border-[rgba(0,229,255,0.5)] hover:border-[rgba(0,180,220,0.5)]
            rounded-xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.10) 0%, rgba(139, 92, 246, 0.08) 100%)'
            }}>
            <label className="block text-[12px] font-bold uppercase tracking-wider dark:text-[#00E5FF] text-[#0097A7] mb-4"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', letterSpacing: '1.5px' }}
            >
              → Was hast du diese Woche gelernt?
            </label>
            <textarea
              value={formData.learned}
              onChange={(e) =>
                setFormData({ ...formData, learned: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[120px] px-4 py-3 border-2 dark:border-[rgba(0,229,255,0.2)] border-[rgba(0,180,220,0.25)]
                dark:bg-[rgba(0,229,255,0.05)] bg-[rgba(0,180,220,0.08)] rounded-lg resize-none
                focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 focus:border-[rgba(0,229,255,0.4)]
                disabled:cursor-not-allowed placeholder:dark:text-[#A0A0A0] placeholder:text-[#888888]
                dark:text-[#FFFFFF] text-[#1A1A1A] transition-all"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '15px', lineHeight: '1.7' }}
              placeholder="Deine wichtigsten Learnings..."
            />
          </div>

          {/* Question 5 */}
          <div className="group dark:border-[rgba(0,229,255,0.3)] border-[rgba(0,180,220,0.35)] border-2
            transition-all duration-300 ease-out
            hover:shadow-[0_0_30px_rgba(0,229,255,0.25)] hover:-translate-y-1 shadow-sm
            dark:hover:border-[rgba(0,229,255,0.5)] hover:border-[rgba(0,180,220,0.5)]
            rounded-xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.10) 0%, rgba(139, 92, 246, 0.08) 100%)'
            }}>
            <label className="block text-[12px] font-bold uppercase tracking-wider dark:text-[#00E5FF] text-[#0097A7] mb-4"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', letterSpacing: '1.5px' }}
            >
              → Worauf fokussierst du dich nächste Woche?
            </label>
            <textarea
              value={formData.nextWeekFocus}
              onChange={(e) =>
                setFormData({ ...formData, nextWeekFocus: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[120px] px-4 py-3 border-2 dark:border-[rgba(0,229,255,0.2)] border-[rgba(0,180,220,0.25)]
                dark:bg-[rgba(0,229,255,0.05)] bg-[rgba(0,180,220,0.08)] rounded-lg resize-none
                focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 focus:border-[rgba(0,229,255,0.4)]
                disabled:cursor-not-allowed placeholder:dark:text-[#A0A0A0] placeholder:text-[#888888]
                dark:text-[#FFFFFF] text-[#1A1A1A] transition-all"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '15px', lineHeight: '1.7' }}
              placeholder="Dein Fokus für nächste Woche..."
            />
          </div>

          {/* Next Week Goals Section */}
          <div className="space-y-4 pt-8">
            <div className="text-center pb-4">
              <h3 className="text-[14px] font-bold uppercase tracking-wider dark:text-[#00E5FF] text-[#0097A7]"
                style={{ fontFamily: '"Courier New", "Monaco", monospace', letterSpacing: '2px' }}>
                ◢ Teil 3: Next Week Goals ◣
              </h3>
              <p className="text-[12px] dark:text-[#B0B0B0] text-[#666666] mt-2"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                Setze 3-5 Goals für nächste Woche
              </p>
            </div>

            {nextWeekGoals.map((goal, index) => (
              <div
                key={index}
                className="group dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,151,167,0.2)] border-2
                  dark:bg-[rgba(0,229,255,0.02)] bg-[rgba(0,151,167,0.03)]
                  backdrop-blur-sm rounded-xl p-6 transition-all duration-200
                  hover:dark:border-[rgba(0,229,255,0.25)] hover:border-[rgba(0,151,167,0.3)]"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <label className="text-[11px] font-bold uppercase tracking-wider
                    dark:text-[#00E5FF] text-[#0097A7] flex-shrink-0"
                    style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                    Goal {index + 1}
                  </label>
                  {!isReadOnly && nextWeekGoals.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGoal(index)}
                      className="text-[10px] dark:text-[#525252] text-[#3d3d3d]
                        dark:hover:text-red-400 hover:text-red-600
                        uppercase tracking-wider transition-colors"
                      style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <textarea
                  value={goal.goal}
                  onChange={(e) => updateGoal(index, "goal", e.target.value)}
                  disabled={isReadOnly}
                  className="w-full min-h-[80px] px-4 py-3 border-2 dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)]
                    dark:bg-[rgba(0,229,255,0.03)] bg-[rgba(0,180,220,0.05)] rounded-lg resize-none mb-3
                    focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 focus:border-[rgba(0,229,255,0.3)]
                    disabled:cursor-not-allowed placeholder:dark:text-[#A0A0A0] placeholder:text-[#888888]
                    dark:text-[#FFFFFF] text-[#1A1A1A] transition-all"
                  style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '15px', lineHeight: '1.7' }}
                  placeholder="Describe your goal for next week..."
                />

                <div className="pt-2 border-t dark:border-[rgba(0,229,255,0.1)] border-[rgba(0,151,167,0.2)]">
                  <label className="text-[10px] font-bold uppercase tracking-wider
                    dark:text-[#525252] text-[#555555] block mb-2"
                    style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                    Category
                  </label>
                  <select
                    value={goal.category}
                    onChange={(e) => updateGoal(index, "category", e.target.value)}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 dark:bg-white/[0.03] bg-black/[0.03]
                      dark:border-white/[0.1] border-black/[0.12] border rounded-lg
                      dark:text-[#E0E0E0] text-[#1A1A1A]
                      focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50
                      disabled:cursor-not-allowed text-[13px]"
                    style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                  >
                    <option value="Wealth">Wealth</option>
                    <option value="Health">Health</option>
                    <option value="Love">Love</option>
                    <option value="Happiness">Happiness</option>
                  </select>
                </div>
              </div>
            ))}

            {!isReadOnly && (
              <button
                type="button"
                onClick={addGoal}
                className="w-full px-6 py-3 dark:bg-white/[0.03] bg-black/[0.03]
                  dark:border dark:border-dashed dark:border-white/[0.15] border border-dashed border-black/[0.15]
                  dark:text-[#525252] text-[#555555]
                  dark:hover:bg-white/[0.06] hover:bg-black/[0.05]
                  dark:hover:border-[#00E5FF]/30 hover:border-[#0097A7]/40
                  dark:hover:text-[#00E5FF] hover:text-[#0097A7]
                  uppercase tracking-wider text-[11px] font-bold transition-all duration-200 rounded-lg"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              >
                + Add Goal ({nextWeekGoals.length})
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
