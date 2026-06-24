
export enum AppScreen {
  // Contexto navegador
  ONBOARDING_CONSENT = 'ONBOARDING_CONSENT',
  ONBOARDING_INSTALL = 'ONBOARDING_INSTALL',
  // Contexto PWA
  ONBOARDING_WELCOME = 'ONBOARDING_WELCOME',
  ONBOARDING_PERMISSIONS = 'ONBOARDING_PERMISSIONS',
  // App principal
  DASHBOARD = 'DASHBOARD',
  ACTIVITY_VIEW = 'ACTIVITY_VIEW',
  DEV_PANEL = 'DEV_PANEL',
}

export enum ResponseMode {
  TEXT = 'TEXT',
  AUDIO = 'AUDIO',
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
  SKIPPED = 'SKIPPED'
}

export interface ResponseItem {
  mode: ResponseMode;
  content: string | null; // Texto o Base64/URL para media
  timestamp: number;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  scaffoldExample?: string;
  allowedModes: ResponseMode[];   // Modalidades habilitadas para esta actividad
  tacDimension: string | null;    // Dimensión TAC (Volitiva / Agencial / Creencias de control-acción)
  tacSubdimension: string | null; // Subdimensión TAC (Autonomía, Autorregulación, etc.)
  isCompleted: boolean;           // true si responses.length > 0 (incluye SKIPPED)
  responses: ResponseItem[];
}

export interface Moment {
  id: number;
  title: string;
  goal: string;
  isLocked: boolean;
  alwaysVisible: boolean; // true solo para el Cierre (Momento 12)
  activities: Activity[];
}

export interface FidgetSession {
  startTime: string;
  durationSeconds: number;
  shots: number;
  drags: number;
}

export type ThemeType = 'default' | 'high-contrast' | 'warm';
export type FontSizeType = 'normal' | 'large' | 'extra';
export type SoundType = 'off' | 'white' | 'pink' | 'brown';

export interface SensoryProfile {
  theme: ThemeType;
  fontSize: FontSizeType;
  reducedMotion: boolean;
  dyslexiaFont: boolean;
  sound: SoundType;
  soundVolume: number;
}
