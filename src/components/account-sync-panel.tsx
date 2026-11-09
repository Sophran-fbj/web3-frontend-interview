"use client";

import { useState } from "react";

import {
  useAccountLearning,
  useAccountSyncState,
} from "@/components/learning-account-provider";
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
      className="mt-10 border-t border-[var(--line-strong)] pt-6"
      aria-labelledby="cloud-sync-title"
    >
      <h2
        id="cloud-sync-title"
        className="text-xl font-medium text-[var(--text-strong)]"
      >
        学习数据同步
      </h2>
      <p className="mt-3 text-sm leading-7">
        游客记录与每个账号分别保存。首次确认后自动同步，退出登录会回到游客记录；各账号的本地缓存会保留。
      </p>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">本地与云端记录数量</caption>
          <thead>
            <tr className="border-b border-[var(--line)]">
              <th className="py-3 pr-3">记录</th>
              <th className="px-3 py-3">本地账号</th>
              <th className="px-3 py-3">云端</th>
              {!state.confirmed && <th className="px-3 py-3">游客记录</th>}
            </tr>
          </thead>
          <tbody>
            {(Object.keys(collectionLabels) as LearningCollection[]).map(
              (field) => (
                <tr key={field} className="border-b border-[var(--line)]">
                  <th className="py-3 pr-3 font-normal">
                    {collectionLabels[field]}
                  </th>
                  <td className="px-3 py-3">
                    {Object.keys(local[field]).length}
                  </td>
                  <td className="px-3 py-3">
                    {state.remote
                      ? Object.keys(remote[field]).length
                      : "待读取"}
                  </td>
                  {!state.confirmed && (
                    <td className="px-3 py-3">
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
        <label className="mt-5 flex items-start gap-3 text-sm leading-7">
          <input
            type="checkbox"
            className="mt-2"
            checked={includeGuest && !!guest}
            disabled={!guest || busy}
            onChange={(event) => setIncludeGuest(event.target.checked)}
          />
          将当前浏览器的游客记录合入此账号，原游客副本保留。
        </label>
      )}
      {(!state.confirmed || state.phase === "conflict") && (
        <div className="mt-5">
          <label className="study-label">
            同一条记录发生冲突时
            <select
              className="study-input"
              value={preference}
              onChange={(event) =>
                setPreference(event.target.value as MergePreference)
              }
              disabled={busy}
            >
              <option value="local">采用本地修改</option>
              <option value="remote">采用云端修改</option>
            </select>
          </label>
          <p className="mt-2 text-xs leading-6">
            两边独有的记录会保留；只有同一条记录的并发修改按此选择处理。删除与编辑也可能冲突，重复同步不会累加同一条记录。
          </p>
        </div>
      )}
      {state.conflicts.length > 0 && (
        <div
          role="alert"
          className="mt-4 border-l-2 border-[var(--accent)] pl-4 text-sm leading-7"
        >
          <p>
            发现 {state.conflicts.length}{" "}
            条冲突，自动同步已暂停。确认处理方式后继续。
          </p>
          <ul>
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
          className="mt-4 text-sm leading-7"
        >
          {state.message}
        </p>
      )}
      {state.phase === "pending" && (
        <p role="status" className="mt-4 text-sm">
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
        <p className="mt-3 text-xs leading-6">
          确认前，学习记录只写入这个账号在本机的缓存，不自动上传。
        </p>
      )}
    </section>
  );
}
