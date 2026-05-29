import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider.js";
import { Layout } from "./components/Layout.js";
import { AdminPage } from "./pages/AdminPage.js";
import { CatalogPage } from "./pages/CatalogPage.js";
import { GameDetailPage } from "./pages/GameDetailPage.js";
import { LoginPage } from "./pages/LoginPage.js";
import { ModerationPage } from "./pages/ModerationPage.js";
import { MySuggestionsPage } from "./pages/MySuggestionsPage.js";
import { SubmitGamePage } from "./pages/SubmitGamePage.js";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<CatalogPage />} />
            <Route path="games/:slug" element={<GameDetailPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="my-suggestions" element={<MySuggestionsPage />} />
            <Route path="submit-game" element={<SubmitGamePage />} />
            <Route path="moderation" element={<ModerationPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
