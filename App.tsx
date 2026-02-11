import React, { useState, useEffect } from 'react';
import { AppScreen, Activity, WeekModule, SensoryProfile, ResponseItem } from './types';
import { Menu, LifeBuoy, Zap, CheckCircle, Lock, ChevronRight, Settings, FileText, CheckSquare, Square, MessageSquare, Orbit, Loader2, CalendarClock } from 'lucide-react';
import HelpModal from './components/HelpModal';
import FidgetTool from './components/FidgetTool';
import ActivityView from './components/ActivityView';
import SensorySettings from './components/SensorySettings';
import { audioService } from './services/audioService';
import { storageService } from './services/storageService';
import { IS_DEVELOPER_MODE } from './constants';

// Default Sensory Profile
const DEFAULT_PROFILE: SensoryProfile = {
  theme: 'default',
  fontSize: 'normal',
  reducedMotion: false,
  dyslexiaFont: false,
  sound: 'off',
  soundVolume: 0.5
};

const WelcomeScreen = ({ onNext }: { onNext: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-calm-bg transition-colors">
    <div className="w-full max-w-[280px] aspect-[16/9] mb-10 p-4 flex items-center justify-center">
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/9/91/Neurodiversity_Symbol.svg" 
        alt="Símbolo Infinito Multicolor de la Neurodiversidad" 
        className="w-full h-full object-contain filter drop-shadow-xl hover:scale-105 transition-transform duration-700"
      />
    </div>
    
    <h1 className="text-4xl font-black mb-4 text-deep-text tracking-tight">Hola.</h1>
    <p className="text-xl text-deep-text opacity-80 leading-relaxed mb-10 max-w-sm mx-auto">
      Gracias por ser parte de este proyecto. Queremos entender la universidad desde tu perspectiva.
    </p>
    <button onClick={onNext} className="w-full max-w-sm py-4 bg-deep-text text-calm-bg rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all">
      Comenzar
    </button>
  </div>
);

const ConsentScreen = ({ onAccept }: { onAccept: () => Promise<void> }) => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 50) {
      setHasScrolled(true);
    }
  };

  const handleAcceptClick = async () => {
    setIsProcessing(true);
    await onAccept();
  };

  return (
    <div className="flex flex-col h-screen bg-calm-bg text-deep-text transition-colors">
      {/* Header Fijo */}
      <div className="flex-none p-6 bg-card-bg border-b border-soft-gray shadow-sm z-10">
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-calm-blue/10 rounded-lg text-calm-blue">
                <FileText size={24} />
            </div>
            <h1 className="text-xl font-bold">Consentimiento Informado</h1>
        </div>
        <p className="text-xs opacity-60 uppercase tracking-wider font-semibold">FONDECYT Regular N° 1251541</p>
      </div>

      {/* Contenido Scrollable */}
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
                <p className="opacity-90">Estás invitado/a a participar en una investigación dirigida por la Dra. Vanessa Vega de la PUCV. Este estudio busca comprender la experiencia universitaria de estudiantes en el espectro autista para diseñar mejores apoyos que fomenten su autodeterminación y calidad de vida. Antes de decidir si participas, es importante que comprendas por qué hacemos esta investigación y qué implicará para ti.</p>
            </div>

            <div>
                <h3 className="font-bold text-base mb-2">2. ¿Cuál es el objetivo del estudio?</h3>
                <p className="opacity-90">El objetivo principal es identificar las necesidades y fortalezas de los estudiantes autistas universitarios para crear herramientas que les ayuden a tomar decisiones, establecer metas y gestionar su vida académica con mayor autonomía. No estamos evaluando tu inteligencia ni tu rendimiento académico; buscamos aprender de tu experiencia como experto/a de tu propia vida.</p>
            </div>

            <div>
                <h3 className="font-bold text-base mb-2">3. ¿En qué consiste tu participación?</h3>
                <p className="opacity-90 mb-2">Si aceptas participar, interactuarás con esta <strong>Sonda Digital</strong> durante aproximadamente <strong>4 semanas</strong>:</p>
                <ul className="list-disc pl-5 space-y-1 opacity-90">
                    <li><strong>Actividades Semanales:</strong> Responder consignas breves sobre tu entorno sensorial, organización y vida social (texto, audio o foto).</li>
                    <li><strong>Herramienta de Regulación (Fidget):</strong> Uso libre de la herramienta interactiva para el bienestar.</li>
                    <li><strong>Tiempo estimado:</strong> 10-15 minutos por actividad.</li>
                </ul>
            </div>

            <div>
                <h3 className="font-bold text-base mb-2">4. Almacenamiento Local y Envío Proactivo</h3>
                <p className="opacity-90 mb-2">Para proteger tu privacidad, esta aplicación funciona bajo un modelo de "Datos Locales":</p>
                <ul className="list-disc pl-5 space-y-1 opacity-90">
                    <li><strong>Tus datos se guardan en tu teléfono:</strong> Todas las respuestas se almacenan exclusivamente en este dispositivo. Nosotros NO tenemos acceso a ellos en tiempo real.</li>
                    <li><strong>Tú decides cuándo enviar:</strong> Al finalizar el proceso, deberás presionar explícitamente el botón "Enviar Datos" en la configuración. Esto generará un correo electrónico dirigido a la investigadora responsable con un archivo adjunto.</li>
                    <li><strong>Control total:</strong> Nada se envía automáticamente sin tu acción directa.</li>
                </ul>
            </div>

            <div>
                <h3 className="font-bold text-base mb-2">5. Confidencialidad y Anonimato</h3>
                <p className="opacity-90">Toda información recibida será estrictamente confidencial. Tu nombre será reemplazado por un código numérico una vez recibamos los datos. Los resultados se publicarán con fines científicos sin revelar tu identidad.</p>
            </div>

            <div>
                <h3 className="font-bold text-base mb-2">6. Beneficios y Riesgos</h3>
                <p className="opacity-90">No hay pago económico, pero ayudarás a crear mejores apoyos para estudiantes neurodivergentes. El riesgo es mínimo (posible incomodidad al reflexionar), y puedes detenerte cuando quieras.</p>
            </div>

            <div>
                <h3 className="font-bold text-base mb-2">7. Voluntariedad y Derecho a Retirarse</h3>
                <p className="opacity-90">Tu participación es voluntaria y no afecta tus notas. Puedes retirarte sin dar explicaciones. Entendemos que si dejas de usar la app, puede ser una señal de retiro (micro-ética del asentimiento).</p>
            </div>

            <div className="bg-card-bg border border-soft-gray p-4 rounded-xl">
                <h3 className="font-bold text-base mb-2">8. Contacto</h3>
                <p className="text-sm">Dra. Vanessa Vega Córdova<br/>vanessa.vega@pucv.cl<br/>Escuela de Pedagogía, PUCV.</p>
            </div>
        </section>
        
        <div className="h-12"></div> {/* Spacer for scroll */}
      </div>

      {/* Footer Fijo con Acción */}
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
                <span className="opacity-80">He leído la información, he podido hacer preguntas y <strong>acepto participar</strong> en este estudio y usar la sonda digital.</span>
            </div>
        </label>

        <button 
            onClick={handleAcceptClick} 
            disabled={!isAccepted || isProcessing}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
                isAccepted && !isProcessing
                ? 'bg-calm-blue text-btn-text hover:shadow-xl transform hover:-translate-y-1' 
                : 'bg-soft-gray text-gray-500 cursor-not-allowed'
            }`}
        >
            {isProcessing ? (
                <>
                    <Loader2 className="animate-spin" size={24} />
                    <span>Solicitando permisos...</span>
                </>
            ) : (
                'Acepto y firmo digitalmente'
            )}
        </button>
      </div>
    </div>
  );
};

const TutorialScreen = ({ onFinish }: { onFinish: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-calm-bg text-center">
    <h2 className="text-2xl font-bold mb-6">Probemos sin presión</h2>
    <p className="text-deep-text mb-8">
      Para empezar, familiarízate con el entorno. Toca el botón de "Fidget" abajo (el icono de la galaxia) cuando necesites un descanso.
    </p>
    <button onClick={onFinish} className="w-full max-w-xs py-3 bg-deep-text text-calm-bg rounded-xl font-bold">
      ¡Listo, vamos!
    </button>
  </div>
);

const App = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.ONBOARDING_WELCOME);
  const [startDate, setStartDate] = useState<string | null>(storageService.loadStartDate());
  
  // Initialize State from Storage
  const [weeks, setWeeks] = useState<WeekModule[]>(() => {
    let loadedWeeks: any[] = storageService.loadProgress();
    
    // MIGRATION: Convert old single 'response' to 'responses' array if needed
    loadedWeeks = loadedWeeks.map(week => ({
        ...week,
        activities: week.activities.map((act: any) => {
            if (!act.responses && act.response) {
                // Migrate old single response to array
                return { ...act, responses: [act.response], response: undefined };
            } else if (!act.responses) {
                // Initialize empty array
                return { ...act, responses: [] };
            }
            return act;
        })
    }));

    return loadedWeeks;
  });

  const [sensoryProfile, setSensoryProfile] = useState<SensoryProfile>(() => storageService.loadSensoryProfile(DEFAULT_PROFILE));
  
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showFidget, setShowFidget] = useState(false);
  const [showSensorySettings, setShowSensorySettings] = useState(false);

  // Persistence Effects
  useEffect(() => {
    storageService.saveProgress(weeks);
  }, [weeks]);

  useEffect(() => {
    storageService.saveSensoryProfile(sensoryProfile);
  }, [sensoryProfile]);

  // Effect to handle Time-Based Unlocking
  useEffect(() => {
      if (IS_DEVELOPER_MODE) {
          // Dev mode: unlock all
          setWeeks(prevWeeks => {
              if (prevWeeks.some(w => w.isLocked)) {
                  return prevWeeks.map(w => ({ ...w, isLocked: false }));
              }
              return prevWeeks;
          });
          return;
      }

      if (!startDate) return;

      const start = new Date(startDate).getTime();
      const now = Date.now();
      const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

      setWeeks(prevWeeks => prevWeeks.map(week => {
          // Week 1 (id 1): Unlocked immediately (0 weeks offset)
          // Week 2 (id 2): Unlocked after 1 week
          // Week 3 (id 3): Unlocked after 2 weeks
          const weeksPassed = week.id - 1;
          const unlockTime = start + (weeksPassed * ONE_WEEK_MS);
          const shouldBeLocked = now < unlockTime;

          if (week.isLocked !== shouldBeLocked) {
              return { ...week, isLocked: shouldBeLocked };
          }
          return week;
      }));

  }, [startDate, screen]); // Re-check when screen changes (e.g. entering dashboard) or start date is set

  // Apply Sensory Profile Effects
  useEffect(() => {
    // Theme
    document.body.className = `bg-calm-bg text-deep-text font-sans antialiased selection:bg-calm-blue selection:text-white transition-colors duration-300 theme-${sensoryProfile.theme}`;
    
    // Fonts
    if (sensoryProfile.dyslexiaFont) {
        document.body.classList.add('font-dyslexia');
    } else {
        document.body.classList.remove('font-dyslexia');
    }

    // Font Size (using HTML element for REM scaling)
    document.documentElement.className = `text-${sensoryProfile.fontSize}`;

    // Reduced Motion
    if (sensoryProfile.reducedMotion) {
        document.body.classList.add('motion-reduced');
    } else {
        document.body.classList.remove('motion-reduced');
    }

    // Audio
    if (sensoryProfile.sound !== 'off') {
        audioService.playNoise(sensoryProfile.sound as any, sensoryProfile.soundVolume);
    } else {
        audioService.stop();
    }
  }, [sensoryProfile]);

  // FIX: Updated logic to move to Tutorial after Consent
  // AND Request permissions explicitly
  const handleConsentSuccess = async () => {
    // 1. Request permissions
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            // This triggers the browser permission prompt
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            stream.getTracks().forEach(track => track.stop());
            console.log("Permissions granted and streams stopped.");
        } catch (error) {
            console.warn("Permissions denied or API error:", error);
        }
    }
    
    // 2. Set Start Date for Time-Based Locking
    const now = new Date().toISOString();
    storageService.saveStartDate(now);
    setStartDate(now);

    setScreen(AppScreen.ONBOARDING_TUTORIAL);
  };
  const handleTutorialFinish = () => setScreen(AppScreen.DASHBOARD);

  const handleActivitySelect = (activity: Activity) => {
    setActiveActivity(activity);
    setScreen(AppScreen.ACTIVITY_VIEW);
  };

  // Replaces the old handleActivityComplete. Now supports full array replacement (for edits/deletes).
  const handleActivityUpdate = (id: string, updatedResponses: ResponseItem[]) => {
    const updatedWeeks = weeks.map(week => ({
      ...week,
      activities: week.activities.map(act => {
        if (act.id === id) {
             const isCompleted = updatedResponses.length > 0;
             // Update responses array directly
             return { 
                 ...act, 
                 isCompleted, 
                 responses: updatedResponses 
             };
        }
        return act;
      })
    }));
    
    // Note: We removed the logic that unlocked the next week based on completion.
    // Locking is now purely time-based.
    
    setWeeks(updatedWeeks);
    
    const newActive = updatedWeeks
        .flatMap(w => w.activities)
        .find(a => a.id === id);
    if (newActive) setActiveActivity(newActive);
  };

  const handleFidgetClose = (data: { startTime: string; durationSeconds: number; shots: number; drags: number }) => {
    setShowFidget(false);
    // Log data to passive storage
    storageService.saveUsageLog({
        type: 'FIDGET_SESSION',
        startTime: data.startTime,
        durationSeconds: data.durationSeconds,
        shots: data.shots,
        drags: data.drags
    });
    if (IS_DEVELOPER_MODE) {
        console.log("[App] Fidget session saved:", data);
    }
  };

  // Helper to calculate unlock date
  const getUnlockDate = (weekId: number) => {
      if (!startDate) return null;
      const start = new Date(startDate);
      const daysToAdd = (weekId - 1) * 7;
      start.setDate(start.getDate() + daysToAdd);
      return start;
  };

  // Render Dashboard
  const renderDashboard = () => (
    <div className="pb-24">
      <div className="p-6 pt-12">
        <h1 className="text-3xl font-bold text-deep-text mb-2">Bitácora</h1>
        <p className="text-deep-text opacity-60 mb-8">
            Semana a semana
            {IS_DEVELOPER_MODE && <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded">MODO DEV</span>}
        </p>

        <div className="space-y-6">
          {weeks.map((week) => {
             const unlockDate = getUnlockDate(week.id);
             // Format date: "12 de Octubre"
             const dateString = unlockDate ? unlockDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) : '';
             
             return (
                <div key={week.id} className={`rounded-2xl border-2 transition-all ${week.isLocked ? 'bg-calm-bg border-transparent opacity-80' : 'bg-card-bg border-soft-gray shadow-sm'}`}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold tracking-wider text-calm-blue uppercase">Semana {week.id}</span>
                    {week.isLocked && <Lock size={16} className="text-soft-gray" />}
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-deep-text">{week.title.split(':')[1] || week.title}</h2>
                    <p className="text-sm text-deep-text opacity-70 mb-6">{week.goal}</p>

                    {week.isLocked ? (
                        <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-xl text-gray-500 text-sm">
                            <CalendarClock size={20} />
                            <span>
                                Disponible el <span className="font-bold">{dateString}</span>
                            </span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                        {week.activities.map((act) => (
                            <button
                            key={act.id}
                            disabled={week.isLocked}
                            onClick={() => handleActivitySelect(act)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-colors ${
                                act.isCompleted 
                                ? 'bg-green-50 text-green-800 border border-green-100 dark:bg-green-900 dark:text-green-100 dark:border-green-800' 
                                : 'bg-calm-bg hover:opacity-80 text-deep-text'
                            }`}
                            >
                            <div className="flex flex-col min-w-0 pr-2">
                                <span className="font-medium text-sm truncate">{act.title}</span>
                                {act.responses && act.responses.length > 0 && (
                                    <span className="text-xs opacity-70 flex items-center gap-1 mt-1">
                                        <MessageSquare size={12} /> {act.responses.length} respuesta{act.responses.length !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                            <div className="flex-shrink-0">
                                {act.isCompleted ? <CheckCircle size={18} /> : <ChevronRight size={18} className="opacity-40" />}
                            </div>
                            </button>
                        ))}
                        </div>
                    )}
                </div>
                </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-calm-bg relative overflow-hidden font-sans text-deep-text">
      {/* Onboarding Flow */}
      {screen === AppScreen.ONBOARDING_WELCOME && <WelcomeScreen onNext={() => setScreen(AppScreen.ONBOARDING_CONSENT)} />}
      {screen === AppScreen.ONBOARDING_CONSENT && <ConsentScreen onAccept={handleConsentSuccess} />}
      {screen === AppScreen.ONBOARDING_TUTORIAL && <TutorialScreen onFinish={handleTutorialFinish} />}

      {/* Main App */}
      {screen === AppScreen.DASHBOARD && renderDashboard()}
      {screen === AppScreen.ACTIVITY_VIEW && activeActivity && (
        <ActivityView 
          activity={activeActivity} 
          onUpdate={handleActivityUpdate}
          onBack={() => setScreen(AppScreen.DASHBOARD)} 
        />
      )}

      {/* Floating Buttons & Settings */}
      {[AppScreen.DASHBOARD, AppScreen.ACTIVITY_VIEW].includes(screen) && (
        <>
          {/* Top Right: Settings & Help */}
          <div className="fixed top-4 right-4 z-30 flex gap-2">
            <button
                onClick={() => setShowSensorySettings(true)}
                className="p-2 bg-card-bg/80 backdrop-blur rounded-full text-calm-blue shadow-sm hover:bg-card-bg border border-soft-gray"
                aria-label="Ajustes Sensoriales"
            >
                <Settings size={24} />
            </button>
            <button
                onClick={() => setShowHelp(true)}
                className="p-2 bg-card-bg/80 backdrop-blur rounded-full text-calm-blue shadow-sm hover:bg-card-bg border border-soft-gray"
                aria-label="Ayuda"
            >
                <LifeBuoy size={24} />
            </button>
          </div>

          {/* Fidget Button */}
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
            <button
              onClick={() => setShowFidget(true)}
              className="flex items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-transform"
              aria-label="Abrir Galaxia Fluida"
            >
              <Orbit size={32} />
            </button>
          </div>
        </>
      )}

      {/* Overlays */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      
      {showFidget && (
        <FidgetTool 
            onClose={handleFidgetClose} 
            reducedMotion={sensoryProfile.reducedMotion}
        />
      )}

      <SensorySettings 
        isOpen={showSensorySettings}
        onClose={() => setShowSensorySettings(false)}
        settings={sensoryProfile}
        onUpdate={setSensoryProfile}
      />
    </div>
  );
};

export default App;