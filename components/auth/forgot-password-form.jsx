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
      // First, generate reset token on server
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        // If we have a reset link, send email using client-side EmailJS
        if (data.resetLink) {
          try {
            const emailResult = await emailService.sendPasswordResetEmail(email, data.resetLink, "User")

            if (emailResult.success) {
              toast({
                title: "Reset Link Sent",
                description: "Check your email for the password reset link.",
              })
            } else {
              console.warn("Email sending failed:", emailResult.error)
              toast({
                title: "Reset Link Generated",
                description: "Password reset link generated. Check console for development link.",
              })
            }
          } catch (emailError) {
            console.warn("Email service error:", emailError)
            toast({
              title: "Reset Link Generated",
              description: "Password reset link generated. Check console for development link.",
            })
          }

          // Show development link in console
          if (process.env.NODE_ENV === "development") {
            console.log("🔗 Password Reset Link:", data.resetLink)
          }
        }

        if (onSuccess) {
          onSuccess(email)
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send reset email",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Forgot password error:", error)
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
