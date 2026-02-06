"use client";

// PWA BeforeInstallPromptEvent type
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Global state for PWA install prompt
let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(prompt: BeforeInstallPromptEvent | null) => void>();

// Initialize listener once on client side
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;

    // Notify all subscribers
    listeners.forEach(listener => listener(deferredPrompt));
  });
}

export function usePWAInstallPrompt() {
  return {
    getDeferredPrompt: () => deferredPrompt,
    subscribe: (callback: (prompt: BeforeInstallPromptEvent | null) => void) => {
      listeners.add(callback);
      // Immediately call with current value if it exists
      if (deferredPrompt) {
        callback(deferredPrompt);
      }
      return () => {
        listeners.delete(callback);
      };
    },
    clearPrompt: () => {
      deferredPrompt = null;
      listeners.forEach(listener => listener(null));
    }
  };
}
