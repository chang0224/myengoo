import { useCallback, useEffect, useRef, useState } from 'react';
import StudyScopeSelector from '../components/StudyScopeSelector';
import { useStudyScope } from '../hooks/useStudyScope';
import { useExcludedItems } from '../hooks/useVocabulary';
import { generateItemId } from '../lib/parser';
import type { KeyExpression, StudyItem, VocabularyWord } from '../types';

function CardFront({ item }: { item: StudyItem }) {
  if (item.type === 'word') {
    const word = item as VocabularyWord;
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">단어</span>
        <p className="text-3xl font-bold text-gray-900 dark:text-white text-center">{word.word}</p>
        <p className="text-base text-gray-500 dark:text-gray-400 font-mono">{word.ipa}</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">[{word.partOfSpeech}]</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">탭하여 뒤집기</p>
      </div>
    );
  }
  const expr = item as KeyExpression;
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">표현</span>
      <p className="text-2xl font-bold text-gray-900 dark:text-white text-center">{expr.expression}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">탭하여 뒤집기</p>
    </div>
  );
}

function CardBack({ item }: { item: StudyItem }) {
  if (item.type === 'word') {
    const word = item as VocabularyWord;
    return (
<div className="flex flex-col items-center justify-center h-full gap-3 p-6">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">단어</span>
        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 text-center">{word.definition}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center italic mt-2">"{word.exampleSentence}"</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">{word.contextRef}: {word.contextQuote}</p>
      </div>
    );
  }
  const expr = item as KeyExpression;
  return (
<div className="flex flex-col items-center justify-center h-full gap-3 p-6">
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">표현</span>
      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 text-center">{expr.koreanExplanation}</p>
      <p className="text-sm text-gray-600 dark:text-gray-300 text-center italic mt-2">"{expr.contextQuote}"</p>
    </div>
  );
}

export default function FlashcardPage() {
  const { dateRange, setDateRange, filteredItems } = useStudyScope();
  const { excludeItem } = useExcludedItems();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffled, setShuffled] = useState<StudyItem[]>([]);

  const dateRangeKey = dateRange ? `${dateRange.start}_${dateRange.end}` : 'all';
  const lastDateRangeKeyRef = useRef<string>('');

  useEffect(() => {
    const isDateRangeChanged = lastDateRangeKeyRef.current !== dateRangeKey;
    lastDateRangeKeyRef.current = dateRangeKey;

    if (isDateRangeChanged || (shuffled.length === 0 && filteredItems.length > 0)) {
      setShuffled([...filteredItems]);
      setIndex(0);
      setFlipped(false);
    }
  }, [dateRangeKey, filteredItems, shuffled.length]);

  const current = shuffled[index];
  const total = shuffled.length;

  const goNext = useCallback(() => {
    setFlipped(false);
    setTimeout(() => setIndex(i => Math.min(i + 1, total - 1)), 150);
  }, [total]);

  const goPrev = useCallback(() => {
    setFlipped(false);
    setTimeout(() => setIndex(i => Math.max(i - 1, 0)), 150);
  }, []);

  const handleShuffle = useCallback(() => {
    const arr = [...filteredItems];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffled(arr);
    setIndex(0);
    setFlipped(false);
  }, [filteredItems]);

  const handleKnow = useCallback(() => {
    if (!current) return;
    const key = current.type === 'word' ? current.word : current.expression;
    excludeItem(generateItemId(current.sourceFile, key));

    const next = [...shuffled];
    next.splice(index, 1);
    setShuffled(next);

    if (index >= next.length && next.length > 0) {
      setIndex(next.length - 1);
    } else if (next.length === 0) {
      setIndex(0);
    }
    setFlipped(false);
  }, [current, shuffled, index, excludeItem]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFlipped(f => !f); }
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  return (
    <div className="flex flex-col">
      <StudyScopeSelector dateRange={dateRange} onChangeDateRange={setDateRange} />

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-gray-500 dark:text-gray-400">선택한 범위에 단어가 없습니다.</p>
        </div>
      ) : (
        <div className="flex flex-col flex-1 p-4 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">{index + 1} / {total}</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleKnow}
                className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                ✓ 알아요
              </button>
              <button
                type="button"
                onClick={handleShuffle}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                🔀 섞기
              </button>
            </div>
          </div>

          <div
            className="cursor-pointer h-[60vh]"
            style={{ perspective: '1000px' }}
            onClick={() => setFlipped(f => !f)}
          >
            <div
              className="relative w-full h-full transition-transform duration-500"
              style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
              <div className="absolute inset-0 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
                   style={{ backfaceVisibility: 'hidden' }}>
                {current && <CardFront item={current} />}
              </div>
              <div className="absolute inset-0 rounded-2xl bg-indigo-50 dark:bg-gray-800 shadow-lg border border-indigo-200 dark:border-indigo-700"
                   style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                {current && <CardBack item={current} />}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={goPrev}
              disabled={index === 0}
              className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              ← 이전
            </button>
            <button
              onClick={goNext}
              disabled={index === total - 1}
              className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-medium disabled:opacity-40 hover:bg-indigo-700 transition-colors"
            >
              다음 →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
