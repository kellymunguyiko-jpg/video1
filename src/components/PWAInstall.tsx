"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showButton, setShowButton] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Register the service worker.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.warn("SW registration failed:", err));
    }

    // Detect if already running as installed app.
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone === true;
    if (isStandalone) {
      setInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowButton(true);
    };

    const installedHandler = () => {
      setInstalled(true);
      setShowButton(false);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShowButton(false);
    }
    setDeferredPrompt(null);
  };

  if (installed || !showButton) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] w-[calc(100%-2rem)] max-w-sm">
      <div className="bg-white border border-green-200 shadow-2xl shadow-green-200/50 rounded-2xl p-4 flex items-center gap-3 animate-slide-up">
        <div className="w-11 h-11 shrink-0 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-green-900 text-sm">Install VidGrab</p>
          <p className="text-green-600 text-xs">Add to your device for quick access</p>
        </div>
        <button
          onClick={handleInstall}
          className="shrink-0 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
        >
          Install
        </button>
        <button
          onClick={() => setShowButton(false)}
          aria-label="Dismiss"
          className="shrink-0 text-green-400 hover:text-green-600 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
