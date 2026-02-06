"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function PWAUpdatePrompt() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showReload, setShowReload] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;

        // Check for updates every 60 seconds
        setInterval(() => {
          registration.update();
        }, 60000);

        // Listen for new service worker waiting
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New version available
              setWaitingWorker(newWorker);
              setShowReload(true);

              toast.info("Update verfügbar", {
                description: "Eine neue Version mit aktualisiertem Icon ist verfügbar.",
                duration: Infinity,
                action: {
                  label: "Aktualisieren",
                  onClick: () => updateApp(),
                },
              });
            }
          });
        });

        // Listen for controller change
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          window.location.reload();
        });
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    };

    registerServiceWorker();
  }, []);

  const updateApp = async () => {
    if (!waitingWorker) return;

    // Tell the waiting service worker to activate
    waitingWorker.postMessage({ type: "SKIP_WAITING" });

    // Clear all caches to force icon reload
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }

    setShowReload(false);
  };

  if (!showReload) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/95 border border-white/20 rounded-lg p-4 shadow-2xl max-w-sm backdrop-blur-xl">
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <RefreshCw className="h-5 w-5 text-[#00E5FF] mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-white">Update verfügbar</h3>
            <p className="text-sm text-white/70 mt-1">
              Eine neue Version mit aktualisiertem App-Icon ist verfügbar.
            </p>
          </div>
        </div>
        <Button
          onClick={updateApp}
          className="w-full bg-white text-black hover:bg-white/90 font-medium"
        >
          Jetzt aktualisieren
        </Button>
      </div>
    </div>
  );
}
