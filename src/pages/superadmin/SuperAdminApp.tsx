import { Route, Routes, Navigate } from "react-router-dom"
import { LuLayoutDashboard, LuUserCheck, LuFileText, LuFolderOpen, LuCalendarCheck, LuStar, LuFileText as LuArticle } from "react-icons/lu"
import AdminLayout from "@/components/AdminLayout"
import SuperAdminDashboard from "./Dashboard"
import ManageOfficials from "./ManageOfficials"
import SuperAdminReports from "./Reports"
import OpenPendaftaranPage from "./OpenPendaftaran"
import TestimoniPage from "./Testimoni"
import ArtikelPage from "./Artikel"

const navItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LuLayoutDashboard },
  { label: "Kelola Official Admin", path: "/admin/officials", icon: LuUserCheck },
  {
    label: "Kelola Konten",
    path: "/admin/konten/pendaftaran",
    icon: LuFolderOpen,
    children: [
      { label: "Open Pendaftaran", path: "/admin/konten/pendaftaran", icon: LuCalendarCheck },
      { label: "Testimoni", path: "/admin/konten/testimoni", icon: LuStar },
      { label: "Artikel", path: "/admin/konten/artikel", icon: LuArticle },
    ],
  },
  { label: "Laporan", path: "/admin/reports", icon: LuFileText },
]

export default function SuperAdminApp() {
  return (
    <AdminLayout navItems={navItems}>
      <Routes>
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="officials" element={<ManageOfficials />} />
        <Route path="reports" element={<SuperAdminReports />} />
        <Route path="konten/pendaftaran" element={<OpenPendaftaranPage />} />
        <Route path="konten/testimoni" element={<TestimoniPage />} />
        <Route path="konten/artikel" element={<ArtikelPage />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AdminLayout>
  )
}
