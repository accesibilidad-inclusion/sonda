import React, { useState, useEffect } from 'react';
import { AppScreen, Activity, Moment, SensoryProfile, ResponseItem } from './types';
import { LifeBuoy, CheckCircle, Lock, ChevronRight, Settings, MessageSquare, Orbit, CalendarClock, Download, Infinity } from 'lucide-react';
import HelpModal from './components/HelpModal';
import FidgetTool from './components/FidgetTool';
import ActivityView from './components/ActivityView';
import SensorySettings from './components/SensorySettings';
import ConsentScreen from './components/ConsentScreen';
import InstallScreen from './components/InstallScreen';
import WelcomeScreen from './components/WelcomeScreen';
import PermissionsScreen from './components/PermissionsScreen';
import FidgetIntroScreen from './components/FidgetIntroScreen';
import DevPanel from './components/DevPanel';
import { audioService } from './services/audioService';
import { storageService } from './services/storageService';

const DEFAULT_PROFILE: SensoryProfile = {
  theme: 'default',
  fontSize: 'normal',
  reducedMotion: false,
  dyslexiaFont: false,
  sound: 'off',
  soundVolume: 0.5
};

// Añade N días hábiles (lunes-viernes) a una fecha
function addWorkingDays(start: Date, days: number): Date {
  if (days === 0) return new Date(start);
  const result = new Date(start);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
}

function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
    || (window.navigator as any).standalone === true;
}

function getInitialScreen(): AppScreen {
  // Panel de desarrollador: accesible via #dev
  if (window.location.hash === '#dev') return AppScreen.DEV_PANEL;

  const hasConsented = storageService.hasConsented();
  if (!hasConsented) return AppScreen.ONBOARDING_GREETING;

  if (!isPWA()) return AppScreen.ONBOARDING_INSTALL;

  if (!storageService.hasSeenWelcome()) return AppScreen.ONBOARDING_WELCOME;
  if (!storageService.hasSeenPermissions()) return AppScreen.ONBOARDING_PERMISSIONS;
  if (!storageService.hasSeenFidgetIntro()) return AppScreen.ONBOARDING_FIDGET;
  return AppScreen.DASHBOARD;
}

const App = () => {
  const [screen, setScreen] = useState<AppScreen>(getInitialScreen);
  const [startDate, setStartDate] = useState<string | null>(storageService.loadStartDate());
  const [moments, setMoments] = useState<Moment[]>(() => storageService.loadProgress());
  const [sensoryProfile, setSensoryProfile] = useState<SensoryProfile>(() =>
    storageService.loadSensoryProfile(DEFAULT_PROFILE)
  );
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showFidget, setShowFidget] = useState(false);
  const [showSensorySettings, setShowSensorySettings] = useState(false);

  // Persistencia
  useEffect(() => { storageService.saveProgress(moments); }, [moments]);
  useEffect(() => { storageService.saveSensoryProfile(sensoryProfile); }, [sensoryProfile]);

  // Desbloqueo por día hábil
  useEffect(() => {
    const devMode = storageService.isDevMode();
    if (devMode) {
      setMoments(prev => {
        if (prev.some(m => m.isLocked)) return prev.map(m => ({ ...m, isLocked: false }));
        return prev;
      });
      return;
    }
    if (!startDate) return;

    const start = new Date(startDate);
    const now = new Date();

    setMoments(prev => prev.map(moment => {
      if (moment.alwaysVisible) return { ...moment, isLocked: false };
      const unlockDate = addWorkingDays(start, moment.id - 1);
      const shouldBeLocked = now < unlockDate;
      if (moment.isLocked !== shouldBeLocked) return { ...moment, isLocked: shouldBeLocked };
      return moment;
    }));
  }, [startDate, screen]);

  // Perfil sensorial
  useEffect(() => {
    document.body.className = `bg-calm-bg text-deep-text font-sans antialiased selection:bg-calm-blue selection:text-white transition-colors duration-300 theme-${sensoryProfile.theme}`;
    if (sensoryProfile.dyslexiaFont) document.body.classList.add('font-dyslexia');
    document.documentElement.className = `text-${sensoryProfile.fontSize}`;
    if (sensoryProfile.reducedMotion) document.body.classList.add('motion-reduced');
    else document.body.classList.remove('motion-reduced');
    if (sensoryProfile.sound !== 'off') audioService.playNoise(sensoryProfile.sound as any, sensoryProfile.soundVolume);
    else audioService.stop();
  }, [sensoryProfile]);

  // --- Handlers de onboarding ---

  const handleConsentAccept = () => {
    const now = new Date().toISOString();
    storageService.saveStartDate(now);
    setStartDate(now);
    setScreen(isPWA() ? AppScreen.ONBOARDING_WELCOME : AppScreen.ONBOARDING_INSTALL);
  };

  const handleWelcomeDone = () => {
    storageService.markWelcomeSeen();
    setScreen(AppScreen.ONBOARDING_PERMISSIONS);
  };

  const handlePermissionsDone = () => {
    storageService.markPermissionsSeen();
    setScreen(AppScreen.ONBOARDING_FIDGET);
  };

  const handleFidgetIntroDone = () => {
    storageService.markFidgetIntroSeen();
    setScreen(AppScreen.DASHBOARD);
  };

  // --- Handlers de actividades ---

  const handleActivitySelect = (activity: Activity) => {
    setActiveActivity(activity);
    setScreen(AppScreen.ACTIVITY_VIEW);
  };

  const handleActivityUpdate = (id: string, updatedResponses: ResponseItem[]) => {
    const updatedMoments = moments.map(moment => ({
      ...moment,
      activities: moment.activities.map(act => {
        if (act.id !== id) return act;
        return { ...act, isCompleted: updatedResponses.length > 0, responses: updatedResponses };
      })
    }));
    setMoments(updatedMoments);
    const newActive = updatedMoments.flatMap(m => m.activities).find(a => a.id === id);
    if (newActive) setActiveActivity(newActive);
  };

  const handleFidgetClose = (data: { startTime: string; durationSeconds: number; shots: number; drags: number }) => {
    setShowFidget(false);
    storageService.saveUsageLog({ type: 'FIDGET_SESSION', ...data });
  };

  // --- Helpers del dashboard ---

  const getUnlockDate = (momentId: number): Date | null => {
    if (!startDate) return null;
    return addWorkingDays(new Date(startDate), momentId - 1);
  };

  const formatUnlockDate = (date: Date): string => {
    return date.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  // Próximo momento por desbloquear (para mostrar "disponible el...")
  const nextLockedMoment = moments
    .filter(m => m.isLocked && !m.alwaysVisible)
    .sort((a, b) => a.id - b.id)[0];

  // --- Dashboard ---

  const renderMomentCard = (moment: Moment) => {
    const unlockDate = getUnlockDate(moment.id);
    const isDevMode = storageService.isDevMode();
    const completedCount = moment.activities.filter(a => a.isCompleted).length;
    const totalCount = moment.activities.length;
    const isCierre = moment.alwaysVisible;

    return (
      <div
        key={moment.id}
        className={`rounded-2xl border-2 transition-all ${
          moment.isLocked
            ? 'bg-calm-bg border-transparent opacity-70'
            : isCierre
            ? 'bg-card-bg border-calm-blue/30 shadow-sm'
            : 'bg-card-bg border-soft-gray shadow-sm'
        }`}
      >
        <div className="p-5">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-xs font-bold tracking-wider uppercase ${isCierre ? 'text-calm-blue' : 'text-calm-blue opacity-70'}`}>
              {isCierre ? 'Cierre · Opcional' : `Momento ${moment.id}`}
            </span>
            {moment.isLocked && <Lock size={14} className="text-soft-gray" />}
            {!moment.isLocked && completedCount > 0 && (
              <span className="text-xs text-calm-green font-semibold">
                {completedCount}/{totalCount} ✓
              </span>
            )}
          </div>

          <h2 className="text-lg font-bold mb-1 text-deep-text">{moment.title}</h2>
          <p className="text-sm text-deep-text opacity-60 mb-4 leading-snug">{moment.goal}</p>

          {moment.isLocked && unlockDate ? (
            <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-xl text-gray-500 text-sm">
              <CalendarClock size={16} className="flex-shrink-0" />
              <span>Disponible el <span className="font-semibold capitalize">{formatUnlockDate(unlockDate)}</span></span>
            </div>
          ) : (
            <div className="space-y-2">
              {moment.activities.map(act => (
                <button
                  key={act.id}
                  onClick={() => handleActivitySelect(act)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-colors ${
                    act.isCompleted
                      ? 'bg-green-50 text-green-800 border border-green-100'
                      : 'bg-calm-bg hover:opacity-80 text-deep-text'
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="font-medium text-sm truncate">{act.title}</span>
                    {act.responses.length > 0 && (
                      <span className="text-xs opacity-60 flex items-center gap-1 mt-0.5">
                        <MessageSquare size={11} />
                        {act.responses.length} respuesta{act.responses.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {act.isCompleted
                      ? <CheckCircle size={18} className="text-green-500" />
                      : <ChevronRight size={18} className="opacity-40" />}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    const regularMoments = moments.filter(m => !m.alwaysVisible);
    const cierreMoment = moments.find(m => m.alwaysVisible);
    const isDevMode = storageService.isDevMode();
    const totalActivities = moments.reduce((sum, m) => sum + m.activities.length, 0);
    const completedActivities = moments.reduce((sum, m) => sum + m.activities.filter(a => a.isCompleted).length, 0);

    return (
      <div className="pb-28">
        <div className="p-6 pt-12">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-deep-text">Sonda</h1>
              <p className="text-deep-text opacity-50 text-sm mt-1">
                {completedActivities} de {totalActivities} actividades
                {isDevMode && <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded">DEV</span>}
              </p>
            </div>
            <img src={`${import.meta.env.BASE_URL}au.png`} alt="" className="w-10 h-10 opacity-60 object-contain" />
          </div>

          {/* Próxima actividad */}
          {nextLockedMoment && !isDevMode && (() => {
            const unlockDate = getUnlockDate(nextLockedMoment.id);
            return unlockDate ? (
              <div className="mt-4 mb-6 flex items-center gap-2 text-sm text-deep-text opacity-50">
                <CalendarClock size={14} />
                <span>Próxima actividad: <span className="font-medium capitalize">{formatUnlockDate(unlockDate)}</span></span>
              </div>
            ) : null;
          })()}

          <div className="mt-6 space-y-4">
            {regularMoments.map(renderMomentCard)}
          </div>

          {/* Cierre — siempre al final */}
          {cierreMoment && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-px bg-soft-gray opacity-40" />
                <span className="text-xs text-deep-text opacity-40 font-medium uppercase tracking-wider">Cierre</span>
                <div className="flex-1 h-px bg-soft-gray opacity-40" />
              </div>
              {renderMomentCard(cierreMoment)}
            </div>
          )}

          {/* Exportar datos */}
          <div className="mt-8">
            <button
              onClick={() => {
                if (confirm('¿Descargar tus datos en un archivo JSON?')) storageService.exportData();
              }}
              className="w-full flex items-center justify-center gap-3 py-4 bg-calm-bg border-2 border-soft-gray text-deep-text opacity-70 rounded-2xl font-semibold text-sm hover:opacity-100 transition-opacity"
            >
              <Download size={18} />
              Exportar mis datos
            </button>
          </div>
        </div>
      </div>
    );
  };

  const showFloatingButtons = [AppScreen.DASHBOARD, AppScreen.ACTIVITY_VIEW].includes(screen);

  return (
    <div className="min-h-screen bg-calm-bg relative overflow-hidden font-sans text-deep-text">
      {/* Onboarding — contexto navegador */}
      {screen === AppScreen.ONBOARDING_GREETING && (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-calm-bg transition-colors">
          <img
            src={`${import.meta.env.BASE_URL}au.png`}
            alt="Símbolo del infinito dorado"
            className="w-56 h-56 mb-10 object-contain drop-shadow-xl hover:scale-105 transition-transform duration-700"
          />
          <h1 className="text-4xl font-black mb-4 text-deep-text tracking-tight">Hola.</h1>
          <p className="text-xl text-deep-text opacity-80 leading-relaxed mb-10 max-w-sm mx-auto">
            Gracias por ser parte de este proyecto. Queremos entender la universidad desde tu perspectiva.
          </p>
          <button
            onClick={() => setScreen(AppScreen.ONBOARDING_CONSENT)}
            className="w-full max-w-sm py-4 bg-deep-text text-calm-bg rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all"
          >
            Comenzar
          </button>
        </div>
      )}
      {screen === AppScreen.ONBOARDING_CONSENT && <ConsentScreen onAccept={handleConsentAccept} />}
      {screen === AppScreen.ONBOARDING_INSTALL && <InstallScreen />}

      {/* Onboarding — contexto PWA */}
      {screen === AppScreen.ONBOARDING_WELCOME && <WelcomeScreen onNext={handleWelcomeDone} />}
      {screen === AppScreen.ONBOARDING_PERMISSIONS && <PermissionsScreen onDone={handlePermissionsDone} />}
      {screen === AppScreen.ONBOARDING_FIDGET && <FidgetIntroScreen onNext={handleFidgetIntroDone} />}

      {/* App principal */}
      {screen === AppScreen.DASHBOARD && renderDashboard()}
      {screen === AppScreen.ACTIVITY_VIEW && activeActivity && (
        <ActivityView
          activity={activeActivity}
          onUpdate={handleActivityUpdate}
          onBack={() => setScreen(AppScreen.DASHBOARD)}
        />
      )}

      {/* Panel de desarrollador */}
      {screen === AppScreen.DEV_PANEL && (
        <DevPanel onBack={() => {
          window.location.hash = '';
          setScreen(getInitialScreen());
        }} />
      )}

      {/* Botones flotantes */}
      {showFloatingButtons && (
        <>
          <div className="fixed top-4 right-4 z-30 flex gap-2">
            <button
              onClick={() => setShowSensorySettings(true)}
              className="p-2 bg-card-bg/80 backdrop-blur rounded-full text-calm-blue shadow-sm hover:bg-card-bg border border-soft-gray"
              aria-label="Ajustes sensoriales"
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

          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
            <button
              onClick={() => setShowFidget(true)}
              className="flex items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-transform"
              aria-label="Herramienta de regulación"
            >
              <Orbit size={32} />
            </button>
          </div>
        </>
      )}

      {/* Overlays */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      {showFidget && (
        <FidgetTool onClose={handleFidgetClose} reducedMotion={sensoryProfile.reducedMotion} />
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
