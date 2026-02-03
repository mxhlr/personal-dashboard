# Setup Instructions - Personal Dashboard

## Quick Start (5 Minuten)

### 1️⃣ Convex Setup

```bash
npx convex dev
```

Das wird:
- ✅ Browser öffnen mit Convex Dashboard
- ✅ Neues Projekt erstellen lassen
- ✅ Automatisch `.env.local` mit `NEXT_PUBLIC_CONVEX_URL` erstellen
- ✅ Schema deployen (alle 8 Tabellen)

**Wichtig:** Lass `convex dev` laufen (nicht stoppen)!

---

### 2️⃣ Clerk Setup

#### A. Projekt erstellen
1. Gehe zu https://dashboard.clerk.com/
2. Klicke auf "Create Application"
3. Name: **Personal Dashboard**
4. Wähle: **Email** + **Password**
5. Erstelle das Projekt

#### B. API Keys kopieren
Im Clerk Dashboard → **API Keys**:

Kopiere diese 2 Keys in `.env.local`:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

#### C. JWT Template erstellen
1. Clerk Dashboard → **JWT Templates**
2. Klicke "New Template"
3. Template Name: **convex**
4. Kopiere die **Issuer Domain** (sieht aus wie: `your-app.clerk.accounts.dev`)

#### D. Clerk Issuer in Convex setzen
```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN your-app.clerk.accounts.dev
```

Ersetze `your-app.clerk.accounts.dev` mit deiner kopierten Issuer Domain!

---

### 3️⃣ App starten

```bash
npm run dev
```

Öffne: http://localhost:3000

---

## ✅ Checklist

- [ ] `npx convex dev` läuft
- [ ] `.env.local` hat alle 3 Variablen:
  - `NEXT_PUBLIC_CONVEX_URL`
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
- [ ] JWT Template "convex" in Clerk erstellt
- [ ] `CLERK_JWT_ISSUER_DOMAIN` in Convex gesetzt
- [ ] App läuft auf http://localhost:3000

---

## 🔧 Troubleshooting

### Problem: "Authentication failed"
- **Lösung:** Prüfe ob JWT Template in Clerk "convex" heißt
- **Lösung:** Prüfe ob `CLERK_JWT_ISSUER_DOMAIN` in Convex richtig gesetzt ist

### Problem: "Convex not connected"
- **Lösung:** `npx convex dev` muss laufen
- **Lösung:** Prüfe `.env.local` für `NEXT_PUBLIC_CONVEX_URL`

### Problem: "User not authenticated"
- **Lösung:** Gehe zu http://localhost:3000 und registriere einen Account
- **Lösung:** Prüfe Clerk Keys in `.env.local`

---

## 📦 Deine .env.local sollte so aussehen:

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://happy-rabbit-123.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_aGFwcHktcmFiYml0LTEyMy5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_dGVzdF8xMjM0NTY3ODkwYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo

# Anthropic (später für AI Coach - Phase 6)
# ANTHROPIC_API_KEY=sk-ant-...
```

---

## 🚀 Nächste Schritte

Nach erfolgreichem Setup:
- **Phase 2:** Onboarding Wizard implementieren (7 Schritte)
- **Phase 3:** Daily Tracking (Evening Review)
- **Phase 4:** Data Views
- **Phase 5:** Reviews (Weekly, Monthly, Quarterly, Annual)
- **Phase 6:** AI Coach
- **Phase 7:** Settings & Polish
- **Phase 8:** Testing & Deployment

Viel Erfolg! 🎉
