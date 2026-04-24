import { useState, useMemo } from 'react';
import { useVocabulary } from './useVocabulary';
import type { KeyExpression, StudyItem, VocabularyWord } from '../types';

export interface StudyScopeState {
  selectedDate: string | null;  // null = all dates
  setSelectedDate: (date: string | null) => void;
  filteredItems: StudyItem[];
  filteredWords: VocabularyWord[];
  filteredExpressions: KeyExpression[];
  itemCount: { words: number; expressions: number; total: number };
}

export function useStudyScope(): StudyScopeState {
  const { allItems, allWords, getItemsByDate, getWordsByDate } = useVocabulary();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const filteredItems = useMemo<StudyItem[]>(() => {
    if (selectedDate === null) return allItems;
    return getItemsByDate(selectedDate);
  }, [selectedDate, allItems, getItemsByDate]);

  const filteredWords = useMemo<VocabularyWord[]>(() => {
    if (selectedDate === null) return allWords;
    return getWordsByDate(selectedDate);
  }, [selectedDate, allWords, getWordsByDate]);

  const filteredExpressions = useMemo<KeyExpression[]>(() => {
    return filteredItems.filter((item): item is KeyExpression => item.type === 'expression');
  }, [filteredItems]);

  const itemCount = useMemo(() => ({
    words: filteredWords.length,
    expressions: filteredExpressions.length,
    total: filteredItems.length,
  }), [filteredWords, filteredExpressions, filteredItems]);

  return {
    selectedDate,
    setSelectedDate,
    filteredItems,
    filteredWords,
    filteredExpressions,
    itemCount,
  };
}
