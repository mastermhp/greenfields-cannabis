"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Mail, Settings, Send, Loader2, ExternalLink, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import emailService from "@/lib/email-service"

export default function EmailTestPage() {
  const [testEmail, setTestEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState(null)
  const [testResults, setTestResults] = useState([])
  const { toast } = useToast()

  const checkConnection = async () => {
    setLoading(true)
    try {
      const connectionTest = await emailService.testConnection()
      setConnectionStatus(connectionTest)

      if (connectionTest.success) {
        toast({
          title: "Connection Successful",
          description: "EmailJS service is configured correctly",
        })
      } else {
        toast({
          title: "Connection Failed",
          description: connectionTest.error || "EmailJS service configuration error",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test EmailJS connection",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const sendTestEmailClient = async (type = "test") => {
    if (!testEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      let result

      switch (type) {
        case "welcome":
          result = await emailService.sendWelcomeEmail(testEmail, "Test User")
          break
        case "reset":
          const testResetLink = `${window.location.origin}/reset-password?token=test-token-123`
          result = await emailService.sendPasswordResetEmail(testEmail, testResetLink, "Test User")
          break
        case "newsletter":
          result = await emailService.sendNewsletterWelcome(testEmail)
          break
        default:
          result = await emailService.sendContactEmail(
            "Test User",
            testEmail,
            "This is a test email from Greenfields Cannabis to verify EmailJS configuration.",
            "EmailJS Test Email",
          )
      }

      const testResult = {
        type,
        email: testEmail,
        success: result.success,
        timestamp: new Date().toISOString(),
        details: result,
      }

      setTestResults((prev) => [testResult, ...prev.slice(0, 4)])

      if (result.success) {
        toast({
          title: "Email Sent",
          description: `${type} email sent successfully to ${testEmail}`,
        })
      } else {
        toast({
          title: "Email Failed",
          description: result.error || "Failed to send email",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Test email error:", error)
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Mail className="h-6 w-6" />
        <h1 className="text-2xl font-bold">EmailJS Service Test</h1>
      </div>

      {/* Important Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            Important: Client-Side Email Sending
          </CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-700">
          <p className="mb-2">
            EmailJS works best with <strong>client-side</strong> email sending. Server-side API calls are restricted in
            the free tier.
          </p>
          <p>This test page uses client-side EmailJS, which is how your actual application should work.</p>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration Status
          </CardTitle>
          <CardDescription>Check your EmailJS service configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={checkConnection} disabled={loading} className="w-full sm:w-auto">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
            Check Configuration
          </Button>

          {connectionStatus && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {connectionStatus.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={connectionStatus.success ? "text-green-700" : "text-red-700"}>
                  {connectionStatus.success ? "Configuration is complete" : connectionStatus.error}
                </span>
              </div>

              {connectionStatus.missingConfig && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-red-800 font-medium">Missing Configuration:</p>
                  <ul className="list-disc list-inside text-red-700 mt-1">
                    {connectionStatus.missingConfig.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Emails */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Test Emails (Client-Side)
          </CardTitle>
          <CardDescription>Test different email templates using client-side EmailJS</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter test email address"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <Button onClick={() => sendTestEmailClient("test")} disabled={loading} variant="outline">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
              Contact Test
            </Button>
            <Button onClick={() => sendTestEmailClient("welcome")} disabled={loading} variant="outline">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
              Welcome Email
            </Button>
            <Button onClick={() => sendTestEmailClient("reset")} disabled={loading} variant="outline">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
              Password Reset
            </Button>
            <Button onClick={() => sendTestEmailClient("newsletter")} disabled={loading} variant="outline">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
              Newsletter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Recent email test results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium">
                        {result.type} email to {result.email}
                      </div>
                      <div className="text-sm text-muted-foreground">{new Date(result.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? "Success" : "Failed"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            EmailJS Setup Instructions
            <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="ml-2">
              <ExternalLink className="h-4 w-4" />
            </a>
          </CardTitle>
          <CardDescription>How to configure EmailJS service</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Create EmailJS Account</h4>
            <p className="text-sm text-muted-foreground">Go to https://www.emailjs.com and create a free account</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-medium">2. Add Email Service</h4>
            <p className="text-sm text-muted-foreground">Connect Gmail, Outlook, or any SMTP service</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-medium">3. Create Email Templates</h4>
            <p className="text-sm text-muted-foreground">
              Create templates for password reset, welcome, newsletter, and contact emails
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-medium">4. Add Environment Variables</h4>
            <div className="bg-muted p-3 rounded-lg text-sm font-mono">
              NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
              <br />
              NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
              <br />
              NEXT_PUBLIC_EMAILJS_TEMPLATE_PASSWORD_RESET=template_id
              <br />
              NEXT_PUBLIC_EMAILJS_TEMPLATE_WELCOME=template_id
              <br />
              NEXT_PUBLIC_EMAILJS_TEMPLATE_NEWSLETTER=template_id
              <br />
              NEXT_PUBLIC_EMAILJS_TEMPLATE_CONTACT=template_id
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
