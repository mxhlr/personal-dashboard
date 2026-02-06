"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function PWAUpdatePrompt() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showReload, setShowReload] = useState(false);

  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Listen for service worker updates
    navigator.serviceWorker.ready.then((registration) => {
      // Check for updates every 60 seconds
      setInterval(() => {
        registration.update();
      }, 60000);

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            // New service worker available
            setWaitingWorker(newWorker);
            setShowReload(true);

            toast.info("Update verfügbar", {
              description: "Eine neue Version ist verfügbar. Aktualisiere die App, um fortzufahren.",
              duration: Infinity,
              action: {
                label: "Aktualisieren",
                onClick: () => updateServiceWorker(),
              },
            });
          }
        });
      });
    });

    // Listen for controller change (new service worker activated)
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  }, []);

  const updateServiceWorker = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    }
  };

  if (!showReload) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/90 border border-white/10 rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="font-semibold text-white">Update verfügbar</h3>
          <p className="text-sm text-white/60">
            Eine neue Version von Real Rise ist verfügbar. Das App-Icon und Features wurden aktualisiert.
          </p>
        </div>
        <Button
          onClick={updateServiceWorker}
          className="w-full bg-white text-black hover:bg-white/90"
        >
          Jetzt aktualisieren
        </Button>
      </div>
    </div>
  );
}
