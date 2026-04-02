import { GitPullRequest, GitBranch, CheckCircle2, Clock } from "lucide-react";

function Hero() {
  return (
    <section className="bg-bg">
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-16 md:pt-28 md:pb-24 text-center">

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-primary">
          Stay on top of every pull request
        </h1>

        {/* Subtext */}
        <p className="mt-6 max-w-2xl mx-auto text-secondary text-base md:text-lg leading-relaxed">
          Track repository activity, review status, and team progress in one
          focused workspace built for developers.
        </p>

        {/* Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button className="px-6 py-3 rounded-md bg-hover hover:bg-selected text-primary transition">
            Connect repositories
          </button>

          <button className="px-6 py-3 rounded-md border border-divider text-secondary hover:text-primary hover:bg-hover transition">
            View demo
          </button>
        </div>

        {/* PR Dashboard Preview */}
        <div className="mt-16 mx-auto max-w-5xl text-left">
          <div className="rounded-xl border border-divider bg-surface overflow-hidden">

            {/* Repo header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-divider">
              <div className="flex items-center gap-3">
                <GitBranch size={18} className="text-secondary" />
                <span className="text-primary font-medium">
                  pr-tracker/frontend
                </span>
              </div>
              <span className="text-secondary text-sm">3 open PRs</span>
            </div>

            {/* PR rows */}
            <div className="divide-y divide-[var(--divider)]">

              {/* PR item */}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <GitPullRequest size={18} className="text-secondary" />
                  <div>
                    <div className="text-primary text-sm font-medium">
                      Add dashboard filters
                    </div>
                    <div className="text-secondary text-xs">
                      #128 opened by Aditi
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* status */}
                  <span className="flex items-center gap-1 text-secondary text-xs">
                    <Clock size={14} /> Review
                  </span>

                  {/* avatars */}
                  <div className="flex -space-x-2">
                    <div className="h-6 w-6 rounded-full bg-hover border border-divider" />
                    <div className="h-6 w-6 rounded-full bg-hover border border-divider" />
                    <div className="h-6 w-6 rounded-full bg-hover border border-divider" />
                  </div>
                </div>
              </div>

              {/* PR item */}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <GitPullRequest size={18} className="text-secondary" />
                  <div>
                    <div className="text-primary text-sm font-medium">
                      Fix mobile navbar layout
                    </div>
                    <div className="text-secondary text-xs">
                      #124 opened by Raj
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-secondary text-xs">
                    <CheckCircle2 size={14} /> Approved
                  </span>

                  <div className="flex -space-x-2">
                    <div className="h-6 w-6 rounded-full bg-hover border border-divider" />
                    <div className="h-6 w-6 rounded-full bg-hover border border-divider" />
                  </div>
                </div>
              </div>

              {/* PR item */}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <GitPullRequest size={18} className="text-secondary" />
                  <div>
                    <div className="text-primary text-sm font-medium">
                      API pagination support
                    </div>
                    <div className="text-secondary text-xs">
                      #119 opened by Sam
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-secondary text-xs">
                    <Clock size={14} /> Changes requested
                  </span>

                  <div className="flex -space-x-2">
                    <div className="h-6 w-6 rounded-full bg-hover border border-divider" />
                    <div className="h-6 w-6 rounded-full bg-hover border border-divider" />
                    <div className="h-6 w-6 rounded-full bg-hover border border-divider" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Hero;