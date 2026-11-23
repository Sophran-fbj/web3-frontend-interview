export default function QuestionDetailLoading() {
  return (
    <main
      id="main-content"
      aria-busy="true"
      aria-label="正在加载题目详情"
      className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14"
    >
      <div className="h-4 w-20 animate-pulse rounded bg-[var(--surface)] motion-reduce:animate-none" />

      <div className="mt-8 border-b border-[var(--line-strong)] pb-9">
        <div className="flex gap-2">
          <div className="h-6 w-14 animate-pulse rounded-full bg-[var(--surface)] motion-reduce:animate-none" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-[var(--surface)] motion-reduce:animate-none" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-[var(--surface)] motion-reduce:animate-none" />
        </div>
        <div className="mt-5 h-10 w-4/5 animate-pulse rounded-lg bg-[var(--surface)] motion-reduce:animate-none sm:h-12" />
        <div className="mt-4 h-5 w-2/3 animate-pulse rounded bg-[var(--surface)] motion-reduce:animate-none" />
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,46rem)_16rem] lg:items-start lg:gap-14">
        <div className="space-y-4">
          <div className="h-7 w-32 animate-pulse rounded bg-[var(--surface)] motion-reduce:animate-none" />
          <div className="h-4 w-full animate-pulse rounded bg-[var(--surface)] motion-reduce:animate-none" />
          <div className="h-4 w-11/12 animate-pulse rounded bg-[var(--surface)] motion-reduce:animate-none" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-[var(--surface)] motion-reduce:animate-none" />
          <div className="mt-8 h-24 w-full animate-pulse rounded-2xl bg-[var(--surface)] motion-reduce:animate-none" />
        </div>

        <aside className="space-y-4">
          <div className="study-card h-36 animate-pulse p-4 motion-reduce:animate-none" />
          <div className="study-card h-44 animate-pulse p-4 motion-reduce:animate-none" />
        </aside>
      </div>
    </main>
  );
}
