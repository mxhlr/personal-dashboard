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
    <div className="max-w-4xl mx-auto px-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold">Monthly Review</h1>
        <p className="text-sm text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator percentage={percentage} />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question 1 */}
        <TrackingCard label="Was war dein größter Erfolg diesen Monat?">
          <textarea
            value={formData.biggestSuccess}
            onChange={(e) =>
              setFormData({ ...formData, biggestSuccess: e.target.value })
            }
            disabled={isReadOnly}
            className="w-full min-h-[120px] px-4 py-3 border-0 bg-transparent resize-none focus:outline-none disabled:cursor-not-allowed placeholder:text-muted-foreground/50"
            placeholder="Beschreibe deinen größten Erfolg..."
          />
        </TrackingCard>

        {/* Question 2 */}
        <TrackingCard label="Welches Muster möchtest du ändern?">
          <textarea
            value={formData.patternToChange}
            onChange={(e) =>
              setFormData({ ...formData, patternToChange: e.target.value })
            }
            disabled={isReadOnly}
            className="w-full min-h-[120px] px-4 py-3 border-0 bg-transparent resize-none focus:outline-none disabled:cursor-not-allowed placeholder:text-muted-foreground/50"
            placeholder="Welches Verhaltensmuster möchtest du ändern?"
          />
        </TrackingCard>

        {/* Question 3 */}
        <TrackingCard label="Was hast du über dich selbst gelernt?">
          <textarea
            value={formData.learnedAboutSelf}
            onChange={(e) =>
              setFormData({ ...formData, learnedAboutSelf: e.target.value })
            }
            disabled={isReadOnly}
            className="w-full min-h-[120px] px-4 py-3 border-0 bg-transparent resize-none focus:outline-none disabled:cursor-not-allowed placeholder:text-muted-foreground/50"
            placeholder="Was hast du über dich gelernt?"
          />
        </TrackingCard>

        {/* Question 4 */}
        <TrackingCard label="Was war die größte Überraschung?">
          <textarea
            value={formData.biggestSurprise}
            onChange={(e) =>
              setFormData({ ...formData, biggestSurprise: e.target.value })
            }
            disabled={isReadOnly}
            className="w-full min-h-[120px] px-4 py-3 border-0 bg-transparent resize-none focus:outline-none disabled:cursor-not-allowed placeholder:text-muted-foreground/50"
            placeholder="Was hat dich überrascht?"
          />
        </TrackingCard>

        {/* Question 5 */}
        <TrackingCard label="Worauf bist du stolz?">
          <textarea
            value={formData.proudOf}
            onChange={(e) =>
              setFormData({ ...formData, proudOf: e.target.value })
            }
            disabled={isReadOnly}
            className="w-full min-h-[120px] px-4 py-3 border-0 bg-transparent resize-none focus:outline-none disabled:cursor-not-allowed placeholder:text-muted-foreground/50"
            placeholder="Worauf bist du stolz?"
          />
        </TrackingCard>

        {/* Question 6 */}
        <TrackingCard label="Was ist dein Fokus für nächsten Monat?">
          <textarea
            value={formData.nextMonthFocus}
            onChange={(e) =>
              setFormData({ ...formData, nextMonthFocus: e.target.value })
            }
            disabled={isReadOnly}
            className="w-full min-h-[120px] px-4 py-3 border-0 bg-transparent resize-none focus:outline-none disabled:cursor-not-allowed placeholder:text-muted-foreground/50"
            placeholder="Dein Fokus für nächsten Monat..."
          />
        </TrackingCard>

        {/* Buttons */}
        <div className="border-t pt-4">
          <div className="flex gap-3 justify-center">
            {isReadOnly ? (
              <button
                type="button"
                onClick={handleEdit}
                className="px-8 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 font-medium transition-colors"
              >
                Bearbeiten
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {isSubmitting ? "Speichert..." : "Speichern"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
