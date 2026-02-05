"use client";

import { useState, useEffect } from "react";
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

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
      console.error("Error submitting review:", error);
      toast.error("Fehler beim Speichern des Reviews.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addGoal = () => {
    if (nextWeekGoals.length < 5) {
      setNextWeekGoals([...nextWeekGoals, { goal: "", category: "Wealth" }]);
    }
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
          <h1 className="text-[44px] font-bold text-white"
            style={{
              textShadow: '0 0 30px rgba(255, 255, 255, 0.2)',
              fontFamily: '"Courier New", "Monaco", monospace',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '2px'
            }}
          >
            Weekly Review
          </h1>
          <p className="text-[13px] dark:text-[#888888] text-[#666666] font-medium"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
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
              Was war dein größter Erfolg diese Woche?
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
              Was hat dich am meisten frustriert?
            </label>
            <textarea
              value={formData.mostFrustrating}
              onChange={(e) =>
                setFormData({ ...formData, mostFrustrating: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[120px] px-0 py-0 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-0
                disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
              placeholder="Was war frustrierend?"
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
              Was hättest du anders gemacht?
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
              className="w-full min-h-[120px] px-0 py-0 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-0
                disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
              placeholder="Was würdest du beim nächsten Mal anders machen?"
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
              Was hast du diese Woche gelernt?
            </label>
            <textarea
              value={formData.learned}
              onChange={(e) =>
                setFormData({ ...formData, learned: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[120px] px-0 py-0 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-0
                disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
              placeholder="Deine wichtigsten Learnings..."
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
              Worauf fokussierst du dich nächste Woche?
            </label>
            <textarea
              value={formData.nextWeekFocus}
              onChange={(e) =>
                setFormData({ ...formData, nextWeekFocus: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[120px] px-0 py-0 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-0
                disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
              placeholder="Dein Fokus für nächste Woche..."
            />
          </div>

          {/* Next Week Goals Section */}
          <div className="space-y-4 pt-8">
            <div className="text-center pb-2">
              <h3 className="text-[13px] font-bold uppercase tracking-wider dark:text-[#00E5FF] text-[#0097A7]"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                Next Week Goals (Plan Ahead)
              </h3>
              <p className="text-[11px] dark:text-[#888888] text-[#666666] mt-1"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                Set 3-5 goals for the upcoming week
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
                      className="text-[10px] dark:text-[#888888] text-[#666666]
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
                  className="w-full min-h-[80px] px-0 py-0 border-0 dark:bg-transparent bg-transparent resize-none
                    focus:outline-none focus:ring-0 mb-3
                    disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                    dark:text-[#E0E0E0] text-[#1A1A1A]"
                  style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
                  placeholder="Describe your goal for next week..."
                />

                <div className="pt-2 border-t dark:border-[rgba(0,229,255,0.1)] border-[rgba(0,151,167,0.15)]">
                  <label className="text-[10px] font-bold uppercase tracking-wider
                    dark:text-[#888888] text-[#666666] block mb-2"
                    style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                    Category
                  </label>
                  <select
                    value={goal.category}
                    onChange={(e) => updateGoal(index, "category", e.target.value)}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 dark:bg-white/[0.03] bg-black/[0.02]
                      dark:border-white/[0.1] border-black/[0.08] border rounded-lg
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

            {!isReadOnly && nextWeekGoals.length < 5 && (
              <button
                type="button"
                onClick={addGoal}
                className="w-full px-6 py-3 dark:bg-white/[0.03] bg-black/[0.02]
                  dark:border dark:border-dashed dark:border-white/[0.15] border border-dashed border-black/[0.1]
                  dark:text-[#888888] text-[#666666]
                  dark:hover:bg-white/[0.06] hover:bg-black/[0.04]
                  dark:hover:border-[#00E5FF]/30 hover:border-[#0097A7]/30
                  dark:hover:text-[#00E5FF] hover:text-[#0097A7]
                  uppercase tracking-wider text-[11px] font-bold transition-all duration-200 rounded-lg"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              >
                + Add Goal ({nextWeekGoals.length}/5)
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
