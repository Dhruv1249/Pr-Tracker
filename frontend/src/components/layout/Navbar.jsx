import { NavLink } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  const linkBase =
    "block py-2 text-secondary hover:text-primary transition-colors";
  const active =
    "text-primary after:block after:h-[2px] after:bg-primary after:mt-1";

  const handleOnClickLogin = () => {
    navigate("/login");
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-divider bg-surface">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Brand */}
        <NavLink
          to="/"
          className="text-lg font-semibold tracking-tight text-primary"
        >
          PR Tracker
        </NavLink>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : ""}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : ""}`
            }
          >
            About
          </NavLink>
          <NavLink
            to="/docs"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : ""}`
            }
          >
            Docs
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : ""}`
            }
          >
            Contact
          </NavLink>
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3 text-sm">
          <button className="px-3 py-1.5 text-secondary hover:bg-hover hover:text-primary transition-colors"
          onClick={handleOnClickLogin}>
            Login
          </button>
          <button className="rounded-md px-4 py-1.5 bg-accent text-black hover:opacity-90 transition">
            Register
          </button>
        </div>

        {/* Mobile Icon */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-md hover:bg-hover transition"
          aria-label="menu"
        >
          {open ? (
            <X size={20} className="text-primary" />
          ) : (
            <Menu size={20} className="text-primary" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-divider px-6 py-4 space-y-2 bg-surface">
          <NavLink
            to="/"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : ""}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : ""}`
            }
          >
            About
          </NavLink>
          <NavLink
            to="/docs"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : ""}`
            }
          >
            Docs
          </NavLink>
          <NavLink
            to="/contact"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : ""}`
            }
          >
            Contact
          </NavLink>

          <div className="pt-3 flex gap-3">
            <button className="flex-1 py-2 text-secondary hover:bg-hover hover:text-primary transition">
              Dashboard
            </button>
            <button className="flex-1 py-2 text-secondary hover:bg-hover hover:text-primary transition">
              Login
            </button>
            <button className="flex-1 py-2 rounded-md bg-accent text-black hover:opacity-90 transition">
              Register
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;