"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import { TrackingCard } from "@/components/dashboard/TrackingCard";
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

  // Load existing review data
  useEffect(() => {
    if (existingReview) {
      setFormData(existingReview.responses);
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
      await submitReview({
        year,
        month,
        responses: formData,
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

      <div className="relative max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold font-orbitron dark:text-[#00E5FF] text-[#0077B6]">Monthly Review</h1>
          <p className="text-sm dark:text-[#888888] text-[#666666]">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator percentage={percentage} />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question 1 */}
          <div className="p-6 dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)] dark:bg-card/50 bg-white/80
            shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl border
            dark:hover:border-[rgba(0,229,255,0.25)] hover:border-[rgba(0,180,220,0.3)]">
            <label className="block text-sm font-bold font-orbitron uppercase tracking-wider dark:text-[#00E5FF] text-[#0077B6] mb-4">
              Was war dein größter Erfolg diesen Monat?
            </label>
            <textarea
              value={formData.biggestSuccess}
              onChange={(e) =>
                setFormData({ ...formData, biggestSuccess: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[120px] px-4 py-3 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-2 focus:ring-[rgba(0,229,255,0.3)] rounded-lg
                disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              placeholder="Beschreibe deinen größten Erfolg..."
            />
          </div>

          {/* Question 2 */}
          <div className="p-6 dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)] dark:bg-card/50 bg-white/80
            shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl border
            dark:hover:border-[rgba(0,229,255,0.25)] hover:border-[rgba(0,180,220,0.3)]">
            <label className="block text-sm font-bold font-orbitron uppercase tracking-wider dark:text-[#00E5FF] text-[#0077B6] mb-4">
              Welches Muster möchtest du ändern?
            </label>
            <textarea
              value={formData.patternToChange}
              onChange={(e) =>
                setFormData({ ...formData, patternToChange: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[120px] px-4 py-3 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-2 focus:ring-[rgba(0,229,255,0.3)] rounded-lg
                disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              placeholder="Welches Verhaltensmuster möchtest du ändern?"
            />
          </div>

          {/* Question 3 */}
          <div className="p-6 dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)] dark:bg-card/50 bg-white/80
            shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl border
            dark:hover:border-[rgba(0,229,255,0.25)] hover:border-[rgba(0,180,220,0.3)]">
            <label className="block text-sm font-bold font-orbitron uppercase tracking-wider dark:text-[#00E5FF] text-[#0077B6] mb-4">
              Was hast du über dich selbst gelernt?
            </label>
            <textarea
              value={formData.learnedAboutSelf}
              onChange={(e) =>
                setFormData({ ...formData, learnedAboutSelf: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[120px] px-4 py-3 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-2 focus:ring-[rgba(0,229,255,0.3)] rounded-lg
                disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              placeholder="Was hast du über dich gelernt?"
            />
          </div>

          {/* Question 4 */}
          <div className="p-6 dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)] dark:bg-card/50 bg-white/80
            shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl border
            dark:hover:border-[rgba(0,229,255,0.25)] hover:border-[rgba(0,180,220,0.3)]">
            <label className="block text-sm font-bold font-orbitron uppercase tracking-wider dark:text-[#00E5FF] text-[#0077B6] mb-4">
              Was war die größte Überraschung?
            </label>
            <textarea
              value={formData.biggestSurprise}
              onChange={(e) =>
                setFormData({ ...formData, biggestSurprise: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[120px] px-4 py-3 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-2 focus:ring-[rgba(0,229,255,0.3)] rounded-lg
                disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              placeholder="Was hat dich überrascht?"
            />
          </div>

          {/* Question 5 */}
          <div className="p-6 dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)] dark:bg-card/50 bg-white/80
            shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl border
            dark:hover:border-[rgba(0,229,255,0.25)] hover:border-[rgba(0,180,220,0.3)]">
            <label className="block text-sm font-bold font-orbitron uppercase tracking-wider dark:text-[#00E5FF] text-[#0077B6] mb-4">
              Worauf bist du stolz?
            </label>
            <textarea
              value={formData.proudOf}
              onChange={(e) =>
                setFormData({ ...formData, proudOf: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[120px] px-4 py-3 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-2 focus:ring-[rgba(0,229,255,0.3)] rounded-lg
                disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              placeholder="Worauf bist du stolz?"
            />
          </div>

          {/* Question 6 */}
          <div className="p-6 dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)] dark:bg-card/50 bg-white/80
            shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl border
            dark:hover:border-[rgba(0,229,255,0.25)] hover:border-[rgba(0,180,220,0.3)]">
            <label className="block text-sm font-bold font-orbitron uppercase tracking-wider dark:text-[#00E5FF] text-[#0077B6] mb-4">
              Was ist dein Fokus für nächsten Monat?
            </label>
            <textarea
              value={formData.nextMonthFocus}
              onChange={(e) =>
                setFormData({ ...formData, nextMonthFocus: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[120px] px-4 py-3 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-2 focus:ring-[rgba(0,229,255,0.3)] rounded-lg
                disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              placeholder="Dein Fokus für nächsten Monat..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-center pt-4">
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
  );
}
