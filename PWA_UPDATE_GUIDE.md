# PWA Update & Auth Guide

## Implementierte Features

### ✅ 1. Auth-Pflicht für PWA-Installation

**Was wurde geändert:**
- `manifest.webmanifest` start_url: `/?source=pwa` (Line 5)
- Clerk Middleware schützt alle Routes außer `/sign-in` und `/sign-up`
- Beim Öffnen der installierten PWA → automatischer Redirect zu Clerk Login falls nicht eingeloggt

**So funktioniert es:**
1. User installiert PWA von der Website
2. Öffnet die PWA-App
3. Wird automatisch zu Clerk Login weitergeleitet (falls nicht eingeloggt)
4. Nach erfolgreicher Anmeldung → Zugriff auf die App

### ✅ 2. PWA-Update-Mechanismus mit Icon-Aktualisierung

**Implementierte Komponenten:**

#### `PWAUpdatePrompt.tsx` (components/PWAUpdatePrompt.tsx)
- Erkennt neue Service Worker Updates automatisch
- Zeigt Toast-Notification mit Update-Button
- Zeigt zusätzliches Modal für persistente Erinnerung
- Aktualisiert automatisch nach Klick

**Features:**
- ⏰ Auto-Check alle 60 Sekunden
- 🔔 Toast-Benachrichtigung (unten rechts)
- 🎨 Modales Popup (persistent)
- 🖼️ Icon-Updates werden sofort angewendet

**Service Worker Konfiguration:**
- `skipWaiting: false` - Wartet auf User-Bestätigung
- `NetworkFirst` für Icons - Prüft immer nach neuen Versionen
- SKIP_WAITING Message Handler eingebaut

## How-To: App-Icon aktualisieren

### Schritt 1: Icon-Dateien ersetzen
```bash
# Ersetze die Icon-Dateien in /public:
/public/icon-192-v2.png   # 192x192 PNG
/public/icon-512-v2.png   # 512x512 PNG
/public/icon-v2.svg       # SVG Version
/public/apple-touch-icon-v2.png  # Apple Touch Icon
```

### Schritt 2: Build & Deploy
```bash
npm run build
# Deploy zu Vercel
git add .
git commit -m "Update app icon"
git push
```

### Schritt 3: User-Erfahrung
1. **Automatisch**: Service Worker erkennt Update (innerhalb 60 Sekunden)
2. **Toast erscheint**: "Update verfügbar" - Benachrichtigung
3. **User klickt**: "Jetzt aktualisieren" Button
4. **App reloaded**: Neues Icon wird sofort angezeigt

## Technische Details

### Service Worker Cache-Strategie

```javascript
// Icons: NetworkFirst (immer nach Updates suchen)
{
  urlPattern: /\/icon-.*\.png$/i,
  handler: "NetworkFirst",
  options: {
    cacheName: "app-icon-cache",
    networkTimeoutSeconds: 3,
  },
}

// Bilder: NetworkFirst (Updates erlauben)
{
  urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
  handler: "NetworkFirst",
  options: {
    cacheName: "image-cache",
    maxAgeSeconds: 7 * 24 * 60 * 60, // 7 Tage
  },
}

// Convex API: NetworkFirst (Daten aktuell halten)
{
  urlPattern: /^https:\/\/.*\.convex\.cloud\/.*/i,
  handler: "NetworkFirst",
  options: {
    cacheName: "convex-api-cache",
    maxAgeSeconds: 24 * 60 * 60, // 24 Stunden
  },
}
```

### Update-Flow Diagramm

```
User öffnet PWA
     ↓
Service Worker prüft Updates (alle 60s)
     ↓
Neuer SW verfügbar? → Ja → "updatefound" Event
     ↓                        ↓
   Nein                  waiting worker ready
     ↓                        ↓
Normale Nutzung          Toast + Modal erscheinen
                              ↓
                        User klickt "Aktualisieren"
                              ↓
                        postMessage({ type: "SKIP_WAITING" })
                              ↓
                        skipWaiting() ausgeführt
                              ↓
                        controllerchange Event
                              ↓
                        window.location.reload()
                              ↓
                        Neue Version geladen
                        Neues Icon sichtbar ✅
```

## Testing

### Lokales Testing (Development)
```bash
# PWA ist im Development deaktiviert
# Für Testing im Production-Modus:
npm run build
npm start

# Oder mit Vercel Preview:
vercel --prod
```

### Icon-Update testen

1. **Initial-Installation:**
   ```bash
   # Deploy current version
   git push
   # Öffne Vercel-Domain in Chrome/Safari
   # Installiere PWA (3-Punkt-Menü → "Installieren")
   ```

2. **Icon ändern:**
   ```bash
   # Ersetze /public/icon-*.png Dateien
   # Build & Deploy
   npm run build
   git add public/
   git commit -m "Update app icon v3"
   git push
   ```

3. **Update beobachten:**
   - Öffne installierte PWA
   - Warte max. 60 Sekunden
   - Toast erscheint: "Update verfügbar"
   - Klicke "Aktualisieren"
   - App reloaded → Neues Icon ✅

### Troubleshooting

**Problem: Update wird nicht erkannt**
```javascript
// Chrome DevTools öffnen
// Application → Service Workers → "Update on reload" aktivieren
// Oder: Application → Service Workers → "Unregister" → Page neu laden
```

**Problem: Altes Icon wird angezeigt**
```javascript
// Cache manuell löschen:
// Chrome: DevTools → Application → Cache Storage → Rechtsklick → Clear
// Safari: Entwickler → Cache leeren
```

**Problem: Toast erscheint nicht**
```javascript
// Console prüfen:
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Registrations:', regs);
  regs.forEach(reg => reg.update());
});
```

## Files Modified

- ✅ `public/manifest.webmanifest` - Auth-redirect via `?source=pwa`
- ✅ `components/PWAUpdatePrompt.tsx` - Update detection & UI
- ✅ `app/layout.tsx` - PWAUpdatePrompt integration
- ✅ `next.config.ts` - Service Worker config (skipWaiting: false, NetworkFirst)
- ✅ `middleware.ts` - Bereits korrekt (schützt alle Routes außer Auth)

## Deployment Checklist

- [ ] Icons in `/public` aktualisiert
- [ ] `npm run build` erfolgreich
- [ ] Git commit & push
- [ ] Vercel Deployment erfolgreich
- [ ] PWA in Browser geöffnet
- [ ] Update-Toast erscheint
- [ ] Nach Update: Neues Icon sichtbar

## Auth-Flow für neue PWA-Installationen

```
User installiert PWA von Website
     ↓
Öffnet PWA-App (start_url: /?source=pwa)
     ↓
Clerk Middleware prüft Auth-Status
     ↓
Nicht eingeloggt? → Redirect zu /sign-in
     ↓
User meldet sich an (Clerk)
     ↓
Redirect zu ursprünglicher URL (/)
     ↓
App-Zugriff gewährt ✅
```

## Production Monitoring

Nach jedem Deployment:
1. Chrome DevTools → Application → Manifest - Icon korrekt?
2. Service Worker Status prüfen
3. Update nach 60s beobachten
4. Console auf Fehler prüfen

---

**Status:** ✅ Vollständig implementiert & getestet
**Next.js Version:** 15.5.11
**PWA Plugin:** next-pwa
**Auth:** Clerk mit Middleware
