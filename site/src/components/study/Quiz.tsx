import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	generateQuizSession,
	type QuizDirection,
	type QuizQuestion,
} from '../../lib/quiz';
import { addExcluded, loadExcluded, loadSettings, saveSettings } from '../../lib/storage';
import type { StudyItem } from '../../types/study';

interface Props {
	items: StudyItem[];
}

type QuizStatus = 'idle' | 'in-progress' | 'finished';

function eligibleForDirection(items: StudyItem[]): boolean {
	const wordCount = items.filter((i) => i.type === 'word').length;
	const expressionCount = items.filter((i) => i.type === 'expression').length;
	return wordCount >= 4 || expressionCount >= 4;
}

export default function Quiz({ items }: Props) {
	const [direction, setDirection] = useState<QuizDirection>('en-to-kr');
	const [status, setStatus] = useState<QuizStatus>('idle');
	const [questions, setQuestions] = useState<QuizQuestion[]>([]);
	const [index, setIndex] = useState(0);
	const [selected, setSelected] = useState<number | null>(null);
	const [correctCount, setCorrectCount] = useState(0);

	const wordCount = useMemo(() => items.filter((i) => i.type === 'word').length, [items]);
	const expressionCount = useMemo(
		() => items.filter((i) => i.type === 'expression').length,
		[items]
	);

	useEffect(() => {
		const settings = loadSettings();
		setDirection(settings.quizDirection);
	}, []);

	const persistDirection = useCallback((next: QuizDirection) => {
		setDirection(next);
		const settings = loadSettings();
		saveSettings({ ...settings, quizDirection: next });
	}, []);

	const start = useCallback(() => {
		const excludedIds = new Set(loadExcluded().map((r) => r.itemId));
		const eligible = items.filter((item) => !excludedIds.has(item.id));
		const session = generateQuizSession(eligible, direction);
		if (session.length === 0) return;
		setQuestions(session);
		setIndex(0);
		setSelected(null);
		setCorrectCount(0);
		setStatus('in-progress');
	}, [items, direction]);

	const current = questions[index];

	const select = useCallback(
		(optionIndex: number) => {
			if (selected !== null || !current) return;
			setSelected(optionIndex);
			if (optionIndex === current.correctIndex) {
				setCorrectCount((c) => c + 1);
			}
		},
		[selected, current]
	);

	const next = useCallback(() => {
		if (selected === null) return;
		if (index + 1 >= questions.length) {
			setStatus('finished');
			return;
		}
		setIndex((i) => i + 1);
		setSelected(null);
	}, [selected, index, questions.length]);

	const restart = useCallback(() => {
		setStatus('idle');
		setQuestions([]);
		setIndex(0);
		setSelected(null);
		setCorrectCount(0);
	}, []);

	const handleKnow = useCallback(() => {
		if (!current || selected !== null) return;
		addExcluded(current.item.id);
		const nextQuestions = questions.filter((q) => q.item.id !== current.item.id);
		setQuestions(nextQuestions);
		if (nextQuestions.length === 0) {
			setStatus('finished');
			return;
		}
		if (index >= nextQuestions.length) {
			setIndex(nextQuestions.length - 1);
		}
		setSelected(null);
	}, [current, selected, questions, index]);

	useEffect(() => {
		if (status !== 'in-progress') return;
		function onKeyDown(e: KeyboardEvent) {
			const target = e.target as HTMLElement | null;
			if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;
			if (e.key >= '1' && e.key <= '4') {
				const optionIndex = Number(e.key) - 1;
				if (current && optionIndex < current.options.length) {
					e.preventDefault();
					select(optionIndex);
				}
			} else if (e.key === 'Enter') {
				e.preventDefault();
				next();
			}
		}
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [status, current, select, next]);

	if (!eligibleForDirection(items)) {
		return (
			<p className="text-center py-12" style={{ color: 'var(--muted)' }}>
				4지선다 퀴즈는 단어 또는 표현이 4개 이상 있어야 시작할 수 있어요.
				<br />
				현재 단어 {wordCount}개, 표현 {expressionCount}개.
			</p>
		);
	}

	if (status === 'idle') {
		return (
			<div className="space-y-6">
				<div className="rounded-lg p-5" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
					<h2 className="font-semibold mb-3" style={{ color: 'var(--fg)' }}>퀴즈 설정</h2>
					<div className="space-y-3">
						<div>
							<div className="text-sm mb-2" style={{ color: 'var(--muted)' }}>출제 방향</div>
							<div className="grid grid-cols-2 gap-2">
								{(['en-to-kr', 'kr-to-en'] as const).map((dir) => (
									<button
										key={dir}
										type="button"
										onClick={() => persistDirection(dir)}
										className="px-4 py-3 rounded-lg text-sm font-medium"
										style={{
											backgroundColor: direction === dir ? 'var(--fg)' : 'var(--card-bg)',
											color: direction === dir ? 'var(--bg)' : 'var(--fg)',
											border: '1px solid var(--border)',
											minHeight: '44px',
										}}
									>
										{dir === 'en-to-kr' ? '영어 → 한국어' : '한국어 → 영어'}
									</button>
								))}
							</div>
						</div>
						<div className="text-sm" style={{ color: 'var(--muted)' }}>
							총 {items.length}개 항목 (단어 {wordCount}, 표현 {expressionCount})
							<br />
							문제는 같은 유형 안에서 출제되며 각 항목당 1문제 출제됩니다.
						</div>
					</div>
				</div>

				<button
					type="button"
					onClick={start}
					className="w-full px-6 py-4 rounded-lg font-semibold"
					style={{
						backgroundColor: 'var(--fg)',
						color: 'var(--bg)',
						minHeight: '52px',
					}}
				>
					퀴즈 시작
				</button>
			</div>
		);
	}

	if (status === 'finished') {
		const percent = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
		return (
			<div className="space-y-6 text-center">
				<div
					className="rounded-lg p-8"
					style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
				>
					<div className="text-5xl mb-4">🎉</div>
					<h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--fg)' }}>퀴즈 완료!</h2>
					<p className="text-lg" style={{ color: 'var(--fg)' }}>
						{correctCount} / {questions.length} 정답 · {percent}%
					</p>
				</div>
				<div className="grid grid-cols-2 gap-3">
					<button
						type="button"
						onClick={restart}
						className="px-4 py-3 rounded-lg font-medium"
						style={{
							backgroundColor: 'var(--card-bg)',
							color: 'var(--fg)',
							border: '1px solid var(--border)',
							minHeight: '44px',
						}}
					>
						설정 변경
					</button>
					<button
						type="button"
						onClick={start}
						className="px-4 py-3 rounded-lg font-medium"
						style={{
							backgroundColor: 'var(--fg)',
							color: 'var(--bg)',
							minHeight: '44px',
						}}
					>
						다시 풀기
					</button>
				</div>
			</div>
		);
	}

	if (!current) return null;

	const showFeedback = selected !== null;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between text-sm" style={{ color: 'var(--muted)' }}>
				<span>{index + 1} / {questions.length}</span>
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={handleKnow}
						disabled={selected !== null}
						className="text-sm hover:underline"
						style={{
							color: '#16a34a',
							minHeight: '32px',
							padding: '0 4px',
							opacity: selected !== null ? 0.4 : 1,
							cursor: selected !== null ? 'not-allowed' : 'pointer',
						}}
					>
						✓ 알아요
					</button>
					<span>정답 {correctCount}</span>
				</div>
			</div>

			<div
				className="rounded-lg p-6"
				style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
			>
				<div className="text-xs mb-2" style={{ color: 'var(--muted)' }}>
					{direction === 'en-to-kr' ? '이 단어/표현의 뜻은?' : '다음 뜻에 해당하는 영어는?'}
				</div>
				<div
					className="text-2xl font-bold text-center py-6"
					style={{ color: 'var(--fg)', wordBreak: 'keep-all' }}
				>
					{current.question}
				</div>
			</div>

			<div className="grid gap-2">
				{current.options.map((option, i) => {
					const isSelected = selected === i;
					const isCorrect = i === current.correctIndex;
					let bg = 'var(--card-bg)';
					let border = 'var(--border)';
					if (showFeedback) {
						if (isCorrect) {
							bg = '#16a34a';
							border = '#16a34a';
						} else if (isSelected) {
							bg = '#dc2626';
							border = '#dc2626';
						}
					}
					const fg = showFeedback && (isCorrect || isSelected) ? '#fff' : 'var(--fg)';
					return (
						<button
							key={i}
							type="button"
							onClick={() => select(i)}
							disabled={showFeedback}
							className="px-4 py-3 rounded-lg text-left text-base"
							style={{
								backgroundColor: bg,
								color: fg,
								border: `1px solid ${border}`,
								minHeight: '52px',
								cursor: showFeedback ? 'default' : 'pointer',
								wordBreak: 'keep-all',
							}}
						>
							<span style={{ opacity: 0.6, marginRight: '0.5rem' }}>{i + 1}.</span>
							{option}
						</button>
					);
				})}
			</div>

			{showFeedback && (
				<button
					type="button"
					onClick={next}
					className="w-full px-4 py-3 rounded-lg font-semibold"
					style={{
						backgroundColor: 'var(--fg)',
						color: 'var(--bg)',
						minHeight: '48px',
					}}
				>
					{index + 1 >= questions.length ? '결과 보기' : '다음 문제'} (Enter)
				</button>
			)}
		</div>
	);
}
