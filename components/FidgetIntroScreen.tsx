import React, { useState } from 'react';
import { Orbit } from 'lucide-react';
import { storageService } from '../services/storageService';

interface FidgetIntroScreenProps {
  onNext: () => void;
}

const FidgetIntroScreen: React.FC<FidgetIntroScreenProps> = ({ onNext }) => {
  const [choice, setChoice] = useState<'yes' | 'no' | null>(null);

  const handleContinue = () => {
    if (!choice) return;
    storageService.setFidgetConsent(choice === 'yes');
    onNext();
  };

  return (
    <div className="flex flex-col min-h-screen bg-calm-bg p-8">
      <div className="flex-1 flex flex-col items-center justify-center">

        <div className="flex items-center justify-center w-24 h-24 mb-10 bg-indigo-100 rounded-full shadow-inner">
          <Orbit size={52} className="text-indigo-500" />
        </div>

        <h1 className="text-3xl font-black text-deep-text mb-4 tracking-tight leading-tight text-center">
          La sonda tiene un fidget
        </h1>

        <div className="max-w-sm space-y-4 text-left mb-8 w-full">
          <p className="text-lg text-deep-text opacity-80 leading-relaxed">
            En cualquier momento durante el estudio puedes abrirlo — está en el <strong>botón del centro</strong> en la parte de abajo de la pantalla.
          </p>
          <p className="text-lg text-deep-text opacity-80 leading-relaxed">
            Está hecho para <strong>relajarse</strong>: arrastra la pelota y suéltala para derribar los bloques. Sin reglas. Sin puntaje.
          </p>
        </div>

        {/* Vista previa del botón */}
        <div className="flex items-center gap-3 mb-8 p-4 bg-card-bg rounded-2xl border border-soft-gray shadow-sm w-full max-w-sm">
          <div className="flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-full shadow-md flex-shrink-0">
            <Orbit size={24} className="text-white" />
          </div>
          <span className="text-sm text-deep-text opacity-70">Este es el botón del fidget</span>
        </div>

        {/* Bloque de consentimiento de registro */}
        <div className="w-full max-w-sm bg-card-bg border-2 border-soft-gray rounded-2xl p-5 mb-8">
          <p className="text-sm font-bold text-deep-text mb-2">¿Por qué nos interesa?</p>
          <p className="text-sm text-deep-text opacity-70 leading-relaxed mb-4">
            Para conocer los mementos de relajación, o de enfoque y persistencia. Esto guarda cuatro datos cada vez que cierras el fidget: cuándo lo abriste, cuántos minutos estuvo abierto, cuántas veces lanzaste y cuántas veces arrastraste.
          </p>
          <p className="text-sm text-deep-text opacity-70 leading-relaxed mb-5">
            No se graba nada de lo que ocurre en la pantalla. Sirve para saber si una herramienta como esta tiene sentido para ti. Puedes cambiar de opinión cuando quieras desde Preferencias.
          </p>

          <div className="space-y-2">
            <button
              onClick={() => setChoice('yes')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors text-sm font-medium ${
                choice === 'yes'
                  ? 'border-calm-blue bg-calm-blue/10 text-deep-text'
                  : 'border-soft-gray bg-calm-bg text-deep-text opacity-70'
              }`}
            >
              <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                choice === 'yes' ? 'border-calm-blue' : 'border-soft-gray'
              }`}>
                {choice === 'yes' && <span className="w-2.5 h-2.5 rounded-full bg-calm-blue" />}
              </span>
              Sí, pueden guardar el registro de uso
            </button>

            <button
              onClick={() => setChoice('no')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors text-sm font-medium ${
                choice === 'no'
                  ? 'border-calm-blue bg-calm-blue/10 text-deep-text'
                  : 'border-soft-gray bg-calm-bg text-deep-text opacity-70'
              }`}
            >
              <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                choice === 'no' ? 'border-calm-blue' : 'border-soft-gray'
              }`}>
                {choice === 'no' && <span className="w-2.5 h-2.5 rounded-full bg-calm-blue" />}
              </span>
              No, prefiero que no
            </button>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={!choice}
          className="w-full max-w-sm py-4 bg-deep-text text-calm-bg rounded-2xl font-bold text-lg shadow-xl disabled:opacity-30 hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all"
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default FidgetIntroScreen;
