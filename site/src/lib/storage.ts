import { getLocalISO } from './dateLocal';
import { DEFAULT_SETTINGS, type ExcludedRecord, type SRSRecord, type StudySettings } from '../types/study';

const SRS_KEY = 'myengoo:srs:v1';
const SETTINGS_KEY = 'myengoo:settings:v1';
const EXCLUDED_KEY = 'myengoo:excluded:v1';

function isBrowser(): boolean {
	return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function loadSRS(): SRSRecord[] {
	if (!isBrowser()) return [];
	try {
		const raw = localStorage.getItem(SRS_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed as SRSRecord[];
	} catch (err) {
		console.warn('Failed to load SRS records:', err);
		return [];
	}
}

export function saveSRS(records: SRSRecord[]): void {
	if (!isBrowser()) return;
	try {
		localStorage.setItem(SRS_KEY, JSON.stringify(records));
	} catch (err) {
		console.warn('Failed to save SRS records:', err);
	}
}

export function upsertSRSRecord(record: SRSRecord): SRSRecord[] {
	const records = loadSRS();
	const idx = records.findIndex((r) => r.itemId === record.itemId);
	const next = [...records];
	if (idx >= 0) {
		next[idx] = record;
	} else {
		next.push(record);
	}
	saveSRS(next);
	return next;
}

export function loadSettings(): StudySettings {
	if (!isBrowser()) return DEFAULT_SETTINGS;
	try {
		const raw = localStorage.getItem(SETTINGS_KEY);
		if (!raw) return DEFAULT_SETTINGS;
		const parsed = JSON.parse(raw) as Partial<StudySettings>;
		return { ...DEFAULT_SETTINGS, ...parsed };
	} catch (err) {
		console.warn('Failed to load settings:', err);
		return DEFAULT_SETTINGS;
	}
}

export function saveSettings(settings: StudySettings): void {
	if (!isBrowser()) return;
	try {
		localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
	} catch (err) {
		console.warn('Failed to save settings:', err);
	}
}

export function loadExcluded(): ExcludedRecord[] {
	if (!isBrowser()) return [];
	try {
		const raw = localStorage.getItem(EXCLUDED_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed as ExcludedRecord[];
	} catch (err) {
		console.warn('Failed to load excluded records:', err);
		return [];
	}
}

export function saveExcluded(records: ExcludedRecord[]): void {
	if (!isBrowser()) return;
	try {
		localStorage.setItem(EXCLUDED_KEY, JSON.stringify(records));
	} catch (err) {
		console.warn('Failed to save excluded records:', err);
	}
}

export function addExcluded(itemId: string): ExcludedRecord[] {
	const records = loadExcluded();
	if (records.some((r) => r.itemId === itemId)) return records;
	const next = [...records, { itemId, excludedAt: getLocalISO() }];
	saveExcluded(next);
	return next;
}

export function removeExcluded(itemId: string): ExcludedRecord[] {
	const records = loadExcluded();
	const next = records.filter((r) => r.itemId !== itemId);
	saveExcluded(next);
	return next;
}

export function clearExcluded(): void {
	saveExcluded([]);
}
