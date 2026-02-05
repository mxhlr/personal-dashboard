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
          <p className="text-[13px] dark:text-[#888888] text-[#666666]"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
          >
            {year}
          </p>
        </div>

        {/* Completion Badge */}
        {existingReview && isReadOnly && (
          <div className="flex justify-center">
            <div className="px-5 py-2 rounded-full uppercase text-[11px] font-bold tracking-wider
              dark:bg-white/[0.06] bg-black/[0.04]
              dark:border dark:border-white/[0.1] border border-black/[0.08]"
              style={{
                color: '#00E676',
                boxShadow: '0 0 15px rgba(0, 230, 118, 0.3)',
                fontFamily: '"Courier New", "Monaco", monospace'
              }}
            >
              ✓ Review Complete
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Part 1: North Star Check */}
          <div className="group dark:border-border/50 border-border/30 dark:bg-card/50 bg-white/80
            transition-all duration-300 ease-out
            hover:shadow-xl hover:-translate-y-1 shadow-sm
            dark:hover:border-border hover:border-border/50
            rounded-xl border p-6">
            <h3 className="text-[11px] font-bold uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-4"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              Teil 1: North Star Check
            </h3>
            <p className="text-[13px] dark:text-[#888888] text-[#666666] mb-4"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              Bewerte für jeden Lebensbereich, wie gut du dein Jahresziel erreicht hast.
            </p>

            {currentNorthStars && (
              <div className="space-y-5">
                {Object.entries(AREA_LABELS).map(([area, label]) => (
                  <div
                    key={area}
                    className="p-4 dark:border-border/30 border-border/20 border rounded-lg
                      dark:bg-[rgba(26,26,26,0.3)] bg-white/50"
                  >
                    <div className="text-[11px] font-bold uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-2"
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
                        <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-2"
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
                                className="w-4 h-4 dark:border-border/50 border-border/30"
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
                        <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-2"
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
                            disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
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
          <div className="group dark:border-border/50 border-border/30 dark:bg-card/50 bg-white/80
            transition-all duration-300 ease-out
            hover:shadow-xl hover:-translate-y-1 shadow-sm
            dark:hover:border-border hover:border-border/50
            rounded-xl border p-6">
            <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-3"
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
                disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
              placeholder="Beschreibe das Jahr in einem Satz..."
            />
          </div>

          {/* Question 2 */}
          <div className="group dark:border-border/50 border-border/30 dark:bg-card/50 bg-white/80
            transition-all duration-300 ease-out
            hover:shadow-xl hover:-translate-y-1 shadow-sm
            dark:hover:border-border hover:border-border/50
            rounded-xl border p-6">
            <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-3"
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
                disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
              placeholder="Der entscheidende Wendepunkt..."
            />
          </div>

          {/* Question 3 */}
          <div className="group dark:border-border/50 border-border/30 dark:bg-card/50 bg-white/80
            transition-all duration-300 ease-out
            hover:shadow-xl hover:-translate-y-1 shadow-sm
            dark:hover:border-border hover:border-border/50
            rounded-xl border p-6">
            <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-3"
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
                disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
              placeholder="Worauf bist du stolz..."
            />
          </div>

          {/* Question 4 */}
          <div className="group dark:border-border/50 border-border/30 dark:bg-card/50 bg-white/80
            transition-all duration-300 ease-out
            hover:shadow-xl hover:-translate-y-1 shadow-sm
            dark:hover:border-border hover:border-border/50
            rounded-xl border p-6">
            <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-3"
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
                disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px', lineHeight: '1.6' }}
              placeholder="Deine Top 3 Learnings..."
            />
          </div>

              {/* Question 5 */}
              <div>
                <label className="block text-sm font-bold font-orbitron uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-2">
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
                  className="w-full min-h-[100px] px-3 py-2 dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)]
                    border rounded-lg dark:bg-transparent bg-transparent dark:text-[#E0E0E0] text-[#1A1A1A]
                    disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                    focus:outline-none focus:ring-2 focus:ring-[rgba(0,229,255,0.3)]"
                  placeholder="Was möchtest du stoppen, starten, weitermachen..."
                />
              </div>
            </div>
          </div>

          {/* Part 3: Next Year North Stars */}
          <div>
            <h3 className="text-xl font-bold font-orbitron dark:text-[#00E5FF] text-[#0077B6] mb-4">
              Teil 3: North Stars für {year + 1}
            </h3>
            <p className="text-sm dark:text-[#888888] text-[#666666] mb-4">
              Definiere deine North Stars für das kommende Jahr.
            </p>

            <div className="space-y-4">
              {Object.entries(AREA_LABELS).map(([area, label]) => (
                <div key={area}>
                  <label className="block text-sm font-bold font-orbitron uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-2">
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
                    className="w-full px-3 py-2 dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)]
                      border rounded-lg dark:bg-transparent bg-transparent dark:text-[#E0E0E0] text-[#1A1A1A]
                      disabled:cursor-not-allowed placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                      focus:outline-none focus:ring-2 focus:ring-[rgba(0,229,255,0.3)]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
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
    </div>
  );
}
