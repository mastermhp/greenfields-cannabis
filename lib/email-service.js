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
        console.log("EmailJS: Server-side execution, skipping initialization")
        return false
      }

      if (!this.serviceId || !this.publicKey) {
        console.warn("EmailJS: Missing credentials", {
          serviceId: !!this.serviceId,
          publicKey: !!this.publicKey,
          templateIds: Object.keys(this.templateIds).reduce((acc, key) => {
            acc[key] = !!this.templateIds[key]
            return acc
          }, {}),
        })
        return false
      }

      // Dynamic import for EmailJS
      const emailjs = await import("@emailjs/browser")
      emailjs.default.init(this.publicKey)

      this.initialized = true
      console.log("EmailJS: Service initialized successfully")
      return true
    } catch (error) {
      console.error("EmailJS: Failed to initialize", error)
      return false
    }
  }

  async sendEmail(templateId, templateParams) {
    try {
      if (typeof window === "undefined") {
        console.log("EmailJS: Server-side execution, cannot send email")
        return {
          success: false,
          error: "EmailJS requires client-side execution",
          needsClientSide: true,
        }
      }

      if (!this.initialized) {
        console.log("EmailJS: Initializing service...")
        const initResult = await this.initialize()
        if (!initResult) {
          return {
            success: false,
            error: "EmailJS service not available - check configuration",
            configStatus: this.getConfigurationStatus(),
          }
        }
      }

      if (!templateId) {
        return {
          success: false,
          error: "Template ID is required",
        }
      }

      console.log("EmailJS: Sending email", {
        serviceId: this.serviceId,
        templateId,
        hasParams: !!templateParams,
        paramsKeys: templateParams ? Object.keys(templateParams) : [],
      })

      const emailjs = await import("@emailjs/browser")
      const result = await emailjs.default.send(this.serviceId, templateId, templateParams)

      console.log("EmailJS: Email sent successfully", result)
      return {
        success: true,
        message: "Email sent successfully",
        result,
      }
    } catch (error) {
      console.error("EmailJS: Email sending failed", error)

      let errorMessage = "Failed to send email"
      if (error.status === 400) {
        errorMessage = "Invalid email configuration or template"
      } else if (error.status === 401) {
        errorMessage = "Email service authentication failed"
      } else if (error.status === 403) {
        errorMessage = "Email service access denied"
      } else if (error.status === 404) {
        errorMessage = "Email template not found"
      }

      return {
        success: false,
        error: errorMessage,
        details: error,
        status: error.status,
      }
    }
  }

  async sendPasswordResetEmail(email, resetLink, userName = "User") {
    console.log("EmailJS: Preparing password reset email", { email, resetLink, userName })

    if (!this.templateIds.passwordReset) {
      console.error("EmailJS: Password reset template ID not configured")
      return {
        success: false,
        error: "Password reset email template not configured",
      }
    }

    const templateParams = {
      to_email: email,
      to_name: userName,
      reset_link: resetLink,
      user_name: userName,
      company_name: "Greenfields Cannabis",
      from_name: "Greenfields Cannabis Team",
      reply_to: "noreply@greenfields.com",
    }

    return await this.sendEmail(this.templateIds.passwordReset, templateParams)
  }

  async sendNewsletterWelcome(email) {
    console.log("EmailJS: Preparing newsletter welcome email", { email })

    if (!this.templateIds.newsletter) {
      console.error("EmailJS: Newsletter template ID not configured")
      return {
        success: false,
        error: "Newsletter email template not configured",
      }
    }

    const templateParams = {
      to_email: email,
      company_name: "Greenfields Cannabis",
      website_url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      from_name: "Greenfields Cannabis Team",
      reply_to: "noreply@greenfields.com",
    }

    return await this.sendEmail(this.templateIds.newsletter, templateParams)
  }

  getConfigurationStatus() {
    return {
      serviceId: !!this.serviceId,
      publicKey: !!this.publicKey,
      passwordResetTemplate: !!this.templateIds.passwordReset,
      welcomeTemplate: !!this.templateIds.welcome,
      newsletterTemplate: !!this.templateIds.newsletter,
      contactTemplate: !!this.templateIds.contact,
      allConfigured:
        !!this.serviceId && !!this.publicKey && !!this.templateIds.passwordReset && !!this.templateIds.newsletter,
      missingConfig: {
        serviceId: !this.serviceId,
        publicKey: !this.publicKey,
        passwordResetTemplate: !this.templateIds.passwordReset,
        newsletterTemplate: !this.templateIds.newsletter,
      },
    }
  }
}

// Create singleton instance
const emailService = new EmailService()

export default emailService
