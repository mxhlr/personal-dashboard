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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Load existing review data
  useEffect(() => {
    if (existingReview) {
      setFormData(existingReview.responses);
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
      await submitReview({
        year,
        weekNumber,
        responses: formData,
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
          <div className="group dark:border-border/50 border-border/30 dark:bg-card/50 bg-white/80
            transition-all duration-300 ease-out
            hover:shadow-xl hover:-translate-y-1 shadow-sm
            dark:hover:border-border hover:border-border/50
            rounded-xl p-6">
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
          <div className="group dark:border-border/50 border-border/30 dark:bg-card/50 bg-white/80
            transition-all duration-300 ease-out
            hover:shadow-xl hover:-translate-y-1 shadow-sm
            dark:hover:border-border hover:border-border/50
            rounded-xl p-6">
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
          <div className="group dark:border-border/50 border-border/30 dark:bg-card/50 bg-white/80
            transition-all duration-300 ease-out
            hover:shadow-xl hover:-translate-y-1 shadow-sm
            dark:hover:border-border hover:border-border/50
            rounded-xl p-6">
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
          <div className="group dark:border-border/50 border-border/30 dark:bg-card/50 bg-white/80
            transition-all duration-300 ease-out
            hover:shadow-xl hover:-translate-y-1 shadow-sm
            dark:hover:border-border hover:border-border/50
            rounded-xl p-6">
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
          <div className="group dark:border-border/50 border-border/30 dark:bg-card/50 bg-white/80
            transition-all duration-300 ease-out
            hover:shadow-xl hover:-translate-y-1 shadow-sm
            dark:hover:border-border hover:border-border/50
            rounded-xl p-6">
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
