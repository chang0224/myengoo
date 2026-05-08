import { useEffect, useMemo, useState } from 'react';
import { clearExcluded, loadExcluded, removeExcluded } from '../../lib/storage';
import type { ExcludedRecord, StudyItem } from '../../types/study';

interface Props {
	allItems: StudyItem[];
}

interface DisplayEntry {
	itemId: string;
	excludedAt: string;
	item: StudyItem | null;
}

function getFront(item: StudyItem): string {
	return item.type === 'word' ? item.word : item.expression;
}

export default function ExcludedSettings({ allItems }: Props) {
	const [records, setRecords] = useState<ExcludedRecord[]>([]);
	const [hydrated, setHydrated] = useState(false);
	const [confirmingClear, setConfirmingClear] = useState(false);

	useEffect(() => {
		setRecords(loadExcluded());
		setHydrated(true);
	}, []);

	const itemMap = useMemo(() => {
		const map = new Map<string, StudyItem>();
		for (const item of allItems) map.set(item.id, item);
		return map;
	}, [allItems]);

	const display = useMemo<DisplayEntry[]>(
		() =>
			[...records]
				.sort((a, b) => b.excludedAt.localeCompare(a.excludedAt))
				.map((r) => ({
					itemId: r.itemId,
					excludedAt: r.excludedAt,
					item: itemMap.get(r.itemId) ?? null,
				})),
		[records, itemMap]
	);

	function handleRestore(itemId: string) {
		const next = removeExcluded(itemId);
		setRecords(next);
	}

	function handleClearAll() {
		if (!confirmingClear) {
			setConfirmingClear(true);
			return;
		}
		clearExcluded();
		setRecords([]);
		setConfirmingClear(false);
	}

	if (!hydrated) {
		return (
			<p className="text-center py-12" style={{ color: 'var(--muted)' }}>
				불러오는 중…
			</p>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-3 flex-wrap">
				<div>
					<h2 className="text-base font-semibold" style={{ color: 'var(--fg)' }}>
						제외한 단어
					</h2>
					<p className="text-sm" style={{ color: 'var(--muted)' }}>
						{records.length === 0
							? '학습에서 제외한 단어가 없습니다.'
							: `${records.length}개 단어가 학습에서 제외되었습니다.`}
					</p>
				</div>
				{records.length > 0 && (
					<button
						type="button"
						onClick={handleClearAll}
						onBlur={() => setConfirmingClear(false)}
						className="text-sm px-3 py-2 rounded-lg font-medium"
						style={{
							backgroundColor: confirmingClear ? '#dc2626' : 'transparent',
							color: confirmingClear ? '#fff' : '#dc2626',
							border: `1px solid ${confirmingClear ? '#dc2626' : 'var(--border)'}`,
							minHeight: '40px',
						}}
					>
						{confirmingClear ? '정말 모두 복원?' : '전체 복원'}
					</button>
				)}
			</div>

			{display.length === 0 ? (
				<div
					className="rounded-lg p-8 text-center"
					style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
				>
					<div className="text-4xl mb-3">📭</div>
					<p className="text-sm" style={{ color: 'var(--muted)' }}>
						학습 화면에서 '✓ 알아요' 버튼을 누르면 여기에 표시됩니다.
					</p>
				</div>
			) : (
				<ul className="space-y-2">
					{display.map(({ itemId, excludedAt, item }) => {
						const label = item ? getFront(item) : itemId;
						const meaning = item?.definitionKo ?? '';
						const typeLabel = item?.type === 'expression' ? '표현' : '단어';

						return (
							<li
								key={itemId}
								className="flex items-center justify-between gap-3 p-3 rounded-lg"
								style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
							>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-1">
										<span
											className="text-xs font-medium px-2 py-0.5 rounded"
											style={{ backgroundColor: 'var(--border)', color: 'var(--fg)' }}
										>
											{typeLabel}
										</span>
										<p className="font-semibold truncate" style={{ color: 'var(--fg)' }}>
											{label}
										</p>
									</div>
									{meaning && (
										<p className="text-sm truncate" style={{ color: 'var(--muted)' }}>
											{meaning}
										</p>
									)}
									<p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
										제외일: {excludedAt}
									</p>
								</div>
								<button
									type="button"
									onClick={() => handleRestore(itemId)}
									className="text-sm font-medium px-3 py-2 rounded-lg flex-shrink-0"
									style={{
										color: 'var(--fg)',
										border: '1px solid var(--border)',
										minHeight: '40px',
									}}
								>
									복원
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
