import { GitPullRequest, Users, BarChart3 } from "lucide-react";

function Features() {
  return (
    <section className="bg-bg">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">

        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-primary">
            Everything you need to manage PR flow
          </h2>
          <p className="mt-4 text-secondary">
            Monitor repositories, reviews, and team activity from a single
            calm interface built for developers.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">

          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-3">
              <GitPullRequest size={18} className="text-primary" />
              <h3 className="text-primary font-medium">
                Unified PR tracking
              </h3>
            </div>
            <p className="mt-4 text-secondary text-sm leading-relaxed">
              See all pull requests across repositories in one place with
              clear status and ownership.
            </p>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-3">
              <Users size={18} className="text-primary" />
              <h3 className="text-primary font-medium">
                Reviewer visibility
              </h3>
            </div>
            <p className="mt-4 text-secondary text-sm leading-relaxed">
              Instantly know who is reviewing, blocking, or waiting on each
              change request.
            </p>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-3">
              <BarChart3 size={18} className="text-primary" />
              <h3 className="text-primary font-medium">
                Flow insights
              </h3>
            </div>
            <p className="mt-4 text-secondary text-sm leading-relaxed">
              Understand cycle time, bottlenecks, and throughput across your
              development workflow.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Features;