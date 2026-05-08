import { useMemo, useState } from 'react';
import { useExcludedItems, useVocabulary } from '../hooks/useVocabulary';
import { generateItemId } from '../lib/parser';
import type { StudyItem } from '../types';

interface ExcludedDisplay {
  itemId: string;
  excludedAt: string;
  item: StudyItem | null;
}

export default function SettingsPage() {
  const { allItems } = useVocabulary();
  const { records, restoreItem, restoreAll } = useExcludedItems();
  const [confirmingRestoreAll, setConfirmingRestoreAll] = useState(false);

  const itemsById = useMemo(() => {
    const map = new Map<string, StudyItem>();
    for (const item of allItems) {
      const key = item.type === 'word' ? item.word : item.expression;
      map.set(generateItemId(item.sourceFile, key), item);
    }
    return map;
  }, [allItems]);

  const displayList = useMemo<ExcludedDisplay[]>(
    () =>
      [...records]
        .sort((a, b) => b.excludedAt.localeCompare(a.excludedAt))
        .map(record => ({
          itemId: record.itemId,
          excludedAt: record.excludedAt,
          item: itemsById.get(record.itemId) ?? null,
        })),
    [records, itemsById],
  );

  function handleRestoreAll() {
    if (!confirmingRestoreAll) {
      setConfirmingRestoreAll(true);
      return;
    }
    restoreAll();
    setConfirmingRestoreAll(false);
  }

  return (
    <div className="flex flex-col p-4 gap-4">
      <header>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">⚙️ 설정</h1>
      </header>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">제외한 단어</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {records.length === 0
                ? '학습에서 제외한 단어가 없습니다.'
                : `${records.length}개 단어가 학습에서 제외되었습니다.`}
            </p>
          </div>
          {records.length > 0 && (
            <button
              type="button"
              onClick={handleRestoreAll}
              onBlur={() => setConfirmingRestoreAll(false)}
              className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                confirmingRestoreAll
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
            >
              {confirmingRestoreAll ? '정말 모두 복원?' : '전체 복원'}
            </button>
          )}
        </div>

        {displayList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              학습 화면에서 '알아요' 버튼을 누르면 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {displayList.map(({ itemId, excludedAt, item }) => {
              const label = item
                ? item.type === 'word'
                  ? item.word
                  : item.expression
                : itemId.split('::')[1] ?? itemId;
              const meaning = item
                ? item.type === 'word'
                  ? item.definition
                  : item.koreanExplanation
                : '';
              const typeLabel = item?.type === 'expression' ? '표현' : '단어';
              const typeStyle =
                item?.type === 'expression'
                  ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                  : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300';

              return (
                <li
                  key={itemId}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeStyle}`}>
                        {typeLabel}
                      </span>
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{label}</p>
                    </div>
                    {meaning && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{meaning}</p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">제외일: {excludedAt}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => restoreItem(itemId)}
                    className="px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors flex-shrink-0"
                  >
                    복원
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
