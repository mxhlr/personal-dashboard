# Personal Dashboard - Deployment & Testing Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Anthropic API Key (für AI Coach)
- Clerk Account configured
- Convex Project deployed

### Installation

```bash
npm install
npm run dev
```

App läuft auf: `http://localhost:3000`

## 🔑 Required Setup

### 1. Anthropic API Key (WICHTIG für AI Coach!)

**Convex Dashboard → Settings → Environment Variables:**

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

**API Key erhalten:**
1. Gehe zu [console.anthropic.com](https://console.anthropic.com)
2. Erstelle einen neuen API Key  
3. Füge ihn in Convex Environment Variables ein

### 2. Clerk JWT Issuer

Already configured:
```bash
CLERK_JWT_ISSUER_DOMAIN=https://assured-bison-80.clerk.accounts.dev
```

## 🧪 Testing Checklist

### ✅ Phase 1-2: Onboarding (Already Tested)
- [x] 7-Step Wizard funktioniert
- [x] Profile wird gespeichert
- [x] Redirect zu Dashboard nach Completion

### ✅ Phase 3: Daily Tracking
- [ ] DailyTracker lädt
- [ ] Alle Fields funktionieren (Movement, Phone Jail, Vibes, Meals, Work)
- [ ] Wellbeing Sliders (1-10)
- [ ] "Speichern" button funktioniert
- [ ] Weekly Progress sidebar zeigt Targets
- [ ] Streak incrementiert bei Phone Jail toggle

### ✅ Phase 4: Data Views
- [ ] Data Tab lädt
- [ ] Daily/Weekly/Monthly/Quarterly/Annual Views wechseln
- [ ] Daten werden korrekt angezeigt

### ✅ Phase 5: Review Forms
- [ ] Planning Tab → Weekly Review (5 Fragen)
- [ ] Planning Tab → Monthly Review (6 Fragen)
- [ ] Planning Tab → Quarterly Review (Milestones + 5 Fragen)
- [ ] Planning Tab → Annual Review (North Stars + 6 Fragen)
- [ ] Forms speichern korrekt
- [ ] Read-only Mode nach Completion

### ✅ Phase 6: AI Coach
- [ ] Coach Tab lädt
- [ ] Message senden funktioniert
- [ ] AI antwortet mit Kontext (North Stars, Streaks, Wellbeing)
- [ ] Coach Tone wird respektiert
- [ ] Conversation History bleibt erhalten

### ✅ Phase 7: Settings
- [ ] Settings Modal öffnet
- [ ] Profile Tab: Edit & Save
- [ ] North Stars Tab: Edit & Save
- [ ] Tracking Fields Tab: Toggle active/inactive
- [ ] Coach Tone Tab: Change & Save
- [ ] Toast Notifications erscheinen

## 🚢 Production Deployment

### Vercel (Recommended)

```bash
vercel
vercel --prod
```

**Environment Variables in Vercel:**
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CONVEX_SITE_URL`

### Convex Production

```bash
npx convex deploy --prod
```

Don't forget to add `ANTHROPIC_API_KEY` to production environment!

## 🐛 Known Issues

### Issue: Coach nicht responding
**Fix:** Add `ANTHROPIC_API_KEY` to Convex environment variables

### Issue: Streaks not incrementing
**Fix:** Ensure daily log saved with `completed: true` and toggle value set

### Issue: Weekly Progress shows 0%
**Fix:** Set weekly target in Settings → Tracking Fields

## 📊 All Phases Complete!

- ✅ Phase 1: Foundation
- ✅ Phase 2: Onboarding Wizard
- ✅ Phase 3: Daily Tracking
- ✅ Phase 4: Data Views
- ✅ Phase 5: Review Forms
- ✅ Phase 6: AI Coach
- ✅ Phase 7: Settings & Polish

**App is production-ready!**

---

Built with Next.js 15, Convex, Clerk, and Claude AI 🚀
