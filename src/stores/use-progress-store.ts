"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type LearningStatus = "unseen" | "unclear" | "mastered" | "review";

type ProgressRecord = {
  status: LearningStatus;
  reviewCount: number;
  updatedAt: string;
};

type ProgressState = {
  progress: Record<string, ProgressRecord>;
  hasHydrated: boolean;
  setStatus: (questionId: string, status: LearningStatus) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  clearProgress: () => void;
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      progress: {},
      hasHydrated: false,
      setStatus: (questionId, status) =>
        set((state) => {
          const previous = state.progress[questionId];

          if (status === "unseen") {
            if (!previous) return state;

            const progress = { ...state.progress };
            delete progress[questionId];
            return { progress };
          }

          if (previous?.status === status) return state;

          return {
            progress: {
              ...state.progress,
              [questionId]: {
                status,
                reviewCount: (previous?.reviewCount ?? 0) + 1,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      clearProgress: () => set({ progress: {} }),
    }),
    {
      name: "web3-interview-progress",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({ progress: state.progress }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
