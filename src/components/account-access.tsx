"use client";

import Link from "next/link";
import { useState } from "react";

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
      <p role="status" className="mt-10">
        正在读取登录状态…
      </p>
    );
  return (
    <section
      className="mt-10 border-y border-[var(--line-strong)] py-6"
      aria-label="账号登录"
    >
      {sessionError ? (
        <div>
          <p role="alert">暂时无法读取账号状态，本地学习数据仍保留。</p>
          <button
            className="study-button mt-4"
            type="button"
            onClick={() => void refetch()}
          >
            重试连接
          </button>
        </div>
      ) : data?.user ? (
        <div>
          <p className="text-lg font-medium text-[var(--text-strong)]">
            已登录：{data.user.name}
          </p>
          <p className="mt-2 text-sm">{data.user.email}</p>
          <button
            type="button"
            className="study-button mt-5"
            disabled={busy}
            onClick={() => void signOut()}
          >
            {busy ? "正在退出…" : "退出登录"}
          </button>
        </div>
      ) : (
        <div>
          <p className="mb-4 text-sm leading-7">
            使用 GitHub 登录，本站不会接收你的 GitHub
            密码。不登录也可以继续本地练习。
          </p>
          <button
            className="study-button study-button-primary"
            type="button"
            disabled={busy}
            onClick={() => void signIn()}
          >
            {busy ? "正在跳转 GitHub…" : "使用 GitHub 登录"}
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm">
          {error}
        </p>
      )}
      <Link href="/questions" className="study-link mt-6 inline-block">
        返回题库
      </Link>
    </section>
  );
}
