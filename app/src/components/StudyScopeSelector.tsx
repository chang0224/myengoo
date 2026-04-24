import { useVocabulary } from '../hooks/useVocabulary';

interface Props {
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  showCounts?: boolean;
}

export default function StudyScopeSelector({ selectedDate, onSelectDate, showCounts = true }: Props) {
  const { availableDates, allWords, allExpressions, getItemsByDate } = useVocabulary();

  if (availableDates.length === 0) return null;

  return (
    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => onSelectDate(null)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedDate === null
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          전체
          {showCounts && (
            <span className="ml-1 opacity-75">
              {allWords.length}단어 · {allExpressions.length}표현
            </span>
          )}
        </button>

        {availableDates.map(date => {
          const items = getItemsByDate(date);
          const wordCount = items.filter(i => i.type === 'word').length;
          const exprCount = items.filter(i => i.type === 'expression').length;
          return (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedDate === date
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {date}
              {showCounts && (
                <span className="ml-1 opacity-75">
                  {wordCount}단어 · {exprCount}표현
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
