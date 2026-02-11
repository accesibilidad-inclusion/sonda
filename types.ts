
export enum AppScreen {
  ONBOARDING_WELCOME = 'ONBOARDING_WELCOME',
  ONBOARDING_CONSENT = 'ONBOARDING_CONSENT',
  ONBOARDING_TUTORIAL = 'ONBOARDING_TUTORIAL',
  DASHBOARD = 'DASHBOARD',
  ACTIVITY_VIEW = 'ACTIVITY_VIEW',
  FIDGET_MODE = 'FIDGET_MODE',
  COMPLETION = 'COMPLETION'
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
  content: string | null; // Text content or Base64/URL for media
  timestamp: number;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  scaffoldExample?: string; // "Andamiaje"
  isCompleted: boolean;
  responses: ResponseItem[]; // Changed from single response to array
}

export interface WeekModule {
  id: number;
  title: string;
  goal: string;
  isLocked: boolean;
  activities: Activity[];
}

export interface FidgetSession {
  startTime: string; // ISO 8601 timestamp when user started the fidget
  durationSeconds: number; // Length of the session in seconds
  shots: number; // Number of times the ball was released from the slingshot
  drags: number; // Number of times the ball was grabbed/dragged
}

// Sensory Profile Types
export type ThemeType = 'default' | 'high-contrast' | 'warm';
export type FontSizeType = 'normal' | 'large' | 'extra';
export type SoundType = 'off' | 'white' | 'pink' | 'brown';

export interface SensoryProfile {
  theme: ThemeType;
  fontSize: FontSizeType;
  reducedMotion: boolean;
  dyslexiaFont: boolean;
  sound: SoundType;
  soundVolume: number; // 0 to 1
}