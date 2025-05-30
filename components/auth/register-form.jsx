"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, User, Calendar, Check, Award, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

export default function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthdate: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [step, setStep] = useState(1)

  // Get referral code from URL if present
  const referralCode = searchParams.get("ref")
  const redirectTo = searchParams.get("redirect") || "/"

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Password validation
  const passwordValidation = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[@$!%*?&]/.test(formData.password),
  }

  const isPasswordValid = Object.values(passwordValidation).every(Boolean)
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== ""

  const validateAge = () => {
    if (!formData.birthdate) return false

    const birthDate = new Date(formData.birthdate)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age >= 21
  }

  const handleNextStep = (e) => {
    e.preventDefault()

    if (!validateAge()) {
      toast({
        title: "Age Verification Failed",
        description: "You must be 21 years or older to register.",
        variant: "destructive",
      })
      return
    }

    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isPasswordValid) {
      toast({
        title: "Password Requirements",
        description: "Please ensure your password meets all requirements.",
        variant: "destructive",
      })
      return
    }

    if (!passwordsMatch) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      })
      return
    }

    if (!agreeTerms) {
      toast({
        title: "Terms Agreement Required",
        description: "You must agree to the Terms and Conditions to register.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`
      const result = await register(fullName, formData.email, formData.password, formData.confirmPassword)

      if (result.success) {
        // Store redirect path if present
        if (redirectTo && redirectTo !== "/") {
          localStorage.setItem("redirectAfterLogin", redirectTo)
        }

        // Registration successful, redirect to login page
        router.push("/login")
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-40 bg-black flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="hidden md:block md:w-1/2 relative">
          <Image
            src="/register.jpg"
            alt="Cannabis Registration"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/70"></div>

          <div className="absolute inset-0 flex flex-col justify-center items-center p-12 z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 gold-text">Join Our Community</h2>
              <p className="text-beige text-lg mb-8 max-w-md">
                Create an account to access exclusive products, track orders, and earn rewards with every purchase.
              </p>

              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="bg-[#D4AF37] rounded-full p-2 mr-4">
                    <Check className="text-black" size={20} />
                  </div>
                  <p className="text-beige text-left">Access to exclusive products and early releases</p>
                </div>

                <div className="flex items-center">
                  <div className="bg-[#D4AF37] rounded-full p-2 mr-4">
                    <Check className="text-black" size={20} />
                  </div>
                  <p className="text-beige text-left">Earn loyalty points with every purchase</p>
                </div>

                <div className="flex items-center">
                  <div className="bg-[#D4AF37] rounded-full p-2 mr-4">
                    <Check className="text-black" size={20} />
                  </div>
                  <p className="text-beige text-left">Track your orders and delivery status</p>
                </div>

                <div className="flex items-center">
                  <div className="bg-[#D4AF37] rounded-full p-2 mr-4">
                    <Check className="text-black" size={20} />
                  </div>
                  <p className="text-beige text-left">Personalized product recommendations</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
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
              <h1 className="text-3xl font-bold mt-4 mb-2 gold-text">Create Account</h1>
              <p className="text-beige">Join the Greenfields community</p>
            </div>

            {/* Referral Code Banner (if present) */}
            {referralCode && (
              <motion.div
                className="mb-6 bg-[#D4AF37]/10 border border-[#D4AF37] p-4 rounded-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-center">
                  <Award className="text-[#D4AF37] mr-2" size={20} />
                  <div>
                    <p className="font-medium text-[#D4AF37]">Referral Code Applied</p>
                    <p className="text-sm text-beige">You'll receive 250 points on your first purchase!</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? "bg-[#D4AF37] text-black" : "bg-[#333] text-white"}`}
                  >
                    1
                  </div>
                  <span className="text-sm mt-2 text-beige">Verification</span>
                </div>

                <div className={`flex-1 h-0.5 mx-2 ${step >= 2 ? "bg-[#D4AF37]" : "bg-[#333]"}`}></div>

                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? "bg-[#D4AF37] text-black" : "bg-[#333] text-white"}`}
                  >
                    2
                  </div>
                  <span className="text-sm mt-2 text-beige">Account Details</span>
                </div>
              </div>
            </div>

            {step === 1 ? (
              <form onSubmit={handleNextStep} className="space-y-6">
                <div className="bg-[#D4AF37]/10 border border-[#D4AF37] p-4 mb-6">
                  <p className="text-sm text-beige">
                    You must be 21 years or older to create an account. Please verify your age to continue.
                  </p>
                </div>

                <div className="space-y-1">
                  <label htmlFor="birthdate" className="block text-sm font-medium text-beige">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="birthdate"
                      name="birthdate"
                      type="date"
                      value={formData.birthdate}
                      onChange={handleChange}
                      required
                      max={new Date().toISOString().split("T")[0]}
                      className="pl-10 bg-[#111] border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-black text-lg py-6 rounded-none"
                  disabled={loading}
                >
                  Continue
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="firstName" className="block text-sm font-medium text-beige">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        placeholder="First Name"
                        className="pl-10 bg-[#111] border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="lastName" className="block text-sm font-medium text-beige">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Last Name"
                      className="bg-[#111] border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                      disabled={loading}
                    />
                  </div>
                </div>

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
                      placeholder="Create a password"
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

                  {/* Password Validation Indicators */}
                  {formData.password && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        {passwordValidation.length ? (
                          <Check className="h-4 w-4 text-[#D4AF37]" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-xs ${passwordValidation.length ? "text-[#D4AF37]" : "text-red-500"}`}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passwordValidation.uppercase ? (
                          <Check className="h-4 w-4 text-[#D4AF37]" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-xs ${passwordValidation.uppercase ? "text-[#D4AF37]" : "text-red-500"}`}>
                          One uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passwordValidation.lowercase ? (
                          <Check className="h-4 w-4 text-[#D4AF37]" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-xs ${passwordValidation.lowercase ? "text-[#D4AF37]" : "text-red-500"}`}>
                          One lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passwordValidation.number ? (
                          <Check className="h-4 w-4 text-[#D4AF37]" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-xs ${passwordValidation.number ? "text-[#D4AF37]" : "text-red-500"}`}>
                          One number
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passwordValidation.special ? (
                          <Check className="h-4 w-4 text-[#D4AF37]" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-xs ${passwordValidation.special ? "text-[#D4AF37]" : "text-red-500"}`}>
                          One special character (@$!%*?&)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-beige">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Confirm your password"
                      className="pl-10 pr-10 bg-[#111] border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      tabIndex="-1"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {formData.confirmPassword && (
                    <div className="flex items-center space-x-2 mt-2">
                      {passwordsMatch ? (
                        <Check className="h-4 w-4 text-[#D4AF37]" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-xs ${passwordsMatch ? "text-[#D4AF37]" : "text-red-500"}`}>
                        Passwords match
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={() => setAgreeTerms(!agreeTerms)}
                      className="h-4 w-4 bg-[#111] border-[#333] focus:ring-[#D4AF37] text-[#D4AF37]"
                      disabled={loading}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="text-beige">
                      I agree to the{" "}
                      <Link href="/terms-conditions" className="text-[#D4AF37] hover:underline">
                        Terms and Conditions
                      </Link>{" "}
                      and{" "}
                      <Link href="#" className="text-[#D4AF37] hover:underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !isPasswordValid || !passwordsMatch || !agreeTerms}
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
                      Creating Account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-beige">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[#D4AF37] hover:underline">
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#111] py-4 text-center">
        <p className="text-beige text-sm">© {new Date().getFullYear()} Greenfields Group Inc. All rights reserved.</p>
      </div>
    </div>
  )
}
