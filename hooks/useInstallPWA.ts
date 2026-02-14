import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const useInstallPWA = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInStandalone, setIsInStandalone] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const checkIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setIsIOS(checkIOS);

    // Verificar si ya está instalado (modo standalone)
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInStandalone(checkStandalone);

    // Timeout de seguridad: si después de 3 segundos el SW no se registró,
    // marcarlo como registrado de todas formas para mostrar el botón
    const swTimeout = setTimeout(() => {
      if (!swRegistered) {
        setSwRegistered(true);
      }
    }, 3000);

    // Listener para el evento beforeinstallprompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      setIsInstallable(true);
    };

    // Listener para cuando se instala la app
    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Verificar si el service worker está registrado
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        setSwRegistered(true);
        clearTimeout(swTimeout);
      }).catch((error) => {
        console.error('Error con Service Worker:', error);
        setSwRegistered(true); // Mostrar botón de todas formas
        clearTimeout(swTimeout);
      });
    } else {
      // Si no soporta Service Worker, igual mostrar el botón
      setSwRegistered(true);
      clearTimeout(swTimeout);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(swTimeout);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      return;
    }

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;

      console.log(`Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);

      setInstallPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Error al mostrar el prompt de instalación:', error);
    }
  };

  return {
    isInstallable,
    isIOS,
    isInStandalone,
    swRegistered,
    handleInstallClick,
  };
};
