import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider.js";
import { Layout } from "./components/Layout.js";
import { ProtectedRoute } from "./components/ProtectedRoute.js";
import { AdminPage } from "./pages/AdminPage.js";
import { CatalogPage } from "./pages/CatalogPage.js";
import { GameDetailPage } from "./pages/GameDetailPage.js";
import { LoginPage } from "./pages/LoginPage.js";
import { ModerationPage } from "./pages/ModerationPage.js";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route
              index
              element={
                <ProtectedRoute route="catalog">
                  <CatalogPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="games/:slug"
              element={
                <ProtectedRoute route="game-detail">
                  <GameDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="login"
              element={
                <ProtectedRoute route="login">
                  <LoginPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="moderation"
              element={
                <ProtectedRoute route="moderation">
                  <ModerationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin"
              element={
                <ProtectedRoute route="admin">
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
