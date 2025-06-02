import twilio from "twilio"

class SMSService {
  constructor() {
    this.client = null
    this.initialized = false
  }

  async initialize() {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID
      const authToken = process.env.TWILIO_AUTH_TOKEN

      if (!accountSid || !authToken) {
        console.warn("Twilio credentials not found. SMS service will be disabled.")
        return false
      }

      this.client = twilio(accountSid, authToken)
      this.initialized = true
      console.log("SMS Service initialized successfully")
      return true
    } catch (error) {
      console.error("Failed to initialize SMS service:", error)
      return false
    }
  }

  async sendSMS(to, message, orderId = null) {
    try {
      if (!this.initialized) {
        const initResult = await this.initialize()
        if (!initResult) {
          throw new Error("SMS service not available")
        }
      }

      const fromNumber = process.env.TWILIO_PHONE_NUMBER
      if (!fromNumber) {
        throw new Error("Twilio phone number not configured")
      }

      console.log(`Sending SMS to ${to}: ${message}`)

      const result = await this.client.messages.create({
        body: message,
        from: fromNumber,
        to: to,
      })

      console.log(`SMS sent successfully. SID: ${result.sid}`)

      return {
        success: true,
        sid: result.sid,
        status: result.status,
        to: result.to,
        message: message,
        orderId: orderId,
      }
    } catch (error) {
      console.error("SMS sending failed:", error)
      return {
        success: false,
        error: error.message,
        to: to,
        message: message,
        orderId: orderId,
      }
    }
  }

  async sendOrderConfirmation(order, customTemplate = null) {
    try {
      const { SMSSettingsOperations } = await import("./database-operations.js")
      const settings = await SMSSettingsOperations.getSMSSettings()

      if (!settings.enabled || !settings.orderConfirmationEnabled) {
        console.log("Order confirmation SMS is disabled")
        return { success: false, reason: "SMS disabled" }
      }

      const phoneNumber = order.customer?.phone || order.shippingAddress?.phone
      if (!phoneNumber) {
        console.log("No phone number found for order:", order.id)
        return { success: false, reason: "No phone number" }
      }

      // Use custom template or default from settings
      const template =
        customTemplate ||
        settings.customMessageTemplate ||
        "Thank you for your order! Your order #{orderId} has been confirmed and will be processed shortly."

      // Replace placeholders in the message
      const message = this.replacePlaceholders(template, order)

      const result = await this.sendSMS(phoneNumber, message, order.id)

      // Store the notification in database
      if (result.success) {
        const { SMSNotificationOperations } = await import("./database-operations.js")
        await SMSNotificationOperations.sendSMS(phoneNumber, message, order.id)
      }

      return result
    } catch (error) {
      console.error("Error sending order confirmation SMS:", error)
      return { success: false, error: error.message }
    }
  }

  async sendShippingUpdate(order, trackingNumber, customTemplate = null) {
    try {
      const { SMSSettingsOperations } = await import("./database-operations.js")
      const settings = await SMSSettingsOperations.getSMSSettings()

      if (!settings.enabled || !settings.shippingUpdateEnabled) {
        console.log("Shipping update SMS is disabled")
        return { success: false, reason: "SMS disabled" }
      }

      const phoneNumber = order.customer?.phone || order.shippingAddress?.phone
      if (!phoneNumber) {
        console.log("No phone number found for order:", order.id)
        return { success: false, reason: "No phone number" }
      }

      const template =
        customTemplate ||
        "Your order #{orderId} has been shipped! Track your package with tracking number: {trackingNumber}"

      const orderWithTracking = { ...order, trackingNumber }
      const message = this.replacePlaceholders(template, orderWithTracking)

      const result = await this.sendSMS(phoneNumber, message, order.id)

      // Store the notification in database
      if (result.success) {
        const { SMSNotificationOperations } = await import("./database-operations.js")
        await SMSNotificationOperations.sendSMS(phoneNumber, message, order.id)
      }

      return result
    } catch (error) {
      console.error("Error sending shipping update SMS:", error)
      return { success: false, error: error.message }
    }
  }

  async sendDeliveryNotification(order, customTemplate = null) {
    try {
      const { SMSSettingsOperations } = await import("./database-operations.js")
      const settings = await SMSSettingsOperations.getSMSSettings()

      if (!settings.enabled || !settings.deliveryNotificationEnabled) {
        console.log("Delivery notification SMS is disabled")
        return { success: false, reason: "SMS disabled" }
      }

      const phoneNumber = order.customer?.phone || order.shippingAddress?.phone
      if (!phoneNumber) {
        console.log("No phone number found for order:", order.id)
        return { success: false, reason: "No phone number" }
      }

      const template =
        customTemplate ||
        "Great news! Your order #{orderId} has been delivered. Thank you for choosing Greenfields Cannabis!"

      const message = this.replacePlaceholders(template, order)

      const result = await this.sendSMS(phoneNumber, message, order.id)

      // Store the notification in database
      if (result.success) {
        const { SMSNotificationOperations } = await import("./database-operations.js")
        await SMSNotificationOperations.sendSMS(phoneNumber, message, order.id)
      }

      return result
    } catch (error) {
      console.error("Error sending delivery notification SMS:", error)
      return { success: false, error: error.message }
    }
  }

  replacePlaceholders(template, order) {
    let message = template

    // Replace common placeholders
    message = message.replace(/{orderId}/g, order.id || "N/A")
    message = message.replace(/{customerName}/g, order.customer?.name || "Valued Customer")
    message = message.replace(/{total}/g, `$${order.total?.toFixed(2) || "0.00"}`)
    message = message.replace(/{trackingNumber}/g, order.trackingNumber || "N/A")
    message = message.replace(
      /{estimatedDelivery}/g,
      order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : "TBD",
    )

    // Replace tracking URL
    const trackingUrl = order.trackingNumber
      ? `${process.env.NEXT_PUBLIC_BASE_URL || "https://greenfields.com"}/track-order?number=${order.id}&email=${order.customer?.email}`
      : `${process.env.NEXT_PUBLIC_BASE_URL || "https://greenfields.com"}/track-order`

    message = message.replace(/{trackingUrl}/g, trackingUrl)

    return message
  }

  async testConnection() {
    try {
      if (!this.initialized) {
        const initResult = await this.initialize()
        if (!initResult) {
          return { success: false, error: "SMS service not available" }
        }
      }

      // Test by fetching account info
      const account = await this.client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch()

      return {
        success: true,
        accountSid: account.sid,
        status: account.status,
        friendlyName: account.friendlyName,
      }
    } catch (error) {
      console.error("SMS connection test failed:", error)
      return { success: false, error: error.message }
    }
  }
}

// Create singleton instance
const smsService = new SMSService()

export default smsService
