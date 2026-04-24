import type { AppSettings, SRSRecord } from '../types';

const STORAGE_KEY_SRS = 'vocab-quiz-srs';
const STORAGE_KEY_SETTINGS = 'vocab-quiz-settings';

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  lastStudyDate: null,
  lastStudyMode: null,
};

export function saveSRSRecords(records: SRSRecord[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY_SRS, JSON.stringify(records));
    return true;
  } catch (error) {
    console.warn('[storage] Failed to save SRS records:', error);
    return false;
  }
}

export function loadSRSRecords(): SRSRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SRS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as SRSRecord[];
  } catch (error) {
    console.warn('[storage] Failed to load SRS records:', error);
    return [];
  }
}

export function saveSettings(settings: AppSettings): boolean {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.warn('[storage] Failed to save settings:', error);
    return false;
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (error) {
    console.warn('[storage] Failed to load settings:', error);
    return { ...DEFAULT_SETTINGS };
  }
}
