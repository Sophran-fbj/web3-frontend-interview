import type { Metadata } from "next";
import Link from "next/link";

import { AccountAccess } from "@/components/account-access";
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
      className="mx-auto w-full max-w-4xl px-5 py-14 sm:px-8 sm:py-20"
    >
      <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[var(--text-strong)] sm:text-5xl">
        账号与同步
      </h1>
      {available ? (
        <AccountAccess oauthError={typeof params.error === "string"} />
      ) : (
        <div className="mt-8">
          <p className="text-sm leading-7">
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
