class EmailService {
  constructor() {
    this.initialized = false
    this.serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
    this.templateIds = {
      passwordReset: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_PASSWORD_RESET,
      welcome: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_WELCOME,
      newsletter: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_NEWSLETTER,
      contact: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_CONTACT,
    }
    this.publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
  }

  async initialize() {
    try {
      if (typeof window === "undefined") {
        // Server-side: Just check configuration
        return this.checkServerConfig()
      }

      // Client-side: Use EmailJS SDK
      if (!this.serviceId || !this.publicKey) {
        console.warn("EmailJS credentials not found. Email service will be disabled.")
        return false
      }

      // Dynamic import for EmailJS
      const emailjs = await import("@emailjs/browser")
      emailjs.default.init(this.publicKey)

      this.initialized = true
      console.log("EmailJS service initialized successfully")
      return true
    } catch (error) {
      console.error("Failed to initialize EmailJS service:", error)
      return false
    }
  }

  checkServerConfig() {
    const hasRequiredConfig = this.serviceId && this.publicKey

    if (!hasRequiredConfig) {
      console.warn("EmailJS configuration incomplete")
      return false
    }

    this.initialized = true
    return true
  }

  async sendEmailClient(templateId, templateParams) {
    try {
      if (!this.initialized) {
        const initResult = await this.initialize()
        if (!initResult) {
          throw new Error("EmailJS service not initialized")
        }
      }

      if (!templateId) {
        throw new Error("Template ID is required")
      }

      console.log("Sending email with:", { templateId, templateParams })

      const emailjs = await import("@emailjs/browser")
      const result = await emailjs.default.send(this.serviceId, templateId, templateParams)

      console.log("Email sent successfully:", result)
      return {
        success: true,
        message: "Email sent successfully",
        result,
      }
    } catch (error) {
      console.error("Client email sending failed:", error)
      return {
        success: false,
        error: error.message || "Failed to send email",
      }
    }
  }

  async sendEmail(templateId, templateParams) {
    try {
      // Always use client-side for EmailJS
      if (typeof window === "undefined") {
        return {
          success: false,
          error: "EmailJS requires client-side execution",
          needsClientSide: true,
        }
      }

      return await this.sendEmailClient(templateId, templateParams)
    } catch (error) {
      console.error("Email sending failed:", error)
      return {
        success: false,
        error: error.message || "Failed to send email",
      }
    }
  }

  async sendPasswordResetEmail(email, resetLink, userName = "User") {
    const templateParams = {
      to_email: email,
      to_name: userName,
      reset_link: resetLink,
      user_name: userName,
      company_name: "Greenfields Cannabis",
      from_name: "Greenfields Cannabis Team",
    }

    return await this.sendEmail(this.templateIds.passwordReset, templateParams)
  }

  async sendWelcomeEmail(email, userName) {
    const templateParams = {
      to_email: email,
      to_name: userName,
      user_name: userName,
      company_name: "Greenfields Cannabis",
      website_url: process.env.NEXT_PUBLIC_BASE_URL || "https://greenfields.com",
      from_name: "Greenfields Cannabis Team",
    }

    return await this.sendEmail(this.templateIds.welcome, templateParams)
  }

  async sendNewsletterWelcome(email) {
    const templateParams = {
      to_email: email,
      company_name: "Greenfields Cannabis",
      website_url: process.env.NEXT_PUBLIC_BASE_URL || "https://greenfields.com",
      from_name: "Greenfields Cannabis Team",
    }

    return await this.sendEmail(this.templateIds.newsletter, templateParams)
  }

  async sendContactEmail(name, email, message, subject = "New Contact Form Submission") {
    const templateParams = {
      from_name: name,
      from_email: email,
      message: message,
      subject: subject,
      to_email: process.env.CONTACT_EMAIL || "support@greenfields.com",
      company_name: "Greenfields Cannabis",
    }

    return await this.sendEmail(this.templateIds.contact, templateParams)
  }

  async testConnection() {
    try {
      if (typeof window === "undefined") {
        return {
          success: false,
          error: "EmailJS testing requires client-side execution",
        }
      }

      if (!this.initialized) {
        const initResult = await this.initialize()
        if (!initResult) {
          return { success: false, error: "EmailJS service not available" }
        }
      }

      // Check if all required configuration is present
      const missingConfig = []
      if (!this.serviceId) missingConfig.push("Service ID")
      if (!this.publicKey) missingConfig.push("Public Key")
      if (!this.templateIds.passwordReset) missingConfig.push("Password Reset Template")
      if (!this.templateIds.welcome) missingConfig.push("Welcome Template")
      if (!this.templateIds.newsletter) missingConfig.push("Newsletter Template")
      if (!this.templateIds.contact) missingConfig.push("Contact Template")

      if (missingConfig.length > 0) {
        return {
          success: false,
          error: `Missing configuration: ${missingConfig.join(", ")}`,
          missingConfig,
        }
      }

      return { success: true, message: "EmailJS service is configured correctly" }
    } catch (error) {
      console.error("EmailJS connection test failed:", error)
      return { success: false, error: error.message }
    }
  }
}

// Create singleton instance
const emailService = new EmailService()

export default emailService
