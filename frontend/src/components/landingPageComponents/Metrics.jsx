import { GitPullRequest, Clock, CheckCircle2, Users } from "lucide-react";

function Metrics() {
  return (
    <section className="bg-bg">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">

        {/* Heading */}
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-primary">
            Keep your review flow moving
          </h2>
          <p className="mt-4 text-secondary">
            Visibility into pull request lifecycle helps teams merge faster
            and reduce bottlenecks.
          </p>
        </div>

        {/* Metrics grid */}
        <div className="mt-14 grid gap-6 md:grid-cols-4">

          <div className="glass rounded-xl p-6">
            <GitPullRequest size={18} className="text-primary" />
            <div className="mt-4 text-3xl font-semibold text-primary">
              128
            </div>
            <div className="mt-1 text-secondary text-sm">
              Open PRs tracked
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <Clock size={18} className="text-primary" />
            <div className="mt-4 text-3xl font-semibold text-primary">
              14h
            </div>
            <div className="mt-1 text-secondary text-sm">
              Avg review time
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <CheckCircle2 size={18} className="text-primary" />
            <div className="mt-4 text-3xl font-semibold text-primary">
              92%
            </div>
            <div className="mt-1 text-secondary text-sm">
              Merge success rate
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <Users size={18} className="text-primary" />
            <div className="mt-4 text-3xl font-semibold text-primary">
              24
            </div>
            <div className="mt-1 text-secondary text-sm">
              Active reviewers
            </div>
          </div>

        </div>

        {/* Activity strip */}
        <div className="mt-14 glass rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>
              <div className="text-primary font-medium">
                Repository activity
              </div>
              <div className="text-secondary text-sm mt-1">
                Pull request flow across your connected repos
              </div>
            </div>

            {/* repo pills */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-md bg-hover text-secondary text-xs">
                frontend
              </span>
              <span className="px-3 py-1 rounded-md bg-hover text-secondary text-xs">
                api
              </span>
              <span className="px-3 py-1 rounded-md bg-hover text-secondary text-xs">
                mobile
              </span>
              <span className="px-3 py-1 rounded-md bg-hover text-secondary text-xs">
                infra
              </span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

export default Metrics;