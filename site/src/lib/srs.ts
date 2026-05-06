import type { SRSRating, SRSRecord } from '../types/study';
import { addDaysLocal, diffDaysLocal, getLocalISO } from './dateLocal';

const MIN_EASE_FACTOR = 1.3;
const MAX_EASE_FACTOR = 4.0;
const INITIAL_EASE_FACTOR = 2.5;

function clampEaseFactor(value: number): number {
	return Math.min(Math.max(value, MIN_EASE_FACTOR), MAX_EASE_FACTOR);
}

export function createNewSRSRecord(itemId: string): SRSRecord {
	return {
		itemId,
		easeFactor: INITIAL_EASE_FACTOR,
		interval: 0,
		repetitions: 0,
		nextReviewDate: getLocalISO(),
		lastReviewDate: '',
	};
}

export function reviewCard(record: SRSRecord, rating: SRSRating): SRSRecord {
	const today = getLocalISO();
	let { repetitions, interval, easeFactor } = record;

	switch (rating) {
		case 0:
			repetitions = 0;
			interval = 1;
			easeFactor = clampEaseFactor(easeFactor - 0.2);
			break;
		case 2:
			interval = repetitions === 0 ? 1 : Math.max(1, Math.round(interval * 1.2));
			easeFactor = clampEaseFactor(easeFactor - 0.15);
			break;
		case 3:
			repetitions += 1;
			interval =
				repetitions === 1 ? 1 : repetitions === 2 ? 6 : Math.round(interval * easeFactor);
			break;
		case 5:
			repetitions += 1;
			interval =
				repetitions === 1
					? 4
					: repetitions === 2
						? 6
						: Math.round(interval * easeFactor * 1.3);
			easeFactor = clampEaseFactor(easeFactor + 0.15);
			break;
	}

	return {
		...record,
		easeFactor,
		interval,
		repetitions,
		nextReviewDate: addDaysLocal(today, interval),
		lastReviewDate: today,
	};
}

export function getDueRecords(records: SRSRecord[], today: string = getLocalISO()): SRSRecord[] {
	return records
		.filter((record) => record.nextReviewDate <= today)
		.sort((left, right) => {
			const leftOverdue = diffDaysLocal(left.nextReviewDate, today);
			const rightOverdue = diffDaysLocal(right.nextReviewDate, today);
			return rightOverdue - leftOverdue;
		});
}

export function getNewItemIds(allItemIds: string[], records: SRSRecord[]): string[] {
	const existing = new Set(records.map((r) => r.itemId));
	return allItemIds.filter((id) => !existing.has(id));
}

export function countDueItems(records: SRSRecord[], today: string = getLocalISO()): number {
	return records.filter((record) => record.nextReviewDate <= today).length;
}
