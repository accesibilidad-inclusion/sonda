import { WeekModule, SensoryProfile } from '../types';
import { WEEKLY_CONTENT, HELP_CONTENT, IS_DEVELOPER_MODE } from '../constants';

const KEYS = {
  PROGRESS: 'neuroprobe_progress',
  SENSORY: 'neuroprobe_sensory',
  USAGE: 'neuroprobe_usage',
  START_DATE: 'neuroprobe_start_date'
};

export const storageService = {
  // --- Progress Management ---
  saveProgress: (weeks: WeekModule[]) => {
    try {
      localStorage.setItem(KEYS.PROGRESS, JSON.stringify(weeks));
    } catch (e) {
      console.error("Error saving progress:", e);
    }
  },

  loadProgress: (): WeekModule[] => {
    try {
      const saved = localStorage.getItem(KEYS.PROGRESS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error loading progress:", e);
    }
    return WEEKLY_CONTENT; // Fallback to default
  },

  // --- Study Start Date Management ---
  saveStartDate: (dateIsoString: string) => {
    try {
        localStorage.setItem(KEYS.START_DATE, dateIsoString);
    } catch (e) {
        console.error("Error saving start date:", e);
    }
  },

  loadStartDate: (): string | null => {
      try {
          return localStorage.getItem(KEYS.START_DATE);
      } catch (e) {
          console.error("Error loading start date:", e);
          return null;
      }
  },

  // --- Sensory Profile Management ---
  saveSensoryProfile: (profile: SensoryProfile) => {
    try {
      localStorage.setItem(KEYS.SENSORY, JSON.stringify(profile));
    } catch (e) {
      console.error("Error saving sensory profile:", e);
    }
  },

  loadSensoryProfile: (defaultProfile: SensoryProfile): SensoryProfile => {
    try {
      const saved = localStorage.getItem(KEYS.SENSORY);
      if (saved) {
        return { ...defaultProfile, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error("Error loading sensory profile:", e);
    }
    return defaultProfile;
  },

  // --- Usage Logging (Passive Data) ---
  saveUsageLog: (entry: any) => {
    try {
        const currentLogs = storageService.loadUsageLogs();
        const newLog = {
            timestamp: new Date().toISOString(),
            ...entry
        };
        currentLogs.push(newLog);
        localStorage.setItem(KEYS.USAGE, JSON.stringify(currentLogs));
    } catch (e) {
        console.error("Error saving usage log:", e);
    }
  },

  loadUsageLogs: (): any[] => {
      try {
          const saved = localStorage.getItem(KEYS.USAGE);
          return saved ? JSON.parse(saved) : [];
      } catch (e) {
          console.error("Error loading usage logs:", e);
          return [];
      }
  },

  // --- Data Export & Sending (For Research) ---
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
      a.download = `neuroprobe_data_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (e) {
      console.error("Error exporting data", e);
      return false;
    }
  },

  prepareEmailData: () => {
    // 1. Trigger Download first so user has the file
    storageService.exportData();

    // 2. Determine Email Recipient based on Mode
    const recipientEmail = IS_DEVELOPER_MODE ? "hspencer@ead.cl" : HELP_CONTENT.email;

    // 3. Open Mail Client with pre-filled subject
    const subject = encodeURIComponent(HELP_CONTENT.subject);
    const body = encodeURIComponent("Hola,\n\nAdjunto a este correo el archivo JSON descargado desde la aplicación Sonda Digital.\n\nSaludos.");
    
    window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
  },

  clearAllData: () => {
    localStorage.removeItem(KEYS.PROGRESS);
    localStorage.removeItem(KEYS.SENSORY);
    localStorage.removeItem(KEYS.USAGE);
    localStorage.removeItem(KEYS.START_DATE);
    window.location.reload();
  }
};