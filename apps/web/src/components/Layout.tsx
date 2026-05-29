import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider.js";
import { getNavItems, getRoleHome } from "../auth/role-access.js";
import { api } from "../api.js";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const navItems = getNavItems(user?.role);
  const showPendingCount = user?.role === "moderator";
  const brandLink = user ? getRoleHome(user.role) : "/login";

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  useEffect(() => {
    if (!showPendingCount) {
      setPendingCount(0);
      return;
    }

    api
      .pendingCounts()
      .then((counts) => setPendingCount(counts.total))
      .catch(() => setPendingCount(0));
  }, [user, showPendingCount]);

  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="nav-inner">
          <Link to={brandLink} className="brand">
            GameFinder
          </Link>
          {navItems.length ? (
            <nav className="nav-links">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to}>
                  {item.label}
                  {item.showPendingCount && pendingCount
                    ? ` (${pendingCount})`
                    : ""}
                </NavLink>
              ))}
            </nav>
          ) : null}
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
