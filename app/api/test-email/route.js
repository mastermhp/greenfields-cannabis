import { NextResponse } from "next/server"
import emailService from "@/lib/email-service"

export async function POST(request) {
  try {
    const { email, type = "test" } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    let result

    switch (type) {
      case "connection":
        result = await emailService.testConnection()
        break

      case "welcome":
        result = await emailService.sendWelcomeEmail(email, "Test User")
        break

      case "reset":
        const testResetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=test-token-123`
        result = await emailService.sendPasswordResetEmail(email, testResetLink, "Test User")
        break

      case "newsletter":
        result = await emailService.sendNewsletterWelcome(email)
        break

      default:
        // For basic test, we'll use the contact template
        result = await emailService.sendContactEmail(
          "Test User",
          email,
          "This is a test email from Greenfields Cannabis to verify EmailJS configuration.",
          "EmailJS Test Email",
        )
    }

    return NextResponse.json({
      success: result.success,
      message: result.success ? "Email sent successfully!" : "Email failed to send",
      details: result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Test email error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send test email",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const connectionTest = await emailService.testConnection()

    return NextResponse.json({
      success: connectionTest.success,
      message: connectionTest.success
        ? "EmailJS service is configured correctly"
        : "EmailJS service configuration error",
      details: connectionTest,
      environment: {
        serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ? "✓ Set" : "✗ Missing",
        publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ? "✓ Set" : "✗ Missing",
        passwordResetTemplate: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_PASSWORD_RESET ? "✓ Set" : "✗ Missing",
        welcomeTemplate: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_WELCOME ? "✓ Set" : "✗ Missing",
        newsletterTemplate: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_NEWSLETTER ? "✓ Set" : "✗ Missing",
        contactTemplate: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_CONTACT ? "✓ Set" : "✗ Missing",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to test EmailJS configuration",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
