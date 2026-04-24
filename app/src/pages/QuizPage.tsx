import { useCallback, useEffect, useState } from 'react';
import StudyScopeSelector from '../components/StudyScopeSelector';
import { useStudyScope } from '../hooks/useStudyScope';
import { useVocabulary } from '../hooks/useVocabulary';
import { generateQuizSession, type QuizDirection, type QuizQuestion } from '../lib/quiz';

export default function QuizPage() {
  const { selectedDate, setSelectedDate, filteredItems } = useStudyScope();
  const { allItems } = useVocabulary();
  const [direction, setDirection] = useState<QuizDirection>('en-to-kr');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [done, setDone] = useState(false);

  const startSession = useCallback(() => {
    if (filteredItems.length === 0) return;
    const qs = generateQuizSession(filteredItems, direction, allItems);
    setQuestions(qs);
    setQIndex(0);
    setSelected(null);
    setCorrect(0);
    setIncorrect(0);
    setDone(false);
  }, [filteredItems, direction, allItems]);

  useEffect(() => { startSession(); }, [startSession]);

  const current = questions[qIndex];

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === current.correctIndex) {
      setCorrect(c => c + 1);
      setTimeout(() => advance(), 1500);
    } else {
      setIncorrect(i => i + 1);
    }
  }

  function advance() {
    if (qIndex + 1 >= questions.length) {
      setDone(true);
    } else {
      setQIndex(i => i + 1);
      setSelected(null);
    }
  }

  if (filteredItems.length < 2) {
    return (
      <div className="flex flex-col h-full">
        <StudyScopeSelector selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
          <p className="text-4xl mb-4">❓</p>
          <p className="text-gray-500 dark:text-gray-400">퀴즈를 하려면 최소 2개의 단어가 필요합니다.</p>
        </div>
      </div>
    );
  }

  if (done) {
    const total = correct + incorrect;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
      <div className="flex flex-col h-full">
        <StudyScopeSelector selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center gap-4">
          <p className="text-5xl">{pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪'}</p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">세션 완료!</h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">{pct}%</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">정답률</p>
            <div className="flex justify-around text-sm">
              <div><p className="font-semibold text-green-600">{correct}</p><p className="text-gray-500">정답</p></div>
              <div><p className="font-semibold text-red-500">{incorrect}</p><p className="text-gray-500">오답</p></div>
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

  return (
    <div className="flex flex-col h-full">
      <StudyScopeSelector selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      <div className="flex flex-col flex-1 p-4 gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {qIndex + 1} / {questions.length} · 정답률 {questions.length > 0 ? Math.round((correct / Math.max(qIndex, 1)) * 100) : 0}%
          </span>
          <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 text-xs">
            {(['en-to-kr', 'kr-to-en'] as QuizDirection[]).map(d => (
              <button
                key={d}
                onClick={() => { setDirection(d); }}
                className={`px-3 py-1.5 transition-colors ${direction === d ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                {d === 'en-to-kr' ? '영→한' : '한→영'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">{current.item.type === 'word' ? '단어' : '표현'}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{current.question}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 flex-1">
          {current.options.map((opt, idx) => {
            let cls = 'w-full p-4 rounded-xl text-left font-medium transition-colors border ';
            if (selected === null) {
              cls += 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20';
            } else if (idx === current.correctIndex) {
              cls += 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-300';
            } else if (idx === selected) {
              cls += 'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-300';
            } else {
              cls += 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 opacity-50';
            }
            return (
              <button key={idx} onClick={() => handleSelect(idx)} className={cls}>
                {opt}
              </button>
            );
          })}
        </div>

        {selected !== null && selected !== current.correctIndex && (
          <button onClick={advance} className="py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
            다음 →
          </button>
        )}
      </div>
    </div>
  );
}
