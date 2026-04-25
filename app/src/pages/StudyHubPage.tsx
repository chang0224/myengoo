import { useNavigate } from 'react-router-dom';
import StudyScopeSelector from '../components/StudyScopeSelector';
import { useStudyScope } from '../hooks/useStudyScope';

const MODES = [
  { to: '/flashcard', icon: '🃏', title: '플래시카드', desc: '모든 카드 앞/뒤 넘겨보기' },
  { to: '/quiz', icon: '❓', title: '4지선다 퀴즈', desc: '영↔한 객관식 퀴즈' },
  { to: '/fill-blank', icon: '✏️', title: '빈칸 채우기', desc: '예문 속 단어 타이핑' },
];

export default function StudyHubPage() {
  const navigate = useNavigate();
  const { dateRange, setDateRange, itemCount } = useStudyScope();

  return (
    <div className="flex flex-col">
      <StudyScopeSelector dateRange={dateRange} onChangeDateRange={setDateRange} />

      <div className="p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          학습 범위: {itemCount.words}단어 · {itemCount.expressions}표현
        </p>

        <div className="flex flex-col gap-3">
          {MODES.map(({ to, icon, title, desc }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-left"
            >
              <span className="text-3xl">{icon}</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
