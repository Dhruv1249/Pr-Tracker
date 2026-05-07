import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * /auth/callback
 * Redirects to /dashboard after successful login via HttpOnly cookie.
 */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  return null;
}
