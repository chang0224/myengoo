import { useState, useMemo, useCallback } from 'react';
import { useVocabulary } from './useVocabulary';
import type { KeyExpression, StudyItem, VocabularyWord } from '../types';

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
  itemCount: { words: number; expressions: number; total: number };
}

export function useStudyScope(): StudyScopeState {
  const { allItems, allWords, allExpressions } = useVocabulary();
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  const filterByRange = useCallback(<T extends { sourceDate: string }>(items: T[]): T[] => {
    if (dateRange === null) return items;
    return items.filter(item => item.sourceDate >= dateRange.start && item.sourceDate <= dateRange.end);
  }, [dateRange]);

  const filteredItems = useMemo<StudyItem[]>(() => filterByRange(allItems), [filterByRange, allItems]);
  const filteredWords = useMemo<VocabularyWord[]>(() => filterByRange(allWords), [filterByRange, allWords]);
  const filteredExpressions = useMemo<KeyExpression[]>(() => filterByRange(allExpressions), [filterByRange, allExpressions]);

  const itemCount = useMemo(() => ({
    words: filteredWords.length,
    expressions: filteredExpressions.length,
    total: filteredItems.length,
  }), [filteredWords, filteredExpressions, filteredItems]);

  return { dateRange, setDateRange, filteredItems, filteredWords, filteredExpressions, itemCount };
}
