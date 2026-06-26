import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { HadithSummary } from '../types';
import type { User } from './useAuth';

export function useBookmarks(
  user: User | null,
  openAuthModal: () => void
) {
  const [bookmarkedList, setBookmarkedList] = useState<HadithSummary[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [bookmarksLoading, setBookmarksLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setBookmarkedList([]);
      setBookmarkedIds(new Set());
      return;
    }

    setBookmarksLoading(true);
    api.getBookmarks()
      .then((res) => {
        if (res.success) {
          setBookmarkedList(res.bookmarks);
          setBookmarkedIds(new Set(res.bookmarks.map((b) => b.MainID)));
        }
      })
      .catch((err) => {
        console.error('Error fetching bookmarks', err);
      })
      .finally(() => {
        setBookmarksLoading(false);
      });
  }, [user]);

  const handleToggleBookmark = async (hadith: HadithSummary) => {
    if (!user) {
      openAuthModal();
      return;
    }

    try {
      const res = await api.toggleBookmark(hadith.MainID);
      if (res.success) {
        if (res.bookmarked) {
          setBookmarkedIds((prev) => {
            const next = new Set(prev);
            next.add(hadith.MainID);
            return next;
          });
          setBookmarkedList((prev) => [hadith, ...prev]);
        } else {
          setBookmarkedIds((prev) => {
            const next = new Set(prev);
            next.delete(hadith.MainID);
            return next;
          });
          setBookmarkedList((prev) => prev.filter((b) => b.MainID !== hadith.MainID));
        }
      }
    } catch (err) {
      console.error('Toggle bookmark error', err);
    }
  };

  const clearBookmarks = () => {
    setBookmarkedList([]);
    setBookmarkedIds(new Set());
  };

  return {
    bookmarkedList,
    setBookmarkedList,
    bookmarkedIds,
    setBookmarkedIds,
    bookmarksLoading,
    handleToggleBookmark,
    clearBookmarks,
  };
}
