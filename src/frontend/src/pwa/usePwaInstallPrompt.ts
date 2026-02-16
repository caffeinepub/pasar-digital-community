/**
 * React hook for PWA install prompt with strict installability check
 * Only shows install banner when beforeinstallprompt fires and app is not in standalone mode
 */

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSAL_KEY = 'pwa-install-dismissed';
const DISMISSAL_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export function usePwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsInstallable(false);
      return;
    }

    // Check if user has dismissed the prompt recently
    const dismissedAt = localStorage.getItem(DISMISSAL_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const now = Date.now();
      if (now - dismissedTime < DISMISSAL_DURATION) {
        setIsDismissed(true);
        return;
      } else {
        // Dismissal expired, clear it
        localStorage.removeItem(DISMISSAL_KEY);
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      // Clear the deferredPrompt
      setDeferredPrompt(null);
      setIsInstallable(false);
      // Clear dismissal flag since app is now installed
      localStorage.removeItem(DISMISSAL_KEY);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) {
      console.warn(
        'Install prompt not available - app may already be installed or browser does not support PWA installation'
      );
      return;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.info('User accepted the install prompt');
      } else {
        console.info('User dismissed the install prompt');
      }

      // Clear the deferredPrompt
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };

  const dismiss = () => {
    // Store dismissal timestamp
    localStorage.setItem(DISMISSAL_KEY, Date.now().toString());
    setIsDismissed(true);
    setIsInstallable(false);
  };

  // Only installable if we have a deferred prompt, not dismissed, and not in standalone mode
  return {
    isInstallable: isInstallable && !isDismissed && !!deferredPrompt,
    promptInstall,
    dismiss,
  };
}
