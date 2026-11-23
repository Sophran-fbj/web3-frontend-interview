"use client";

import Link from "next/link";
import { useState } from "react";

import { AccountSyncPanel } from "@/components/account-sync-panel";
import { authClient } from "@/lib/auth-client";

export function AccountAccess({ oauthError }: { oauthError: boolean }) {
  const {
    data,
    isPending,
    error: sessionError,
    refetch,
  } = authClient.useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(
    oauthError ? "GitHub 授权未完成，请重试。" : "",
  );

  async function signIn() {
    setBusy(true);
    setError("");
    try {
      const result = await authClient.signIn.social({
        provider: "github",
        callbackURL: "/account",
        errorCallbackURL: "/account?error=oauth",
      });
      if (result.error) {
        setError("无法发起 GitHub 登录，请稍后重试。");
        setBusy(false);
      }
    } catch {
      setError("网络连接失败，请稍后重试。");
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    setError("");
    try {
      const result = await authClient.signOut();
      if (result.error) setError("退出未完成，请重试。");
    } catch {
      setError("网络连接失败，请重试退出。");
    } finally {
      setBusy(false);
    }
  }

  if (isPending)
    return (
      <p role="status" className="mt-10 text-sm text-[var(--text-muted)]">
        正在读取登录状态…
      </p>
    );

  return (
    <section className="study-card mt-10 p-5 sm:p-6" aria-label="账号登录">
      {sessionError ? (
        <div>
          <p role="alert" className="text-sm text-[var(--danger)]">
            暂时无法读取账号状态，本地学习数据仍保留。
          </p>
          <button
            className="study-button mt-4"
            type="button"
            onClick={() => void refetch()}
          >
            重试连接
          </button>
        </div>
      ) : data?.user ? (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-[var(--text-strong)]">
              已登录：{data.user.name}
            </p>
            <p className="mt-1 font-mono text-xs text-[var(--text-faint)]">
              {data.user.email}
            </p>
          </div>
          <button
            type="button"
            className="study-button"
            disabled={busy}
            onClick={() => void signOut()}
          >
            {busy ? "正在退出…" : "退出登录"}
          </button>
        </div>
      ) : (
        <div>
          <p className="mb-4 text-sm leading-7 text-[var(--text-muted)]">
            使用 GitHub 登录，本站不会接收你的 GitHub
            密码。不登录也可以继续本地练习。
          </p>
          <button
            className="study-button study-button-primary"
            type="button"
            disabled={busy}
            onClick={() => void signIn()}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="size-4 shrink-0"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
            <span>{busy ? "正在跳转 GitHub…" : "使用 GitHub 登录"}</span>
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-[var(--danger)]">
          {error}
        </p>
      )}
      {data?.user && !sessionError && <AccountSyncPanel key={data.user.id} />}
      <div className="mt-6 border-t border-[var(--line)] pt-4">
        <Link href="/questions" className="study-link inline-block">
          返回题库
        </Link>
      </div>
    </section>
  );
}
