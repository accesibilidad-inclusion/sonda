import React, { useState } from 'react';
import { FileText, CheckSquare, Square, Loader2 } from 'lucide-react';

interface ConsentScreenProps {
  onAccept: () => void;
}

const ConsentScreen: React.FC<ConsentScreenProps> = ({ onAccept }) => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 50) setHasScrolled(true);
  };

  const handleAcceptClick = () => {
    setIsProcessing(true);
    onAccept();
  };

  return (
    <div className="flex flex-col h-screen bg-calm-bg text-deep-text transition-colors">
      {/* Header fijo */}
      <div className="flex-none p-6 bg-card-bg border-b border-soft-gray shadow-sm z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-calm-blue/10 rounded-lg text-calm-blue">
            <FileText size={24} />
          </div>
          <h1 className="text-xl font-bold">Consentimiento Informado</h1>
        </div>
        <p className="text-xs opacity-60 uppercase tracking-wider font-semibold">FONDECYT Regular N° 1251541</p>
      </div>

      {/* Contenido scrollable */}
      <div
        className="flex-1 overflow-y-auto p-6 space-y-8 text-sm leading-relaxed scroll-smooth"
        onScroll={handleScroll}
      >
        <section className="bg-card-bg p-6 rounded-2xl shadow-sm border border-soft-gray">
          <h2 className="font-bold text-lg mb-4 text-calm-blue">Detalles del Proyecto</h2>
          <div className="space-y-2">
            <p><span className="font-bold">Título:</span> Promoción del aprendizaje de habilidades de autodeterminación en estudiantes con TEA en educación superior: Diseño y evaluación de una propuesta formativa basada en la Teoría de la Agencia Causal.</p>
            <p><span className="font-bold">Financiamiento:</span> Agencia Nacional de Investigación y Desarrollo (ANID)</p>
            <p><span className="font-bold">Investigadora Responsable:</span> Dra. Vanessa Vega Córdova</p>
            <p><span className="font-bold">Institución:</span> Pontificia Universidad Católica de Valparaíso (PUCV)</p>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h3 className="font-bold text-base mb-2">1. Invitación</h3>
            <p className="opacity-90">Estás invitado/a a participar en una investigación dirigida por la Dra. Vanessa Vega de la PUCV. Este estudio busca comprender la experiencia universitaria de estudiantes en el espectro autista para diseñar mejores apoyos que fomenten su autodeterminación y calidad de vida.</p>
          </div>
          <div>
            <h3 className="font-bold text-base mb-2">2. ¿Cuál es el objetivo del estudio?</h3>
            <p className="opacity-90">El objetivo principal es identificar las necesidades y fortalezas de los estudiantes autistas universitarios para crear herramientas que les ayuden a tomar decisiones, establecer metas y gestionar su vida académica con mayor autonomía. No estamos evaluando tu inteligencia ni tu rendimiento académico; buscamos aprender de tu experiencia como experto/a de tu propia vida.</p>
          </div>
          <div>
            <h3 className="font-bold text-base mb-2">3. ¿En qué consiste tu participación?</h3>
            <p className="opacity-90 mb-2">Si aceptas participar, interactuarás con esta <strong>Sonda Digital</strong> durante aproximadamente <strong>13 días hábiles</strong>, respondiendo una actividad por día:</p>
            <ul className="list-disc pl-5 space-y-1 opacity-90">
              <li><strong>Actividades diarias:</strong> Responder consignas breves sobre tu experiencia universitaria (texto, audio o foto).</li>
              <li><strong>Herramienta de Regulación:</strong> Uso libre de la herramienta interactiva para el bienestar.</li>
              <li><strong>Tiempo estimado:</strong> 10-15 minutos por actividad.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-base mb-2">4. Almacenamiento Local y Envío Proactivo</h3>
            <p className="opacity-90 mb-2">Para proteger tu privacidad, esta aplicación funciona bajo un modelo de datos locales:</p>
            <ul className="list-disc pl-5 space-y-1 opacity-90">
              <li><strong>Tus datos se guardan en tu teléfono:</strong> Todas las respuestas se almacenan exclusivamente en este dispositivo.</li>
              <li><strong>Tú decides cuándo enviar:</strong> Puedes exportar y enviar tus datos en cualquier momento, incluso parcialmente.</li>
              <li><strong>Control total:</strong> Nada se envía automáticamente sin tu acción directa.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-base mb-2">5. Confidencialidad y Anonimato</h3>
            <p className="opacity-90">Toda información recibida será estrictamente confidencial. Tu nombre será reemplazado por un código numérico. Los resultados se publicarán con fines científicos sin revelar tu identidad.</p>
          </div>
          <div>
            <h3 className="font-bold text-base mb-2">6. Beneficios y Riesgos</h3>
            <p className="opacity-90">No hay pago económico, pero ayudarás a crear mejores apoyos para estudiantes neurodivergentes. El riesgo es mínimo (posible incomodidad al reflexionar), y puedes detenerte cuando quieras.</p>
          </div>
          <div>
            <h3 className="font-bold text-base mb-2">7. Voluntariedad y Derecho a Retirarse</h3>
            <p className="opacity-90">Tu participación es voluntaria y no afecta tus notas. Puedes retirarte sin dar explicaciones. Entendemos que si dejas de usar la app, puede ser una señal de retiro.</p>
          </div>
          <div className="bg-card-bg border border-soft-gray p-4 rounded-xl">
            <h3 className="font-bold text-base mb-2">8. Contacto</h3>
            <p className="text-sm">Dra. Vanessa Vega Córdova<br />vanessa.vega@pucv.cl<br />Escuela de Pedagogía, PUCV.</p>
          </div>
        </section>

        <div className="h-12" />
      </div>

      {/* Footer fijo */}
      <div className="flex-none p-6 bg-card-bg border-t border-soft-gray shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
        <label
          className="flex items-start gap-4 p-4 mb-4 rounded-xl bg-calm-bg border border-soft-gray cursor-pointer select-none hover:opacity-80 transition-colors"
          onClick={() => !isProcessing && setIsAccepted(!isAccepted)}
        >
          <div className={`mt-1 transition-colors ${isAccepted ? 'text-calm-green' : 'text-soft-gray'}`}>
            {isAccepted ? <CheckSquare size={24} /> : <Square size={24} />}
          </div>
          <div className="text-sm">
            <span className="font-bold block mb-1">Declaración de Consentimiento</span>
            <span className="opacity-80">He leído la información y <strong>acepto participar</strong> en este estudio y usar la sonda digital.</span>
          </div>
        </label>

        <button
          onClick={handleAcceptClick}
          disabled={!isAccepted || !hasScrolled || isProcessing}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
            isAccepted && hasScrolled && !isProcessing
              ? 'bg-calm-blue text-btn-text hover:shadow-xl transform hover:-translate-y-1'
              : 'bg-soft-gray text-gray-500 cursor-not-allowed'
          }`}
        >
          {isProcessing ? (
            <><Loader2 className="animate-spin" size={24} /><span>Procesando...</span></>
          ) : !hasScrolled ? (
            'Lee el documento completo para continuar'
          ) : (
            'Acepto y firmo digitalmente'
          )}
        </button>
      </div>
    </div>
  );
};

export default ConsentScreen;
