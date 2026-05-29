import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth, PERMISSIONS } from "../auth/AuthProvider.js";
import { api } from "../api.js";

export function Layout() {
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  useEffect(() => {
    if (!can(PERMISSIONS.VIEW_MODERATION_QUEUE)) {
      return;
    }

    api
      .pendingCounts()
      .then((counts) => setPendingCount(counts.total))
      .catch(() => setPendingCount(0));
  }, [user, can]);

  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="nav-inner">
          <Link to="/" className="brand">
            GameFinder
          </Link>
          <nav className="nav-links">
            <NavLink to="/">Catalog</NavLink>
            {user ? (
              <>
                <NavLink to="/my-suggestions">My Suggestions</NavLink>
                {can(PERMISSIONS.SUBMIT_GAME_SUGGESTION) ? (
                  <NavLink to="/submit-game">Submit Game</NavLink>
                ) : null}
                {can(PERMISSIONS.VIEW_MODERATION_QUEUE) ? (
                  <NavLink to="/moderation">
                    Moderation{pendingCount ? ` (${pendingCount})` : ""}
                  </NavLink>
                ) : null}
                {can(PERMISSIONS.MANAGE_GAMES) ? (
                  <NavLink to="/admin">Admin</NavLink>
                ) : null}
              </>
            ) : null}
          </nav>
          <div className="nav-actions">
            {user ? (
              <>
                <span className="user-chip">
                  {user.displayName} · {user.role}
                </span>
                <button type="button" className="button-secondary" onClick={() => void handleLogout()}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="button-primary">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}
