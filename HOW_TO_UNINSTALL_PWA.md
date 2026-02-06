# PWA deinstallieren / Auto-Launch stoppen

## Problem
Beim Öffnen von `personal-dashboard-one-amber.vercel.app` wird automatisch die installierte PWA-App geöffnet, anstatt im Browser zu bleiben.

## Warum passiert das?
- PWA ist mit `display: standalone` konfiguriert
- Browser (Safari/Chrome) merkt sich installierte PWAs
- Bei Domain-Aufruf → automatischer Launch der installierten App
- **Das ist Standard-PWA-Verhalten und kann nicht im Code verhindert werden**

## Lösung 1: PWA deinstallieren (für Testing)

### macOS Chrome:
1. Öffne Chrome
2. Gehe zu `chrome://apps`
3. Rechtsklick auf "Real Rise"
4. "Remove from Chrome" / "Aus Chrome entfernen"

**Oder:**
1. Finder → Programme / Applications
2. Suche "Real Rise"
3. App in den Papierkorb verschieben

### macOS Safari:
1. Safari öffnen
2. Safari → Einstellungen → Websites → Web Apps
3. "Real Rise" auswählen → "Remove" / "Entfernen"

**Oder:**
1. Gehe zu `/Users/deinname/Applications/`
2. Lösche "Real Rise.app"

## Lösung 2: Inkognito-Modus verwenden

```
Chrome: Cmd + Shift + N
Safari: Cmd + Shift + N
```

Im Inkognito-Modus wird die installierte PWA **nicht** automatisch geöffnet.

## Lösung 3: Andere Domain verwenden

Erstelle einen Vercel Preview-Branch:
```bash
git checkout -b testing
git push origin testing
# Öffne die Preview-URL (z.B. personal-dashboard-testing.vercel.app)
```

Preview-URLs haben keine PWA installiert → kein Auto-Launch

## Lösung 4: URL-Parameter verwenden

**Funktioniert NICHT** - Browser ignoriert Parameter für PWA-Matching:
- ❌ `personal-dashboard-one-amber.vercel.app?web=true`
- ❌ `personal-dashboard-one-amber.vercel.app#web`

## Lösung 5: Subdomain verwenden

Erstelle eine separate Subdomain für Web-Version:
```
web.personal-dashboard.vercel.app  → Nur Browser
app.personal-dashboard.vercel.app  → PWA installierbar
```

## Empfehlung für Production

### Für Entwicklung:
- **Inkognito-Modus** für schnelles Testing
- **PWA deinstallieren** wenn du nur im Browser testen willst

### Für Production:
- Das ist **erwünschtes Verhalten** für echte User
- User erwarten: "Ich habe die App installiert → Sie öffnet sich automatisch"
- Wenn User im Browser bleiben wollen → PWA nicht installieren

## Quick Fix: PWA jetzt deinstallieren

```bash
# macOS - Finde installierte PWA
find ~/Applications -name "*Real Rise*" -type d

# Lösche die App
rm -rf ~/Applications/"Real Rise.app"

# Oder öffne Finder und lösche manuell:
open ~/Applications/
```

Nach dem Löschen:
- ✅ Vercel-Domain öffnet sich wieder im Browser
- ✅ Kein Auto-Launch mehr
- ✅ PWA kann jederzeit neu installiert werden
