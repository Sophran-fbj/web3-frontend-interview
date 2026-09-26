export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-20">
      <p className="mb-5 font-mono text-sm text-emerald-400">
        Web3 Frontend Interview
      </p>
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
        不是背答案，是真正理解 Web3 前端。
      </h1>
      <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
        面向候选人的中文专项题库。内容覆盖钱包连接、签名、交易、合约交互、安全与工程化，
        并记录适用版本、验证日期和可靠来源。
      </p>
      <div className="mt-10 flex flex-wrap gap-3 text-sm text-slate-300">
        {["100 道首发目标", "人工验证", "真实业务场景", "本地学习进度"].map(
          (item) => (
            <span
              key={item}
              className="rounded-full border border-slate-700 px-4 py-2"
            >
              {item}
            </span>
          ),
        )}
      </div>
      <p className="mt-12 text-sm text-slate-500">
        项目骨架已就绪，题库内容正在建设中。
      </p>
    </main>
  );
}
