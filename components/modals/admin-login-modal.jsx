"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { X, Lock, User, Eye, EyeOff, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

export default function AdminLoginModal({ isOpen, onClose }) {
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const [lockTimer, setLockTimer] = useState(0)

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
      setFormData({
        email: "",
        password: "",
      })
      setShowPassword(false)
      setLoading(false)
    }
  }, [isOpen])

  // Handle account lockout timer
  useEffect(() => {
    let interval

    if (locked && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer((prev) => {
          if (prev <= 1) {
            setLocked(false)
            setAttempts(0)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [locked, lockTimer])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (locked) {
      toast({
        title: "Account Temporarily Locked",
        description: `Too many failed attempts. Please wait ${lockTimer} seconds.`,
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const result = await login(formData.email, formData.password, true, true) // isAdminLogin = true

      if (result.success) {
        if (result.user?.role === "admin" || result.user?.isAdmin) {
          toast({
            title: "Admin Access Granted",
            description: "Welcome to the admin panel.",
          })
          router.push("/admin")
          onClose()
          setAttempts(0)
        } else {
          // This shouldn't happen due to server-side check, but just in case
          handleFailedAttempt("Access denied. Administrator privileges required.")
        }
      } else {
        handleFailedAttempt(result.error)
      }
    } catch (error) {
      console.error("Admin login error:", error)
      handleFailedAttempt("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleFailedAttempt = (errorMessage) => {
    setAttempts((prev) => {
      const newAttempts = prev + 1
      if (newAttempts >= 3) {
        setLocked(true)
        setLockTimer(60) // 60 second lockout
        toast({
          title: "Too Many Failed Attempts",
          description: "Admin login temporarily locked for 60 seconds.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
      return newAttempts
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#111] border border-[#333] shadow-xl rounded-lg w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#333]">
              <div className="flex items-center">
                <ShieldAlert className="text-[#D4AF37] mr-3" size={24} />
                <h2 className="text-xl font-bold text-white">Admin Access</h2>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close">
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6 bg-[#D4AF37]/10 border border-[#D4AF37] p-4 rounded-md">
                <p className="text-sm text-[#D4AF37]">
                  🔒 Restricted access point for administrators only. Use{" "}
                  <kbd className="bg-black px-1 rounded">Ctrl+Shift+A</kbd> to access.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label htmlFor="admin-email" className="block text-sm font-medium text-beige">
                    Admin Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="admin-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter admin email"
                      className="pl-10 bg-[#0a0a0a] border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                      disabled={loading || locked}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="admin-password" className="block text-sm font-medium text-beige">
                    Admin Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="admin-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter admin password"
                      className="pl-10 pr-10 bg-[#0a0a0a] border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                      disabled={loading || locked}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      tabIndex="-1"
                      disabled={loading || locked}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {locked && (
                  <div className="p-3 bg-red-900/30 border border-red-800 rounded-md text-center">
                    <p className="text-sm text-red-300">Too many failed attempts. Please wait {lockTimer} seconds.</p>
                  </div>
                )}

                {attempts > 0 && !locked && (
                  <div className="p-3 bg-yellow-900/30 border border-yellow-800 rounded-md text-center">
                    <p className="text-sm text-yellow-300">
                      {3 - attempts} attempt{3 - attempts !== 1 ? "s" : ""} remaining before lockout.
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || locked}
                  className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-black text-lg py-6 rounded-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Authenticating...
                    </span>
                  ) : (
                    "Access Admin Panel"
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
