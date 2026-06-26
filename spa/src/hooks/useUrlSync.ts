import { useEffect } from 'react';
import type { Book } from '../types';

export function useUrlSync(
  currentView: string,
  setCurrentView: (view: any) => void,
  currentTab: string | null,
  setCurrentTab: (tab: string | null) => void,
  selectedBook: Book | null
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
    window.history.replaceState({}, '', url.toString());
  }, [currentView, currentTab, selectedBook]);
}
