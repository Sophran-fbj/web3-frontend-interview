import type { Metadata } from "next";
import Link from "next/link";

import { AccountAccess } from "@/components/account-access";
import { PageHeader } from "@/components/ui/page-header";
import { readAuthConfiguration } from "@/lib/auth-config";

export const metadata: Metadata = {
  title: "账号与同步",
  robots: { index: false, follow: false },
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { available } = readAuthConfiguration();
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16"
    >
      <PageHeader
        backLink={{ href: "/questions", label: "返回题库" }}
        eyebrow="ACCOUNT & SYNC"
        title="账号与同步"
        description="管理 GitHub 登录状态，并与云端安全同步掌握状态、收藏、题单与面试记录。"
      />
      {available ? (
        <AccountAccess oauthError={typeof params.error === "string"} />
      ) : (
        <div className="study-card mt-10 p-6">
          <p className="text-sm leading-7 text-[var(--text-muted)]">
            账号服务尚未启用。你可以继续浏览题库，学习状态和练习记录仍保存在当前浏览器。
          </p>
          <Link href="/questions" className="study-button mt-5">
            继续本地学习
          </Link>
        </div>
      )}
    </main>
  );
}
