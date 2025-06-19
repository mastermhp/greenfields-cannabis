"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Lock, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [token, setToken] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (!tokenParam) {
      toast({
        title: "Invalid Reset Link",
        description: "No reset token found. Please request a new password reset.",
        variant: "destructive",
      })
      router.push("/forgot-password")
    } else {
      setToken(tokenParam)
    }
  }, [searchParams, router, toast])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords match.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        toast({
          title: "Password Reset Successful",
          description: "Your password has been reset successfully. You can now log in with your new password.",
        })
      } else {
        toast({
          title: "Reset Failed",
          description: data.error || "Failed to reset password",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Reset password error:", error)
      toast({
        title: "Reset Failed",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Validating reset token...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Password Reset Successful</CardTitle>
            <p className="text-gray-600">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Continue to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <p className="text-gray-600">Enter your new password below.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>Password requirements:</p>
              <ul className="list-disc list-inside space-y-1">
                <li className={password.length >= 6 ? "text-green-600" : ""}>At least 6 characters</li>
                <li className={password === confirmPassword && password ? "text-green-600" : ""}>Passwords match</li>
              </ul>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                <>
                  <Lock size={16} className="mr-2" />
                  Reset Password
                </>
              )}
            </Button>

            <div className="text-center">
              <Link href="/login" className="text-sm text-blue-600 hover:underline">
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
