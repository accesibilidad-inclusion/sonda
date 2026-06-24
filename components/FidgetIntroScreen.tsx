import React from 'react';
import { Orbit } from 'lucide-react';

interface FidgetIntroScreenProps {
  onNext: () => void;
}

const FidgetIntroScreen: React.FC<FidgetIntroScreenProps> = ({ onNext }) => (
  <div className="flex flex-col min-h-screen bg-calm-bg p-8">
    <div className="flex-1 flex flex-col items-center justify-center text-center">

      <div className="flex items-center justify-center w-24 h-24 mb-10 bg-indigo-100 rounded-full shadow-inner">
        <Orbit size={52} className="text-indigo-500" />
      </div>

      <h1 className="text-3xl font-black text-deep-text mb-4 tracking-tight leading-tight">
        La sonda tiene un fidget
      </h1>

      <div className="max-w-sm space-y-4 text-left mb-10">
        <p className="text-lg text-deep-text opacity-80 leading-relaxed">
          En cualquier momento durante el estudio puedes abrirlo — está en el <strong>botón del centro</strong> en la parte de abajo de la pantalla.
        </p>
        <p className="text-lg text-deep-text opacity-80 leading-relaxed">
          Está hecho para <strong>relajarse</strong>: arrastra la pelota y suéltala para derribar los bloques. Sin reglas. Sin puntaje.
        </p>
        <p className="text-lg text-deep-text opacity-80 leading-relaxed">
          Descubre cómo funciona cuando quieras.
        </p>
      </div>

      {/* Vista previa del botón */}
      <div className="flex items-center gap-3 mb-10 p-4 bg-card-bg rounded-2xl border border-soft-gray shadow-sm">
        <div className="flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-full shadow-md">
          <Orbit size={24} className="text-white" />
        </div>
        <span className="text-sm text-deep-text opacity-70">Este es el botón del fidget</span>
      </div>

      <button
        onClick={onNext}
        className="w-full max-w-sm py-4 bg-deep-text text-calm-bg rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all"
      >
        Entendido
      </button>
    </div>
  </div>
);

export default FidgetIntroScreen;
