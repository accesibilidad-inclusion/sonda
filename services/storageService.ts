import { Moment, SensoryProfile, ExportSelection } from '../types';
import { STUDY_CONTENT, HELP_CONTENT } from '../constants';
import { idbGet, idbSet, idbClear } from './db';

// Claves IDB — datos grandes que crecen con medios base64.
const IDB = {
  PROGRESS: 'sonda_progress',
  USAGE: 'sonda_usage',
};

// Claves localStorage — flags y datos pequeños que se leen de forma síncrona al arrancar.
const LS = {
  SENSORY: 'sonda_sensory',
  START_DATE: 'sonda_start_date',
  SEEN_WELCOME: 'sonda_seen_welcome',
  SEEN_PERMISSIONS: 'sonda_seen_permissions',
  SEEN_FIDGET: 'sonda_seen_fidget',
  DEV_MODE: 'sonda_dev_mode',
};

function defaultMoments(): Moment[] {
  return STUDY_CONTENT.map(m => ({
    ...m,
    activities: m.activities.map(a => ({ ...a, responses: [] })),
  }));
}

export const storageService = {

  // ── Progreso (IDB) ─────────────────────────────────────────────────────────

  /** Lectura síncrona desde localStorage: sólo para el estado inicial de React.
   *  Después del primer montaje, loadProgress() (async) toma el relevo. */
  loadProgressSync(): Moment[] {
    try {
      const raw = localStorage.getItem(IDB.PROGRESS);
      if (raw) return JSON.parse(raw);
    } catch { /* corrupción: ignorar */ }
    return defaultMoments();
  },

  /** Lectura canónica: IDB primero, localStorage como fallback pre-migración. */
  async loadProgress(): Promise<Moment[]> {
    try {
      const data = await idbGet<Moment[]>(IDB.PROGRESS);
      if (data) return data;
    } catch { /* continuar al fallback */ }
    try {
      const raw = localStorage.getItem(IDB.PROGRESS);
      if (raw) return JSON.parse(raw);
    } catch { /* ignorar */ }
    return defaultMoments();
  },

  /** Lanza si la escritura falla (el llamador muestra el error al usuario). */
  async saveProgress(moments: Moment[]): Promise<void> {
    await idbSet(IDB.PROGRESS, moments);
  },

  // ── Fecha de inicio / consentimiento (localStorage) ────────────────────────

  saveStartDate(dateIsoString: string) {
    localStorage.setItem(LS.START_DATE, dateIsoString);
  },

  loadStartDate(): string | null {
    return localStorage.getItem(LS.START_DATE);
  },

  hasConsented(): boolean {
    return !!localStorage.getItem(LS.START_DATE);
  },

  // ── Flags de onboarding (localStorage) ────────────────────────────────────

  markWelcomeSeen()       { localStorage.setItem(LS.SEEN_WELCOME, 'true'); },
  hasSeenWelcome()        { return localStorage.getItem(LS.SEEN_WELCOME) === 'true'; },
  markPermissionsSeen()   { localStorage.setItem(LS.SEEN_PERMISSIONS, 'true'); },
  hasSeenPermissions()    { return localStorage.getItem(LS.SEEN_PERMISSIONS) === 'true'; },
  markFidgetIntroSeen()   { localStorage.setItem(LS.SEEN_FIDGET, 'true'); },
  hasSeenFidgetIntro()    { return localStorage.getItem(LS.SEEN_FIDGET) === 'true'; },

  // ── Modo desarrollador (localStorage) ─────────────────────────────────────

  isDevMode()              { return localStorage.getItem(LS.DEV_MODE) === 'true'; },
  setDevMode(on: boolean)  { localStorage.setItem(LS.DEV_MODE, on ? 'true' : 'false'); },

  // ── Consentimiento del registro del fidget (localStorage) ─────────────────

  getFidgetConsent(): { granted: boolean; decidedAt: string } | null {
    try {
      const raw = localStorage.getItem('sonda_fidget_consent');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  setFidgetConsent(granted: boolean) {
    localStorage.setItem('sonda_fidget_consent', JSON.stringify({
      granted,
      decidedAt: new Date().toISOString(),
    }));
  },

  async clearFidgetLogs(): Promise<void> {
    await idbSet(IDB.USAGE, []);
    localStorage.removeItem(IDB.USAGE); // limpiar también el fallback pre-migración
  },

  // ── Perfil sensorial (localStorage — pequeño, se lee de forma síncrona) ───

  saveSensoryProfile(profile: SensoryProfile) {
    try { localStorage.setItem(LS.SENSORY, JSON.stringify(profile)); } catch { /* ignorar */ }
  },

  loadSensoryProfile(defaultProfile: SensoryProfile): SensoryProfile {
    try {
      const raw = localStorage.getItem(LS.SENSORY);
      if (raw) return { ...defaultProfile, ...JSON.parse(raw) };
    } catch { /* ignorar */ }
    return defaultProfile;
  },

  // ── Logs de uso (IDB) ─────────────────────────────────────────────────────

  async saveUsageLog(entry: object): Promise<void> {
    const logs = await storageService.loadUsageLogs();
    logs.push({ timestamp: new Date().toISOString(), ...entry });
    await idbSet(IDB.USAGE, logs);
  },

  async loadUsageLogs(): Promise<object[]> {
    try {
      const data = await idbGet<object[]>(IDB.USAGE);
      if (data) return data;
    } catch { /* continuar al fallback */ }
    try {
      const raw = localStorage.getItem(IDB.USAGE);
      if (raw) return JSON.parse(raw);
    } catch { /* ignorar */ }
    return [];
  },

  // ── Exportación ────────────────────────────────────────────────────────────

  /** Construye el blob del sobre de datos según la selección.
   *  selection por defecto = todo incluido (para exportaciones de emergencia). */
  async buildExportBlob(selection: ExportSelection = { bitacora: true, mensajeAlFuturo: true, fidget: true }): Promise<Blob> {
    const [allMoments, allUsageLogs] = await Promise.all([
      storageService.loadProgress(),
      storageService.loadUsageLogs(),
    ]);
    const sensoryRaw = localStorage.getItem(LS.SENSORY);

    const bitacora = allMoments.filter(m => !m.alwaysVisible);
    const mensajeFuturo = allMoments.filter(m => m.alwaysVisible);

    const progress = [
      ...(selection.bitacora ? bitacora : []),
      ...(selection.mensajeAlFuturo ? mensajeFuturo : []),
    ];

    const payload = {
      schemaVersion: '2.0',
      exportedAt: new Date().toISOString(),
      studyStartDate: storageService.loadStartDate(),
      seleccion: selection,
      omitido: {
        bitacora: !selection.bitacora,
        mensajeAlFuturo: !selection.mensajeAlFuturo,
        fidget: !selection.fidget,
      },
      progress,
      sensoryProfile: sensoryRaw ? JSON.parse(sensoryRaw) : null,
      usageLogs: selection.fidget ? allUsageLogs : [],
      deviceInfo: {
        userAgent: navigator.userAgent,
        screen: { width: window.screen.width, height: window.screen.height },
      },
    };

    return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  },

  exportFilename(): string {
    return `sonda_datos_${new Date().toISOString().split('T')[0]}.json`;
  },

  /** Descarga directa (fallback de emergencia, sin pantalla de revisión). */
  async exportData(selection?: ExportSelection): Promise<boolean> {
    try {
      const blob = await storageService.buildExportBlob(selection);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = storageService.exportFilename();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch {
      return false;
    }
  },

  emailHref(): string {
    const recipient = storageService.isDevMode() ? 'hspencer@ead.cl' : HELP_CONTENT.email;
    const subject = encodeURIComponent(HELP_CONTENT.subject);
    const body = encodeURIComponent(
      'Hola,\n\nAdjunto a este correo el archivo con mis datos de Sonda Digital.\n\nSaludos.'
    );
    return `mailto:${recipient}?subject=${subject}&body=${body}`;
  },

  // ── Borrado total ──────────────────────────────────────────────────────────

  async clearAllData() {
    await idbClear();
    Object.values(LS).forEach(k => localStorage.removeItem(k));
    // Limpiar también las claves IDB que puedan estar en localStorage (pre-migración)
    Object.values(IDB).forEach(k => localStorage.removeItem(k));
    window.location.reload();
  },
};
