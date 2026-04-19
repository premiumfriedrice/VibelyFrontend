"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import {
  AppState,
  ContentResult,
  MediaAttachment,
  SearchHistoryItem,
  Platform,
} from "./types";
import { MOCK_RESULTS, MOCK_HISTORY, LOADING_STEPS } from "./mock-data";
import { searchContent } from "./api";

interface VibelyState {
  appState: AppState;
  query: string;
  results: ContentResult[];
  selectedResult: ContentResult | null;
  attachments: MediaAttachment[];
  searchHistory: SearchHistoryItem[];
  savedContent: ContentResult[];
  platformFilter: Platform | null;
  loadingStep: number;
  showHistory: boolean;
  showDetail: boolean;

  setAppState: (state: AppState) => void;
  setQuery: (query: string) => void;
  setSelectedResult: (result: ContentResult | null) => void;
  setPlatformFilter: (filter: Platform | null) => void;
  setShowHistory: (show: boolean) => void;
  setShowDetail: (show: boolean) => void;
  addAttachment: (attachment: MediaAttachment) => void;
  removeAttachment: (id: string) => void;
  toggleSaved: (result: ContentResult) => void;
  isSaved: (id: string) => boolean;
  performSearch: () => void;
  resetSearch: () => void;
  loadHistoryItem: (item: SearchHistoryItem) => void;
  clearHistory: () => void;
  filteredResults: ContentResult[];
}

const VibelyContext = createContext<VibelyState | null>(null);

export function VibelyProvider({ children }: { children: ReactNode }) {
  const [appState, setAppState] = useState<AppState>("empty");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ContentResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<ContentResult | null>(null);
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>(MOCK_HISTORY);
  const [savedContent, setSavedContent] = useState<ContentResult[]>([]);
  const [platformFilter, setPlatformFilter] = useState<Platform | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const addAttachment = useCallback((attachment: MediaAttachment) => {
    setAttachments((prev) => [...prev, attachment]);
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const toggleSaved = useCallback((result: ContentResult) => {
    setSavedContent((prev) => {
      const exists = prev.find((r) => r.content_id === result.content_id);
      if (exists) return prev.filter((r) => r.content_id !== result.content_id);
      return [...prev, result];
    });
  }, []);

  const isSaved = useCallback(
    (id: string) => savedContent.some((r) => r.content_id === id),
    [savedContent]
  );

  const performSearch = useCallback(() => {
    if (!query.trim() && attachments.length === 0) return;

    setAppState("loading");
    setLoadingStep(0);

    // Animate loading steps
    const stepTimers: ReturnType<typeof setTimeout>[] = [];
    LOADING_STEPS.forEach((_, i) => {
      stepTimers.push(
        setTimeout(() => setLoadingStep(i + 1), (i + 1) * 500)
      );
    });

    // Determine mode and file from attachments
    const fileAttachment = attachments[0];
    const mode = fileAttachment?.type || "text";

    // Convert attachment preview (data URL) to Blob if present
    const getFile = async (): Promise<File | undefined> => {
      if (!fileAttachment?.preview) return undefined;
      const res = await fetch(fileAttachment.preview);
      const blob = await res.blob();
      return new File([blob], fileAttachment.label, { type: blob.type });
    };

    (async () => {
      try {
        const file = await getFile();
        const searchResults = await searchContent(query, mode, file);

        // Complete remaining loading steps
        stepTimers.forEach(clearTimeout);
        setLoadingStep(LOADING_STEPS.length);

        setTimeout(() => {
          setResults(searchResults);
          setAppState("results");

          const historyItem: SearchHistoryItem = {
            id: crypto.randomUUID(),
            query: query.trim() || "Visual search",
            attachments: [...attachments],
            results: searchResults,
            timestamp: new Date(),
          };
          setSearchHistory((prev) => [historyItem, ...prev]);
        }, 400);
      } catch {
        // Fallback to mock data if API is unreachable
        console.warn("API unreachable, using demo data");
        setTimeout(() => {
          const searchResults = [...MOCK_RESULTS].sort(() => Math.random() - 0.5);
          setResults(searchResults);
          setAppState("results");

          const historyItem: SearchHistoryItem = {
            id: crypto.randomUUID(),
            query: query.trim() || "Visual search",
            attachments: [...attachments],
            results: searchResults,
            timestamp: new Date(),
          };
          setSearchHistory((prev) => [historyItem, ...prev]);
        }, LOADING_STEPS.length * 500 + 400);
      }
    })();

    return () => stepTimers.forEach(clearTimeout);
  }, [query, attachments]);

  const resetSearch = useCallback(() => {
    setAppState("empty");
    setQuery("");
    setResults([]);
    setAttachments([]);
    setPlatformFilter(null);
    setShowDetail(false);
    setSelectedResult(null);
  }, []);

  const loadHistoryItem = useCallback((item: SearchHistoryItem) => {
    setQuery(item.query);
    setResults(item.results);
    setAppState("results");
    setShowHistory(false);
    setPlatformFilter(null);
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  const filteredResults = platformFilter
    ? results.filter((r) => r.platform === platformFilter)
    : results;

  return (
    <VibelyContext.Provider
      value={{
        appState,
        query,
        results,
        selectedResult,
        attachments,
        searchHistory,
        savedContent,
        platformFilter,
        loadingStep,
        showHistory,
        showDetail,
        setAppState,
        setQuery,
        setSelectedResult,
        setPlatformFilter,
        setShowHistory,
        setShowDetail,
        addAttachment,
        removeAttachment,
        toggleSaved,
        isSaved,
        performSearch,
        resetSearch,
        loadHistoryItem,
        clearHistory,
        filteredResults,
      }}
    >
      {children}
    </VibelyContext.Provider>
  );
}

export function useVibely() {
  const ctx = useContext(VibelyContext);
  if (!ctx) throw new Error("useVibely must be used within VibelyProvider");
  return ctx;
}
