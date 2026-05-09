import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * /auth/callback
 * Redirects to /dashboard after successful login via HttpOnly cookie.
 */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    const token = params.get("token");
    const error = params.get("error");

    if (token) {
      localStorage.setItem("token", token);
    }

    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);

    if (error) {
      navigate("/login", { replace: true });
      return;
    }

    navigate("/dashboard", { replace: true });
  }, [navigate]);

  return null;
}
