"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { authClient } from "@/lib/auth-client";
import {
  applyLearningSnapshot,
  currentLearningOwner,
  getLearningSnapshot,
  hydrateLearningStores,
  readLearningCache,
  readStoredLearning,
  saveLearningCache,
  subscribeLearningChanges,
  switchLearningOwner,
} from "@/lib/learning-local";
import { LearningSyncController, type SyncState } from "@/lib/learning-sync";

const AccountLearningContext = createContext<{
  owner: string | null;
  controller: LearningSyncController | null;
  ready: boolean;
}>({ owner: null, controller: null, ready: true });

export const useAccountLearning = () => useContext(AccountLearningContext);
export const useLearningReady = () => useContext(AccountLearningContext).ready;

const initialSyncState: SyncState = {
  phase: "loading",
  confirmed: false,
  remote: null,
  conflicts: [],
  message: "",
};
const initialSnapshot = () => initialSyncState;
const noSubscribe = () => () => {};
export function useAccountSyncState() {
  const { controller } = useAccountLearning();
  return useSyncExternalStore(
    controller?.subscribe ?? noSubscribe,
    controller?.getSnapshot ?? initialSnapshot,
    initialSnapshot,
  );
}

export function LearningAccountProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  return enabled ? (
    <EnabledLearningAccountProvider>{children}</EnabledLearningAccountProvider>
  ) : (
    children
  );
}

function EnabledLearningAccountProvider({ children }: { children: ReactNode }) {
  const { data, isPending, error } = authClient.useSession();
  const [runtime, setRuntime] = useState<{
    owner: string | null;
    controller: LearningSyncController | null;
  } | null>(null);
  const [scopeError, setScopeError] = useState("");
  const userId = error ? (runtime?.owner ?? null) : (data?.user.id ?? null);
  const hasError = !!error;

  useEffect(() => {
    if (isPending) return;
    let cancelled = false;
    let controller: LearningSyncController | null = null;
    async function initialize() {
      try {
        await hydrateLearningStores();
        if (cancelled) return;
        switchLearningOwner(userId);
        if (userId && !hasError) {
          controller = new LearningSyncController({
            userId,
            base: readLearningCache(userId)?.base ?? null,
            readLocal: getLearningSnapshot,
            readGuest: () => readStoredLearning(null),
            applyLocal: (snapshot) => {
              applyLearningSnapshot(snapshot, userId);
            },
            saveCache: saveLearningCache,
            isCurrent: () => currentLearningOwner() === userId,
            subscribeLocal: subscribeLearningChanges,
          });
        }
        setScopeError("");
        setRuntime({ owner: userId, controller });
        controller?.start();
        if (controller) {
          window.addEventListener("online", controller.requestSync);
          window.addEventListener("focus", controller.requestSync);
        }
      } catch {
        if (!cancelled)
          setScopeError(
            "本地学习记录暂时无法读取，原始缓存未删除。请检查浏览器存储设置后刷新。",
          );
      }
    }
    void initialize();
    return () => {
      cancelled = true;
      if (controller) {
        window.removeEventListener("online", controller.requestSync);
        window.removeEventListener("focus", controller.requestSync);
        controller.dispose();
      }
    };
  }, [userId, isPending, hasError]);

  const ready = Boolean(
    !scopeError &&
    runtime &&
    runtime.owner === userId &&
    !(isPending && !runtime),
  );

  const value = useMemo(
    () => ({
      owner: runtime?.owner ?? null,
      controller: runtime?.controller ?? null,
      ready,
    }),
    [ready, runtime],
  );

  return (
    <AccountLearningContext.Provider value={value}>
      {scopeError && (
        <div
          role="alert"
          className="border-b border-[var(--danger-border)] bg-[var(--danger-soft)] px-5 py-3 text-sm text-[var(--text-strong)] sm:px-8"
        >
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
            <p>{scopeError}</p>
            <button
              type="button"
              className="study-button min-h-9 px-3 text-xs"
              onClick={() => window.location.reload()}
            >
              重新读取
            </button>
          </div>
        </div>
      )}
      {children}
    </AccountLearningContext.Provider>
  );
}
