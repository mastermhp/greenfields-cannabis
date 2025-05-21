"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import AgeVerification from "@/components/modals/age-verification"
import Loader from "@/components/ui/loader"
import { useToast } from "@/hooks/use-toast"

export default function ClientLayout({ children }) {
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if user has already verified age
    const isVerified = localStorage.getItem("age-verified")
    if (isVerified) {
      setVerified(true)
    }

    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleVerify = () => {
    setVerified(true)
    localStorage.setItem("age-verified", "true")
    toast({
      title: "Age Verified",
      description: "Welcome to Greenfields",
    })
  }

  if (loading) {
    return <Loader />
  }

  if (!verified) {
    return <AgeVerification onVerify={handleVerify} />
  }

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <main key={pathname}>{children}</main>
      </AnimatePresence>
      <Footer />
    </>
  )
}
