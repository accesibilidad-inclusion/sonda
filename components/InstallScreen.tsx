import React, { useState } from 'react';
import { Download, Share2 } from 'lucide-react';
import { useInstallPWA } from '../hooks/useInstallPWA';

const InstallScreen: React.FC = () => {
  const { isInstallable, isIOS, isInStandalone, swRegistered, handleInstallClick } = useInstallPWA();
  const [showInstructions, setShowInstructions] = useState(false);
  const [installed, setInstalled] = useState(false);

  const handleInstall = async () => {
    await handleInstallClick();
    setInstalled(true);
  };

  if (isInStandalone) {
    // Ya está en PWA — no debería verse esta pantalla, pero por si acaso
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-calm-bg p-8">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <img
          src={`${import.meta.env.BASE_URL}au.png`}
          alt="Sonda Digital"
          className="w-40 h-40 mb-8 object-contain drop-shadow-lg"
        />

        {!installed ? (
          <>
            <h1 className="text-3xl font-black text-deep-text mb-4 tracking-tight">
              Comencemos
            </h1>
            <p className="text-lg text-deep-text opacity-80 leading-relaxed mb-10 max-w-sm">
              Para usar la sonda, instala la aplicación en tu pantalla de inicio. Así podrás acceder a ella como una app normal, sin abrir el navegador.
            </p>

            <div className="flex flex-col gap-3 w-full max-w-xs">
              {/* Android/Desktop: botón nativo */}
              {isInstallable && swRegistered && (
                <button
                  onClick={handleInstall}
                  className="flex items-center justify-center w-full gap-2 py-4 text-btn-text bg-calm-blue rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  <Download size={20} />
                  Instalar en mi pantalla
                </button>
              )}

              {/* iOS: instrucciones manuales */}
              {isIOS && (
                <>
                  <button
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="flex items-center justify-center w-full gap-2 py-4 text-btn-text bg-calm-blue rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    <Download size={20} />
                    Cómo instalar en iOS
                  </button>
                  {showInstructions && (
                    <div className="bg-card-bg p-5 rounded-2xl border border-soft-gray text-sm text-deep-text space-y-3 text-left animate-fade-in">
                      <p className="font-semibold">Para instalar en iPhone/iPad:</p>
                      <ol className="list-decimal list-inside space-y-2 opacity-80">
                        <li>Toca el botón <Share2 size={14} className="inline mx-0.5" /> (Compartir) en Safari</li>
                        <li>Selecciona <strong>"Añadir a pantalla de inicio"</strong></li>
                        <li>Confirma tocando <strong>"Agregar"</strong></li>
                      </ol>
                      <button
                        onClick={() => setInstalled(true)}
                        className="w-full mt-2 py-2 text-calm-blue font-semibold text-sm"
                      >
                        Ya la instalé →
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Chrome/Edge sin evento beforeinstallprompt */}
              {!isInstallable && !isIOS && swRegistered && (
                <>
                  <button
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="flex items-center justify-center w-full gap-2 py-4 text-btn-text bg-calm-blue rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    <Download size={20} />
                    Cómo instalar
                  </button>
                  {showInstructions && (
                    <div className="bg-card-bg p-5 rounded-2xl border border-soft-gray text-sm text-deep-text space-y-3 text-left animate-fade-in">
                      <p className="font-semibold">Para instalar en Chrome/Edge:</p>
                      <ol className="list-decimal list-inside space-y-2 opacity-80">
                        <li>Busca el ícono <Download size={14} className="inline mx-0.5" /> en la barra de direcciones</li>
                        <li>Haz clic en <strong>"Instalar"</strong></li>
                        <li>O ve al menú (⋮) → <strong>"Instalar Sonda..."</strong></li>
                      </ol>
                      <button
                        onClick={() => setInstalled(true)}
                        className="w-full mt-2 py-2 text-calm-blue font-semibold text-sm"
                      >
                        Ya la instalé →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-black text-deep-text mb-4 tracking-tight">
              ¡Listo!
            </h1>
            <p className="text-lg text-deep-text opacity-80 leading-relaxed mb-6 max-w-sm">
              Ahora cierra esta ventana y abre la app <strong>Sonda</strong> desde el ícono en tu pantalla de inicio.
            </p>
            <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-xl border-2 border-soft-gray">
              <img src={`${import.meta.env.BASE_URL}au.png`} alt="Ícono Sonda" className="w-full h-full object-contain" />
            </div>
            <p className="mt-6 text-sm text-deep-text opacity-50">Puedes cerrar esta pestaña.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default InstallScreen;
