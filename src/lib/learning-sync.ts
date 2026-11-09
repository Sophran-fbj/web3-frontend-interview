import {
  emptyLearningSnapshot,
  mergeLearningSnapshots,
  remoteLearningSchema,
  sameLearningValue,
  type LearningSnapshot,
  type MergeConflict,
  type MergePreference,
  type RemoteLearning,
} from "@/lib/learning-snapshot";

export type SyncState = {
  phase:
    | "loading"
    | "confirmation"
    | "syncing"
    | "ready"
    | "pending"
    | "conflict"
    | "error";
  confirmed: boolean;
  remote: RemoteLearning | null;
  conflicts: MergeConflict[];
  message: string;
};

type SyncOptions = {
  userId: string;
  base: RemoteLearning | null;
  readLocal: () => LearningSnapshot;
  readGuest: () => LearningSnapshot;
  applyLocal: (snapshot: LearningSnapshot) => void;
  saveCache: (base: RemoteLearning, local: LearningSnapshot) => void;
  isCurrent: () => boolean;
  subscribeLocal: (listener: () => void) => () => void;
  readRemote?: (signal: AbortSignal) => Promise<RemoteLearning>;
  writeRemote?: (
    remote: RemoteLearning,
    snapshot: LearningSnapshot,
    signal: AbortSignal,
  ) => Promise<RemoteLearning>;
};

export async function requestLearning(
  userId: string,
  signal: AbortSignal,
  write?: { baseRevision: number; snapshot: LearningSnapshot },
) {
  const response = await fetch("/api/learning", {
    method: write ? "POST" : "GET",
    credentials: "same-origin",
    cache: "no-store",
    signal,
    ...(write
      ? {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...write,
            expectedUserId: userId,
            mutationId: crypto.randomUUID(),
          }),
        }
      : {}),
  });
  const data: unknown = await response.json();
  if (!response.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : response.status === 409
          ? "云端数据已变化，请重新同步并确认冲突。"
          : "连接失败，本地记录已保留，请稍后重试。";
    throw new Error(message);
  }
  const parsed = remoteLearningSchema.safeParse(data);
  if (!parsed.success)
    throw new Error("云端记录格式暂不兼容，本地数据未修改。");
  const remote = parsed.data;
  if (remote.userId !== userId)
    throw new Error("登录账号已变化，请刷新后重新确认同步。");
  return remote;
}

export class LearningSyncController {
  private options: SyncOptions;
  private base: RemoteLearning | null;
  private state: SyncState;
  private listeners = new Set<() => void>();
  private abort = new AbortController();
  private stopped = false;
  private busy = false;
  private applying = false;
  private retryCount = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private poll: ReturnType<typeof setInterval> | undefined;
  private unsubscribe: (() => void) | undefined;

  constructor(options: SyncOptions) {
    this.options = options;
    this.base = options.base;
    this.state = {
      phase: "loading",
      confirmed: !!this.base,
      remote: this.base,
      conflicts: [],
      message: "",
    };
  }

  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private publish(update: Partial<SyncState>) {
    if (this.stopped) return;
    this.state = { ...this.state, ...update, confirmed: !!this.base };
    this.listeners.forEach((listener) => listener());
  }
  private active() {
    return !this.stopped && this.options.isCurrent();
  }
  private queue(delay = 1500) {
    clearTimeout(this.timer);
    if (!this.base || this.state.phase === "conflict") return;
    this.timer = setTimeout(() => {
      void this.synchronize();
    }, delay);
  }

  start() {
    this.unsubscribe = this.options.subscribeLocal(() => {
      if (!this.active() || this.applying) return;
      try {
        if (this.base)
          this.options.saveCache(this.base, this.options.readLocal());
      } catch {
        this.publish({
          phase: "error",
          message: "无法保存浏览器缓存，请保留此页面并检查浏览器存储空间。",
        });
        return;
      }
      if (this.base) {
        if (this.state.phase !== "conflict") this.publish({ phase: "pending" });
        this.queue();
      } else this.publish({});
    });
    this.poll = setInterval(() => {
      if (this.base && this.state.phase !== "conflict") this.requestSync();
    }, 30000);
    this.requestSync();
  }

  requestSync = () => {
    if (this.state.phase !== "conflict") void this.synchronize();
  };

  async synchronize(preference?: MergePreference, includeGuest = false) {
    if (this.busy || !this.active()) return;
    clearTimeout(this.timer);
    this.busy = true;
    this.publish({ phase: "syncing", message: "" });
    try {
      const remote = await (this.options.readRemote
        ? this.options.readRemote(this.abort.signal)
        : requestLearning(this.options.userId, this.abort.signal));
      if (!this.active()) return;
      if (remote.userId !== this.options.userId)
        throw new Error("登录账号已变化，未导入数据。");
      const sentLocal = this.options.readLocal();
      const local = includeGuest
        ? mergeLearningSnapshots(
            emptyLearningSnapshot(),
            this.options.readGuest(),
            sentLocal,
            preference,
          ).snapshot
        : sentLocal;
      const merged = mergeLearningSnapshots(
        this.base?.snapshot ?? emptyLearningSnapshot(),
        local,
        remote.snapshot,
        preference,
      );
      if (!this.base && !preference) {
        this.publish({
          phase: "confirmation",
          remote,
          conflicts: merged.conflicts,
        });
        return;
      }
      if (merged.conflicts.length && !preference) {
        this.publish({
          phase: "conflict",
          remote,
          conflicts: merged.conflicts,
        });
        return;
      }
      const committed = sameLearningValue(merged.snapshot, remote.snapshot)
        ? remote
        : await (this.options.writeRemote
            ? this.options.writeRemote(
                remote,
                merged.snapshot,
                this.abort.signal,
              )
            : requestLearning(this.options.userId, this.abort.signal, {
                baseRevision: remote.revision,
                snapshot: merged.snapshot,
              }));
      if (!this.active()) return;
      if (committed.userId !== this.options.userId)
        throw new Error("登录账号已变化，未导入数据。");
      // 请求途中产生的新修改留在本地，下一轮再同步。
      const latest = mergeLearningSnapshots(
        sentLocal,
        this.options.readLocal(),
        committed.snapshot,
        "local",
      ).snapshot;
      this.applying = true;
      this.base = committed;
      this.options.applyLocal(latest);
      this.options.saveCache(committed, latest);
      this.retryCount = 0;
      this.publish({
        phase: "ready",
        remote: committed,
        conflicts: [],
        message: "同步已完成。",
      });
      if (!sameLearningValue(latest, committed.snapshot)) this.queue();
    } catch (error) {
      if (!this.active()) return;
      this.publish({
        phase: "error",
        message:
          error instanceof Error
            ? error.message
            : "同步未完成，本地记录已保留。",
      });
      if (this.base && this.retryCount++ < 3)
        this.queue(Math.min(30000, 5000 * this.retryCount));
    } finally {
      this.applying = false;
      this.busy = false;
    }
  }

  dispose() {
    this.stopped = true;
    this.abort.abort();
    clearTimeout(this.timer);
    clearInterval(this.poll);
    this.unsubscribe?.();
    this.listeners.clear();
  }
}
