"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface MonthlyReviewFormProps {
  year: number;
  month: number;
}

const MONTH_NAMES = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields are filled
    if (
      !formData.biggestSuccess.trim() ||
      !formData.patternToChange.trim() ||
      !formData.learnedAboutSelf.trim() ||
      !formData.biggestSurprise.trim() ||
      !formData.proudOf.trim() ||
      !formData.nextMonthFocus.trim()
    ) {
      alert("Bitte fülle alle Felder aus.");
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
      alert("Monthly Review erfolgreich gespeichert!");
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
          <h2 className="text-2xl font-bold mb-2">Monthly Review</h2>
          <p className="text-muted-foreground">
            {MONTH_NAMES[month - 1]} {year}
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
              Was war dein größter Erfolg diesen Monat?
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
              Welches Muster möchtest du ändern?
            </label>
            <textarea
              value={formData.patternToChange}
              onChange={(e) =>
                setFormData({ ...formData, patternToChange: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background disabled:bg-muted disabled:cursor-not-allowed"
              placeholder="Welches Verhaltensmuster möchtest du ändern?"
            />
          </div>

          {/* Question 3 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Was hast du über dich selbst gelernt?
            </label>
            <textarea
              value={formData.learnedAboutSelf}
              onChange={(e) =>
                setFormData({ ...formData, learnedAboutSelf: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background disabled:bg-muted disabled:cursor-not-allowed"
              placeholder="Was hast du über dich gelernt?"
            />
          </div>

          {/* Question 4 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Was war die größte Überraschung?
            </label>
            <textarea
              value={formData.biggestSurprise}
              onChange={(e) =>
                setFormData({ ...formData, biggestSurprise: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background disabled:bg-muted disabled:cursor-not-allowed"
              placeholder="Was hat dich überrascht?"
            />
          </div>

          {/* Question 5 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Worauf bist du stolz?
            </label>
            <textarea
              value={formData.proudOf}
              onChange={(e) =>
                setFormData({ ...formData, proudOf: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background disabled:bg-muted disabled:cursor-not-allowed"
              placeholder="Worauf bist du stolz?"
            />
          </div>

          {/* Question 6 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Was ist dein Fokus für nächsten Monat?
            </label>
            <textarea
              value={formData.nextMonthFocus}
              onChange={(e) =>
                setFormData({ ...formData, nextMonthFocus: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background disabled:bg-muted disabled:cursor-not-allowed"
              placeholder="Dein Fokus für nächsten Monat..."
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
