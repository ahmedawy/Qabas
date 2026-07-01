import { useEffect } from 'react';
import type { Book } from '../types';

export function useUrlSync(
  currentView: string,
  setCurrentView: (view: any) => void,
  currentTab: string | null,
  setCurrentTab: (tab: string | null) => void,
  selectedBook: Book | null,
  extraParams: { hadith?: string; tarqeem?: string; page?: string; part?: string },
  isReady: boolean
) {
  // Sync initial view parameters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view && ['library', 'narrators', 'atraf', 'thematics', 'sciences', 'statistics'].includes(view)) {
      setCurrentView(view as any);
      const tab = params.get('tab');
      if (tab) {
        setCurrentTab(tab);
      }
    }
  }, [setCurrentView, setCurrentTab]);

  // Sync view, tab, and selected book state to URL
  useEffect(() => {
    if (!isReady) return;

    const url = new URL(window.location.href);
    url.searchParams.set('view', currentView);
    if (currentTab) {
      url.searchParams.set('tab', currentTab);
    } else {
      url.searchParams.delete('tab');
    }
    if (selectedBook) {
      url.searchParams.set('book', selectedBook.ID.toString());
    } else {
      url.searchParams.delete('book');
    }

    if (extraParams.hadith) {
      url.searchParams.set('hadith', extraParams.hadith);
      if (extraParams.tarqeem) {
        url.searchParams.set('tarqeem', extraParams.tarqeem);
      } else {
        url.searchParams.delete('tarqeem');
      }
      url.searchParams.delete('page');
      url.searchParams.delete('part');
    } else if (extraParams.page) {
      url.searchParams.set('page', extraParams.page);
      if (extraParams.part) {
        url.searchParams.set('part', extraParams.part);
      } else {
        url.searchParams.delete('part');
      }
      url.searchParams.delete('hadith');
      url.searchParams.delete('tarqeem');
    } else {
      url.searchParams.delete('hadith');
      url.searchParams.delete('tarqeem');
      url.searchParams.delete('page');
      url.searchParams.delete('part');
    }

    window.history.replaceState({}, '', url.toString());
  }, [currentView, currentTab, selectedBook, extraParams.hadith, extraParams.tarqeem, extraParams.page, extraParams.part, isReady]);
}
