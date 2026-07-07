import { useCallback, useEffect, useMemo, useState } from 'react';
import { addExcluded, loadExcluded } from '../../lib/storage';
import type { StudyItem } from '../../types/study';

interface Props {
	items: StudyItem[];
}

function shuffle<T>(arr: T[]): T[] {
	const copy = [...arr];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

function getFront(item: StudyItem): string {
	return item.type === 'word' ? item.word : item.expression;
}

export default function Flashcard({ items }: Props) {
	const [order, setOrder] = useState<StudyItem[]>(() => items);
	const [index, setIndex] = useState(0);
	const [flipped, setFlipped] = useState(false);

	const total = order.length;
	const current = order[index];

	const next = useCallback(() => {
		setIndex((i) => (i + 1) % Math.max(total, 1));
		setFlipped(false);
	}, [total]);

	const prev = useCallback(() => {
		setIndex((i) => (i - 1 + total) % Math.max(total, 1));
		setFlipped(false);
	}, [total]);

	const flip = useCallback(() => setFlipped((f) => !f), []);

	const reshuffle = useCallback(() => {
		const excludedIds = new Set(loadExcluded().map((r) => r.itemId));
		setOrder(shuffle(items.filter((item) => !excludedIds.has(item.id))));
		setIndex(0);
		setFlipped(false);
	}, [items]);

	useEffect(() => {
		const excludedIds = new Set(loadExcluded().map((r) => r.itemId));
		setOrder(items.filter((item) => !excludedIds.has(item.id)));
		setIndex(0);
		setFlipped(false);
	}, [items]);

	const handleKnow = useCallback(() => {
		if (!current) return;
		addExcluded(current.id);
		const nextOrder = order.filter((item) => item.id !== current.id);
		setOrder(nextOrder);
		if (nextOrder.length === 0) {
			setIndex(0);
		} else if (index >= nextOrder.length) {
			setIndex(nextOrder.length - 1);
		}
		setFlipped(false);
	}, [current, order, index]);

	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			const target = e.target as HTMLElement | null;
			if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;
			if (e.key === ' ' || e.code === 'Space') {
				e.preventDefault();
				flip();
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				next();
			} else if (e.key === 'ArrowLeft') {
				e.preventDefault();
				prev();
			} else if (e.key === 's' || e.key === 'S') {
				reshuffle();
			}
		}
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [flip, next, prev, reshuffle]);

	const cardStyle = useMemo<React.CSSProperties>(
		() => ({
			perspective: '1200px',
			minHeight: '320px',
		}),
		[]
	);

	if (total === 0 || !current) {
		return (
			<p className="text-center py-12" style={{ color: 'var(--muted)' }}>
				학습할 항목이 없어요.
			</p>
		);
	}

	const front = getFront(current);
	const ipa = current.type === 'word' ? current.ipa : '';
	const pos = current.type === 'word' ? current.pos : '';
	const back = current.type === 'useful-expression' ? current.meaningKo : current.definitionKo;
	const example = current.type === 'word'
		? current.exampleEn
		: current.type === 'useful-expression'
			? current.exampleEn
			: current.usageNoteKo ?? '';

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between text-sm" style={{ color: 'var(--muted)' }}>
				<span>{index + 1} / {total}</span>
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={handleKnow}
						className="text-sm hover:underline"
						style={{ color: '#16a34a', minHeight: '32px', padding: '0 4px' }}
					>
						✓ 알아요
					</button>
					<span>{current.type === 'word' ? '단어' : current.type === 'useful-expression' ? '유용한 표현' : '표현'}</span>
				</div>
			</div>

			<div style={cardStyle}>
				<button
					type="button"
					onClick={flip}
					className="w-full text-left"
					style={{
						position: 'relative',
						width: '100%',
						minHeight: '320px',
						transformStyle: 'preserve-3d',
						transition: 'transform 0.5s',
						transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
						background: 'transparent',
						border: 'none',
						cursor: 'pointer',
						padding: 0,
					}}
					aria-label="카드 뒤집기"
				>
					<div
						style={{
							position: 'absolute',
							inset: 0,
							backfaceVisibility: 'hidden',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							gap: '0.75rem',
							padding: '2rem',
							borderRadius: '0.75rem',
							backgroundColor: 'var(--card-bg)',
							border: '1px solid var(--border)',
							color: 'var(--fg)',
						}}
					>
						<div className="text-3xl font-bold text-center" style={{ wordBreak: 'keep-all' }}>
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
						<div className="text-xs mt-4" style={{ color: 'var(--muted)' }}>탭하거나 Space로 뒤집기</div>
					</div>

					<div
						style={{
							position: 'absolute',
							inset: 0,
							backfaceVisibility: 'hidden',
							transform: 'rotateY(180deg)',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							gap: '0.75rem',
							padding: '2rem',
							borderRadius: '0.75rem',
							backgroundColor: 'var(--card-bg)',
							border: '1px solid var(--border)',
							color: 'var(--fg)',
						}}
					>
						<div className="text-2xl font-semibold text-center" style={{ wordBreak: 'keep-all' }}>
							{back}
						</div>
						{example && (
							<div
								className="text-sm text-center mt-2 italic"
								style={{ color: 'var(--muted)', maxWidth: '90%' }}
							>
								{example}
							</div>
						)}
					</div>
				</button>
			</div>

			<div className="grid grid-cols-3 gap-2">
				<button
					type="button"
					onClick={prev}
					className="px-4 py-3 rounded-lg text-sm font-medium"
					style={{
						backgroundColor: 'var(--card-bg)',
						color: 'var(--fg)',
						border: '1px solid var(--border)',
						minHeight: '44px',
					}}
				>
					← 이전
				</button>
				<button
					type="button"
					onClick={flip}
					className="px-4 py-3 rounded-lg text-sm font-medium"
					style={{
						backgroundColor: 'var(--fg)',
						color: 'var(--bg)',
						minHeight: '44px',
					}}
				>
					{flipped ? '앞면' : '뒤집기'}
				</button>
				<button
					type="button"
					onClick={next}
					className="px-4 py-3 rounded-lg text-sm font-medium"
					style={{
						backgroundColor: 'var(--card-bg)',
						color: 'var(--fg)',
						border: '1px solid var(--border)',
						minHeight: '44px',
					}}
				>
					다음 →
				</button>
			</div>

			<div className="flex justify-center">
				<button
					type="button"
					onClick={reshuffle}
					className="px-4 py-2 rounded-lg text-sm"
					style={{
						color: 'var(--muted)',
						border: '1px solid var(--border)',
						minHeight: '44px',
					}}
				>
					🔀 셔플 (S)
				</button>
			</div>
		</div>
	);
}
