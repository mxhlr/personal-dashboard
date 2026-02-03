"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface AnnualReviewFormProps {
  year: number;
}

const AREA_LABELS: Record<string, string> = {
  wealth: "💰 WEALTH",
  health: "🏃 HEALTH",
  love: "❤️ LOVE",
  happiness: "😊 HAPPINESS",
};

export function AnnualReviewForm({ year }: AnnualReviewFormProps) {
  const existingReview = useQuery(api.annualReview.getAnnualReview, {
    year,
  });
  const currentNorthStars = useQuery(api.annualReview.getCurrentNorthStars);
  const submitReview = useMutation(api.annualReview.submitAnnualReview);

  const [northStarReview, setNorthStarReview] = useState({
    wealth: { achieved: "", notes: "" },
    health: { achieved: "", notes: "" },
    love: { achieved: "", notes: "" },
    happiness: { achieved: "", notes: "" },
  });

  const [formData, setFormData] = useState({
    yearInOneSentence: "",
    turningPoint: "",
    mostProudOf: "",
    topThreeLearnings: "",
    stopStartContinue: "",
  });

  const [nextYearNorthStars, setNextYearNorthStars] = useState({
    wealth: "",
    health: "",
    love: "",
    happiness: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Load existing review data
  useEffect(() => {
    if (existingReview) {
      setNorthStarReview(existingReview.northStarReview);
      setFormData({
        yearInOneSentence: existingReview.responses.yearInOneSentence,
        turningPoint: existingReview.responses.turningPoint,
        mostProudOf: existingReview.responses.mostProudOf,
        topThreeLearnings: existingReview.responses.topThreeLearnings,
        stopStartContinue: existingReview.responses.stopStartContinue,
      });
      setNextYearNorthStars(existingReview.responses.nextYearNorthStars);
      setIsReadOnly(true);
    } else if (currentNorthStars) {
      // Pre-fill next year's North Stars with current ones
      setNextYearNorthStars(currentNorthStars);
    }
  }, [existingReview, currentNorthStars]);

  const handleNorthStarReviewChange = (
    area: keyof typeof northStarReview,
    field: "achieved" | "notes",
    value: string
  ) => {
    setNorthStarReview({
      ...northStarReview,
      [area]: {
        ...northStarReview[area],
        [field]: value,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all North Star reviews are filled
    const areas: Array<keyof typeof northStarReview> = [
      "wealth",
      "health",
      "love",
      "happiness",
    ];
    for (const area of areas) {
      if (
        !northStarReview[area].achieved ||
        !northStarReview[area].notes.trim()
      ) {
        alert(
          `Bitte fülle die North Star Review für ${AREA_LABELS[area]} vollständig aus.`
        );
        return;
      }
    }

    // Validate all reflection questions are filled
    if (
      !formData.yearInOneSentence.trim() ||
      !formData.turningPoint.trim() ||
      !formData.mostProudOf.trim() ||
      !formData.topThreeLearnings.trim() ||
      !formData.stopStartContinue.trim()
    ) {
      alert("Bitte fülle alle Reflexionsfragen aus.");
      return;
    }

    // Validate all next year North Stars are filled
    for (const area of areas) {
      if (!nextYearNorthStars[area].trim()) {
        alert(
          `Bitte definiere einen North Star für ${AREA_LABELS[area]} für nächstes Jahr.`
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await submitReview({
        year,
        northStarReview,
        responses: {
          ...formData,
          nextYearNorthStars,
        },
      });
      setIsReadOnly(true);
      alert("Annual Review erfolgreich gespeichert!");
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
          <h2 className="text-2xl font-bold mb-2">Annual Review</h2>
          <p className="text-muted-foreground">{year}</p>
        </div>

        {existingReview && isReadOnly ? (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <p className="text-green-800 dark:text-green-200">
              ✓ Review abgeschlossen am{" "}
              {new Date(existingReview.completedAt).toLocaleDateString("de-DE")}
            </p>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Part 1: North Star Check */}
          <div>
            <h3 className="text-xl font-bold mb-4">Teil 1: North Star Check</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Bewerte für jeden Lebensbereich, wie gut du dein Jahresziel
              erreicht hast.
            </p>

            {currentNorthStars && (
              <div className="space-y-6">
                {Object.entries(AREA_LABELS).map(([area, label]) => (
                  <div
                    key={area}
                    className="p-4 border border-border rounded-md"
                  >
                    <div className="font-bold mb-2">{label}</div>
                    <div className="text-sm text-muted-foreground mb-3">
                      North Star: {currentNorthStars[area as keyof typeof currentNorthStars]}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Erreicht?
                        </label>
                        <div className="flex gap-4">
                          {["Ja", "Teilweise", "Nein"].map((option) => (
                            <label key={option} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`achieved-${area}`}
                                value={option}
                                checked={
                                  northStarReview[
                                    area as keyof typeof northStarReview
                                  ].achieved === option
                                }
                                onChange={(e) =>
                                  handleNorthStarReviewChange(
                                    area as keyof typeof northStarReview,
                                    "achieved",
                                    e.target.value
                                  )
                                }
                                disabled={isReadOnly}
                              />
                              <span className="text-sm">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Notizen
                        </label>
                        <textarea
                          value={
                            northStarReview[
                              area as keyof typeof northStarReview
                            ].notes
                          }
                          onChange={(e) =>
                            handleNorthStarReviewChange(
                              area as keyof typeof northStarReview,
                              "notes",
                              e.target.value
                            )
                          }
                          disabled={isReadOnly}
                          placeholder="Notizen..."
                          className="w-full min-h-[80px] px-3 py-2 text-sm border border-border rounded-md bg-background disabled:bg-muted disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Part 2: Reflection Questions */}
          <div>
            <h3 className="text-xl font-bold mb-4">
              Teil 2: Reflexionsfragen
            </h3>

            <div className="space-y-6">
              {/* Question 1 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Das Jahr in einem Satz?
                </label>
                <textarea
                  value={formData.yearInOneSentence}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      yearInOneSentence: e.target.value,
                    })
                  }
                  disabled={isReadOnly}
                  className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background disabled:bg-muted disabled:cursor-not-allowed"
                  placeholder="Beschreibe das Jahr in einem Satz..."
                />
              </div>

              {/* Question 2 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Was war der Wendepunkt?
                </label>
                <textarea
                  value={formData.turningPoint}
                  onChange={(e) =>
                    setFormData({ ...formData, turningPoint: e.target.value })
                  }
                  disabled={isReadOnly}
                  className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background disabled:bg-muted disabled:cursor-not-allowed"
                  placeholder="Der entscheidende Wendepunkt..."
                />
              </div>

              {/* Question 3 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Worauf bist du am meisten stolz?
                </label>
                <textarea
                  value={formData.mostProudOf}
                  onChange={(e) =>
                    setFormData({ ...formData, mostProudOf: e.target.value })
                  }
                  disabled={isReadOnly}
                  className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background disabled:bg-muted disabled:cursor-not-allowed"
                  placeholder="Worauf bist du stolz..."
                />
              </div>

              {/* Question 4 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Top 3 Learnings?
                </label>
                <textarea
                  value={formData.topThreeLearnings}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      topThreeLearnings: e.target.value,
                    })
                  }
                  disabled={isReadOnly}
                  className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background disabled:bg-muted disabled:cursor-not-allowed"
                  placeholder="Deine Top 3 Learnings..."
                />
              </div>

              {/* Question 5 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Was stoppen/starten/weitermachen?
                </label>
                <textarea
                  value={formData.stopStartContinue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stopStartContinue: e.target.value,
                    })
                  }
                  disabled={isReadOnly}
                  className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background disabled:bg-muted disabled:cursor-not-allowed"
                  placeholder="Was möchtest du stoppen, starten, weitermachen..."
                />
              </div>
            </div>
          </div>

          {/* Part 3: Next Year North Stars */}
          <div>
            <h3 className="text-xl font-bold mb-4">
              Teil 3: North Stars für {year + 1}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Definiere deine North Stars für das kommende Jahr.
            </p>

            <div className="space-y-4">
              {Object.entries(AREA_LABELS).map(([area, label]) => (
                <div key={area}>
                  <label className="block text-sm font-bold mb-2">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={
                      nextYearNorthStars[area as keyof typeof nextYearNorthStars]
                    }
                    onChange={(e) =>
                      setNextYearNorthStars({
                        ...nextYearNorthStars,
                        [area]: e.target.value,
                      })
                    }
                    disabled={isReadOnly}
                    placeholder="North Star..."
                    className="w-full px-3 py-2 border border-border rounded-md bg-background disabled:bg-muted disabled:cursor-not-allowed"
                  />
                </div>
              ))}
            </div>
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
