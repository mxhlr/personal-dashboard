// Custom service worker extension
// This file adds manual update control to the auto-generated service worker

// Listen for SKIP_WAITING message from client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
