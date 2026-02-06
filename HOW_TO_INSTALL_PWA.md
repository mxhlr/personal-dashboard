# Real Rise PWA installieren

## 🚀 Installation - Schritt für Schritt

### Chrome (Desktop - macOS)

1. **Öffne die Website:**
   ```
   https://personal-dashboard-one-amber.vercel.app
   ```

2. **Melde dich an (wichtig!):**
   - Zuerst mit Clerk einloggen
   - Dann erst die App installieren

3. **Installation starten:**

   **Option A - Via URL-Leiste:**
   - Rechts in der Adressleiste erscheint ein **Download-Icon** ⬇️
   - Oder ein **Plus-Icon im Kreis** ➕
   - Klick darauf → "Installieren"

   **Option B - Via Menü:**
   - Klick auf die 3 Punkte oben rechts (⋮)
   - "Speichern und teilen"
   - → "Real Rise installieren..."
   - Klick "Installieren"

4. **Nach Installation:**
   - App öffnet sich in eigenem Fenster
   - Icon erscheint im Dock
   - Icon erscheint in Programme (`~/Applications/Chrome Apps.localized/`)

---

### Safari (macOS)

1. **Öffne die Website:**
   ```
   https://personal-dashboard-one-amber.vercel.app
   ```

2. **Login:**
   - Mit Clerk anmelden

3. **Installation:**
   - Safari → Menü "Ablage" (File)
   - → "Zum Dock hinzufügen"
   - Oder: Teilen-Button → "Zum Home-Bildschirm"

4. **Nach Installation:**
   - App startet als Web-App im eigenen Fenster

---

### Chrome (Mobile - iOS/Android)

1. **Website öffnen:**
   ```
   personal-dashboard-one-amber.vercel.app
   ```

2. **Login via Clerk**

3. **Installation:**

   **iOS (Safari):**
   - Teilen-Button tippen (⬆️)
   - Runterscrollen → "Zum Home-Bildschirm"
   - "Hinzufügen" tippen
   - Icon erscheint auf dem Home-Screen

   **Android (Chrome):**
   - 3-Punkte-Menü → "App installieren"
   - Oder Banner oben: "Installieren"
   - App erscheint in App-Drawer

---

## ✅ Nach erfolgreicher Installation

### Was passiert:
- ✅ **App-Icon** erscheint im Dock / Programme
- ✅ **Eigenes Fenster** ohne Browser-UI
- ✅ **Offline-Funktionalität** (Service Worker)
- ✅ **Auto-Updates** (alle 60 Sekunden Check)

### Beim nächsten Öffnen:
```
1. App-Icon im Dock anklicken
   ↓
2. App startet (standalone)
   ↓
3. Auth-Check: Eingeloggt?
   ↓
   Ja → Direkt zur App ✅
   Nein → Clerk Login-Screen
```

---

## 🔍 Troubleshooting

### "Installieren"-Button erscheint nicht

**Mögliche Ursachen:**

1. **PWA ist bereits installiert**
   - Check: `~/Applications/Chrome Apps.localized/`
   - Lösung: Erst deinstallieren, dann neu installieren

2. **Service Worker läuft bereits**
   - Check: DevTools → Application → Service Workers
   - Lösung: Service Worker deregistrieren

3. **HTTPS fehlt**
   - PWAs funktionieren nur über HTTPS
   - Vercel hat automatisch HTTPS ✅

4. **Manifest nicht geladen**
   - DevTools → Application → Manifest
   - Sollte "Real Rise" anzeigen

### App installiert, aber öffnet nicht

```bash
# App-Pfad prüfen
ls -la ~/Applications/Chrome\ Apps.localized/

# Wenn App da ist, aber nicht startet:
# Via Finder öffnen
open ~/Applications/Chrome\ Apps.localized/Real\ Rise.app
```

### Installation rückgängig machen

**Chrome:**
```bash
# Via Terminal
rm -rf ~/Applications/Chrome\ Apps.localized/Real\ Rise.app

# Oder via Browser
chrome://apps → Rechtsklick auf "Real Rise" → "Aus Chrome entfernen"
```

**Safari:**
- Safari → Einstellungen → Websites → Web Apps → "Real Rise" entfernen

---

## 🎯 Empfohlener Workflow

### Für Development (Testing):
1. ❌ **Nicht installieren** - nutze Browser-Tab
2. ✅ Service Worker deaktivieren in DevTools
3. ✅ Oder: Inkognito-Modus nutzen

### Für Production (echte Nutzung):
1. ✅ **Installieren** - bessere User Experience
2. ✅ Auto-Updates aktiviert
3. ✅ Offline-Support
4. ✅ Wie native App nutzen

---

## 📱 Expected Behavior nach Installation

### Browser vs. PWA

| Feature | Browser-Tab | Installierte PWA |
|---------|-------------|------------------|
| **URL-Leiste** | ✅ Sichtbar | ❌ Versteckt |
| **Browser-Buttons** | ✅ Zurück/Vor | ❌ Keine |
| **Dock-Icon** | Chrome-Icon | Real Rise-Icon |
| **Fenster** | Browser-Fenster | Eigenes App-Fenster |
| **Offline** | Eingeschränkt | ✅ Funktioniert |
| **Auto-Updates** | Nein | ✅ Ja (alle 60s) |

### Auto-Launch Verhalten

Wenn PWA installiert ist:
```
personal-dashboard-one-amber.vercel.app öffnen
    ↓
Chrome erkennt: PWA installiert
    ↓
Öffnet installierte App (nicht Browser-Tab)
    ↓
Standalone-Modus ✅
```

**Das ist gewolltes Verhalten!** Genau so sollen PWAs funktionieren.

Um im Browser zu bleiben:
- Inkognito-Modus (`Cmd + Shift + N`)
- Oder: PWA deinstallieren

---

## 🚀 Quick Start

```bash
# 1. Website öffnen
open "https://personal-dashboard-one-amber.vercel.app"

# 2. In Chrome:
#    - Login via Clerk
#    - 3-Punkte-Menü → "Real Rise installieren"
#    - "Installieren" klicken

# 3. App nutzen
open ~/Applications/Chrome\ Apps.localized/Real\ Rise.app
```

---

**Status:** Bereit zur Installation ✅
**Manifest:** `/manifest.webmanifest`
**Service Worker:** `/sw.js`
**Icons:** `/icon-192-v2.png`, `/icon-512-v2.png`
