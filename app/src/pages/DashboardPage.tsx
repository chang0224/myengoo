import { useNavigate } from 'react-router-dom';
import StudyScopeSelector from '../components/StudyScopeSelector';
import { useStudyScope } from '../hooks/useStudyScope';
import { useSRS, useVocabulary } from '../hooks/useVocabulary';

const MODES = [
  { to: '/flashcard', icon: '🃏', title: '플래시카드', desc: '모든 카드 넘겨보기' },
  { to: '/quiz', icon: '❓', title: '4지선다 퀴즈', desc: '영↔한 퀴즈' },
  { to: '/fill-blank', icon: '✏️', title: '빈칸 채우기', desc: '예문 속 단어 맞추기' },
  { to: '/review', icon: '🔄', title: 'SRS 복습', desc: null },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { dateRange, setDateRange } = useStudyScope();
  const { allWords, allExpressions, files, isLoading } = useVocabulary();
  const { getDueCount } = useSRS();
  const dueCount = getDueCount();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-400 dark:text-gray-500">단어장 로딩 중...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
        <p className="text-5xl mb-4">📂</p>
        <p className="text-gray-500 dark:text-gray-400">단어장이 없습니다.</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">words/ 폴더에 마크다운 파일을 추가하세요.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <StudyScopeSelector dateRange={dateRange} onChangeDateRange={setDateRange} />

      <div className="p-4 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '총 단어', value: allWords.length, icon: '📝' },
            { label: '총 표현', value: allExpressions.length, icon: '💬' },
            { label: '학습 파일', value: files.length, icon: '📄' },
            { label: '오늘 복습', value: dueCount, icon: '🔄', highlight: dueCount > 0 },
          ].map(({ label, value, icon, highlight }) => (
            <div key={label} className={`rounded-2xl p-4 border ${highlight ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
              <p className="text-2xl mb-1">{icon}</p>
              <p className={`text-2xl font-bold ${highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {MODES.map(({ to, icon, title, desc }) => {
            const dynamicDesc = to === '/review' ? `오늘 복습할 카드 ${dueCount}장` : desc;
            const isHighlight = to === '/review' && dueCount > 0;
            return (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-colors ${
                  isHighlight
                    ? 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                }`}
              >
                <p className="text-2xl mb-2">{icon}</p>
                <p className={`font-semibold text-sm ${isHighlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{title}</p>
                <p className={`text-xs mt-0.5 ${isHighlight ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>{dynamicDesc}</p>
              </button>
            );
          })}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">최근 학습 파일</h3>
          <div className="flex flex-col gap-2">
            {files.slice(0, 5).map(file => (
              <div key={file.fileName} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{file.title}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{file.date}</p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
                  {file.words.length}단어 · {file.expressions.length}표현
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
