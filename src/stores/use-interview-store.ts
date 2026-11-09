"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  interviewSessionSchema,
  remainingSeconds,
  restoreInterviews,
  type InterviewAssessment,
  type InterviewSession,
} from "@/lib/interviews";

type NewSession = {
  source: InterviewSession["source"];
  sourceId: string | null;
  sourceLabel: string;
  secondsPerQuestion: number;
  questions: { id: string; title: string }[];
};

type InterviewState = {
  sessions: Record<string, InterviewSession>;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  createSession: (input: NewSession) => string | undefined;
  startQuestion: (id: string) => void;
  saveDraft: (id: string, text: string) => void;
  submitQuestion: (id: string, skip?: boolean) => void;
  advanceQuestion: (id: string) => void;
  assessQuestion: (
    id: string,
    questionId: string,
    assessment: InterviewAssessment,
  ) => void;
  completeSession: (id: string) => void;
  deleteSession: (id: string) => void;
};

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set) => {
      function update(
        id: string,
        change: (session: InterviewSession) => InterviewSession,
      ) {
        set((state) => {
          const current = state.sessions[id];
          if (!current) return state;
          const next = change(current);
          return next === current
            ? state
            : {
                sessions: {
                  ...state.sessions,
                  [id]: { ...next, updatedAt: new Date().toISOString() },
                },
              };
        });
      }

      return {
        sessions: {},
        hasHydrated: false,
        setHasHydrated: (hasHydrated) => set({ hasHydrated }),
        createSession: (input) => {
          const id = crypto.randomUUID();
          const now = new Date().toISOString();
          const parsed = interviewSessionSchema.safeParse({
            id,
            source: input.source,
            sourceId: input.sourceId,
            sourceLabel: input.sourceLabel,
            secondsPerQuestion: input.secondsPerQuestion,
            currentIndex: 0,
            status: "answering",
            items: input.questions.map(
              ({ id: questionId, title: questionTitle }) => ({
                questionId,
                questionTitle,
                text: "",
                startedAt: null,
                submittedAt: null,
                elapsedSeconds: 0,
                timedOut: false,
                skipped: false,
                assessment: null,
              }),
            ),
            createdAt: now,
            updatedAt: now,
            completedAt: null,
          });
          if (!parsed.success) return undefined;
          set((state) => ({
            sessions: { ...state.sessions, [id]: parsed.data },
          }));
          return id;
        },
        startQuestion: (id) =>
          update(id, (session) => {
            const item = session.items[session.currentIndex];
            if (
              session.status !== "answering" ||
              item.startedAt ||
              item.submittedAt
            )
              return session;
            return {
              ...session,
              items: session.items.map((value, index) =>
                index === session.currentIndex
                  ? { ...value, startedAt: new Date().toISOString() }
                  : value,
              ),
            };
          }),
        saveDraft: (id, text) =>
          update(id, (session) => {
            const item = session.items[session.currentIndex];
            if (
              session.status !== "answering" ||
              !item.startedAt ||
              item.submittedAt ||
              remainingSeconds(
                item.startedAt,
                session.secondsPerQuestion,
                Date.now(),
              ) === 0
            )
              return session;
            return {
              ...session,
              items: session.items.map((value, index) =>
                index === session.currentIndex
                  ? { ...value, text: text.slice(0, 10000) }
                  : value,
              ),
            };
          }),
        submitQuestion: (id, skip = false) =>
          update(id, (session) => {
            const item = session.items[session.currentIndex];
            if (
              session.status !== "answering" ||
              item.submittedAt ||
              (!skip && !item.startedAt)
            )
              return session;
            const now = Date.now();
            const timedOut =
              !!item.startedAt &&
              remainingSeconds(
                item.startedAt,
                session.secondsPerQuestion,
                now,
              ) === 0;
            const elapsedSeconds = item.startedAt
              ? Math.min(
                  session.secondsPerQuestion,
                  Math.max(
                    0,
                    Math.floor((now - Date.parse(item.startedAt)) / 1000),
                  ),
                )
              : 0;
            return {
              ...session,
              items: session.items.map((value, index) =>
                index === session.currentIndex
                  ? {
                      ...value,
                      submittedAt: new Date(now).toISOString(),
                      timedOut,
                      skipped: skip,
                      elapsedSeconds,
                    }
                  : value,
              ),
            };
          }),
        advanceQuestion: (id) =>
          update(id, (session) => {
            if (
              session.status !== "answering" ||
              !session.items[session.currentIndex].submittedAt
            )
              return session;
            return session.currentIndex + 1 < session.items.length
              ? { ...session, currentIndex: session.currentIndex + 1 }
              : { ...session, status: "reviewing" };
          }),
        assessQuestion: (id, questionId, assessment) =>
          update(id, (session) =>
            session.status !== "reviewing"
              ? session
              : {
                  ...session,
                  items: session.items.map((item) =>
                    item.questionId === questionId
                      ? { ...item, assessment }
                      : item,
                  ),
                },
          ),
        completeSession: (id) =>
          update(id, (session) =>
            session.status !== "reviewing" ||
            session.items.some((item) => !item.skipped && !item.assessment)
              ? session
              : {
                  ...session,
                  status: "completed",
                  completedAt: new Date().toISOString(),
                },
          ),
        deleteSession: (id) =>
          set((state) => {
            const sessions = { ...state.sessions };
            delete sessions[id];
            return { sessions };
          }),
      };
    },
    {
      name: "web3-interview-sessions",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ sessions: state.sessions }),
      merge: (persisted, current) => ({
        ...current,
        sessions: restoreInterviews(persisted),
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
