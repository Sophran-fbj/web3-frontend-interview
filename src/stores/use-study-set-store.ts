"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  restoreStudySets,
  studySetMetadataSchema,
  type StudySet,
} from "@/lib/study-sets";

type StudySetState = {
  studySets: Record<string, StudySet>;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  createStudySet: (name: string) => string | undefined;
  updateMetadata: (id: string, name: string, description: string) => boolean;
  deleteStudySet: (id: string) => void;
  addQuestion: (id: string, questionId: string) => void;
  removeQuestion: (id: string, questionId: string) => void;
  moveQuestion: (id: string, questionId: string, direction: -1 | 1) => void;
};

export const useStudySetStore = create<StudySetState>()(
  persist(
    (set) => {
      function update(id: string, change: (current: StudySet) => StudySet) {
        set((state) => {
          const current = state.studySets[id];
          if (!current) return state;
          const next = change(current);
          if (next === current) return state;
          return {
            studySets: {
              ...state.studySets,
              [id]: { ...next, updatedAt: new Date().toISOString() },
            },
          };
        });
      }

      return {
        studySets: {},
        hasHydrated: false,
        setHasHydrated: (hasHydrated) => set({ hasHydrated }),
        createStudySet: (name) => {
          const metadata = studySetMetadataSchema.safeParse({
            name,
            description: "",
          });
          if (!metadata.success) return undefined;
          const id = crypto.randomUUID();
          const now = new Date().toISOString();
          set((state) => ({
            studySets: {
              ...state.studySets,
              [id]: {
                ...metadata.data,
                id,
                questionIds: [],
                createdAt: now,
                updatedAt: now,
              },
            },
          }));
          return id;
        },
        updateMetadata: (id, name, description) => {
          const metadata = studySetMetadataSchema.safeParse({
            name,
            description,
          });
          if (!metadata.success) return false;
          update(id, (current) => ({ ...current, ...metadata.data }));
          return true;
        },
        deleteStudySet: (id) =>
          set((state) => {
            const studySets = { ...state.studySets };
            delete studySets[id];
            return { studySets };
          }),
        addQuestion: (id, questionId) => {
          if (!questionId.trim()) return;
          update(id, (current) =>
            current.questionIds.includes(questionId)
              ? current
              : {
                  ...current,
                  questionIds: [...current.questionIds, questionId],
                },
          );
        },
        removeQuestion: (id, questionId) =>
          update(id, (current) => ({
            ...current,
            questionIds: current.questionIds.filter(
              (value) => value !== questionId,
            ),
          })),
        moveQuestion: (id, questionId, direction) =>
          update(id, (current) => {
            const index = current.questionIds.indexOf(questionId);
            const target = index + direction;
            if (index < 0 || target < 0 || target >= current.questionIds.length)
              return current;
            const questionIds = [...current.questionIds];
            [questionIds[index], questionIds[target]] = [
              questionIds[target],
              questionIds[index],
            ];
            return { ...current, questionIds };
          }),
      };
    },
    {
      name: "web3-interview-study-sets",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ studySets: state.studySets }),
      merge: (persisted, current) => ({
        ...current,
        studySets: restoreStudySets(persisted),
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
