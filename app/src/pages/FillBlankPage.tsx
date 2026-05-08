import { useCallback, useEffect, useRef, useState } from 'react';
import StudyScopeSelector from '../components/StudyScopeSelector';
import { useStudyScope } from '../hooks/useStudyScope';
import { useExcludedItems } from '../hooks/useVocabulary';
import { generateItemId } from '../lib/parser';
import { checkAnswer, createFillBlankQuestion, type FillBlankQuestion } from '../lib/fillblank';

type AnswerState = 'idle' | 'correct' | 'wrong';

export default function FillBlankPage() {
  const { dateRange, setDateRange, filteredWords } = useStudyScope();
  const { excludeItem } = useExcludedItems();
  const [questions, setQuestions] = useState<FillBlankQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [input, setInput] = useState('');
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startSession = useCallback(() => {
    const qs = filteredWords.map(w => createFillBlankQuestion(w));
    for (let i = qs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [qs[i], qs[j]] = [qs[j], qs[i]];
    }
    setQuestions(qs);
    setQIndex(0);
    setInput('');
    setAnswerState('idle');
    setRevealed(false);
    setCorrect(0);
    setDone(false);
  }, [filteredWords]);

  const dateRangeKey = dateRange ? `${dateRange.start}_${dateRange.end}` : 'all';
  const lastDateRangeKeyRef = useRef<string>('');

  useEffect(() => {
    const isDateRangeChanged = lastDateRangeKeyRef.current !== dateRangeKey;
    lastDateRangeKeyRef.current = dateRangeKey;

    if (isDateRangeChanged || (questions.length === 0 && filteredWords.length > 0)) {
      startSession();
    }
  }, [dateRangeKey, startSession, questions.length, filteredWords.length]);

  useEffect(() => {
    if (answerState === 'idle') inputRef.current?.focus();
  }, [answerState, qIndex]);

  const current = questions[qIndex];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!current || answerState !== 'idle') return;
    if (checkAnswer(input, current.word)) {
      setAnswerState('correct');
      setCorrect(c => c + 1);
      setTimeout(() => advance(), 1500);
    } else {
      setAnswerState('wrong');
    }
  }

  function advance() {
    if (qIndex + 1 >= questions.length) {
      setDone(true);
    } else {
      setQIndex(i => i + 1);
      setInput('');
      setAnswerState('idle');
      setRevealed(false);
    }
  }

  function handleKnow() {
    if (!current) return;
    excludeItem(generateItemId(current.word.sourceFile, current.word.word));

    const next = [...questions];
    next.splice(qIndex, 1);
    setQuestions(next);
    setInput('');
    setAnswerState('idle');
    setRevealed(false);

    if (qIndex >= next.length) {
      if (next.length === 0) {
        setDone(true);
      } else {
        setQIndex(next.length - 1);
      }
    }
  }

  if (filteredWords.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <StudyScopeSelector dateRange={dateRange} onChangeDateRange={setDateRange} />
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
          <p className="text-4xl mb-4">✏️</p>
          <p className="text-gray-500 dark:text-gray-400">빈칸 채우기에 사용할 단어가 없습니다.</p>
        </div>
      </div>
    );
  }

  if (done) {
    const total = questions.length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
      <div className="flex flex-col h-full">
        <StudyScopeSelector dateRange={dateRange} onChangeDateRange={setDateRange} />
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center gap-4">
          <p className="text-5xl">{pct >= 80 ? '🎉' : '💪'}</p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">세션 완료!</h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">{pct}%</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">정답률</p>
            <div className="flex justify-around text-sm">
              <div><p className="font-semibold text-green-600">{correct}</p><p className="text-gray-500">정답</p></div>
              <div><p className="font-semibold text-red-500">{total - correct}</p><p className="text-gray-500">오답</p></div>
              <div><p className="font-semibold text-gray-700 dark:text-gray-300">{total}</p><p className="text-gray-500">전체</p></div>
            </div>
          </div>
          <button onClick={startSession} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
            다시 시작
          </button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const inputCls = `w-full px-4 py-3 rounded-xl border-2 text-lg font-medium outline-none transition-colors ${
    answerState === 'correct'
      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
      : answerState === 'wrong'
      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500'
  }`;

  return (
    <div className="flex flex-col h-full">
      <StudyScopeSelector dateRange={dateRange} onChangeDateRange={setDateRange} />

      <div className="flex flex-col flex-1 p-4 gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">{qIndex + 1} / {questions.length}</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleKnow}
              disabled={answerState !== 'idle'}
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ✓ 알아요
            </button>
            <span className="text-xs text-gray-400 dark:text-gray-500">{current.word.partOfSpeech}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-lg text-gray-900 dark:text-white leading-relaxed text-center">
            {current.sentence}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center mt-3 font-mono">{current.hint}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={answerState !== 'idle'}
            placeholder="단어를 입력하세요..."
            className={inputCls}
            autoComplete="off"
            autoCapitalize="none"
          />

          {answerState === 'idle' && (
            <button type="submit" className="py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
              확인
            </button>
          )}

          {answerState === 'correct' && (
            <div className="text-center text-green-600 dark:text-green-400 font-semibold">정답! ✓</div>
          )}

          {answerState === 'wrong' && !revealed && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setInput(''); setAnswerState('idle'); }}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                다시 시도
              </button>
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="flex-1 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                정답 보기
              </button>
            </div>
          )}

          {answerState === 'wrong' && revealed && (
            <div className="flex flex-col gap-2">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-gray-400">정답:</p>
                <p className="text-xl font-bold text-green-700 dark:text-green-400">{current.word.word}</p>
              </div>
              <button
                type="button"
                onClick={advance}
                className="py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                다음 →
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
