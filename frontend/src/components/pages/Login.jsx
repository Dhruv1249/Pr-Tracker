import { Github, ShieldCheck, GitPullRequest } from "lucide-react";
import { useState } from "react";

const serverEndpoint = import.meta.env.VITE_SERVER_ENDPOINT;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    try {
      setLoading(true);
      window.location.href = `${serverEndpoint}/api/auth/github`;
      
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if(loading){
    return (
      <div>
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="text-xl font-semibold text-primary">
            PR Tracker
          </div>
          <p className="text-sm text-secondary">
            Connect your GitHub account to continue
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-divider bg-surface p-6 space-y-5">
          {/* Connect Button */}
          <button
            onClick={handleConnect}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-black hover:opacity-90 transition"
          >
            <Github className="h-4 w-4" />
            Continue with GitHub
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 text-xs text-secondary">
            <div className="flex-1 h-px bg-divider" />
            secure connection
            <div className="flex-1 h-px bg-divider" />
          </div>

          {/* Permissions */}
          <div className="space-y-3 text-sm">
            <Permission
              icon={GitPullRequest}
              text="Read pull requests and repositories"
            />
            <Permission
              icon={ShieldCheck}
              text="No write access without approval"
            />
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-secondary">
          By continuing, you authorize PR Tracker to access your GitHub
          repositories for pull request analysis.
        </p>
      </div>
    </div>
  );
}

function Permission({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 text-secondary">
      <Icon className="h-4 w-4" />
      {text}
    </div>
  );
}