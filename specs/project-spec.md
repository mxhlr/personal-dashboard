# Personal Dashboard - Project Specification

**Version:** 1.0
**Date:** 2026-02-03
**Language:** Deutsch (Du-Form)

---

## Executive Summary

Personal Dashboard ist eine Web-App für ganzheitliches Life-Tracking, Reviews und AI-Coaching. Die App strukturiert Lebensziele in 4 Bereiche (WEALTH, HEALTH, LOVE, HAPPINESS), ermöglicht tägliches Tracking mit Streaks, und bietet strukturierte Review-Rhythmen (Weekly, Monthly, Quarterly, Annual) mit AI-gestützter Analyse.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15 (App Router) |
| **Backend/Database** | Convex (Real-time) |
| **Authentication** | Clerk |
| **Styling** | Tailwind CSS 4 |
| **Components** | shadcn/ui |
| **AI** | Claude API (Anthropic) |
| **Icons** | Lucide React |
| **Language** | TypeScript (Strict Mode) |

---

## Core Concepts

### 1. Die 4 Lebensbereiche

Alle Ziele und Tracking-Aktivitäten sind in 4 Bereiche aufgeteilt:

| Symbol | Bereich | Fokus | Beispiele |
|--------|---------|-------|-----------|
| 💰 | **WEALTH** | Geld, Karriere, Business | "SaaS auf 10k MRR", "Beförderung" |
| 🏃 | **HEALTH** | Körper, Fitness, Ernährung | "Halbmarathon", "8h Schlaf" |
| ❤️ | **LOVE** | Beziehungen, Familie, Freunde | "Weekly Date Night", "Mehr Zeit mit Kindern" |
| 😊 | **HAPPINESS** | Erfüllung, Hobbies, Sinn | "Meditation täglich", "1 Buch/Monat" |

### 2. Ziel-Hierarchie

```
4 NORTH STARS
(1 pro Lebensbereich, Jahresziel)
    ↓
QUARTERLY MILESTONES
(pro Bereich, Anzahl frei wählbar)
    ↓
DAILY TRACKING
(tägliche Gewohnheiten & Wellbeing)
```

**Wichtig:**
- North Stars = Große Jahresziele
- Quarterly Milestones = Konkrete Schritte pro Quartal
- Daily Tracking = Gewohnheiten die zu den Zielen führen

### 3. Review-Philosophie

**ERST User-Input, DANN Analyse:**
- Jedes Review ist ein Formular das DU ausfüllst
- NACH dem Ausfüllen aggregiert die App die Daten
- AI Coach zeigt dann Insights & Patterns

---

## User Workflows

### Morgen Flow
```
1. App öffnen → Data Tab
2. Gestern's Daten checken
3. Streaks checken (🔥)
4. Coach Insight lesen
```

### Abend Flow (Daily Review)
```
1. Planning & Review Tab → Daily
2. Tracking-Felder ausfüllen
   - Movement, Phone Jail, Vibes, etc.
3. Wellbeing Slider
   - Energie (1-10)
   - Zufriedenheit (1-10)
   - Stress (1-10)
4. "Tag abschließen" → Streak Update
```

### Review Rhythmus

| Review | Zeitpunkt | Dauer | Fragen |
|--------|-----------|-------|--------|
| **Weekly** | Sonntag abends | 20 Min | 5 Reflexionsfragen |
| **Monthly** | Letzter Tag des Monats | 30 Min | 6 Reflexionsfragen |
| **Quarterly** | Ende März/Juni/Sept/Dez | 60 Min | Milestone Check + 5 Fragen + Neue Milestones |
| **Annual** | Dezember | 2-3h | North Star Check + 6 Fragen + Neue North Stars |

---

## App Structure

### Navigation Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Personal Coach     [Planning & Review ▼] [Data] [Coach]   ⚙️  │
│                     ┌────────────────────┐                      │
│                     │ ○ Daily            │                      │
│                     │ ○ Weekly           │                      │
│                     │ ○ Monthly          │                      │
│                     │ ○ Quarterly        │                      │
│                     │ ○ Annual           │                      │
│                     └────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

### Tab 1: Planning & Review
- **Dropdown Navigation:** Daily / Weekly / Monthly / Quarterly / Annual
- **Daily** = Evening Review (Original Daily Tracker Form)
- **Weekly/Monthly/Quarterly/Annual** = Review Formulare
- Nach Review-Submit: Analyse-Sektion erscheint

### Tab 2: Data View
- **Ansicht basiert auf gewähltem Zeitraum**
- **Navigation:** ◀ ▶ durch Tage/Wochen/Monate/Quartale/Jahre
- **Drill-Down:** Tap auf Element öffnet Detail-View
- **Hierarchie:** Annual → Quarterly → Monthly → Weekly → Daily

### Tab 3: Coach
- AI Chat mit Claude API
- Zugriff auf alle Tracking-Daten, Reviews, North Stars
- Pattern Recognition & Insights
- Direkte, actionable Antworten

### Settings (⚙️ Icon)
- Tracking-Felder verwalten (Add/Remove)
- Coach-Persönlichkeit (Motivierend/Sachlich/Empathisch/Direkt)
- Weekly Targets für Toggle-Felder
- Setup Wizard neu starten

---

## Onboarding (Setup Wizard)

### 5-Schritt Prozess

#### Schritt 1: Willkommen
- Begrüßung
- "Ich bin dein Personal Coach"
- "Los geht's" CTA

#### Schritt 2: Über dich
**Felder:**
- Name (Text Input)
- Rolle (Dropdown: Gründer, Executive, Freelancer, Student, etc.)
- Hauptprojekt (Text Input)

#### Schritt 3: Deine 4 North Stars
**Je 1 Ziel pro Lebensbereich:**
- 💰 WEALTH (Text Input)
- 🏃 HEALTH (Text Input)
- ❤️ LOVE (Text Input)
- 😊 HAPPINESS (Text Input)

**Beispiele als Placeholder:**
- WEALTH: "SaaS auf 10k MRR"
- HEALTH: "Halbmarathon laufen"
- LOVE: "Weekly Date Night etablieren"
- HAPPINESS: "Meditation täglich"

#### Schritt 4: Q1 Milestones
**Pro Bereich, frei wählbare Anzahl:**
- WEALTH: [Input] [+ Button]
- HEALTH: [Input] [+ Button]
- LOVE: [Input] [+ Button]
- HAPPINESS: [Input] [+ Button]

**Min:** 1 Milestone pro Bereich
**Max:** Unbegrenzt (empfohlen: 2-3)

#### Schritt 5: Tracking Setup
**Default Felder (vorausgewählt):**
- ☑ Movement (Text)
- ☑ Phone Jail (Toggle mit Streak 🔥)
- ☑ Vibes (Text)
- ☑ Meals (Frühstück/Mittag/Abend)
- ☑ Work (Stunden + Notes)

**Actions:**
- [+ Eigenes Feld hinzufügen]
- Für Toggle-Felder: Weekly Target setzen

#### Schritt 6: Coach-Einstellungen
**Coach-Persönlichkeit (Radio Buttons):**
- ○ Motivierend (feiert jeden Erfolg)
- ○ Sachlich (Fakten & Daten)
- ○ Empathisch (verständnisvoll)
- ● Direkt (keine Umschweife) [Default]

**Weekly Targets Beispiel:**
- Phone Jail: [5] Tage/Woche

#### Schritt 7: Fertig
**Zusammenfassung:**
- ✓ Alles eingerichtet!
- Zeige die 4 North Stars
- [Zum Dashboard →] CTA

**Nach Completion:**
- `setupCompleted: true` in userProfile
- Redirect zu Tab 1 (Daily Review)

---

## Data Model (Convex Schema)

### Tables Overview

```typescript
// convex/schema.ts

1. userProfile        - User Basics, North Stars, Milestones, Coach Settings
2. trackingFields     - Configurable Daily Tracking Fields
3. dailyLog           - Daily Tracking Data + Wellbeing
4. weeklyReview       - 5 Reflexionsfragen
5. monthlyReview      - 6 Reflexionsfragen
6. quarterlyReview    - Milestone Check + 5 Fragen + Neue Milestones
7. annualReview       - North Star Check + 6 Fragen + Neue North Stars
8. coachMessages      - Chat History mit AI Coach
```

### Table: userProfile

```typescript
userProfile: defineTable({
  // Basics
  name: v.string(),
  role: v.string(),
  mainProject: v.string(),

  // 4 North Stars (1 pro Lebensbereich)
  northStars: v.object({
    wealth: v.string(),
    health: v.string(),
    love: v.string(),
    happiness: v.string(),
  }),

  // Quarterly Milestones
  quarterlyMilestones: v.array(v.object({
    quarter: v.number(), // 1-4
    area: v.string(), // "wealth" | "health" | "love" | "happiness"
    milestone: v.string(),
    completed: v.boolean(),
  })),

  // Coach Settings
  coachTone: v.string(), // "Motivierend" | "Sachlich" | "Empathisch" | "Direkt"

  // Setup
  setupCompleted: v.boolean(),
  setupDate: v.optional(v.string()),

  createdAt: v.string(),
  updatedAt: v.string(),
})
```

### Table: trackingFields

```typescript
trackingFields: defineTable({
  name: v.string(),
  type: v.string(), // "text" | "toggle" | "meals" | "work"
  hasStreak: v.boolean(),
  isDefault: v.boolean(),
  isActive: v.boolean(),
  order: v.number(),

  // Streak (nur wenn hasStreak = true)
  currentStreak: v.optional(v.number()),
  longestStreak: v.optional(v.number()),

  // Weekly Target (optional, für Toggle-Felder)
  weeklyTarget: v.optional(v.number()),

  createdAt: v.string(),
}).index("by_active", ["isActive"])
  .index("by_order", ["order"])
```

**Field Types:**
- `text` = Simple text input
- `toggle` = Ja/Nein mit Streak
- `meals` = 3 Felder (B/L/D)
- `work` = Stunden (number) + Notes (text)

### Table: dailyLog

```typescript
dailyLog: defineTable({
  date: v.string(), // "YYYY-MM-DD"
  weekNumber: v.number(),
  dayOfWeek: v.string(),

  // Tracking Data
  tracking: v.object({
    movement: v.optional(v.string()),
    phoneJail: v.optional(v.boolean()),
    phoneJailNotes: v.optional(v.string()),
    vibes: v.optional(v.string()),
    breakfast: v.optional(v.string()),
    lunch: v.optional(v.string()),
    dinner: v.optional(v.string()),
    workHours: v.optional(v.number()),
    workNotes: v.optional(v.string()),

    // Custom Fields
    customToggles: v.optional(v.array(v.object({
      fieldId: v.id("trackingFields"),
      value: v.boolean(),
    }))),
    customTexts: v.optional(v.array(v.object({
      fieldId: v.id("trackingFields"),
      value: v.string(),
    }))),
  }),

  // Wellbeing Slider (1-10)
  wellbeing: v.optional(v.object({
    energy: v.number(),
    satisfaction: v.number(),
    stress: v.number(),
  })),

  // Meta
  completed: v.boolean(),
  completedAt: v.optional(v.string()),

  createdAt: v.string(),
  updatedAt: v.string(),
}).index("by_date", ["date"])
  .index("by_week", ["weekNumber"])
```

### Table: weeklyReview

```typescript
weeklyReview: defineTable({
  year: v.number(),
  weekNumber: v.number(),

  // User Input (5 Fragen)
  responses: v.object({
    biggestSuccess: v.string(),        // Was war dein größter Erfolg diese Woche?
    mostFrustrating: v.string(),       // Was hat dich am meisten frustriert?
    differentlyNextTime: v.string(),   // Was hättest du anders gemacht?
    learned: v.string(),               // Was hast du diese Woche gelernt?
    nextWeekFocus: v.string(),         // Worauf fokussierst du dich nächste Woche?
  }),

  completedAt: v.string(),
}).index("by_year_week", ["year", "weekNumber"])
```

### Table: monthlyReview

```typescript
monthlyReview: defineTable({
  year: v.number(),
  month: v.number(),

  // User Input (6 Fragen)
  responses: v.object({
    biggestSuccess: v.string(),        // Was war dein größter Erfolg diesen Monat?
    patternToChange: v.string(),       // Welches Muster möchtest du ändern?
    learnedAboutSelf: v.string(),      // Was hast du über dich selbst gelernt?
    biggestSurprise: v.string(),       // Was war die größte Überraschung?
    proudOf: v.string(),               // Worauf bist du stolz?
    nextMonthFocus: v.string(),        // Was ist dein Fokus für nächsten Monat?
  }),

  completedAt: v.string(),
}).index("by_year_month", ["year", "month"])
```

### Table: quarterlyReview

```typescript
quarterlyReview: defineTable({
  year: v.number(),
  quarter: v.number(),

  // Milestone Review (User markiert welche completed)
  milestoneReview: v.array(v.object({
    area: v.string(),
    milestone: v.string(),
    completed: v.boolean(),
    notes: v.optional(v.string()),
  })),

  // User Input (5 Fragen)
  responses: v.object({
    proudestMilestone: v.string(),     // Welcher Milestone macht dich am stolzesten?
    approachDifferently: v.string(),   // Welches Ziel hättest du anders angehen sollen?
    learnedAboutGoals: v.string(),     // Was hast du über deine Zielsetzung gelernt?
    decisionDifferently: v.string(),   // Welche Entscheidung würdest du anders treffen?
    needForNextQuarter: v.string(),    // Was brauchst du, um nächstes Quartal erfolgreicher zu sein?
  }),

  // Next Quarter Milestones (User definiert neue)
  nextQuarterMilestones: v.array(v.object({
    area: v.string(),
    milestone: v.string(),
  })),

  completedAt: v.string(),
}).index("by_year_quarter", ["year", "quarter"])
```

### Table: annualReview

```typescript
annualReview: defineTable({
  year: v.number(),

  // North Star Review
  northStarReview: v.object({
    wealth: v.object({ achieved: v.string(), notes: v.string() }),
    health: v.object({ achieved: v.string(), notes: v.string() }),
    love: v.object({ achieved: v.string(), notes: v.string() }),
    happiness: v.object({ achieved: v.string(), notes: v.string() }),
  }),

  // User Input (6 Fragen)
  responses: v.object({
    yearInOneSentence: v.string(),     // Das Jahr in einem Satz?
    turningPoint: v.string(),          // Was war der Wendepunkt?
    mostProudOf: v.string(),           // Worauf bist du am meisten stolz?
    topThreeLearnings: v.string(),     // Top 3 Learnings?
    stopStartContinue: v.string(),     // Was stoppen/starten/weitermachen?
    nextYearNorthStars: v.object({     // North Stars für nächstes Jahr
      wealth: v.string(),
      health: v.string(),
      love: v.string(),
      happiness: v.string(),
    }),
  }),

  completedAt: v.string(),
}).index("by_year", ["year"])
```

### Table: coachMessages

```typescript
coachMessages: defineTable({
  role: v.string(), // "user" | "assistant"
  content: v.string(),
  timestamp: v.string(),
}).index("by_timestamp", ["timestamp"])
```

---

## UI Components & Views

### Design System

#### Color Tokens
```css
:root {
  /* Base Colors */
  --bg: #F9FAFB;
  --card: #FFFFFF;
  --text: #111827;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;
  --border: #E5E7EB;
  --accent: #111827;
  --streak: #F59E0B;

  /* Life Areas */
  --wealth: #10B981;
  --health: #3B82F6;
  --love: #EF4444;
  --happiness: #F59E0B;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;

  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
}
```

#### Typography
- **Font:** System Default (SF Pro, Segoe UI, etc.)
- **Sizes:**
  - Heading: 20px, bold
  - Body: 16px, regular
  - Caption: 14px, medium
  - Small: 12px, regular

### Component: Evening Review (Daily)

**Layout:**
```
┌─────────────────────────────────────────┐
│ Evening Review                      ◀ ▶ │
│ Dienstag, 4. Februar 2026               │
├─────────────────────────────────────────┤
│                                         │
│ TRACKING                                │
│ ┌─────────────────────────────────────┐ │
│ │ Phone Jail    [✓]       Streak: 13  │ │
│ │                                     │ │
│ │ Movement                            │ │
│ │ [________________________________] │ │
│ │                                     │ │
│ │ Vibes                               │ │
│ │ [________________________________] │ │
│ │                                     │ │
│ │ Meals                               │ │
│ │ B: [______] L: [______] D: [______] │ │
│ │                                     │ │
│ │ Work: [__] Std                      │ │
│ │ [________________________________] │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ WELLBEING                               │
│ ┌─────────────────────────────────────┐ │
│ │ Energie       [━━━━━━●━━━] 7        │ │
│ │ Zufriedenheit [━━━━━━━●━━] 8        │ │
│ │ Stress        [━━●━━━━━━━] 3        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │         ✓ Tag abschließen           │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Features:**
- Navigation: ◀ ▶ (Previous/Next Day)
- Date Display: "Wochentag, DD. Monat YYYY"
- Dynamic Tracking Fields (from trackingFields table)
- Streak Display (🔥 nur bei Toggle-Feldern mit hasStreak=true)
- Wellbeing Sliders (1-10)
- Submit Button: "Tag abschließen"

**Behavior:**
- On Submit:
  - Save to dailyLog
  - Update Streaks (increment oder reset)
  - Set completed=true
  - Redirect to Data Tab (Today's View)

### Component: Weekly Review

**5 Fragen:**
1. Was war dein größter Erfolg diese Woche?
2. Was hat dich am meisten frustriert?
3. Was hättest du anders gemacht?
4. Was hast du diese Woche gelernt?
5. Worauf fokussierst du dich nächste Woche?

**Post-Submit Analyse:**
- 📊 Tracking Performance (Phone Jail: 6/7, etc.)
- 📈 Wellbeing Trends (Ø Energie, Zufriedenheit, Stress)
- 🔥 Streak Updates
- 💡 Patterns & Insights (via AI)

### Component: Monthly Review

**6 Fragen:**
1. Was war dein größter Erfolg diesen Monat?
2. Welches Muster möchtest du ändern?
3. Was hast du über dich selbst gelernt?
4. Was war die größte Überraschung?
5. Worauf bist du stolz?
6. Was ist dein Fokus für nächsten Monat?

**Post-Submit Analyse:**
- 📊 4 Wochen Performance
- 📈 Wellbeing Monats-Trend
- 🔄 Wiederkehrende Patterns
- 💡 Aggregierte Insights

### Component: Quarterly Review

**3-Part Process:**

**Part 1: Milestone Check**
- Zeige alle Milestones für dieses Quartal
- User markiert: ☑ Completed / ☐ Not Completed
- Optional: Notes pro Milestone

**Part 2: 5 Reflexionsfragen**
1. Welcher Milestone macht dich am stolzesten?
2. Welches Ziel hättest du anders angehen sollen?
3. Was hast du über deine Zielsetzung gelernt?
4. Welche Entscheidung würdest du anders treffen?
5. Was brauchst du, um nächstes Quartal erfolgreicher zu sein?

**Part 3: Next Quarter Milestones**
- Pro Lebensbereich: Input Fields
- [+ Weiterer Milestone] Button
- Min: 1 pro Bereich

**Post-Submit Analyse:**
- 📊 3 Monate Performance
- 🎯 Milestone Completion Rate
- 📈 Quartals-Trends
- 💡 Strategische Insights

### Component: Annual Review

**3-Part Process:**

**Part 1: North Star Check**
- Zeige alle 4 North Stars
- Pro Bereich:
  - Erreicht? ○ Ja ○ Teilweise ○ Nein
  - Notes (Text)

**Part 2: 6 Reflexionsfragen**
1. Das Jahr in einem Satz?
2. Was war der Wendepunkt?
3. Worauf bist du am meisten stolz?
4. Top 3 Learnings?
5. Was stoppen/starten/weitermachen?

**Part 3: Next Year North Stars**
- 4 Input Fields (1 pro Lebensbereich)
- Pre-filled mit aktuellen North Stars (editierbar)

**Post-Submit Analyse:**
- 📊 Jahres-Performance
- 🎯 North Star Achievement
- 📈 12-Monats-Trends
- 💡 Jahres-Insights

### Component: Data Views

#### Daily Data View
```
┌─────────────────────────────────────────┐
│           ◀ 4. Feb 2026 ▶               │
├─────────────────────────────────────────┤
│ STATUS: ✓ Completed                     │
│                                         │
│ TRACKING                                │
│ ┌─────────────────────────────────────┐ │
│ │ Phone Jail    ✓        Streak: 13 🔥│ │
│ │ Movement      "30 min joggen"       │ │
│ │ Vibes         "Produktiver Tag!"    │ │
│ │ Meals         B: Oats L: Salat      │ │
│ │               D: Pasta              │ │
│ │ Work          8h - "Feature X done" │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ WELLBEING                               │
│ ┌─────────────────────────────────────┐ │
│ │ Energie        ████████░░ 8/10      │ │
│ │ Zufriedenheit  █████████░ 9/10      │ │
│ │ Stress         ███░░░░░░░ 3/10      │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### Weekly Data View
- Tracking Grid (Mo-So)
- Daily Logs Liste (tap to drill-down)
- Wellbeing Trend (Ø Werte)
- Weekly Review Status (✓ oder ○)

#### Monthly Data View
- Wochen Übersicht (KW X | Y/7 | Ø Energie | Review ✓/○)
- Tracking Performance (% per field)
- Wellbeing Trend (Sparkline)
- Monthly Review Status

#### Quarterly Data View
- Milestones mit Status (☑/☐)
- Monate Übersicht
- Quarterly Review Status

#### Annual Data View
- North Stars mit Progress (%)
- Quartale Übersicht
- Milestone Total
- Annual Review Status

### Component: Coach Tab

**Chat Interface:**
```
┌─────────────────────────────────────────┐
│ Coach                                   │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 👤 Wie lief mein Januar?            │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🤖 Januar Stats:                    │ │
│ │                                     │ │
│ │ 💰 WEALTH                           │ │
│ │ • MVP Milestone: 80% ✓              │ │
│ │                                     │ │
│ │ 🏃 HEALTH                           │ │
│ │ • Laufen: 12/12 Sessions            │ │
│ │                                     │ │
│ │ Tracking:                           │ │
│ │ • Phone Jail: 28/31 (90%)           │ │
│ │ • Ø Energie: 7.2                    │ │
│ │ • Ø Zufriedenheit: 7.8              │ │
│ │                                     │ │
│ │ Pattern erkannt:                    │ │
│ │ Montags ist deine Energie           │ │
│ │ konstant niedriger (Ø 5.8).         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ─────────────────────────────────────── │
│ ┌─────────────────────────────────────┐ │
│ │ Nachricht...                    [➤] │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Features:**
- Chat History (stored in coachMessages)
- AI hat Zugriff auf:
  - userProfile (North Stars, Milestones, Role, etc.)
  - Alle dailyLogs
  - Alle Reviews
  - Current Streaks
  - Calculated Aggregates
- Response Style: basierend auf coachTone

### Component: Settings Modal

**Sections:**

**1. TRACKING-FELDER**
- Liste aller Felder (☑ = active, ☐ = inactive)
- Toggle-Felder: Weekly Target anzeigen
- Streak Icon (🔥) wenn hasStreak=true
- [+ Feld hinzufügen] Button
- Drag & Drop für Re-Ordering (order field)

**2. COACH**
- Radio Buttons für Tone:
  - ○ Motivierend
  - ○ Sachlich
  - ○ Empathisch
  - ○ Direkt

**3. ACTIONS**
- [🧙 Setup Wizard neu starten] Button

**4. SAVE**
- [Speichern] Button

### Component: Add Field Dialog

**Fields:**
- Name (Text Input)
- Typ (Radio):
  - ○ Text (kein Streak)
  - ● Ja/Nein (mit Streak 🔥)
- Weekly Target (Number Input, nur wenn Toggle)
- [Hinzufügen] Button

---

## AI Coach Implementation

### System Prompt Template

```typescript
const getCoachSystemPrompt = (userProfile, context) => `
Du bist der persönliche Coach von ${userProfile.name}.

## Stil
- Deutsch, Du-Form
- Ton: ${userProfile.coachTone}
- Direkt, daten-basiert, keine langen Erklärungen

## Context
- Rolle: ${userProfile.role}
- Projekt: ${userProfile.mainProject}

## North Stars 2026
- 💰 WEALTH: ${userProfile.northStars.wealth}
- 🏃 HEALTH: ${userProfile.northStars.health}
- ❤️ LOVE: ${userProfile.northStars.love}
- 😊 HAPPINESS: ${userProfile.northStars.happiness}

## Aktuelle Streaks
${context.streaks.map(s => `- ${s.name}: ${s.current} Tage`).join("\n")}

## Diese Woche
- Logs: ${context.daysLogged}/7
- Ø Energie: ${context.avgEnergy}
- Ø Zufriedenheit: ${context.avgSatisfaction}
- Ø Stress: ${context.avgStress}

## Patterns
${context.patterns}

## Aufgabe
- Kurze, actionable Antworten
- Daten nutzen für Insights
- Patterns erkennen (Wochentage, Bereiche)
- Direkte Empfehlungen
- Bei Reviews: Analyse nach User-Input zeigen
`;
```

### Context Builder

```typescript
const buildCoachContext = async () => {
  // 1. Current Streaks
  const streaks = await getActiveStreaks();

  // 2. This Week Stats
  const weekStats = await getWeekStats(currentWeek);

  // 3. Patterns
  const patterns = await identifyPatterns({
    timeframe: "last30days",
    dimensions: ["dayOfWeek", "lifeArea", "wellbeing"]
  });

  return { streaks, ...weekStats, patterns };
};
```

### Pattern Recognition Examples

**Patterns to detect:**
- Wochentag-Patterns (z.B. "Montags immer niedrige Energie")
- Lebensbereich-Correlations (z.B. "Wenn Wealth gut, dann Love schlecht")
- Wellbeing-Triggers (z.B. "Stress hoch wenn Work > 8h")
- Streak-Breaks (z.B. "Phone Jail streak immer am Wochenende gebrochen")

---

## Core Functions & Logic

### 1. Streak Update Logic

```typescript
const updateStreak = (
  currentStreak: number,
  didComplete: boolean
): number => {
  return didComplete ? currentStreak + 1 : 0;
};

// Bei Daily Log Submit:
for (const field of toggleFields) {
  const newStreak = updateStreak(
    field.currentStreak,
    dailyLog.tracking[field.name]
  );

  await updateField(field.id, {
    currentStreak: newStreak,
    longestStreak: Math.max(field.longestStreak, newStreak)
  });
}
```

### 2. Week Number (ISO 8601)

```typescript
const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};
```

### 3. Review Analysis (Post-Submit)

```typescript
const analyzeWeeklyReview = async (weekNumber: number) => {
  // 1. Lade alle Daily Logs der Woche
  const dailyLogs = await getDailyLogsByWeek(weekNumber);

  // 2. Berechne Tracking Performance
  const trackingPerformance = calculateTrackingPerformance(dailyLogs);
  // → { phoneJail: "6/7 (86%)", movement: "5/7 (71%)", ... }

  // 3. Berechne Wellbeing Trends
  const wellbeingTrends = calculateWellbeingTrends(dailyLogs);
  // → { avgEnergy: 7.2, avgSatisfaction: 8.0, avgStress: 2.8 }

  // 4. Identifiziere Patterns
  const patterns = await identifyPatterns(dailyLogs);
  // → "Montag & Dienstag: Niedrige Energie (Ø 5.5)"

  return { trackingPerformance, wellbeingTrends, patterns };
};
```

### 4. Drill-Down Navigation

```typescript
// Annual → Quarterly
onQuarterTap(quarter) {
  navigate(`/data/quarterly?quarter=${quarter}`);
}

// Quarterly → Monthly
onMonthTap(month) {
  navigate(`/data/monthly?month=${month}`);
}

// Monthly → Weekly
onWeekTap(week) {
  navigate(`/data/weekly?week=${week}`);
}

// Weekly → Daily
onDayTap(date) {
  navigate(`/data/daily?date=${date}`);
}
```

### 5. Milestone Progress Calculation

```typescript
const calculateMilestoneProgress = (milestones) => {
  const total = milestones.length;
  const completed = milestones.filter(m => m.completed).length;
  return {
    total,
    completed,
    percentage: Math.round((completed / total) * 100)
  };
};
```

### 6. North Star Progress (Manual)

```typescript
// In Annual Review: User wählt für jeden North Star:
// "Ja" = 100%, "Teilweise" = 50%, "Nein" = 0%

const achievedToPercentage = (achieved: string): number => {
  switch (achieved) {
    case "Ja": return 100;
    case "Teilweise": return 50;
    case "Nein": return 0;
    default: return 0;
  }
};
```

---

## Implementation Priority (Build Order)

### Phase 1: Foundation (Week 1)
**Goal:** Basic App Structure + Convex Setup

1. **Next.js + Convex Setup**
   - Init Next.js 15 with App Router
   - Install & configure Convex
   - Setup Clerk Authentication
   - Install Tailwind CSS 4 + shadcn/ui

2. **Schema Definition**
   - Implement all 8 tables in convex/schema.ts
   - Create indexes

3. **Basic Layout**
   - Header with 3 Tabs + Dropdown
   - Tab Navigation
   - Settings Icon (⚙️)

### Phase 2: Onboarding (Week 1-2)
**Goal:** Complete Setup Wizard

1. **Setup Wizard Components**
   - 7 Steps (Welcome → Über dich → North Stars → Milestones → Tracking → Coach → Fertig)
   - Step Navigation (Weiter/Zurück)
   - Progress Indicator

2. **Wizard Logic**
   - Form Validation
   - Save to userProfile
   - Create default trackingFields
   - Redirect to Daily Review after completion

3. **Setup Guard**
   - Check setupCompleted on app load
   - Redirect to Wizard if false

### Phase 3: Daily Tracking (Week 2)
**Goal:** Evening Review funktionsfähig

1. **Evening Review Form**
   - Dynamic Tracking Fields (from DB)
   - Wellbeing Sliders (Energie, Zufriedenheit, Stress)
   - Navigation ◀ ▶
   - Submit: "Tag abschließen"

2. **Streak Logic**
   - Update Streaks on Submit
   - Display Streaks (🔥 Icon)
   - Longest Streak Tracking

3. **Daily Log CRUD**
   - Create/Update dailyLog
   - Query by date
   - Check completion status

### Phase 4: Data Views (Week 3)
**Goal:** Read-Only Views für alle Zeiträume

1. **Daily Data View**
   - Show completed dailyLog
   - Navigation ◀ ▶
   - Empty State (wenn nicht completed)

2. **Weekly Data View**
   - Tracking Grid (7 days)
   - Daily Logs List
   - Wellbeing Trend
   - Weekly Review Status

3. **Monthly Data View**
   - Wochen Übersicht
   - Tracking Performance
   - Wellbeing Sparkline
   - Monthly Review Status

4. **Quarterly Data View**
   - Milestones mit Status
   - Monate Übersicht
   - Quarterly Review Status

5. **Annual Data View**
   - North Stars mit Progress
   - Quartale Übersicht
   - Milestone Total
   - Annual Review Status

6. **Drill-Down Navigation**
   - Tap to navigate deeper
   - Breadcrumbs (optional)

### Phase 5: Reviews (Week 4)
**Goal:** Alle Review-Formulare + Analyse

1. **Weekly Review**
   - 5-Fragen Form
   - Submit Logic
   - Post-Submit Analyse (Tracking Performance, Wellbeing Trends, Patterns)

2. **Monthly Review**
   - 6-Fragen Form
   - Submit Logic
   - Post-Submit Analyse

3. **Quarterly Review**
   - Part 1: Milestone Check
   - Part 2: 5 Reflexionsfragen
   - Part 3: Next Quarter Milestones
   - Submit Logic (save + update userProfile.quarterlyMilestones)
   - Post-Submit Analyse

4. **Annual Review**
   - Part 1: North Star Check
   - Part 2: 6 Reflexionsfragen
   - Part 3: Next Year North Stars
   - Submit Logic (update userProfile.northStars)
   - Post-Submit Analyse

5. **Review Analysis Functions**
   - calculateTrackingPerformance()
   - calculateWellbeingTrends()
   - identifyPatterns()

### Phase 6: AI Coach (Week 5)
**Goal:** Chat Interface + Claude API Integration

1. **Chat UI**
   - Message List (coachMessages)
   - Input Field + Send Button
   - User/Assistant Message Bubbles

2. **Claude API Integration**
   - Setup Anthropic SDK
   - System Prompt Builder
   - Context Builder (Streaks, Stats, Patterns)
   - Stream Response

3. **Pattern Recognition**
   - Wochentag-Patterns
   - Lebensbereich-Correlations
   - Wellbeing-Triggers
   - Streak-Break-Patterns

4. **Coach Personality**
   - Implement coachTone variations
   - Test all 4 Tones

### Phase 7: Settings & Polish (Week 6)
**Goal:** Vollständige App

1. **Settings Modal**
   - Tracking-Felder verwalten (Add/Remove/Reorder)
   - Coach Tone Selection
   - Weekly Targets
   - Setup Wizard Restart

2. **Add Field Dialog**
   - Form (Name, Type, Weekly Target)
   - Save to trackingFields

3. **Empty States**
   - No Daily Log yet
   - No Review completed
   - No Coach Messages

4. **Loading States**
   - Skeleton Screens
   - Loading Spinners

5. **Error Handling**
   - Form Validation Errors
   - API Errors
   - Network Errors

6. **Responsive Design**
   - Mobile-First
   - Tablet optimiert
   - Desktop optimiert

7. **Performance**
   - Optimize Queries
   - Lazy Loading
   - Image Optimization (if any)

### Phase 8: Testing & Deployment (Week 7)
**Goal:** Production-Ready

1. **Testing**
   - Manual Testing (all flows)
   - Edge Cases
   - Cross-Browser Testing

2. **Deployment**
   - Deploy Convex (Production)
   - Deploy Next.js (Vercel)
   - Setup Clerk (Production)
   - Environment Variables

3. **Documentation**
   - README (How to run locally)
   - Convex Guidelines adherence
   - Code Comments (where needed)

---

## Success Criteria

### Must-Have (V1.0)
- ✅ Complete Onboarding (Setup Wizard)
- ✅ Daily Evening Review (Tracking + Wellbeing)
- ✅ Streak Tracking (Auto-update, Display)
- ✅ Data Views (Daily, Weekly, Monthly, Quarterly, Annual)
- ✅ Reviews (Weekly, Monthly, Quarterly, Annual)
- ✅ Post-Review Analysis (Tracking Performance, Wellbeing Trends, Patterns)
- ✅ AI Coach Chat (mit Context)
- ✅ Settings (Tracking Fields, Coach Tone, Weekly Targets)
- ✅ Responsive Design (Mobile, Tablet, Desktop)

### Nice-to-Have (V1.1+)
- Export Function (CSV, PDF)
- Notifications (Daily Review Reminder)
- Custom Themes (Light/Dark Mode Variants)
- Weekly Target Progress (Visual in Header)
- Gamification (Badges, Achievements)
- Social Sharing (Milestones, Streaks)

### Performance Requirements
- Page Load: < 2s (initial)
- Navigation: < 200ms (instant feel)
- AI Response: < 5s (streaming)
- Real-time Sync: < 500ms (Convex)

### Quality Requirements
- TypeScript: Strict Mode, no `any`
- Accessibility: WCAG 2.1 AA
- SEO: Meta Tags, Open Graph
- Security: Clerk Auth, Row-Level Security (Convex)

---

## Technical Considerations

### Convex Best Practices
- Follow convexGuidelines.md strictly
- Use validators for all functions
- Implement row-level security (filter by user)
- Use indexes for performance
- Batch queries where possible

### State Management
- Convex Queries (useQuery)
- Convex Mutations (useMutation)
- React useState for local UI state
- No Redux/Zustand needed (Convex handles sync)

### Date Handling
- Always use ISO strings in DB ("YYYY-MM-DD")
- Use date-fns or Luxon for formatting
- Week Numbers: ISO 8601 standard
- Timezone: User's local timezone (client-side)

### AI Integration
- Stream responses for better UX
- Rate limiting (Anthropic limits)
- Error handling (API failures)
- Context window management (summarize old messages if needed)

### Security
- Clerk Authentication (JWT)
- Convex Auth Integration
- Environment Variables (.env.local)
- Never expose API keys client-side
- Row-level security (user can only see their data)

### Environment Variables

**.env.local (Frontend):**
```bash
NEXT_PUBLIC_CONVEX_URL=https://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

**.env (Convex):**
```bash
CLERK_JWT_ISSUER_DOMAIN=clerk...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## File Structure

```
personal-dashboard/
├── app/
│   ├── (auth)/
│   │   └── setup/              # Onboarding Wizard
│   ├── (protected)/
│   │   ├── layout.tsx          # Protected Layout
│   │   ├── page.tsx            # Dashboard (Tab 1)
│   │   ├── data/
│   │   │   ├── page.tsx        # Data Tab
│   │   │   ├── daily/
│   │   │   ├── weekly/
│   │   │   ├── monthly/
│   │   │   ├── quarterly/
│   │   │   └── annual/
│   │   └── coach/
│   │       └── page.tsx        # Coach Tab
│   ├── layout.tsx              # Root Layout
│   └── globals.css
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── TabNavigation.tsx
│   │   └── SettingsModal.tsx
│   ├── reviews/
│   │   ├── DailyReview.tsx
│   │   ├── WeeklyReview.tsx
│   │   ├── MonthlyReview.tsx
│   │   ├── QuarterlyReview.tsx
│   │   └── AnnualReview.tsx
│   ├── data/
│   │   ├── DailyDataView.tsx
│   │   ├── WeeklyDataView.tsx
│   │   ├── MonthlyDataView.tsx
│   │   ├── QuarterlyDataView.tsx
│   │   └── AnnualDataView.tsx
│   ├── coach/
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   └── InputField.tsx
│   ├── onboarding/
│   │   ├── SetupWizard.tsx
│   │   ├── Step1Welcome.tsx
│   │   ├── Step2AboutYou.tsx
│   │   ├── Step3NorthStars.tsx
│   │   ├── Step4Milestones.tsx
│   │   ├── Step5Tracking.tsx
│   │   ├── Step6Coach.tsx
│   │   └── Step7Done.tsx
│   └── ConvexClientProvider.tsx
├── convex/
│   ├── schema.ts               # All 8 tables
│   ├── auth.config.ts          # Clerk integration
│   ├── userProfile.ts          # Queries & Mutations
│   ├── trackingFields.ts
│   ├── dailyLog.ts
│   ├── reviews.ts
│   ├── coach.ts
│   └── analytics.ts            # Pattern recognition
├── lib/
│   ├── utils.ts
│   ├── dateUtils.ts            # Week number, formatting
│   ├── streakUtils.ts
│   └── coachPrompt.ts          # System prompt builder
├── specs/
│   └── project-spec.md         # This file
├── .env.local
├── convex.json
├── middleware.ts
├── package.json
└── tailwind.config.ts
```

---

## API Reference (Convex Functions)

### userProfile

```typescript
// queries
getUserProfile()                    // Get current user's profile
hasCompletedSetup()                 // Check if setup is done

// mutations
createUserProfile(data)             // Create new profile (onboarding)
updateNorthStars(northStars)        // Update annual goals
updateQuarterlyMilestones(q, milestones) // Update milestones
updateCoachTone(tone)               // Update coach personality
```

### trackingFields

```typescript
// queries
getActiveTrackingFields()           // Get all active fields
getFieldsByType(type)               // Filter by type

// mutations
createTrackingField(data)           // Add new field
toggleFieldActive(id, isActive)     // Enable/Disable
updateFieldOrder(id, order)         // Reorder
updateWeeklyTarget(id, target)      // Set weekly target
updateStreak(id, current, longest)  // Update streak
```

### dailyLog

```typescript
// queries
getDailyLog(date)                   // Get log for specific date
getDailyLogsByWeek(weekNumber)      // Get all logs for week
getDailyLogsByMonth(year, month)    // Get all logs for month
getDailyLogsByDateRange(start, end) // Custom range

// mutations
createOrUpdateDailyLog(date, data)  // Upsert daily log
markDayCompleted(date)              // Set completed=true
```

### reviews

```typescript
// queries
getWeeklyReview(year, week)
getMonthlyReview(year, month)
getQuarterlyReview(year, quarter)
getAnnualReview(year)

// mutations
submitWeeklyReview(year, week, responses)
submitMonthlyReview(year, month, responses)
submitQuarterlyReview(year, quarter, data)
submitAnnualReview(year, data)
```

### coach

```typescript
// queries
getCoachMessages(limit)             // Get recent messages

// mutations
sendMessage(content)                // User message
saveAssistantMessage(content)       // AI response

// actions
streamCoachResponse(messages)       // Call Claude API
```

### analytics

```typescript
// queries
getCurrentStreaks()                 // All active streaks
getWeekStats(weekNumber)            // Aggregated week data
getMonthStats(year, month)          // Aggregated month data
identifyPatterns(params)            // Pattern recognition

// functions (internal)
calculateTrackingPerformance(logs)
calculateWellbeingTrends(logs)
detectDayOfWeekPatterns(logs)
detectLifeAreaCorrelations(logs)
```

---

## Design Principles

1. **User-First:** Alle Features basieren auf echten User-Needs (Tracking, Reflection, Coaching)
2. **Data-Driven:** Reviews erzeugen Daten → AI macht Analyse → User bekommt Insights
3. **Simplicity:** Klare UI, keine Überladung, fokussiert auf Essentials
4. **Consistency:** Gleiche Patterns für alle Review-Levels (Daily → Weekly → Monthly → Quarterly → Annual)
5. **Progressive Disclosure:** Analyse erscheint NACH Review-Submit (nicht vorher)
6. **Real-time:** Convex sorgt für instant updates (Streaks, Stats, etc.)
7. **Personalization:** Coach Tone, Custom Tracking Fields, Weekly Targets

---

## Open Questions / Decisions Needed

1. **Timezone Handling:**
   - Use browser timezone (client-side) or store user timezone in profile?
   - **Decision:** Client-side (simpler, no timezone selector needed)

2. **Weekly Target Warning:**
   - Show warning if user is behind on weekly target? (e.g. "3/5 Phone Jail, nur noch 2 Tage!")
   - **Decision:** Yes, add to Data Tab (Weekly View)

3. **Coach Context Window:**
   - How many messages to send to Claude? (all vs. last N)
   - **Decision:** Last 20 messages + always include current stats

4. **Review Reminders:**
   - Email/Push notifications for pending reviews?
   - **Decision:** V1.1 feature (not MVP)

5. **Data Export:**
   - CSV/PDF export for all data?
   - **Decision:** V1.1 feature (not MVP)

6. **Milestone Dependencies:**
   - Can milestones have sub-tasks?
   - **Decision:** No, keep simple (just text + checkbox)

7. **Wellbeing Scale:**
   - 1-10 or 1-5?
   - **Decision:** 1-10 (more granular)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Anthropic API Rate Limits** | High | Implement rate limiting, caching, error handling |
| **User Abandons Onboarding** | Medium | Make wizard skippable (save progress), allow editing later |
| **Timezone Confusion** | Medium | Always use user's local time (client-side), clear date displays |
| **Streak Logic Bugs** | High | Extensive testing, edge cases (midnight, timezone changes) |
| **Review Fatigue** | Medium | Make reviews optional (not blocking), keep questions short |
| **Data Loss** | High | Convex auto-backup, test restore process |
| **Mobile Performance** | Medium | Optimize bundle size, lazy loading, test on slow devices |

---

## Success Metrics (Post-Launch)

1. **Onboarding Completion Rate:** > 80%
2. **Daily Review Completion:** > 60% (avg per user)
3. **Weekly Review Completion:** > 50%
4. **Monthly Review Completion:** > 40%
5. **Quarterly Review Completion:** > 30%
6. **Annual Review Completion:** Target (year-end)
7. **Coach Usage:** > 3 messages/week per active user
8. **Streak Retention:** Avg longest streak > 7 days
9. **User Retention:** 30-day retention > 40%

---

## Conclusion

Dieses Spec-Dokument definiert die komplette Personal Dashboard App:
- **4 Lebensbereiche** (Wealth, Health, Love, Happiness)
- **3-stufige Ziel-Hierarchie** (North Stars → Milestones → Daily Tracking)
- **5 Review-Levels** (Daily, Weekly, Monthly, Quarterly, Annual)
- **AI Coach** mit vollem Daten-Zugriff
- **Flexible Tracking** (Configurable Fields, Streaks, Weekly Targets)

Die App ist **modular aufgebaut** (Convex Backend, Next.js Frontend, shadcn/ui Components) und folgt **Best Practices** (TypeScript, Convex Guidelines, Responsive Design).

**Nächster Schritt:** Phase 1 Implementation (Foundation) starten! 🚀

---

**Document Version:** 1.0
**Last Updated:** 2026-02-03
**Status:** Ready for Implementation
