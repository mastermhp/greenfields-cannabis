"use client"

import { useState } from "react"
import { Mail, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import emailService from "@/lib/email-service"

export default function ForgotPasswordForm({ onSuccess }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      console.log("ForgotPassword: Processing request for:", email)

      // First, generate reset token on server
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      console.log("ForgotPassword: API response:", data)

      if (data.success && data.resetLink) {
        console.log("ForgotPassword: Attempting to send email...")

        // Send email using client-side EmailJS
        const emailResult = await emailService.sendPasswordResetEmail(email, data.resetLink, "User")

        if (emailResult.success) {
          console.log("ForgotPassword: Email sent successfully")
          toast({
            title: "Reset Link Sent",
            description: "Check your email for the password reset link.",
          })
        } else {
          console.warn("ForgotPassword: Email sending failed:", emailResult.error)
          toast({
            title: "Reset Link Generated",
            description: "Password reset link created. Check console for development link.",
          })
        }

        // Show development link in console
        if (process.env.NODE_ENV === "development") {
          console.log("🔗 Password Reset Link:", data.resetLink)
          toast({
            title: "Development Mode",
            description: "Reset link logged to console (development only)",
          })
        }

        if (onSuccess) {
          onSuccess(email)
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to process password reset request",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("ForgotPassword: Error:", error)
      toast({
        title: "Error",
        description: "Failed to send reset email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="h-12"
          required
        />
      </div>

      <Button type="submit" disabled={loading || !email} className="w-full h-12">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending Reset Link...
          </>
        ) : (
          <>
            <Mail className="w-4 h-4 mr-2" />
            Send Reset Link
          </>
        )}
      </Button>

      <p className="text-sm text-gray-600 text-center">
        We'll send you a link to reset your password if an account with that email exists.
      </p>
    </form>
  )
}
