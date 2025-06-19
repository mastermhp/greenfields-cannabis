"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, Mail, Settings, ExternalLink } from "lucide-react"
import emailService from "@/lib/email-service"

export default function EmailSetupPage() {
  const [config, setConfig] = useState({})
  const [testEmail, setTestEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const status = emailService.getConfigurationStatus()
    setConfig(status)
  }, [])

  const handleTestEmail = async (type) => {
    if (!testEmail || !testEmail.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      let result
      if (type === "newsletter") {
        result = await emailService.sendNewsletterWelcome(testEmail)
      } else if (type === "password-reset") {
        const resetLink = "http://localhost:3000/reset-password?token=test123"
        result = await emailService.sendPasswordResetEmail(testEmail, resetLink, "Test User")
      }

      if (result.success) {
        toast({
          title: "Email Sent Successfully",
          description: `${type} email sent to ${testEmail}`,
        })
      } else {
        toast({
          title: "Email Failed",
          description: result.error || "Failed to send email",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Email Service Setup</h1>
          <p className="text-gray-600">Configure and test your EmailJS integration</p>
        </div>
      </div>

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Configuration Status
          </CardTitle>
          <CardDescription>Check if all EmailJS settings are properly configured</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span>Service ID</span>
              <Badge variant={config.serviceId ? "default" : "destructive"}>
                {config.serviceId ? "Configured" : "Missing"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Public Key</span>
              <Badge variant={config.publicKey ? "default" : "destructive"}>
                {config.publicKey ? "Configured" : "Missing"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Password Reset Template</span>
              <Badge variant={config.passwordResetTemplate ? "default" : "destructive"}>
                {config.passwordResetTemplate ? "Configured" : "Missing"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Newsletter Template</span>
              <Badge variant={config.newsletterTemplate ? "default" : "destructive"}>
                {config.newsletterTemplate ? "Configured" : "Missing"}
              </Badge>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {config.allConfigured ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">
                {config.allConfigured ? "All systems ready!" : "Configuration incomplete"}
              </span>
            </div>
            {!config.allConfigured && (
              <p className="text-sm text-gray-600">
                Please add the missing environment variables to your .env.local file
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>EmailJS Setup Instructions</CardTitle>
          <CardDescription>Follow these steps to configure EmailJS</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Create EmailJS Account</p>
                <p className="text-sm text-gray-600">
                  Go to{" "}
                  <a
                    href="https://www.emailjs.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    emailjs.com <ExternalLink className="h-3 w-3" />
                  </a>{" "}
                  and create a free account
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Add Email Service</p>
                <p className="text-sm text-gray-600">Connect your Gmail, Outlook, or other email provider</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Create Email Templates</p>
                <p className="text-sm text-gray-600">Create templates for password reset and newsletter welcome</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                4
              </div>
              <div>
                <p className="font-medium">Add Environment Variables</p>
                <div className="text-sm text-gray-600 mt-1">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs block mt-2">
                    NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
                    <br />
                    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=user_xxxxxxx
                    <br />
                    NEXT_PUBLIC_EMAILJS_TEMPLATE_PASSWORD_RESET=template_xxxxxxx
                    <br />
                    NEXT_PUBLIC_EMAILJS_TEMPLATE_NEWSLETTER=template_xxxxxxx
                  </code>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Test Email Sending
          </CardTitle>
          <CardDescription>Send test emails to verify your configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testEmail">Test Email Address</Label>
            <Input
              id="testEmail"
              type="email"
              placeholder="Enter your email to receive test emails"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => handleTestEmail("newsletter")}
              disabled={loading || !config.allConfigured}
              variant="outline"
            >
              Test Newsletter Email
            </Button>
            <Button
              onClick={() => handleTestEmail("password-reset")}
              disabled={loading || !config.allConfigured}
              variant="outline"
            >
              Test Password Reset Email
            </Button>
          </div>

          {!config.allConfigured && (
            <p className="text-sm text-amber-600">⚠️ Complete the configuration above before testing emails</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
