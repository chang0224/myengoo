import { useCallback, useEffect, useState } from 'react';
import StudyScopeSelector from '../components/StudyScopeSelector';
import { useStudyScope } from '../hooks/useStudyScope';
import { useSRS, useVocabulary } from '../hooks/useVocabulary';
import { createNewSRSRecord, reviewCard as calcReview, getTodayISO } from '../lib/srs';
import { generateItemId } from '../lib/parser';
import type { SRSRating, SRSRecord, StudyItem } from '../types';

const RATING_CONFIG: { rating: SRSRating; label: string; color: string }[] = [
  { rating: 0, label: '다시', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700' },
  { rating: 2, label: '어려움', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700' },
  { rating: 3, label: '좋음', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700' },
  { rating: 5, label: '쉬움', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700' },
];

function getNextInterval(record: SRSRecord, rating: SRSRating): number {
  return calcReview(record, rating).interval;
}

function formatInterval(days: number): string {
  if (days === 0) return '오늘';
  if (days === 1) return '1일';
  if (days < 30) return `${days}일`;
  if (days < 365) return `${Math.round(days / 30)}개월`;
  return `${Math.round(days / 365)}년`;
}

function ItemCard({ item, flipped }: { item: StudyItem; flipped: boolean }) {
  if (!flipped) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.type === 'word' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'}`}>
          {item.type === 'word' ? '단어' : '표현'}
        </span>
        <p className="text-3xl font-bold text-gray-900 dark:text-white text-center">
          {item.type === 'word' ? item.word : item.expression}
        </p>
        {item.type === 'word' && (
          <p className="text-base text-gray-500 dark:text-gray-400 font-mono">{item.ipa}</p>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">탭하여 뒤집기</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 text-center">
        {item.type === 'word' ? item.definition : item.koreanExplanation}
      </p>
      {item.type === 'word' && (
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center italic">"{item.exampleSentence}"</p>
      )}
      {item.type === 'expression' && (
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center italic">"{item.contextQuote}"</p>
      )}
    </div>
  );
}

export default function ReviewPage() {
  const { selectedDate, setSelectedDate, filteredItems } = useStudyScope();
  const { allItems } = useVocabulary();
  const { records, reviewCard } = useSRS();
  const [queue, setQueue] = useState<StudyItem[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [done, setDone] = useState(false);

  const buildQueue = useCallback(() => {
    const today = getTodayISO();
    const scopeItems = filteredItems.length > 0 ? filteredItems : allItems;
    const allIds = scopeItems.map(item =>
      generateItemId(item.sourceFile, item.type === 'word' ? item.word : item.expression)
    );

    const dueIds = new Set(
      records
        .filter(r => r.nextReviewDate <= today && allIds.includes(r.itemId))
        .sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate))
        .map(r => r.itemId)
    );

    const existingIds = new Set(records.map(r => r.itemId));
    const newIds = allIds.filter(id => !existingIds.has(id));

    const dueItems = scopeItems.filter(item => {
      const id = generateItemId(item.sourceFile, item.type === 'word' ? item.word : item.expression);
      return dueIds.has(id);
    });
    const newItems = scopeItems.filter(item => {
      const id = generateItemId(item.sourceFile, item.type === 'word' ? item.word : item.expression);
      return newIds.includes(id);
    });

    setQueue([...dueItems, ...newItems]);
    setQIndex(0);
    setFlipped(false);
    setSessionStats({ again: 0, hard: 0, good: 0, easy: 0 });
    setDone(false);
  }, [filteredItems, allItems, records]);

  useEffect(() => { buildQueue(); }, [buildQueue]);

  const current = queue[qIndex];
  const total = queue.length;

  function handleRate(rating: SRSRating) {
    if (!current) return;
    const itemId = generateItemId(current.sourceFile, current.type === 'word' ? current.word : current.expression);
    reviewCard(itemId, rating);

    setSessionStats(prev => ({
      ...prev,
      again: rating === 0 ? prev.again + 1 : prev.again,
      hard: rating === 2 ? prev.hard + 1 : prev.hard,
      good: rating === 3 ? prev.good + 1 : prev.good,
      easy: rating === 5 ? prev.easy + 1 : prev.easy,
    }));

    if (qIndex + 1 >= total) {
      setDone(true);
    } else {
      setQIndex(i => i + 1);
      setFlipped(false);
    }
  }

  if (total === 0) {
    const today = getTodayISO();
    const futureRecords = records.filter(r => r.nextReviewDate > today);
    const nextDate = futureRecords.length > 0
      ? futureRecords.sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate))[0].nextReviewDate
      : null;

    return (
      <div className="flex flex-col h-full">
        <StudyScopeSelector selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center gap-3">
          <p className="text-5xl">🎉</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">복습할 카드가 없습니다!</p>
          {nextDate && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">다음 복습: {nextDate}</p>
          )}
        </div>
      </div>
    );
  }

  if (done) {
    const total2 = sessionStats.again + sessionStats.hard + sessionStats.good + sessionStats.easy;
    const today = getTodayISO();
    const futureRecords = records.filter(r => r.nextReviewDate > today);
    const nextDate = futureRecords.length > 0
      ? futureRecords.sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate))[0].nextReviewDate
      : null;

    return (
      <div className="flex flex-col h-full">
        <StudyScopeSelector selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center gap-4">
          <p className="text-5xl">✅</p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">복습 완료!</h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">{total2}장</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">복습 완료</p>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div><p className="font-semibold text-red-600">{sessionStats.again}</p><p className="text-gray-500">다시</p></div>
              <div><p className="font-semibold text-orange-600">{sessionStats.hard}</p><p className="text-gray-500">어려움</p></div>
              <div><p className="font-semibold text-green-600">{sessionStats.good}</p><p className="text-gray-500">좋음</p></div>
              <div><p className="font-semibold text-blue-600">{sessionStats.easy}</p><p className="text-gray-500">쉬움</p></div>
            </div>
            {nextDate && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">다음 복습: {nextDate}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const currentId = generateItemId(current.sourceFile, current.type === 'word' ? current.word : current.expression);
  const currentRecord = records.find(r => r.itemId === currentId) ?? createNewSRSRecord(currentId);

  return (
    <div className="flex flex-col h-full">
      <StudyScopeSelector selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      <div className="flex flex-col flex-1 p-4 gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">오늘 복습할 카드: {total}장</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{qIndex + 1} / {total}</span>
        </div>

        <div
          className="flex-1 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer min-h-[200px]"
          onClick={() => !flipped && setFlipped(true)}
        >
          <ItemCard item={current} flipped={flipped} />
        </div>

        {flipped && (
          <div className="grid grid-cols-4 gap-2">
            {RATING_CONFIG.map(({ rating, label, color }) => {
              const nextInterval = getNextInterval(currentRecord, rating);
              return (
                <button
                  key={rating}
                  onClick={() => handleRate(rating)}
                  className={`flex flex-col items-center py-3 px-2 rounded-xl border font-medium text-sm transition-colors ${color}`}
                >
                  <span>{label}</span>
                  <span className="text-xs opacity-75 mt-0.5">{formatInterval(nextInterval)}</span>
                </button>
              );
            })}
          </div>
        )}

        {!flipped && (
          <button
            onClick={() => setFlipped(true)}
            className="py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            뒤집기
          </button>
        )}
      </div>
    </div>
  );
}
