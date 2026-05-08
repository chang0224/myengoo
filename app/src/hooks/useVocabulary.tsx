import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AppSettings, ExcludedRecord, ParsedVocabularyFile, SRSRating, SRSRecord, StudyItem, VocabularyWord, KeyExpression } from '../types';
import { parseVocabularyFile } from '../lib/parser';
import { createNewSRSRecord, reviewCard as srsReviewCard, getDueItems, getNewItems, getTodayISO } from '../lib/srs';
import { loadSRSRecords, saveSRSRecords, loadSettings, saveSettings, loadExcludedRecords, saveExcludedRecords } from '../lib/storage';

const wordFileModules = import.meta.glob('../../../words/*.md', { query: '?raw', import: 'default' });
const contentsModules = import.meta.glob('../../../contents/*.md', { query: '?raw', import: 'default' });
const dailyNewsModules = import.meta.glob('../../../daily_news/*.md', { query: '?raw', import: 'default' });

interface ArticleFile {
  fileName: string;
  date: string;
  title: string;
  content: string;
}

interface VocabularyStore {
  files: ParsedVocabularyFile[];
  allWords: VocabularyWord[];
  allExpressions: KeyExpression[];
  allItems: StudyItem[];
  availableDates: string[];  // sorted descending
  isLoading: boolean;
  getItemsByDate: (date: string) => StudyItem[];
  getWordsByDate: (date: string) => VocabularyWord[];
  contentsFiles: ArticleFile[];
  dailyNewsFiles: ArticleFile[];
}

interface SRSStore {
  records: SRSRecord[];
  getDueCount: () => number;
  getDueRecords: () => SRSRecord[];
  getNewItemIds: (itemIds: string[]) => string[];
  reviewCard: (itemId: string, rating: SRSRating) => void;
}

interface SettingsStore {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
}

interface ExcludedItemsStore {
  records: ExcludedRecord[];
  excludedIds: Set<string>;
  isExcluded: (itemId: string) => boolean;
  excludeItem: (itemId: string) => void;
  restoreItem: (itemId: string) => void;
  restoreAll: () => void;
}

interface VocabularyContextValue {
  vocabulary: VocabularyStore;
  srs: SRSStore;
  settings: SettingsStore;
  excluded: ExcludedItemsStore;
}

const VocabularyContext = createContext<VocabularyContextValue | null>(null);

export function VocabularyProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<ParsedVocabularyFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contentsFiles, setContentsFiles] = useState<ArticleFile[]>([]);
  const [dailyNewsFiles, setDailyNewsFiles] = useState<ArticleFile[]>([]);
  const [srsRecords, setSrsRecords] = useState<SRSRecord[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>(() => loadSettings());
  const [excludedRecords, setExcludedRecords] = useState<ExcludedRecord[]>([]);

  useEffect(() => {
    async function loadFiles() {
      const parsed: ParsedVocabularyFile[] = [];
      const seenWords = new Set<string>();

      for (const [path, loader] of Object.entries(wordFileModules)) {
        try {
          const content = await (loader as () => Promise<string>)();
          const fileName = path.split('/').pop() ?? path;
          const file = parseVocabularyFile(content, fileName);

          const uniqueWords = file.words.filter(w => {
            const key = w.word.toLowerCase();
            if (seenWords.has(key)) return false;
            seenWords.add(key);
            return true;
          });

          parsed.push({ ...file, words: uniqueWords });
        } catch (err) {
          console.warn('[vocabulary] Failed to load file:', path, err);
        }
      }

      parsed.sort((a, b) => b.date.localeCompare(a.date));
      setFiles(parsed);

      const loadedContents: ArticleFile[] = [];
      for (const [path, loader] of Object.entries(contentsModules)) {
        try {
          const content = await (loader as () => Promise<string>)();
          const fileName = path.split('/').pop() ?? path;
          const date = fileName.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? '';
          const titleMatch = content.match(/^#\s+(.+)$/m);
          const title = titleMatch?.[1] ?? fileName;
          loadedContents.push({ fileName, date, title, content });
        } catch (err) {
          console.warn('[vocabulary] Failed to load contents file:', path, err);
        }
      }
      loadedContents.sort((a, b) => b.date.localeCompare(a.date));
      setContentsFiles(loadedContents);

      const loadedDailyNews: ArticleFile[] = [];
      for (const [path, loader] of Object.entries(dailyNewsModules)) {
        try {
          const content = await (loader as () => Promise<string>)();
          const fileName = path.split('/').pop() ?? path;
          const date = fileName.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? '';
          const titleMatch = content.match(/^#\s+(.+)$/m);
          const title = titleMatch?.[1] ?? fileName;
          loadedDailyNews.push({ fileName, date, title, content });
        } catch (err) {
          console.warn('[vocabulary] Failed to load daily_news file:', path, err);
        }
      }
      loadedDailyNews.sort((a, b) => b.date.localeCompare(a.date));
      setDailyNewsFiles(loadedDailyNews);

      setIsLoading(false);
    }

    loadFiles();
  }, []);

  useEffect(() => {
    setSrsRecords(loadSRSRecords());
    setExcludedRecords(loadExcludedRecords());
  }, []);

  useEffect(() => {
    if (appSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appSettings.darkMode]);

  const allWords = useMemo(() => files.flatMap(f => f.words), [files]);
  const allExpressions = useMemo(() => files.flatMap(f => f.expressions), [files]);
  const allItems = useMemo<StudyItem[]>(() => [...allWords, ...allExpressions], [allWords, allExpressions]);
  const availableDates = useMemo(() => [...new Set(files.map(f => f.date))].sort((a, b) => b.localeCompare(a)), [files]);

  const getItemsByDate = useCallback((date: string): StudyItem[] => {
    const dateFiles = files.filter(f => f.date === date);
    return dateFiles.flatMap(f => [...f.words, ...f.expressions]);
  }, [files]);

  const getWordsByDate = useCallback((date: string): VocabularyWord[] => {
    return files.filter(f => f.date === date).flatMap(f => f.words);
  }, [files]);

  const vocabulary: VocabularyStore = useMemo(() => ({
    files,
    allWords,
    allExpressions,
    allItems,
    availableDates,
    isLoading,
    getItemsByDate,
    getWordsByDate,
    contentsFiles,
    dailyNewsFiles,
  }), [files, allWords, allExpressions, allItems, availableDates, isLoading, getItemsByDate, getWordsByDate, contentsFiles, dailyNewsFiles]);

  const today = getTodayISO();

  const getDueCount = useCallback(() => getDueItems(srsRecords, today).length, [srsRecords, today]);
  const getDueRecords = useCallback(() => getDueItems(srsRecords, today), [srsRecords, today]);
  const getNewItemIds = useCallback((itemIds: string[]) => getNewItems(itemIds, srsRecords), [srsRecords]);

  const reviewCard = useCallback((itemId: string, rating: SRSRating) => {
    setSrsRecords(prev => {
      const existing = prev.find(r => r.itemId === itemId);
      const record = existing ?? createNewSRSRecord(itemId);
      const updated = srsReviewCard(record, rating);
      const next = existing
        ? prev.map(r => r.itemId === itemId ? updated : r)
        : [...prev, updated];
      saveSRSRecords(next);
      return next;
    });
  }, []);

  const srs: SRSStore = useMemo(() => ({
    records: srsRecords,
    getDueCount,
    getDueRecords,
    getNewItemIds,
    reviewCard,
  }), [srsRecords, getDueCount, getDueRecords, getNewItemIds, reviewCard]);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setAppSettings(prev => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  }, []);

  const settings: SettingsStore = useMemo(() => ({
    settings: appSettings,
    updateSettings,
  }), [appSettings, updateSettings]);

  const excludedIds = useMemo(() => new Set(excludedRecords.map(r => r.itemId)), [excludedRecords]);

  const isExcluded = useCallback((itemId: string) => excludedIds.has(itemId), [excludedIds]);

  const excludeItem = useCallback((itemId: string) => {
    setExcludedRecords(prev => {
      if (prev.some(r => r.itemId === itemId)) return prev;
      const next = [...prev, { itemId, excludedAt: getTodayISO() }];
      saveExcludedRecords(next);
      return next;
    });
  }, []);

  const restoreItem = useCallback((itemId: string) => {
    setExcludedRecords(prev => {
      const next = prev.filter(r => r.itemId !== itemId);
      saveExcludedRecords(next);
      return next;
    });
  }, []);

  const restoreAll = useCallback(() => {
    setExcludedRecords(() => {
      saveExcludedRecords([]);
      return [];
    });
  }, []);

  const excluded: ExcludedItemsStore = useMemo(() => ({
    records: excludedRecords,
    excludedIds,
    isExcluded,
    excludeItem,
    restoreItem,
    restoreAll,
  }), [excludedRecords, excludedIds, isExcluded, excludeItem, restoreItem, restoreAll]);

  return (
    <VocabularyContext.Provider value={{ vocabulary, srs, settings, excluded }}>
      {children}
    </VocabularyContext.Provider>
  );
}

export function useVocabulary(): VocabularyStore {
  const ctx = useContext(VocabularyContext);
  if (!ctx) throw new Error('useVocabulary must be used within VocabularyProvider');
  return ctx.vocabulary;
}

export function useSRS(): SRSStore {
  const ctx = useContext(VocabularyContext);
  if (!ctx) throw new Error('useSRS must be used within VocabularyProvider');
  return ctx.srs;
}

export function useSettings(): SettingsStore {
  const ctx = useContext(VocabularyContext);
  if (!ctx) throw new Error('useSettings must be used within VocabularyProvider');
  return ctx.settings;
}

export function useExcludedItems(): ExcludedItemsStore {
  const ctx = useContext(VocabularyContext);
  if (!ctx) throw new Error('useExcludedItems must be used within VocabularyProvider');
  return ctx.excluded;
}
