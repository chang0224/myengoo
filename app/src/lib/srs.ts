import type { SRSRating, SRSRecord } from '../types';

const MIN_EASE_FACTOR = 1.3;
const MAX_EASE_FACTOR = 4.0;

function clampEaseFactor(value: number): number {
  return Math.min(Math.max(value, MIN_EASE_FACTOR), MAX_EASE_FACTOR);
}

function getOverdueDays(record: SRSRecord, today: string): number {
  const todayDate = new Date(`${today}T00:00:00Z`);
  const nextReviewDate = new Date(`${record.nextReviewDate}T00:00:00Z`);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.floor((todayDate.getTime() - nextReviewDate.getTime()) / millisecondsPerDay);
}

export function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(dateISO: string, days: number): string {
  const date = new Date(`${dateISO}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function createNewSRSRecord(itemId: string): SRSRecord {
  return {
    itemId,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: getTodayISO(),
    lastReviewDate: '',
  };
}

export function reviewCard(record: SRSRecord, rating: SRSRating): SRSRecord {
  const today = getTodayISO();
  let repetitions = record.repetitions;
  let interval = record.interval;
  let easeFactor = record.easeFactor;

  switch (rating) {
    case 0:
      repetitions = 0;
      interval = 1;
      easeFactor = clampEaseFactor(easeFactor - 0.2);
      break;
    case 2:
      interval = repetitions === 0 ? 1 : Math.round(interval * 1.2);
      easeFactor = clampEaseFactor(easeFactor - 0.15);
      break;
    case 3:
      repetitions += 1;
      interval = repetitions === 1 ? 1 : repetitions === 2 ? 6 : Math.round(interval * easeFactor);
      break;
    case 5:
      repetitions += 1;
      interval = repetitions === 1 ? 4 : repetitions === 2 ? 6 : Math.round(interval * easeFactor * 1.3);
      easeFactor = clampEaseFactor(easeFactor + 0.15);
      break;
  }

  return {
    ...record,
    easeFactor,
    interval,
    repetitions,
    nextReviewDate: addDays(today, interval),
    lastReviewDate: today,
  };
}

export function getDueItems(records: SRSRecord[], today: string): SRSRecord[] {
  return records
    .filter((record) => record.nextReviewDate <= today)
    .sort((left, right) => getOverdueDays(right, today) - getOverdueDays(left, today));
}

export function getNewItems(allItemIds: string[], records: SRSRecord[]): string[] {
  const existingItemIds = new Set(records.map((record) => record.itemId));

  return allItemIds.filter((itemId) => !existingItemIds.has(itemId));
}
