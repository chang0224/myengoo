import { useCallback, useEffect, useMemo, useState } from 'react';
import { getLocalISO } from '../../lib/dateLocal';
import { createNewSRSRecord, getDueRecords, reviewCard } from '../../lib/srs';
import { loadSRS, upsertSRSRecord } from '../../lib/storage';
import {
	SRS_RATING_AGAIN,
	SRS_RATING_EASY,
	SRS_RATING_GOOD,
	SRS_RATING_HARD,
	type SRSRating,
	type SRSRecord,
	type StudyItem,
} from '../../types/study';

interface Props {
	allItems: StudyItem[];
	newItemBatchSize?: number;
}

interface QueueEntry {
	item: StudyItem;
	record: SRSRecord;
	isNew: boolean;
}

const RATING_BUTTONS: Array<{ rating: SRSRating; label: string; color: string; hint: string }> = [
	{ rating: SRS_RATING_AGAIN, label: 'Again', color: '#dc2626', hint: '다시 (1일)' },
	{ rating: SRS_RATING_HARD, label: 'Hard', color: '#ea580c', hint: '어려움' },
	{ rating: SRS_RATING_GOOD, label: 'Good', color: '#16a34a', hint: '좋음' },
	{ rating: SRS_RATING_EASY, label: 'Easy', color: '#2563eb', hint: '쉬움 (긴 간격)' },
];

function getFront(item: StudyItem): string {
	return item.type === 'word' ? item.word : item.expression;
}

export default function Review({ allItems, newItemBatchSize = 10 }: Props) {
	const itemMap = useMemo(() => {
		const map = new Map<string, StudyItem>();
		for (const item of allItems) map.set(item.id, item);
		return map;
	}, [allItems]);

	const [queue, setQueue] = useState<QueueEntry[]>([]);
	const [index, setIndex] = useState(0);
	const [flipped, setFlipped] = useState(false);
	const [reviewedCount, setReviewedCount] = useState(0);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		const records = loadSRS();
		const today = getLocalISO();

		const recordById = new Map(records.map((r) => [r.itemId, r]));
		const dueRecords = getDueRecords(records, today);
		const dueQueue: QueueEntry[] = [];
		for (const record of dueRecords) {
			const item = itemMap.get(record.itemId);
			if (!item) continue;
			dueQueue.push({ item, record, isNew: false });
		}

		const newItems = allItems
			.filter((item) => !recordById.has(item.id))
			.slice(0, newItemBatchSize);

		const newQueue: QueueEntry[] = newItems.map((item) => ({
			item,
			record: createNewSRSRecord(item.id),
			isNew: true,
		}));

		setQueue([...dueQueue, ...newQueue]);
		setIndex(0);
		setFlipped(false);
		setReviewedCount(0);
		setHydrated(true);
	}, [allItems, itemMap, newItemBatchSize]);

	const current = queue[index];

	const flip = useCallback(() => setFlipped((f) => !f), []);

	const rate = useCallback(
		(rating: SRSRating) => {
			if (!current) return;
			const updated = reviewCard(current.record, rating);
			upsertSRSRecord(updated);
			setReviewedCount((c) => c + 1);
			setIndex((i) => i + 1);
			setFlipped(false);
		},
		[current]
	);

	useEffect(() => {
		if (!current) return;
		function onKeyDown(e: KeyboardEvent) {
			const target = e.target as HTMLElement | null;
			if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;
			if (e.key === ' ' || e.code === 'Space') {
				e.preventDefault();
				flip();
				return;
			}
			if (!flipped) return;
			if (e.key === '1') rate(SRS_RATING_AGAIN);
			else if (e.key === '2') rate(SRS_RATING_HARD);
			else if (e.key === '3') rate(SRS_RATING_GOOD);
			else if (e.key === '4') rate(SRS_RATING_EASY);
		}
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [current, flipped, flip, rate]);

	if (!hydrated) {
		return (
			<p className="text-center py-12" style={{ color: 'var(--muted)' }}>
				복습 큐를 불러오는 중…
			</p>
		);
	}

	if (queue.length === 0) {
		return (
			<div className="rounded-lg p-8 text-center" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
				<div className="text-5xl mb-4">✨</div>
				<h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--fg)' }}>오늘 복습할 카드가 없어요</h2>
				<p className="text-sm" style={{ color: 'var(--muted)' }}>
					새 단어를 학습하거나 내일 다시 와보세요.
				</p>
			</div>
		);
	}

	if (!current) {
		return (
			<div className="rounded-lg p-8 text-center" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
				<div className="text-5xl mb-4">🎉</div>
				<h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--fg)' }}>오늘의 복습 완료!</h2>
				<p className="text-sm" style={{ color: 'var(--muted)' }}>
					{reviewedCount}개 카드를 복습했어요. 내일 다시 만나요.
				</p>
			</div>
		);
	}

	const front = getFront(current.item);
	const ipa = current.item.type === 'word' ? current.item.ipa : '';
	const pos = current.item.type === 'word' ? current.item.pos : '';
	const back = current.item.definitionKo;
	const example =
		current.item.type === 'word' ? current.item.exampleEn : current.item.usageNoteKo ?? '';

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between text-sm" style={{ color: 'var(--muted)' }}>
				<span>{index + 1} / {queue.length}</span>
				<span>{current.isNew ? '신규' : `복습 ${current.record.repetitions + 1}회`}</span>
			</div>

			<div
				className="rounded-lg p-8"
				style={{
					backgroundColor: 'var(--card-bg)',
					border: '1px solid var(--border)',
					minHeight: '280px',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					gap: '0.75rem',
				}}
			>
				<div
					className="text-3xl font-bold text-center"
					style={{ color: 'var(--fg)', wordBreak: 'keep-all' }}
				>
					{front}
				</div>
				{ipa && (
					<div className="font-mono text-base" style={{ color: 'var(--muted)' }}>/{ipa}/</div>
				)}
				{pos && (
					<div
						className="text-xs px-2 py-0.5 rounded"
						style={{ backgroundColor: 'var(--border)', color: 'var(--fg)' }}
					>{pos}</div>
				)}
				{flipped && (
					<>
						<div
							style={{
								borderTop: '1px solid var(--border)',
								width: '100%',
								margin: '1rem 0',
							}}
						/>
						<div
							className="text-xl font-semibold text-center"
							style={{ color: 'var(--fg)', wordBreak: 'keep-all' }}
						>
							{back}
						</div>
						{example && (
							<div
								className="text-sm text-center italic mt-1"
								style={{ color: 'var(--muted)', maxWidth: '90%' }}
							>
								{example}
							</div>
						)}
					</>
				)}
			</div>

			{!flipped ? (
				<button
					type="button"
					onClick={flip}
					className="w-full px-6 py-4 rounded-lg font-semibold"
					style={{
						backgroundColor: 'var(--fg)',
						color: 'var(--bg)',
						minHeight: '52px',
					}}
				>
					답 보기 (Space)
				</button>
			) : (
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
					{RATING_BUTTONS.map((btn, i) => (
						<button
							key={btn.rating}
							type="button"
							onClick={() => rate(btn.rating)}
							className="px-3 py-3 rounded-lg font-medium text-sm"
							style={{
								backgroundColor: btn.color,
								color: '#fff',
								minHeight: '56px',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								gap: '0.125rem',
							}}
						>
							<span>{i + 1}. {btn.label}</span>
							<span style={{ opacity: 0.85, fontSize: '0.7rem' }}>{btn.hint}</span>
						</button>
					))}
				</div>
			)}

			<p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
				총 {reviewedCount}개 복습 · 다음 카드까지 진행 중
			</p>
		</div>
	);
}
