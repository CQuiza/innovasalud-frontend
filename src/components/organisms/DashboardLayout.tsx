import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Topbar from './Topbar'
import SidebarDrawer from './SidebarDrawer'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-content-50">
      <Topbar onMenuClick={() => setSidebarOpen(true)} />
      <SidebarDrawer open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="dashboard-content overflow-y-auto" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <Outlet />
      </main>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
