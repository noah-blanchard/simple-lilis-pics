export default function LinksLoading() {
  return (
    <main
      className="min-h-svh bg-ink px-6 pt-5 pb-28 md:px-12"
      aria-busy="true"
    >
      <div className="mx-auto w-full max-w-[640px]">
        <div className="h-20 w-28 rounded-2xl bg-panel" />
        <div className="mt-5 h-8 w-40 rounded-xl bg-panel" />
        <div className="mt-3 h-4 w-64 max-w-full rounded-lg bg-panel" />
        <div className="mt-7 flex flex-col gap-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-20 rounded-card border border-line bg-panel"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
