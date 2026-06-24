import React from 'react';

interface WelcomeScreenProps {
  onNext: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => (
  <div className="flex flex-col min-h-screen bg-calm-bg p-8">
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <img
        src={`${import.meta.env.BASE_URL}au.png`}
        alt="Sonda Digital"
        className="w-44 h-44 mb-10 object-contain drop-shadow-xl hover:scale-105 transition-transform duration-700"
      />

      <h1 className="text-3xl font-black text-deep-text mb-4 tracking-tight leading-tight">
        Bienvenido/a a la sonda
      </h1>

      <div className="max-w-sm space-y-4 text-left mb-10">
        <p className="text-lg text-deep-text opacity-80 leading-relaxed">
          Esta es una <strong>sonda digital de investigación</strong>: una herramienta para recoger información sobre tu experiencia universitaria.
        </p>
        <p className="text-lg text-deep-text opacity-80 leading-relaxed">
          En este proyecto, <strong>tú eres el coinvestigador</strong>. Tus respuestas son el campo. Tú decides qué compartir, cuándo y cómo.
        </p>
        <p className="text-lg text-deep-text opacity-80 leading-relaxed">
          Cada día se desbloqueará una nueva actividad. No hay respuestas correctas ni incorrectas. Solo tu perspectiva.
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full max-w-sm py-4 bg-deep-text text-calm-bg rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all"
      >
        Entendido, vamos
      </button>
    </div>
  </div>
);

export default WelcomeScreen;
