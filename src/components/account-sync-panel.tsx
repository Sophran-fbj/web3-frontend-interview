"use client";

import { useState } from "react";

import {
  useAccountLearning,
  useAccountSyncState,
} from "@/components/learning-account-provider";
import { CustomSelect } from "@/components/ui/custom-select";
import { getLearningSnapshot, readStoredLearning } from "@/lib/learning-local";
import {
  emptyLearningSnapshot,
  type LearningCollection,
  type MergePreference,
} from "@/lib/learning-snapshot";

const collectionLabels: Record<LearningCollection, string> = {
  progress: "掌握状态",
  bookmarks: "收藏",
  studySets: "题单",
  sessions: "面试记录",
};

export function AccountSyncPanel() {
  const { controller } = useAccountLearning();
  const state = useAccountSyncState();
  const [includeGuest, setIncludeGuest] = useState(true);
  const [preference, setPreference] = useState<MergePreference>("local");
  const [guest] = useState(() => {
    try {
      return readStoredLearning(null);
    } catch {
      return null;
    }
  });
  if (!controller) return null;
  const local = getLearningSnapshot();
  const remote = state.remote?.snapshot ?? emptyLearningSnapshot();
  const busy = state.phase === "loading" || state.phase === "syncing";

  return (
    <section
      className="mt-8 border-t border-[var(--line)] pt-6"
      aria-labelledby="cloud-sync-title"
    >
      <h2
        id="cloud-sync-title"
        className="text-xl font-semibold text-[var(--text-strong)]"
      >
        学习数据同步
      </h2>
      <p className="mt-2.5 text-sm leading-7 text-[var(--text-muted)]">
        游客记录与每个账号分别保存。首次确认后自动同步，退出登录会回到游客记录；各账号的本地缓存会保留。
      </p>

      <div className="mt-5 overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--canvas)]">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">本地与云端记录数量</caption>
          <thead>
            <tr className="border-b border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--text-strong)]">
              <th className="py-3 pr-3 pl-4 font-semibold">记录</th>
              <th className="px-3 py-3 font-semibold">本地账号</th>
              <th className="px-3 py-3 font-semibold">云端</th>
              {!state.confirmed && (
                <th className="px-3 py-3 font-semibold">游客记录</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {(Object.keys(collectionLabels) as LearningCollection[]).map(
              (field) => (
                <tr key={field}>
                  <th className="py-3 pr-3 pl-4 font-normal text-[var(--text-strong)]">
                    {collectionLabels[field]}
                  </th>
                  <td className="px-3 py-3 font-mono tabular-nums">
                    {Object.keys(local[field]).length}
                  </td>
                  <td className="px-3 py-3 font-mono tabular-nums">
                    {state.remote
                      ? Object.keys(remote[field]).length
                      : "待读取"}
                  </td>
                  {!state.confirmed && (
                    <td className="px-3 py-3 font-mono tabular-nums">
                      {guest ? Object.keys(guest[field]).length : "无法读取"}
                    </td>
                  )}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      {!state.confirmed && (
        <label className="mt-5 flex items-start gap-3 text-sm leading-7 text-[var(--text-strong)]">
          <input
            type="checkbox"
            className="mt-2 accent-[var(--accent)]"
            checked={includeGuest && !!guest}
            disabled={!guest || busy}
            onChange={(event) => setIncludeGuest(event.target.checked)}
          />
          将当前浏览器的游客记录合入此账号，原游客副本保留。
        </label>
      )}

      {(!state.confirmed || state.phase === "conflict") && (
        <div className="mt-5 max-w-sm">
          <CustomSelect
            label="同一条记录发生冲突时"
            value={preference}
            disabled={busy}
            onChange={(value) => setPreference(value as MergePreference)}
            options={[
              { value: "local", label: "采用本地修改" },
              { value: "remote", label: "采用云端修改" },
            ]}
          />
          <p className="mt-2 text-xs leading-6 text-[var(--text-faint)]">
            两边独有的记录会保留；只有同一条记录的并发修改按此选择处理。删除与编辑也可能冲突，重复同步不会累加同一条记录。
          </p>
        </div>
      )}

      {state.conflicts.length > 0 && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-[var(--warning-border)] bg-[var(--warning-soft)] p-4 text-sm leading-7 text-[var(--text-strong)]"
        >
          <p className="font-medium text-[var(--warning)]">
            发现 {state.conflicts.length}{" "}
            条冲突，自动同步已暂停。确认处理方式后继续。
          </p>
          <ul className="mt-2 list-disc pl-5 text-xs">
            {state.conflicts.slice(0, 8).map((conflict) => (
              <li
                key={`${conflict.collection}:${conflict.id}`}
                className="break-all"
              >
                {collectionLabels[conflict.collection]}：{conflict.id}
              </li>
            ))}
          </ul>
        </div>
      )}

      {state.message && (
        <p
          role={state.phase === "error" ? "alert" : "status"}
          className={`mt-4 text-sm leading-7 ${
            state.phase === "error"
              ? "text-[var(--danger)]"
              : "text-[var(--text-muted)]"
          }`}
        >
          {state.message}
        </p>
      )}

      {state.phase === "pending" && (
        <p role="status" className="mt-4 text-sm text-[var(--text-faint)]">
          有本地更新，等待同步…
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        {!state.confirmed ? (
          <button
            type="button"
            className="study-button study-button-primary"
            disabled={busy || !state.remote}
            onClick={() =>
              void controller.synchronize(preference, includeGuest && !!guest)
            }
          >
            确认合并并启用同步
          </button>
        ) : state.phase === "conflict" ? (
          <button
            type="button"
            className="study-button study-button-primary"
            onClick={() => void controller.synchronize(preference)}
          >
            确认冲突处理并同步
          </button>
        ) : (
          <button
            type="button"
            className="study-button"
            disabled={busy}
            onClick={() => void controller.synchronize()}
          >
            {busy ? "正在同步…" : "立即同步"}
          </button>
        )}
        {!state.confirmed && (
          <button
            type="button"
            className="study-button"
            disabled={busy}
            onClick={() => void controller.synchronize()}
          >
            重新读取云端记录
          </button>
        )}
      </div>

      {!state.confirmed && (
        <p className="mt-3 text-xs leading-6 text-[var(--text-faint)]">
          确认前，学习记录只写入这个账号在本机的缓存，不自动上传。
        </p>
      )}
    </section>
  );
}
