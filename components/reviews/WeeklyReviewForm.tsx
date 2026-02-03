"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields are filled
    if (
      !formData.biggestSuccess.trim() ||
      !formData.mostFrustrating.trim() ||
      !formData.differentlyNextTime.trim() ||
      !formData.learned.trim() ||
      !formData.nextWeekFocus.trim()
    ) {
      alert("Bitte fülle alle Felder aus.");
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
      alert("Weekly Review erfolgreich gespeichert!");
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
          <h2 className="text-2xl font-bold mb-2">Weekly Review</h2>
          <p className="text-muted-foreground">
            KW {weekNumber}, {year}
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question 1 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Was war dein größter Erfolg diese Woche?
            </label>
            <textarea
              value={formData.biggestSuccess}
              onChange={(e) =>
                setFormData({ ...formData, biggestSuccess: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background disabled:bg-muted disabled:cursor-not-allowed"
              placeholder="Beschreibe deinen größten Erfolg..."
            />
          </div>

          {/* Question 2 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Was hat dich am meisten frustriert?
            </label>
            <textarea
              value={formData.mostFrustrating}
              onChange={(e) =>
                setFormData({ ...formData, mostFrustrating: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background disabled:bg-muted disabled:cursor-not-allowed"
              placeholder="Was war frustrierend?"
            />
          </div>

          {/* Question 3 */}
          <div>
            <label className="block text-sm font-medium mb-2">
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
              className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background disabled:bg-muted disabled:cursor-not-allowed"
              placeholder="Was würdest du beim nächsten Mal anders machen?"
            />
          </div>

          {/* Question 4 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Was hast du diese Woche gelernt?
            </label>
            <textarea
              value={formData.learned}
              onChange={(e) =>
                setFormData({ ...formData, learned: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background disabled:bg-muted disabled:cursor-not-allowed"
              placeholder="Deine wichtigsten Learnings..."
            />
          </div>

          {/* Question 5 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Worauf fokussierst du dich nächste Woche?
            </label>
            <textarea
              value={formData.nextWeekFocus}
              onChange={(e) =>
                setFormData({ ...formData, nextWeekFocus: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background disabled:bg-muted disabled:cursor-not-allowed"
              placeholder="Dein Fokus für nächste Woche..."
            />
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
