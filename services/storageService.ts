import { Moment, SensoryProfile } from '../types';
import { STUDY_CONTENT, HELP_CONTENT } from '../constants';

const KEYS = {
  PROGRESS: 'sonda_progress',
  SENSORY: 'sonda_sensory',
  USAGE: 'sonda_usage',
  START_DATE: 'sonda_start_date',
  SEEN_WELCOME: 'sonda_seen_welcome',
  SEEN_PERMISSIONS: 'sonda_seen_permissions',
  SEEN_FIDGET: 'sonda_seen_fidget',
  DEV_MODE: 'sonda_dev_mode',
  // Claves antiguas para migración
  LEGACY_PROGRESS: 'neuroprobe_progress',
  LEGACY_SENSORY: 'neuroprobe_sensory',
  LEGACY_USAGE: 'neuroprobe_usage',
  LEGACY_START_DATE: 'neuroprobe_start_date',
};

// Migra datos del formato antiguo (neuroprobe_*) al nuevo (sonda_*)
const migrateIfNeeded = () => {
  try {
    const alreadyMigrated = localStorage.getItem(KEYS.START_DATE) || localStorage.getItem(KEYS.PROGRESS);
    if (alreadyMigrated) return;

    const legacyDate = localStorage.getItem(KEYS.LEGACY_START_DATE);
    const legacyUsage = localStorage.getItem(KEYS.LEGACY_USAGE);
    const legacySensory = localStorage.getItem(KEYS.LEGACY_SENSORY);

    if (legacyDate) {
      localStorage.setItem(KEYS.START_DATE, legacyDate);
      // Si había fecha de inicio, asumir que ya consintió y vio el welcome
      localStorage.setItem(KEYS.SEEN_WELCOME, 'true');
      localStorage.setItem(KEYS.SEEN_PERMISSIONS, 'true');
    }
    if (legacyUsage) localStorage.setItem(KEYS.USAGE, legacyUsage);
    if (legacySensory) localStorage.setItem(KEYS.SENSORY, legacySensory);

    // El progreso antiguo (WeekModule[]) no es compatible con Moment[]; se descarta.
    // El participante comienza desde el inicio con el nuevo guión TAC.
  } catch (e) {
    console.error('Error en migración de datos:', e);
  }
};

migrateIfNeeded();

export const storageService = {
  // --- Progreso ---
  saveProgress: (moments: Moment[]) => {
    try {
      localStorage.setItem(KEYS.PROGRESS, JSON.stringify(moments));
    } catch (e) {
      console.error('Error guardando progreso:', e);
    }
  },

  loadProgress: (): Moment[] => {
    try {
      const saved = localStorage.getItem(KEYS.PROGRESS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error cargando progreso:', e);
    }
    return STUDY_CONTENT.map(m => ({ ...m, activities: m.activities.map(a => ({ ...a, responses: [] })) }));
  },

  // --- Fecha de inicio (consentimiento) ---
  saveStartDate: (dateIsoString: string) => {
    try {
      localStorage.setItem(KEYS.START_DATE, dateIsoString);
    } catch (e) {
      console.error('Error guardando fecha de inicio:', e);
    }
  },

  loadStartDate: (): string | null => {
    try {
      return localStorage.getItem(KEYS.START_DATE);
    } catch (e) {
      console.error('Error cargando fecha de inicio:', e);
      return null;
    }
  },

  hasConsented: (): boolean => {
    return !!localStorage.getItem(KEYS.START_DATE);
  },

  // --- Estado de onboarding PWA ---
  markWelcomeSeen: () => {
    localStorage.setItem(KEYS.SEEN_WELCOME, 'true');
  },

  hasSeenWelcome: (): boolean => {
    return localStorage.getItem(KEYS.SEEN_WELCOME) === 'true';
  },

  markPermissionsSeen: () => {
    localStorage.setItem(KEYS.SEEN_PERMISSIONS, 'true');
  },

  hasSeenPermissions: (): boolean => {
    return localStorage.getItem(KEYS.SEEN_PERMISSIONS) === 'true';
  },

  markFidgetIntroSeen: () => {
    localStorage.setItem(KEYS.SEEN_FIDGET, 'true');
  },

  hasSeenFidgetIntro: (): boolean => {
    return localStorage.getItem(KEYS.SEEN_FIDGET) === 'true';
  },

  // --- Modo desarrollador ---
  isDevMode: (): boolean => {
    return localStorage.getItem(KEYS.DEV_MODE) === 'true';
  },

  setDevMode: (enabled: boolean) => {
    localStorage.setItem(KEYS.DEV_MODE, enabled ? 'true' : 'false');
  },

  // --- Perfil sensorial ---
  saveSensoryProfile: (profile: SensoryProfile) => {
    try {
      localStorage.setItem(KEYS.SENSORY, JSON.stringify(profile));
    } catch (e) {
      console.error('Error guardando perfil sensorial:', e);
    }
  },

  loadSensoryProfile: (defaultProfile: SensoryProfile): SensoryProfile => {
    try {
      const saved = localStorage.getItem(KEYS.SENSORY);
      if (saved) {
        return { ...defaultProfile, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error cargando perfil sensorial:', e);
    }
    return defaultProfile;
  },

  // --- Logs de uso (datos pasivos) ---
  saveUsageLog: (entry: any) => {
    try {
      const currentLogs = storageService.loadUsageLogs();
      currentLogs.push({ timestamp: new Date().toISOString(), ...entry });
      localStorage.setItem(KEYS.USAGE, JSON.stringify(currentLogs));
    } catch (e) {
      console.error('Error guardando log de uso:', e);
    }
  },

  loadUsageLogs: (): any[] => {
    try {
      const saved = localStorage.getItem(KEYS.USAGE);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error cargando logs de uso:', e);
      return [];
    }
  },

  // --- Exportación de datos ---
  exportData: () => {
    try {
      const progress = localStorage.getItem(KEYS.PROGRESS);
      const sensory = localStorage.getItem(KEYS.SENSORY);
      const usage = localStorage.getItem(KEYS.USAGE);
      const startDate = localStorage.getItem(KEYS.START_DATE);

      const data = {
        exportedAt: new Date().toISOString(),
        studyStartDate: startDate,
        progress: progress ? JSON.parse(progress) : null,
        sensoryProfile: sensory ? JSON.parse(sensory) : null,
        usageLogs: usage ? JSON.parse(usage) : [],
        deviceInfo: {
          userAgent: navigator.userAgent,
          screen: { width: window.screen.width, height: window.screen.height }
        }
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sonda_datos_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (e) {
      console.error('Error exportando datos:', e);
      return false;
    }
  },

  prepareEmailData: () => {
    storageService.exportData();
    const recipientEmail = storageService.isDevMode() ? 'hspencer@ead.cl' : HELP_CONTENT.email;
    const subject = encodeURIComponent(HELP_CONTENT.subject);
    const body = encodeURIComponent('Hola,\n\nAdjunto a este correo el archivo JSON descargado desde la aplicación Sonda Digital.\n\nSaludos.');
    window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
  },

  clearAllData: () => {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
    window.location.reload();
  }
};
