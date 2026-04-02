import { Github, Twitter, Slack } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-bg border-t border-divider">
      <div className="mx-auto max-w-7xl px-6 py-12">

        <div className="grid gap-10 md:grid-cols-4">

          {/* Brand */}
          <div>
            <div className="text-primary font-semibold text-lg">
              Pr-tracker
            </div>
            <p className="mt-3 text-secondary text-sm">
              Monitor pull requests, reviews, and repository activity in a
              focused developer workspace.
            </p>
          </div>

          {/* Product */}
          <div>
            <div className="text-primary font-medium">Product</div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="text-secondary hover:text-primary cursor-pointer">Features</div>
              <div className="text-secondary hover:text-primary cursor-pointer">Integrations</div>
              <div className="text-secondary hover:text-primary cursor-pointer">Pricing</div>
            </div>
          </div>

          {/* Resources */}
          <div>
            <div className="text-primary font-medium">Resources</div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="text-secondary hover:text-primary cursor-pointer">Docs</div>
              <div className="text-secondary hover:text-primary cursor-pointer">API</div>
              <div className="text-secondary hover:text-primary cursor-pointer">Support</div>
            </div>
          </div>

          {/* Social */}
          <div>
            <div className="text-primary font-medium">Community</div>
            <div className="mt-3 flex gap-3">
              <a className="p-2 rounded-md bg-hover hover:bg-selected transition">
                <Github size={18} className="text-primary" />
              </a>
              <a className="p-2 rounded-md bg-hover hover:bg-selected transition">
                <Twitter size={18} className="text-primary" />
              </a>
              <a className="p-2 rounded-md bg-hover hover:bg-selected transition">
                <Slack size={18} className="text-primary" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-divider flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="text-secondary">
            © {new Date().getFullYear()} Pr-tracker. All rights reserved.
          </div>

          <div className="flex gap-6">
            <span className="text-secondary hover:text-primary cursor-pointer">
              Privacy
            </span>
            <span className="text-secondary hover:text-primary cursor-pointer">
              Terms
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;