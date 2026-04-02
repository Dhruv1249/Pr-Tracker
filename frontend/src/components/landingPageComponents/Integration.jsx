import { Github, GitBranch, Slack, GitPullRequest } from "lucide-react";

function Integrations() {
  return (
    <section className="bg-bg">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">

        {/* Heading */}
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-primary">
            Connect your development stack
          </h2>
          <p className="mt-4 text-secondary">
            Sync pull requests, repositories, and notifications from the tools
            your team already uses.
          </p>
        </div>

        {/* Integration cards */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          <div className="glass rounded-xl p-6 flex items-center gap-4">
            <Github size={20} className="text-primary" />
            <div>
              <div className="text-primary font-medium">GitHub</div>
              <div className="text-secondary text-xs">Repositories & PRs</div>
            </div>
          </div>

          <div className="glass rounded-xl p-6 flex items-center gap-4">
            <GitBranch size={20} className="text-primary" />
            <div>
              <div className="text-primary font-medium">GitLab</div>
              <div className="text-secondary text-xs">Merge requests</div>
            </div>
          </div>

          <div className="glass rounded-xl p-6 flex items-center gap-4">
            <GitPullRequest size={20} className="text-primary" />
            <div>
              <div className="text-primary font-medium">Bitbucket</div>
              <div className="text-secondary text-xs">Code reviews</div>
            </div>
          </div>

          <div className="glass rounded-xl p-6 flex items-center gap-4">
            <Slack size={20} className="text-primary" />
            <div>
              <div className="text-primary font-medium">Slack</div>
              <div className="text-secondary text-xs">Review alerts</div>
            </div>
          </div>

        </div>

        {/* Integration flow preview */}
        <div className="mt-14 glass rounded-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            <div>
              <div className="text-primary font-medium">
                Real-time PR updates
              </div>
              <div className="text-secondary text-sm mt-1">
                Changes, reviews, and merges sync automatically across your
                repositories and team channels.
              </div>
            </div>

            <div className="flex items-center gap-3 text-secondary text-sm">
              <Github size={18} />
              <span>→</span>
              <GitPullRequest size={18} />
              <span>→</span>
              <Slack size={18} />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

export default Integrations;