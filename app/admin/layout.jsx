"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Settings,
  FileText,
  Gift,
  Truck,
  BarChart3,
  Menu,
  X,
  LogOut,
  Bell,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

// This is a standalone layout for admin that doesn't include the main site's navbar/footer
const AdminLayout = ({ children }) => {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState(3)

  useEffect(() => {
    // Check if user is admin (in real app, check user role)
    if (!isAuthenticated) {
      router.push("/login?redirect=/admin")
      return
    }

    if (!user?.isAdmin) {
      router.push("/")
      return
    }
  }, [isAuthenticated, user, router])

  const sidebarItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Loyalty", href: "/admin/loyalty", icon: Gift },
    { name: "Shipping", href: "/admin/shipping", icon: Truck },
    { name: "Content", href: "/admin/content", icon: FileText },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold gold-text">Loading Admin Panel</h2>
          <p className="text-beige">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111] border-r border-[#333] transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#333]">
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center">
              <span className="text-black font-bold">G</span>
            </div>
            <h1 className="text-xl font-bold gold-text">Admin Panel</h1>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X size={20} />
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 text-beige hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#333]">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-[#333] text-beige hover:bg-red-500/10 hover:text-red-400 hover:border-red-400"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 mt-24">
        {/* Top bar */}
        <header className="bg-[#111] border-b border-[#333] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="lg:hidden">
                <Menu size={20} />
              </Button>
              <h2 className="text-xl font-semibold text-white">Admin Dashboard</h2>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell size={20} />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center">
                  <span className="text-black font-medium">{user?.name?.charAt(0) || "A"}</span>
                </div>
                <span className="text-beige">{user?.name || "Admin"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

export default AdminLayout
