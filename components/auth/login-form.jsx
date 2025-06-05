"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Get redirect URL and referral code if present
  const redirectTo = searchParams.get("redirect") || "/"
  const referralCode = searchParams.get("ref")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Store redirect path if present
      if (redirectTo && redirectTo !== "/") {
        localStorage.setItem("redirectAfterLogin", redirectTo)
      }

      await login(formData.email, formData.password, rememberMe)
      // The login function now handles redirection and toast notifications
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="w-full max-w-md"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-center mb-8">
        <Link href="/" className="inline-block">
          <Image
            src="/logo.png"
            alt="Greenfields Logo"
            width={80}
            height={80}
            className="mx-auto rounded-full border-2 border-[#D4AF37]"
          />
        </Link>
        <h1 className="text-3xl font-bold mt-4 mb-2 gold-text">Welcome Back</h1>
        <p className="text-beige">Sign in to your Greenfields account</p>
      </div>

      {/* Demo Credentials Banner */}
      {/* <div className="mb-6 bg-[#D4AF37]/10 border border-[#D4AF37] p-4 rounded-md">
        <p className="text-sm font-medium mb-2 text-[#D4AF37]">Demo Credentials:</p>
        <div className="text-xs space-y-1 text-beige">
          <p>
            <strong>Admin:</strong> admin@greenfields.com / admin123
          </p>
          <p>
            <strong>Customer:</strong> Register a new account
          </p>
        </div>
      </div> */}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-beige">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className="pl-10 bg-[#111] border-[#333] focus:border-[#D4AF37] rounded-none h-12"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-beige">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="pl-10 pr-10 bg-[#111] border-[#333] focus:border-[#D4AF37] rounded-none h-12"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              tabIndex="-1"
              disabled={loading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="h-4 w-4 bg-[#111] border-[#333] focus:ring-[#D4AF37] text-[#D4AF37]"
              disabled={loading}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-beige">
              Remember me
            </label>
          </div>

          <Link href="/forgot-password" className="text-sm text-[#D4AF37] hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/20 hover:border hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-1000 cursor-pointer text-black text-lg py-6 rounded-none"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing In...
            </span>
          ) : (
            "Sign In"
          )}
        </Button>

        <div className="text-center">
          <p className="text-beige">
            Don&apos;t have an account?{" "}
            <Link
              href={`/register${referralCode ? `?ref=${referralCode}` : ""}${redirectTo !== "/" ? `${referralCode ? "&" : "?"}redirect=${redirectTo}` : ""}`}
              className="text-[#D4AF37] hover:underline cursor-pointer transition-all duration-1000"
            >
              Create Account
            </Link>
          </p>
        </div>
      </form>

      <div className="mt-32">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#333]"></div>
          </div>
          {/* <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-black text-beige">Or continue with</span>
          </div> */}
        </div>

        {/* <div className="mt-6 grid grid-cols-2 gap-4">
          <button className="flex justify-center items-center py-3 px-4 border border-[#333] hover:border-[#D4AF37] bg-[#111] text-beige">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
              <path fill="none" d="M1 1h22v22H1z" />
            </svg>
            Google
          </button>
          <button className="flex justify-center items-center py-3 px-4 border border-[#333] hover:border-[#D4AF37] bg-[#111] text-beige">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"
              />
            </svg>
            GitHub
          </button>
        </div> */}
      </div>
    </motion.div>
  )
}
