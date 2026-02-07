"use client";

import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProgressIndicator } from "@/components/dashboard/ProgressIndicator";
import { toast } from "sonner";

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

  // Each area now holds an array of reviews, one per North Star
  const [northStarReview, setNorthStarReview] = useState<{
    wealth: Array<{ goal: string; achieved: string; notes: string }>;
    health: Array<{ goal: string; achieved: string; notes: string }>;
    love: Array<{ goal: string; achieved: string; notes: string }>;
    happiness: Array<{ goal: string; achieved: string; notes: string }>;
  }>({
    wealth: [],
    health: [],
    love: [],
    happiness: [],
  });

  const [formData, setFormData] = useState({
    yearInOneSentence: "",
    turningPoint: "",
    mostProudOf: "",
    topThreeLearnings: "",
    stopStartContinue: "",
  });

  const [nextYearNorthStars, setNextYearNorthStars] = useState({
    wealth: [""],
    health: [""],
    love: [""],
    happiness: [""],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Load existing review data or initialize from current North Stars
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
      // Initialize northStarReview with one entry per North Star
      const areas = ["wealth", "health", "love", "happiness"] as const;
      const initialReviews: typeof northStarReview = {
        wealth: [],
        health: [],
        love: [],
        happiness: [],
      };

      areas.forEach((area) => {
        const goals = currentNorthStars[area] || [];
        initialReviews[area] = goals.map((goal: string) => ({
          goal,
          achieved: "",
          notes: "",
        }));
      });

      setNorthStarReview(initialReviews);
      // Pre-fill next year's North Stars with current ones
      setNextYearNorthStars(currentNorthStars);
    }
  }, [existingReview, currentNorthStars]);

  const calculateProgress = () => {
    let totalFields = 0;
    let filledFields = 0;

    // North Star reviews - 2 fields (achieved + notes) per individual North Star
    const areas: Array<keyof typeof northStarReview> = [
      "wealth",
      "health",
      "love",
      "happiness",
    ];
    areas.forEach((area) => {
      const reviews = northStarReview[area];
      reviews.forEach((review) => {
        totalFields += 2; // achieved + notes per North Star
        if (review.achieved) filledFields++;
        if (review.notes.trim()) filledFields++;
      });
    });

    // Reflection questions (5 fields)
    totalFields += 5;
    if (formData.yearInOneSentence.trim()) filledFields++;
    if (formData.turningPoint.trim()) filledFields++;
    if (formData.mostProudOf.trim()) filledFields++;
    if (formData.topThreeLearnings.trim()) filledFields++;
    if (formData.stopStartContinue.trim()) filledFields++;

    // Next year North Stars (at least 1 non-empty goal per area)
    totalFields += 4;
    areas.forEach((area) => {
      const hasGoal = nextYearNorthStars[area].some(goal => goal.trim() !== "");
      if (hasGoal) filledFields++;
    });

    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  };

  const handleNorthStarReviewChange = (
    area: keyof typeof northStarReview,
    index: number,
    field: "achieved" | "notes",
    value: string
  ) => {
    setNorthStarReview((prev) => {
      const updated = [...prev[area]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [area]: updated };
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
      const reviews = northStarReview[area];
      for (let i = 0; i < reviews.length; i++) {
        const review = reviews[i];
        if (!review.achieved || !review.notes.trim()) {
          toast.error(
            `Bitte fülle die Review für "${review.goal}" (${AREA_LABELS[area]}) vollständig aus.`
          );
          return;
        }
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
      toast.error("Bitte fülle alle Reflexionsfragen aus.");
      return;
    }

    // Validate all next year North Stars have at least one goal
    for (const area of areas) {
      const hasGoal = nextYearNorthStars[area].some(goal => goal.trim() !== "");
      if (!hasGoal) {
        toast.error(
          `Bitte definiere mindestens einen North Star für ${AREA_LABELS[area]} für nächstes Jahr.`
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Filter out empty North Stars
      const cleanedNorthStars = {
        wealth: nextYearNorthStars.wealth.filter(g => g.trim() !== ""),
        health: nextYearNorthStars.health.filter(g => g.trim() !== ""),
        love: nextYearNorthStars.love.filter(g => g.trim() !== ""),
        happiness: nextYearNorthStars.happiness.filter(g => g.trim() !== ""),
      };

      await submitReview({
        year,
        northStarReview,
        responses: {
          ...formData,
          nextYearNorthStars: cleanedNorthStars,
        },
      });
      setIsReadOnly(true);
      toast.success("Annual Review erfolgreich gespeichert!");
    } catch (error) {
      logger.error("Error submitting review:", error);
      toast.error("Fehler beim Speichern des Reviews.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setIsReadOnly(false);
  };

  // North Star Helper Functions
  const addNorthStar = (area: keyof typeof nextYearNorthStars) => {
    setNextYearNorthStars({
      ...nextYearNorthStars,
      [area]: [...nextYearNorthStars[area], ""],
    });
  };

  const removeNorthStar = (area: keyof typeof nextYearNorthStars, index: number) => {
    setNextYearNorthStars({
      ...nextYearNorthStars,
      [area]: nextYearNorthStars[area].filter((_, i) => i !== index),
    });
  };

  const updateNorthStar = (area: keyof typeof nextYearNorthStars, index: number, value: string) => {
    const updated = [...nextYearNorthStars[area]];
    updated[index] = value;
    setNextYearNorthStars({
      ...nextYearNorthStars,
      [area]: updated,
    });
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
            Annual Review
          </h1>
          <p className="text-[13px] dark:text-[#525252] text-[#3d3d3d] font-medium"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
          >
            {year}
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator percentage={calculateProgress()} />

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
          {/* Part 1: North Star Check */}
          <div className="group dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)] dark:bg-card/50 bg-white/80
            transition-all duration-300 ease-out
            hover:shadow-xl hover:-translate-y-1 shadow-sm
            dark:hover:border-[rgba(0,229,255,0.25)] hover:border-[rgba(0,180,220,0.3)]
            dark:hover:shadow-[0_0_30px_rgba(0,229,255,0.15)] hover:shadow-[0_8px_30px_rgba(0,180,220,0.2)]
            rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.06) 0%, rgba(139, 92, 246, 0.04) 100%), rgba(26, 26, 26, 0.5)'
            }}>
            <h3 className="text-[11px] font-bold uppercase tracking-wider dark:text-[#525252] text-[#3d3d3d] mb-4"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              Teil 1: North Star Check
            </h3>
            <p className="text-[13px] dark:text-[#525252] text-[#3d3d3d] mb-4"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              Bewerte für jeden Lebensbereich, wie gut du dein Jahresziel erreicht hast.
            </p>

            {currentNorthStars && (
              <div className="space-y-5">
                {Object.entries(AREA_LABELS).map(([area, label]) => {
                  const areaReviews = northStarReview[area as keyof typeof northStarReview] || [];

                  return (
                    <div key={area} className="space-y-3">
                      <div className="text-[11px] font-bold uppercase tracking-wider dark:text-[#525252] text-[#555555]"
                        style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                      >
                        {label}
                      </div>

                      {areaReviews.map((review, index) => (
                        <div
                          key={`${area}-${index}`}
                          className="p-4 dark:border-border/60 border-border/25 border rounded-lg
                            dark:bg-[rgba(26,26,26,0.3)] bg-white/50"
                        >
                          <div className="text-[13px] dark:text-[#E0E0E0] text-[#1A1A1A] font-medium mb-3"
                            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                          >
                            • {review.goal}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#525252] text-[#555555] mb-2"
                                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                              >
                                Erreicht?
                              </label>
                              <div className="flex gap-4">
                                {["Ja", "Teilweise", "Nein"].map((option) => (
                                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`achieved-${area}-${index}`}
                                      value={option}
                                      checked={review.achieved === option}
                                      onChange={(e) =>
                                        handleNorthStarReviewChange(
                                          area as keyof typeof northStarReview,
                                          index,
                                          "achieved",
                                          e.target.value
                                        )
                                      }
                                      disabled={isReadOnly}
                                      className="w-4 h-4 dark:border-border/50 border-border/40"
                                    />
                                    <span className="text-[13px] dark:text-[#E0E0E0] text-[#1A1A1A]"
                                      style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                                    >
                                      {option}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#525252] text-[#555555] mb-2"
                                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                              >
                                Notizen
                              </label>
                              <textarea
                                value={review.notes}
                                onChange={(e) =>
                                  handleNorthStarReviewChange(
                                    area as keyof typeof northStarReview,
                                    index,
                                    "notes",
                                    e.target.value
                                  )
                                }
                                disabled={isReadOnly}
                                placeholder="Notizen..."
                                className="w-full min-h-[80px] px-0 py-0 border-0 dark:bg-transparent bg-transparent resize-none
                                  dark:text-[#E0E0E0] text-[#1A1A1A]
                                  disabled:cursor-not-allowed placeholder:dark:text-[#525252]/50 placeholder:text-[#3d3d3d]/50
                                  focus:outline-none focus:ring-0"
                                style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Part 2: Reflection Questions */}
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
            <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#525252] text-[#3d3d3d] mb-3"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
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
              className="w-full min-h-[120px] px-0 py-0 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-0
                disabled:cursor-not-allowed placeholder:dark:text-[#525252]/50 placeholder:text-[#3d3d3d]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
              placeholder="Beschreibe das Jahr in einem Satz..."
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
            <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#525252] text-[#3d3d3d] mb-3"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              Was war der Wendepunkt?
            </label>
            <textarea
              value={formData.turningPoint}
              onChange={(e) =>
                setFormData({ ...formData, turningPoint: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[120px] px-0 py-0 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-0
                disabled:cursor-not-allowed placeholder:dark:text-[#525252]/50 placeholder:text-[#3d3d3d]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
              placeholder="Der entscheidende Wendepunkt..."
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
            <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#525252] text-[#3d3d3d] mb-3"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              Worauf bist du am meisten stolz?
            </label>
            <textarea
              value={formData.mostProudOf}
              onChange={(e) =>
                setFormData({ ...formData, mostProudOf: e.target.value })
              }
              disabled={isReadOnly}
              className="w-full min-h-[120px] px-0 py-0 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-0
                disabled:cursor-not-allowed placeholder:dark:text-[#525252]/50 placeholder:text-[#3d3d3d]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
              placeholder="Worauf bist du stolz..."
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
            <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#525252] text-[#3d3d3d] mb-3"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
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
              className="w-full min-h-[120px] px-0 py-0 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-0
                disabled:cursor-not-allowed placeholder:dark:text-[#525252]/50 placeholder:text-[#3d3d3d]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
              placeholder="Deine Top 3 Learnings..."
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
            <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#525252] text-[#3d3d3d] mb-3"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
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
              className="w-full min-h-[120px] px-0 py-0 border-0 dark:bg-transparent bg-transparent resize-none
                focus:outline-none focus:ring-0
                disabled:cursor-not-allowed placeholder:dark:text-[#525252]/50 placeholder:text-[#3d3d3d]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
              placeholder="Was möchtest du stoppen, starten, weitermachen..."
            />
          </div>

          {/* Part 3: Next Year North Stars */}
          <div className="group dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)] dark:bg-card/50 bg-white/80
            transition-all duration-300 ease-out
            hover:shadow-xl hover:-translate-y-1 shadow-sm
            dark:hover:border-[rgba(0,229,255,0.25)] hover:border-[rgba(0,180,220,0.3)]
            dark:hover:shadow-[0_0_30px_rgba(0,229,255,0.15)] hover:shadow-[0_8px_30px_rgba(0,180,220,0.2)]
            rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.06) 0%, rgba(139, 92, 246, 0.04) 100%), rgba(26, 26, 26, 0.5)'
            }}>
            <h3 className="text-[11px] font-bold uppercase tracking-wider dark:text-[#525252] text-[#3d3d3d] mb-4"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              Teil 3: North Stars für {year + 1}
            </h3>
            <p className="text-[13px] dark:text-[#525252] text-[#3d3d3d] mb-4"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              Definiere deine North Stars für das kommende Jahr.
            </p>

            <div className="space-y-6">
              {Object.entries(AREA_LABELS).map(([area, label]) => (
                <div key={area} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#525252] text-[#555555]"
                      style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                    >
                      {label}
                    </label>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => addNorthStar(area as keyof typeof nextYearNorthStars)}
                        className="text-[10px] dark:text-[#00E5FF] text-[#0097A7] hover:underline uppercase tracking-wider"
                        style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                      >
                        + Add Goal
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {nextYearNorthStars[area as keyof typeof nextYearNorthStars].map((goal, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={goal}
                          onChange={(e) => updateNorthStar(area as keyof typeof nextYearNorthStars, index, e.target.value)}
                          disabled={isReadOnly}
                          placeholder="North Star..."
                          className="flex-1 px-3 py-2 dark:border-border/50 border-border/40
                            border rounded-lg dark:bg-transparent bg-transparent dark:text-[#E0E0E0] text-[#1A1A1A]
                            disabled:cursor-not-allowed placeholder:dark:text-[#525252]/50 placeholder:text-[#3d3d3d]/50
                            focus:outline-none focus:ring-0"
                          style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px' }}
                        />
                        {!isReadOnly && nextYearNorthStars[area as keyof typeof nextYearNorthStars].length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeNorthStar(area as keyof typeof nextYearNorthStars, index)}
                            className="px-3 text-[10px] dark:text-[#525252] text-[#3d3d3d]
                              dark:hover:text-red-400 hover:text-red-600 uppercase tracking-wider transition-colors"
                            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
