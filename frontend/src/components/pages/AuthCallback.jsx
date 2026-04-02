import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * /auth/callback
 * Extracts the JWT from the URL hash fragment, stores it in localStorage,
 * then redirects to /dashboard.
 */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash; // "#token=eyJ..."
    const token = hash
      .replace(/^#/, "")
      .split("&")
      .find((p) => p.startsWith("token="))
      ?.split("=")
      .slice(1)
      .join("="); // handle '=' chars inside JWT

    if (token) {
      localStorage.setItem("token", token);
    }

    navigate("/dashboard", { replace: true });
  }, [navigate]);

  return null;
}
