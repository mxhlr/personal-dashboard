# OKR/Goals System Implementation Plan

## Überblick
Integration eines vollständigen OKR-Systems in die Review-Formulare, sodass Reviews nicht nur Reflexion sind, sondern auch Goal-Setting für die nächste Periode.

## Flow
```
Weekly Review → Reflektiere letzte Woche → Plant 3-5 Goals für nächste Woche
Monthly Review → Reflektiere letzten Monat → Plant 3-5 OKRs für nächsten Monat
Quarterly Review → Reflektiere Milestones → Plant neue Milestones (bereits implementiert ✓)
Annual Review → Reflektiere North Stars → Plant neue North Stars (bereits implementiert ✓)
```

## Phase 1: Schema Updates

### 1.1 Weekly Goals hinzufügen
```typescript
weeklyReview: {
  // ... existing fields

  // NEU: Goals für nächste Woche
  nextWeekGoals: v.array(v.object({
    goal: v.string(),         // "Launch MVP feature"
    category: v.string(),     // "Work", "Health", "Learning", etc.
    completed: v.boolean(),   // Tracked next week
  })),
}
```

### 1.2 Monthly OKRs hinzufügen
```typescript
monthlyReview: {
  // ... existing fields

  // NEU: OKRs für nächsten Monat
  nextMonthOKRs: v.array(v.object({
    objective: v.string(),      // "Build stronger fitness foundation"
    keyResults: v.array(v.object({
      description: v.string(),  // "Run 3x per week"
      target: v.number(),       // 12 (total runs)
      current: v.number(),      // 0 (initial)
      unit: v.string(),         // "runs", "hours", "pages", etc.
    })),
    area: v.string(),           // "Health", "Wealth", "Love", "Happiness"
  })),
}
```

## Phase 2: Convex Functions

### 2.1 Weekly Goals
- `getWeeklyGoals(year, weekNumber)` - Hole Goals für diese Woche
- `updateWeeklyGoalProgress(goalId, completed)` - Toggle completion
- Existing `submitWeeklyReview` erweitern um `nextWeekGoals`

### 2.2 Monthly OKRs
- `getMonthlyOKRs(year, month)` - Hole OKRs für diesen Monat
- `updateMonthlyKeyResult(keyResultId, current)` - Update progress
- Existing `submitMonthlyReview` erweitern um `nextMonthOKRs`

## Phase 3: UI Components

### 3.1 Weekly Review Form
```
[Existing 5 reflection questions]

═══════════════════════════════
NEXT WEEK GOALS (Plan ahead)
═══════════════════════════════

Goal 1: [input field]
Category: [dropdown: Work/Health/Personal/Learning]

Goal 2: [input field]
Category: [dropdown]

Goal 3: [input field]
Category: [dropdown]

[+ Add another goal] (max 5)

[Save Review]
```

### 3.2 Monthly Review Form
```
[Existing 6 reflection questions]

═══════════════════════════════
NEXT MONTH OKRs (Plan ahead)
═══════════════════════════════

OKR 1:
  Objective: [input] "Launch side project MVP"
  Area: [dropdown: Wealth/Health/Love/Happiness]

  Key Results:
  - KR1: [input] "100 users signed up"
    Target: [number] 100 [unit] users
  - KR2: [input] "$1K MRR"
    Target: [number] 1000 [unit] $
  - KR3: [input] "10 paying customers"
    Target: [number] 10 [unit] customers

  [+ Add Key Result]

[+ Add another OKR] (max 3)

[Save Review]
```

## Phase 4: Dashboard Integration

### 4.1 Weekly Goals Widget
```
THIS WEEK'S GOALS
═════════════════
☐ Launch MVP feature (Work)
☐ Run 3x this week (Health)
☐ Read 2 chapters (Learning)

Progress: 1/3 complete (33%)
```

### 4.2 Monthly OKR Progress
```
FEBRUARY 2026 OKRs
═══════════════════

💰 WEALTH: "Launch side project MVP"
├─ 100 users signed up   [████████░░ 80/100]
├─ $1K MRR              [███░░░░░░░ 300/1000]
└─ 10 paying customers  [████░░░░░░ 4/10]
   Overall: 🟡 45% (On Track)

🏃 HEALTH: "Build fitness foundation"
├─ Run 3x/week         [█████████░ 11/12]
└─ 15km long run       [██████░░░░ 12/15]
   Overall: 🟢 77% (Strong!)
```

## Phase 5: Implementation Order

### Week 1: Schema + Backend
1. ✅ Update schema.ts (Weekly + Monthly)
2. ✅ Create/update Convex functions
3. ✅ Test data flow

### Week 2: Weekly Review
1. ✅ Extend WeeklyReviewForm component
2. ✅ Add goal input fields
3. ✅ Wire up to backend
4. ✅ Test full flow

### Week 3: Monthly Review
1. ✅ Extend MonthlyReviewForm component
2. ✅ Add OKR input fields with key results
3. ✅ Wire up to backend
4. ✅ Test full flow

### Week 4: Dashboard
1. ✅ Create WeeklyGoalsWidget
2. ✅ Create MonthlyOKRProgress component
3. ✅ Add to Dashboard
4. ✅ Polish UI/UX

## Notes
- Quarterly & Annual already have this pattern (Milestones & North Stars)
- Keep UI consistent with existing review style
- Use same card styling as Dashboard
- Make goal tracking optional (not required to complete review)
- Allow editing goals mid-period
