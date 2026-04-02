function Cta() {
  return (
    <section className="bg-bg">
      <div className="mx-auto max-w-7xl px-6 pb-16 md:pb-24">

        <div className="rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-primary">
            Bring clarity to your pull request workflow
          </h2>

          <p className="mt-4 max-w-2xl mx-auto text-secondary">
            Connect your repositories and start tracking reviews, approvals,
            and merge flow in minutes.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button className="px-6 py-3 rounded-md bg-hover hover:bg-selected text-primary transition">
              Connect GitHub
            </button>

            <button className="px-6 py-3 rounded-md border border-divider text-secondary hover:text-primary hover:bg-hover transition">
              View documentation
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Cta;