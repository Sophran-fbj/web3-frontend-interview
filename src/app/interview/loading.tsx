export default function InterviewLoading() {
  return (
    <main
      id="main-content"
      aria-busy="true"
      aria-label="正在加载模拟面试"
      className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16"
    >
      <div className="border-l-2 border-[var(--accent)] pl-5 sm:pl-7">
        <div className="h-3 w-28 animate-pulse rounded bg-[var(--surface)] motion-reduce:animate-none" />
        <div className="mt-3 h-10 w-44 animate-pulse rounded-lg bg-[var(--surface)] motion-reduce:animate-none sm:h-12" />
        <div className="mt-4 h-5 max-w-lg animate-pulse rounded bg-[var(--surface)] motion-reduce:animate-none" />
      </div>

      <div className="study-card mt-10 space-y-5 p-5 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="h-16 animate-pulse rounded-lg bg-[var(--surface)] motion-reduce:animate-none" />
          <div className="h-16 animate-pulse rounded-lg bg-[var(--surface)] motion-reduce:animate-none" />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="h-16 animate-pulse rounded-lg bg-[var(--surface)] motion-reduce:animate-none" />
          <div className="h-16 animate-pulse rounded-lg bg-[var(--surface)] motion-reduce:animate-none" />
          <div className="h-16 animate-pulse rounded-lg bg-[var(--surface)] motion-reduce:animate-none" />
        </div>
      </div>
    </main>
  );
}
