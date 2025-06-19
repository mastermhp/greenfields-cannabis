"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Copy, Mail, Database, Settings } from "lucide-react"
import emailService from "@/lib/email-service"

export default function TestPasswordResetPage() {
  const [testEmail, setTestEmail] = useState("test@example.com")
  const [loading, setLoading] = useState(false)
  const [resetLink, setResetLink] = useState("")
  const { toast } = useToast()

  const testDatabaseConnection = async () => {
    try {
      const response = await fetch("/api/init-db", { method: "POST" })
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Database Connected",
          description: "Database connection and initialization successful",
        })
      } else {
        toast({
          title: "Database Error",
          description: data.error || "Failed to connect to database",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Database Error",
        description: "Failed to test database connection",
        variant: "destructive",
      })
    }
  }

  const testPasswordReset = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: testEmail }),
      })

      const data = await response.json()

      if (data.success && data.resetLink) {
        setResetLink(data.resetLink)
        toast({
          title: "Reset Link Generated",
          description: "Password reset link generated successfully",
        })
      } else {
        toast({
          title: "Test Result",
          description: data.message || "Password reset request processed",
        })
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to test password reset",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testEmailService = async () => {
    const config = emailService.getConfigurationStatus()

    toast({
      title: "Email Service Status",
      description: config.allConfigured
        ? "Email service is properly configured"
        : "Email service configuration incomplete",
      variant: config.allConfigured ? "default" : "destructive",
    })

    console.log("Email Service Configuration:", config)
  }

  const copyResetLink = () => {
    navigator.clipboard.writeText(resetLink)
    toast({
      title: "Copied",
      description: "Reset link copied to clipboard",
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Password Reset Testing</h1>
          <p className="text-gray-600 mt-2">Test and debug the password reset functionality</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Database Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Test database connection and ensure admin user exists</p>
              <Button onClick={testDatabaseConnection} className="w-full">
                Test Database
              </Button>
            </CardContent>
          </Card>

          {/* Email Service Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Email Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Check email service configuration status</p>
              <Button onClick={testEmailService} variant="outline" className="w-full">
                Check Email Config
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Password Reset Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Password Reset Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="testEmail">Test Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email to test"
              />
              <p className="text-xs text-gray-500 mt-1">Use admin@greenfields.com to test with existing user</p>
            </div>

            <Button onClick={testPasswordReset} disabled={loading || !testEmail} className="w-full">
              {loading ? "Testing..." : "Test Password Reset"}
            </Button>

            {resetLink && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Generated Reset Link:</Label>
                  <Button size="sm" variant="outline" onClick={copyResetLink}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="text-xs bg-white p-2 rounded border break-all">{resetLink}</div>
                <p className="text-xs text-gray-500 mt-2">
                  Click the link above or copy it to test the password reset flow
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. Environment Variables</h4>
              <p className="text-sm text-gray-600">
                Make sure these environment variables are set in your .env.local file:
              </p>
              <div className="bg-gray-50 p-3 rounded mt-2 text-xs font-mono">
                MONGODB_URI=your_mongodb_connection_string
                <br />
                NEXT_PUBLIC_BASE_URL=http://localhost:3000
                <br />
                NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
                <br />
                NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
                <br />
                NEXT_PUBLIC_EMAILJS_TEMPLATE_PASSWORD_RESET=your_template_id
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">2. EmailJS Setup (Optional)</h4>
              <p className="text-sm text-gray-600">
                If you want to send actual emails, set up EmailJS with a password reset template. The system will work
                without it, but reset links will only appear in the console.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">3. Testing Flow</h4>
              <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
                <li>Test database connection first</li>
                <li>Use admin@greenfields.com as test email (user exists)</li>
                <li>Generate reset link and copy it</li>
                <li>Open the reset link in a new tab</li>
                <li>Test password reset with new password</li>
                <li>Try logging in with the new password</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
