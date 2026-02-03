"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import { TrackingCard } from "@/components/dashboard/TrackingCard";
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
    <div className="max-w-4xl mx-auto px-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold">Weekly Review</h1>
        <p className="text-sm text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator percentage={percentage} />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question 1 */}
        <TrackingCard label="Was war dein größter Erfolg diese Woche?">
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
        <TrackingCard label="Was hat dich am meisten frustriert?">
          <textarea
            value={formData.mostFrustrating}
            onChange={(e) =>
              setFormData({ ...formData, mostFrustrating: e.target.value })
            }
            disabled={isReadOnly}
            className="w-full min-h-[120px] px-4 py-3 border-0 bg-transparent resize-none focus:outline-none disabled:cursor-not-allowed placeholder:text-muted-foreground/50"
            placeholder="Was war frustrierend?"
          />
        </TrackingCard>

        {/* Question 3 */}
        <TrackingCard label="Was hättest du anders gemacht?">
          <textarea
            value={formData.differentlyNextTime}
            onChange={(e) =>
              setFormData({
                ...formData,
                differentlyNextTime: e.target.value,
              })
            }
            disabled={isReadOnly}
            className="w-full min-h-[120px] px-4 py-3 border-0 bg-transparent resize-none focus:outline-none disabled:cursor-not-allowed placeholder:text-muted-foreground/50"
            placeholder="Was würdest du beim nächsten Mal anders machen?"
          />
        </TrackingCard>

        {/* Question 4 */}
        <TrackingCard label="Was hast du diese Woche gelernt?">
          <textarea
            value={formData.learned}
            onChange={(e) =>
              setFormData({ ...formData, learned: e.target.value })
            }
            disabled={isReadOnly}
            className="w-full min-h-[120px] px-4 py-3 border-0 bg-transparent resize-none focus:outline-none disabled:cursor-not-allowed placeholder:text-muted-foreground/50"
            placeholder="Deine wichtigsten Learnings..."
          />
        </TrackingCard>

        {/* Question 5 */}
        <TrackingCard label="Worauf fokussierst du dich nächste Woche?">
          <textarea
            value={formData.nextWeekFocus}
            onChange={(e) =>
              setFormData({ ...formData, nextWeekFocus: e.target.value })
            }
            disabled={isReadOnly}
            className="w-full min-h-[120px] px-4 py-3 border-0 bg-transparent resize-none focus:outline-none disabled:cursor-not-allowed placeholder:text-muted-foreground/50"
            placeholder="Dein Fokus für nächste Woche..."
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
