"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type BookmarkRecord = {
  createdAt: string;
};

type BookmarkState = {
  bookmarks: Record<string, BookmarkRecord>;
  hasHydrated: boolean;
  toggleBookmark: (questionId: string) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set) => ({
      bookmarks: {},
      hasHydrated: false,
      toggleBookmark: (questionId) =>
        set((state) => {
          const bookmarks = { ...state.bookmarks };
          if (bookmarks[questionId]) {
            delete bookmarks[questionId];
          } else {
            bookmarks[questionId] = { createdAt: new Date().toISOString() };
          }
          return { bookmarks };
        }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "web3-interview-bookmarks",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({ bookmarks: state.bookmarks }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
