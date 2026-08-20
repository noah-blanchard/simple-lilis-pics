export default function LinksLoading() {
  return (
    <main
      className="min-h-svh bg-[radial-gradient(circle_at_top,var(--accent-soft),var(--bg)_58%)] md:px-8 md:py-10"
      aria-busy="true"
    >
      <div className="mx-auto min-h-svh w-full max-w-[500px] overflow-hidden bg-ink shadow-[0_28px_80px_rgb(23_23_23/0.12)] md:min-h-0 md:rounded-[36px]">
        <div className="h-[clamp(220px,30svh,260px)] bg-accent-soft" />
        <div className="relative px-5 pt-[72px] pb-12">
          <div className="-top-[54px] -translate-x-1/2 absolute left-1/2 h-[108px] w-[108px] rounded-full border-[7px] border-ink bg-panel" />
          <div className="mx-auto h-9 w-40 rounded-xl bg-panel" />
          <div className="mx-auto mt-3 h-4 w-64 max-w-full rounded-lg bg-panel" />
          <div className="mt-8 flex flex-col gap-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-[72px] rounded-[22px] bg-panel" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
