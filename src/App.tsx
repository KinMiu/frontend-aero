import { HashRouter, Route, Routes, Navigate } from "react-router-dom"
import LandingPage from "@/pages/LandingPage"
import RegistrationPage from "@/pages/RegistrationPage"
import LoginPage from "@/pages/LoginPage"
import ArticleDetailPage from "@/pages/ArticleDetailPage"
import PublicTestimonialPage from "@/pages/PublicTestimonialPage"
import PublicDocumentPage from "@/pages/PublicDocumentPage"
import SuperAdminApp from "@/pages/superadmin/SuperAdminApp"
import OfficialAdminApp from "@/pages/officialadmin/OfficialAdminApp"
import { getCurrentUser } from "@/store"

function RequireAuth({ children, role }: { children: React.ReactNode; role: "superadmin" | "officialadmin" }) {
  const user = getCurrentUser()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) {
    if (user.role === "superadmin") return <Navigate to="/admin/dashboard" replace />
    return <Navigate to="/official/dashboard" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/daftar" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/artikel/:slug" element={<ArticleDetailPage />} />
        <Route path="/testimoni-public/:token" element={<PublicTestimonialPage />} />
        <Route path="/dokumen-public/:token" element={<PublicDocumentPage />} />
        <Route
          path="/admin/*"
          element={
            <RequireAuth role="superadmin">
              <SuperAdminApp />
            </RequireAuth>
          }
        />
        <Route
          path="/official/*"
          element={
            <RequireAuth role="officialadmin">
              <OfficialAdminApp />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
