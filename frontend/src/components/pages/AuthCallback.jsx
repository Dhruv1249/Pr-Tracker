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
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  return null;
}
