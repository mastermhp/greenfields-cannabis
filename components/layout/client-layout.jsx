"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Navbar from "./navbar"
import Footer from "./footer"
import AgeVerification from "../modals/age-verification"
import AdminLoginModal from "../modals/admin-login-modal"
import { AuthProvider } from "@/hooks/use-auth"
import { useMobile } from "@/hooks/use-mobile"
import CartProvider from "../providers/cart-provider"

export default function ClientLayout({ children }) {
  const pathname = usePathname()
  const { isMobile } = useMobile()
  const [showAgeVerification, setShowAgeVerification] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)

  // Check if user has verified age
  useEffect(() => {
    const ageVerified = localStorage.getItem("ageVerified")
    if (!ageVerified) {
      setShowAgeVerification(true)
    }
  }, [])

  // Secret admin login shortcut (desktop only)
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only work on desktop
      if (isMobile) return

      // Ctrl+Shift+A for admin login
      if (event.ctrlKey && event.shiftKey && event.key === "A") {
        event.preventDefault()
        setShowAdminLogin(true)
      }

      // Escape to close admin login
      if (event.key === "Escape" && showAdminLogin) {
        setShowAdminLogin(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isMobile, showAdminLogin])

  const handleAgeVerified = () => {
    localStorage.setItem("ageVerified", "true")
    setShowAgeVerification(false)
  }

  const isAdminRoute = pathname?.startsWith("/admin")

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-black text-white">
          {!isAdminRoute && <Navbar />}
          <main className={!isAdminRoute ? "pt-0" : ""}>{children}</main>
          {!isAdminRoute && <Footer />}
        </div>

        {/* Age Verification Modal */}
        <AgeVerification isOpen={showAgeVerification} onVerified={handleAgeVerified} />

        {/* Secret Admin Login Modal */}
        <AdminLoginModal isOpen={showAdminLogin} onClose={() => setShowAdminLogin(false)} />
      </CartProvider>
    </AuthProvider>
  )
}
