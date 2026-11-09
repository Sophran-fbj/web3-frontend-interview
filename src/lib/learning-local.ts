"use client";

import { z } from "zod";

import {
  learningSnapshotSchema,
  remoteLearningSchema,
  type LearningSnapshot,
  type RemoteLearning,
} from "@/lib/learning-snapshot";
import { useBookmarkStore } from "@/stores/use-bookmark-store";
import { useInterviewStore } from "@/stores/use-interview-store";
import { useProgressStore } from "@/stores/use-progress-store";
import { useStudySetStore } from "@/stores/use-study-set-store";

let owner: string | null = null;
const cacheSchema = z.object({
  version: z.literal(1),
  base: remoteLearningSchema,
  local: learningSnapshotSchema,
});
const names = {
  progress: "web3-interview-progress",
  bookmarks: "web3-interview-bookmarks",
  studySets: "web3-interview-study-sets",
  sessions: "web3-interview-sessions",
} as const;
const key = (name: string, userId: string | null) =>
  userId ? `${name}:user:${encodeURIComponent(userId)}` : name;
const cacheKey = (userId: string) =>
  `web3-interview-sync:user:${encodeURIComponent(userId)}`;

export function currentLearningOwner() {
  return owner;
}

export function readLearningCache(userId: string) {
  const raw = localStorage.getItem(cacheKey(userId));
  if (!raw) return null;
  const cache = cacheSchema.parse(JSON.parse(raw));
  if (cache.base.userId !== userId)
    throw new Error("本地账号缓存不匹配，记录未修改。");
  return cache;
}

export function saveLearningCache(
  base: RemoteLearning,
  local: LearningSnapshot,
) {
  localStorage.setItem(
    cacheKey(base.userId),
    JSON.stringify({ version: 1, base, local }),
  );
}

export function getLearningSnapshot(): LearningSnapshot {
  return learningSnapshotSchema.parse({
    version: 1,
    progress: useProgressStore.getState().progress,
    bookmarks: useBookmarkStore.getState().bookmarks,
    studySets: useStudySetStore.getState().studySets,
    sessions: useInterviewStore.getState().sessions,
  });
}

export function readStoredLearning(userId: string | null): LearningSnapshot {
  const cache = userId ? readLearningCache(userId) : null;
  const data: Record<string, unknown> = { version: 1 };
  let hasStoredData = false;
  for (const [field, name] of Object.entries(names)) {
    const raw = localStorage.getItem(key(name, userId));
    if (!raw) {
      data[field] = {};
      continue;
    }
    hasStoredData = true;
    const persisted = z
      .object({
        version: z.literal(1),
        state: z.record(z.string(), z.unknown()),
      })
      .parse(JSON.parse(raw));
    data[field] = persisted.state[field] ?? {};
  }
  return !hasStoredData && cache
    ? cache.local
    : learningSnapshotSchema.parse(data);
}

export async function hydrateLearningStores() {
  await Promise.all([
    useProgressStore.persist.rehydrate(),
    useBookmarkStore.persist.rehydrate(),
    useStudySetStore.persist.rehydrate(),
    useInterviewStore.persist.rehydrate(),
  ]);
}

export function applyLearningSnapshot(
  snapshot: LearningSnapshot,
  expectedOwner: string | null,
): boolean {
  if (owner !== expectedOwner) return false;
  const data = learningSnapshotSchema.parse(snapshot);
  useProgressStore.setState({ progress: data.progress, hasHydrated: true });
  useBookmarkStore.setState({ bookmarks: data.bookmarks, hasHydrated: true });
  useStudySetStore.setState({ studySets: data.studySets, hasHydrated: true });
  useInterviewStore.setState({ sessions: data.sessions, hasHydrated: true });
  return true;
}

export function switchLearningOwner(userId: string | null) {
  const target = readStoredLearning(userId);
  useProgressStore.persist.setOptions({ name: key(names.progress, userId) });
  useBookmarkStore.persist.setOptions({ name: key(names.bookmarks, userId) });
  useStudySetStore.persist.setOptions({ name: key(names.studySets, userId) });
  useInterviewStore.persist.setOptions({ name: key(names.sessions, userId) });
  owner = userId;
  applyLearningSnapshot(target, userId);
}

export function subscribeLearningChanges(listener: () => void) {
  const unsubscribe = [
    useProgressStore.subscribe((state, previous) => {
      if (state.progress !== previous.progress) listener();
    }),
    useBookmarkStore.subscribe((state, previous) => {
      if (state.bookmarks !== previous.bookmarks) listener();
    }),
    useStudySetStore.subscribe((state, previous) => {
      if (state.studySets !== previous.studySets) listener();
    }),
    useInterviewStore.subscribe((state, previous) => {
      if (state.sessions !== previous.sessions) listener();
    }),
  ];
  return () => unsubscribe.forEach((stop) => stop());
}
