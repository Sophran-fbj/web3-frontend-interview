export default function QuestionsLoading() {
  return (
    <main
      id="main-content"
      aria-busy="true"
      aria-label="正在加载题库"
      className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16"
    >
      <div className="border-l-2 border-[var(--accent)] pl-5 sm:pl-7">
        <div className="h-3 w-28 animate-pulse rounded bg-[var(--surface)] motion-reduce:animate-none" />
        <div className="mt-3 h-10 w-64 animate-pulse rounded-lg bg-[var(--surface)] motion-reduce:animate-none sm:h-12 sm:w-80" />
        <div className="mt-4 h-5 max-w-xl animate-pulse rounded bg-[var(--surface)] motion-reduce:animate-none" />
      </div>

      <div className="study-card mt-10 p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,1.4fr)_repeat(4,minmax(0,0.85fr))]">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-3 w-12 animate-pulse rounded bg-[var(--surface)] motion-reduce:animate-none" />
              <div className="h-11 animate-pulse rounded-lg bg-[var(--surface)] motion-reduce:animate-none" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 divide-y divide-[var(--line)]">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-3 py-6">
            <div className="h-6 w-3/4 animate-pulse rounded bg-[var(--surface)] motion-reduce:animate-none" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-[var(--surface)] motion-reduce:animate-none" />
          </div>
        ))}
      </div>
    </main>
  );
}
