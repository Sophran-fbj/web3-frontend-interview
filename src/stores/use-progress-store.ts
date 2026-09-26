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
  setStatus: (questionId: string, status: LearningStatus) => void;
  clearProgress: () => void;
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      progress: {},
      setStatus: (questionId, status) =>
        set((state) => {
          const previous = state.progress[questionId];

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
      clearProgress: () => set({ progress: {} }),
    }),
    {
      name: "web3-interview-progress",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
