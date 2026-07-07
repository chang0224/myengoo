import { useState, useMemo, useCallback } from 'react';
import { useVocabulary, useExcludedItems } from './useVocabulary';
import { generateItemId } from '../lib/parser';
import type { KeyExpression, StudyItem, UsefulExpression, VocabularyWord } from '../types';

export interface DateRange {
  start: string;
  end: string;
}

export interface StudyScopeState {
  dateRange: DateRange | null;
  setDateRange: (range: DateRange | null) => void;
  filteredItems: StudyItem[];
  filteredWords: VocabularyWord[];
  filteredExpressions: KeyExpression[];
  filteredUsefulExpressions: UsefulExpression[];
  itemCount: { words: number; expressions: number; usefulExpressions: number; total: number };
}

function getItemKey(item: StudyItem): string {
  return item.type === 'word' ? item.word : item.expression;
}

export function useStudyScope(): StudyScopeState {
  const { allItems, allWords, allExpressions, allUsefulExpressions } = useVocabulary();
  const { excludedIds } = useExcludedItems();
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  const filterByRange = useCallback(<T extends { sourceDate: string }>(items: T[]): T[] => {
    if (dateRange === null) return items;
    return items.filter(item => item.sourceDate >= dateRange.start && item.sourceDate <= dateRange.end);
  }, [dateRange]);

  const filterExcluded = useCallback(<T extends StudyItem>(items: T[]): T[] => {
    if (excludedIds.size === 0) return items;
    return items.filter(item => !excludedIds.has(generateItemId(item.sourceFile, getItemKey(item))));
  }, [excludedIds]);

  const filteredItems = useMemo<StudyItem[]>(
    () => filterExcluded(filterByRange(allItems)),
    [filterByRange, filterExcluded, allItems],
  );
  const filteredWords = useMemo<VocabularyWord[]>(
    () => filterExcluded(filterByRange(allWords)),
    [filterByRange, filterExcluded, allWords],
  );
  const filteredExpressions = useMemo<KeyExpression[]>(
    () => filterExcluded(filterByRange(allExpressions)),
    [filterByRange, filterExcluded, allExpressions],
  );
  const filteredUsefulExpressions = useMemo<UsefulExpression[]>(
    () => filterExcluded(filterByRange(allUsefulExpressions)),
    [filterByRange, filterExcluded, allUsefulExpressions],
  );

  const itemCount = useMemo(() => ({
    words: filteredWords.length,
    expressions: filteredExpressions.length,
    usefulExpressions: filteredUsefulExpressions.length,
    total: filteredItems.length,
  }), [filteredWords, filteredExpressions, filteredUsefulExpressions, filteredItems]);

  return { dateRange, setDateRange, filteredItems, filteredWords, filteredExpressions, filteredUsefulExpressions, itemCount };
}
