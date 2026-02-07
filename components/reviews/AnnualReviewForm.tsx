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

  const [nextYearGoals, setNextYearGoals] = useState<Array<{ goal: string; category: string }>>([
    { goal: "", category: "Wealth" },
  ]);

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
      if (existingReview.nextYearGoals && existingReview.nextYearGoals.length > 0) {
        setNextYearGoals(existingReview.nextYearGoals);
      }
      setIsReadOnly(true);
    } else if (currentNorthStars) {
      // Pre-fill next year's North Stars with current ones
      setNextYearNorthStars(currentNorthStars);
    }
  }, [existingReview, currentNorthStars]);

  const calculateProgress = () => {
    let totalFields = 0;
    let filledFields = 0;

    // North Star reviews (4 areas, 2 fields each = 8 fields)
    const areas: Array<keyof typeof northStarReview> = [
      "wealth",
      "health",
      "love",
      "happiness",
    ];
    areas.forEach((area) => {
      totalFields += 2; // achieved + notes
      if (northStarReview[area].achieved) filledFields++;
      if (northStarReview[area].notes.trim()) filledFields++;
    });

    // Reflection questions (5 fields)
    totalFields += 5;
    if (formData.yearInOneSentence.trim()) filledFields++;
    if (formData.turningPoint.trim()) filledFields++;
    if (formData.mostProudOf.trim()) filledFields++;
    if (formData.topThreeLearnings.trim()) filledFields++;
    if (formData.stopStartContinue.trim()) filledFields++;

    // Next year North Stars (4 fields)
    totalFields += 4;
    areas.forEach((area) => {
      if (nextYearNorthStars[area].trim()) filledFields++;
    });

    return Math.round((filledFields / totalFields) * 100);
  };

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
        toast.error(
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
      toast.error("Bitte fülle alle Reflexionsfragen aus.");
      return;
    }

    // Validate all next year North Stars are filled
    for (const area of areas) {
      if (!nextYearNorthStars[area].trim()) {
        toast.error(
          `Bitte definiere einen North Star für ${AREA_LABELS[area]} für nächstes Jahr.`
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Filter out empty goals
      const validGoals = nextYearGoals.filter(g => g.goal.trim() !== "");

      await submitReview({
        year,
        northStarReview,
        responses: {
          ...formData,
          nextYearNorthStars,
        },
        nextYearGoals: validGoals.length > 0 ? validGoals : undefined,
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

  // Goal Helper Functions
  const addGoal = () => {
    setNextYearGoals([...nextYearGoals, { goal: "", category: "Wealth" }]);
  };

  const removeGoal = (index: number) => {
    setNextYearGoals(nextYearGoals.filter((_, i) => i !== index));
  };

  const updateGoal = (index: number, field: "goal" | "category", value: string) => {
    const updated = [...nextYearGoals];
    updated[index][field] = value;
    setNextYearGoals(updated);
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
                {Object.entries(AREA_LABELS).map(([area, label]) => (
                  <div
                    key={area}
                    className="p-4 dark:border-border/60 border-border/25 border rounded-lg
                      dark:bg-[rgba(26,26,26,0.3)] bg-white/50"
                  >
                    <div className="text-[11px] font-bold uppercase tracking-wider dark:text-[#525252] text-[#555555] mb-2"
                      style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                    >
                      {label}
                    </div>
                    <div className="text-[13px] dark:text-[#E0E0E0] text-[#1A1A1A] font-medium mb-3"
                      style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                    >
                      North Star: {currentNorthStars[area as keyof typeof currentNorthStars]}
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

            <div className="space-y-4">
              {Object.entries(AREA_LABELS).map(([area, label]) => (
                <div key={area}>
                  <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#525252] text-[#555555] mb-2"
                    style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                  >
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
                    className="w-full px-3 py-2 dark:border-border/50 border-border/40
                      border rounded-lg dark:bg-transparent bg-transparent dark:text-[#E0E0E0] text-[#1A1A1A]
                      disabled:cursor-not-allowed placeholder:dark:text-[#525252]/50 placeholder:text-[#3d3d3d]/50
                      focus:outline-none focus:ring-0"
                    style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Part 4: Next Year Goals */}
          <div className="space-y-4 pt-4">
            <div className="text-center pb-4">
              <h3 className="text-[14px] font-bold uppercase tracking-wider dark:text-[#00E5FF] text-[#0097A7]"
                style={{ fontFamily: '"Courier New", "Monaco", monospace', letterSpacing: '2px' }}>
                ◢ Teil 4: Goals für {year + 1} ◣
              </h3>
              <p className="text-[12px] dark:text-[#B0B0B0] text-[#666666] mt-2"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                Setze konkrete Goals für das nächste Jahr
              </p>
            </div>

            {nextYearGoals.map((goal, index) => (
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
                <div className="flex items-start justify-between gap-4 mb-3">
                  <label className="text-[11px] font-bold uppercase tracking-wider
                    dark:text-[#00E5FF] text-[#0097A7] flex-shrink-0"
                    style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                    Goal {index + 1}
                  </label>
                  {!isReadOnly && nextYearGoals.length > 1 && (
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
                  className="w-full min-h-[80px] px-4 py-3 border-2 dark:border-[rgba(0,229,255,0.2)] border-[rgba(0,180,220,0.25)]
                    dark:bg-[rgba(0,229,255,0.05)] bg-[rgba(0,180,220,0.08)] rounded-lg resize-none mb-3
                    focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 focus:border-[rgba(0,229,255,0.4)]
                    disabled:cursor-not-allowed placeholder:dark:text-[#A0A0A0] placeholder:text-[#888888]
                    dark:text-[#FFFFFF] text-[#1A1A1A] transition-all"
                  style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '15px', lineHeight: '1.7' }}
                  placeholder="Beschreibe dein Goal für nächstes Jahr..."
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
                + Add Goal ({nextYearGoals.length})
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
