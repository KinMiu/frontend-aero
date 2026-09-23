import { Route, Routes, Navigate } from "react-router-dom"
import { LuLayoutDashboard, LuFileText } from "react-icons/lu"
import AdminLayout from "@/components/AdminLayout"
import OfficialDashboard from "./Dashboard"
import OfficialReports from "./Reports"

const navItems = [
  { label: "Dashboard", path: "/official/dashboard", icon: LuLayoutDashboard },
  { label: "Laporan Pendaftaran", path: "/official/reports", icon: LuFileText },
]

export default function OfficialAdminApp() {
  return (
    <AdminLayout navItems={navItems}>
      <Routes>
        <Route path="dashboard" element={<OfficialDashboard />} />
        <Route path="reports" element={<OfficialReports />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AdminLayout>
  )
}
