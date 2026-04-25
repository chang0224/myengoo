import { useVocabulary } from '../hooks/useVocabulary';
import type { DateRange } from '../hooks/useStudyScope';

interface Props {
  dateRange: DateRange | null;
  onChangeDateRange: (range: DateRange | null) => void;
}

export default function StudyScopeSelector({ dateRange, onChangeDateRange }: Props) {
  const { availableDates, allWords, allExpressions } = useVocabulary();

  if (availableDates.length === 0) return null;

  const minDate = availableDates[availableDates.length - 1];
  const maxDate = availableDates[0];
  const isAll = dateRange === null;

  function handleStartChange(value: string) {
    const end = dateRange?.end ?? maxDate;
    onChangeDateRange({ start: value, end: value > end ? value : end });
  }

  function handleEndChange(value: string) {
    const start = dateRange?.start ?? minDate;
    onChangeDateRange({ start: value < start ? value : start, end: value });
  }

  return (
    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onChangeDateRange(null)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            isAll
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          전체 {allWords.length}단어 · {allExpressions.length}표현
        </button>

        <div className={`flex items-center gap-1.5 text-sm ${isAll ? 'opacity-40' : ''}`}>
          <input
            type="date"
            value={dateRange?.start ?? minDate}
            min={minDate}
            max={maxDate}
            onChange={e => handleStartChange(e.target.value)}
            onFocus={() => { if (isAll) onChangeDateRange({ start: minDate, end: maxDate }); }}
            className="px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          />
          <span className="text-gray-400">~</span>
          <input
            type="date"
            value={dateRange?.end ?? maxDate}
            min={minDate}
            max={maxDate}
            onChange={e => handleEndChange(e.target.value)}
            onFocus={() => { if (isAll) onChangeDateRange({ start: minDate, end: maxDate }); }}
            className="px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          />
        </div>
      </div>
    </div>
  );
}
