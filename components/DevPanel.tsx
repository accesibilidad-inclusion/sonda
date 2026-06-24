import React, { useState } from 'react';
import { Zap, RotateCcw, ArrowLeft } from 'lucide-react';
import { storageService } from '../services/storageService';

interface DevPanelProps {
  onBack: () => void;
}

const DevPanel: React.FC<DevPanelProps> = ({ onBack }) => {
  const [devMode, setDevMode] = useState(storageService.isDevMode());

  const toggleDevMode = () => {
    const next = !devMode;
    storageService.setDevMode(next);
    setDevMode(next);
  };

  const clearData = () => {
    if (confirm('¿Borrar todos los datos y reiniciar la app?')) {
      storageService.clearAllData();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-calm-bg p-6">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={onBack} className="p-2 -ml-2 text-deep-text rounded-full hover:bg-card-bg">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-deep-text">Panel de desarrollador</h1>
      </div>

      <div className="space-y-4 max-w-sm">
        {/* Dev mode toggle */}
        <div className="bg-card-bg rounded-2xl border border-soft-gray p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-deep-text flex items-center gap-2">
                <Zap size={18} className="text-yellow-500" />
                Modo desarrollador
              </p>
              <p className="text-sm text-deep-text opacity-60 mt-1">
                Desbloquea todos los momentos inmediatamente.
              </p>
            </div>
            <button
              onClick={toggleDevMode}
              className={`relative w-12 h-6 rounded-full transition-colors ${devMode ? 'bg-calm-blue' : 'bg-soft-gray'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${devMode ? 'translate-x-6' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
          {devMode && (
            <p className="mt-3 text-xs text-yellow-600 bg-yellow-50 p-2 rounded-lg">
              Activo — todos los momentos están disponibles. Recarga la app para que tome efecto.
            </p>
          )}
        </div>

        {/* Reset */}
        <div className="bg-card-bg rounded-2xl border border-soft-gray p-5">
          <p className="font-bold text-deep-text mb-1 flex items-center gap-2">
            <RotateCcw size={18} className="text-red-400" />
            Reiniciar app
          </p>
          <p className="text-sm text-deep-text opacity-60 mb-4">
            Borra todos los datos, respuestas y configuración. El participante vuelve al inicio.
          </p>
          <button
            onClick={clearData}
            className="w-full py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
          >
            Borrar todo y reiniciar
          </button>
        </div>

        <p className="text-xs text-center text-deep-text opacity-30 pt-4">
          Acceso: #dev · No enlazado desde la app
        </p>
      </div>
    </div>
  );
};

export default DevPanel;
