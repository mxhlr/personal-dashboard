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
let initialized = false;

// Initialize listener only once on client side
function initializePWAHandler() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;

    // Notify all subscribers
    listeners.forEach(listener => listener(deferredPrompt));
  });
}

export function usePWAInstallPrompt() {
  // Initialize on first use
  initializePWAHandler();

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
