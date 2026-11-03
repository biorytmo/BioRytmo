import { useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(false);
  const [showAutoPrompt, setShowAutoPrompt] = useState<boolean>(false);

  useEffect(() => {
    // 1. Detect standalone mode (already installed as PWA or running in homescreen mode)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // 2. Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // 3. First-visit check: prompt user on initial link opening
    const hasSeenPrompt = localStorage.getItem('biorytmo_pwa_prompt_dismissed');
    if (!isStandalone) {
      setIsFirstVisit(!hasSeenPrompt);
      // Auto-trigger prompt shortly after first link open
      const timer = setTimeout(() => {
        if (!isStandalone) {
          setShowAutoPrompt(true);
        }
      }, 1200);
      return () => clearTimeout(timer);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isStandalone) {
        setShowAutoPrompt(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowAutoPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem('biorytmo_pwa_prompt_dismissed', 'installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setShowAutoPrompt(false);
        setDeferredPrompt(null);
        localStorage.setItem('biorytmo_pwa_prompt_dismissed', 'installed');
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Install prompt error:', err);
      return false;
    }
  };

  const dismissPrompt = () => {
    setShowAutoPrompt(false);
    localStorage.setItem('biorytmo_pwa_prompt_dismissed', 'dismissed');
  };

  const openPromptManually = () => {
    setShowAutoPrompt(true);
  };

  return {
    isInstallable: !!deferredPrompt || isIOS,
    hasNativePrompt: !!deferredPrompt,
    isInstalled,
    isIOS,
    showAutoPrompt,
    install,
    dismissPrompt,
    openPromptManually,
  };
}
