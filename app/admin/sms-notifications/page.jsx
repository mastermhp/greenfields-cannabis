"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Loader2, MessageSquare, Send, Settings, Phone, Clock, CheckCircle, XCircle } from "lucide-react"

export default function SMSNotificationsPage() {
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [smsSettings, setSmsSettings] = useState({
    enabled: true,
    orderConfirmationEnabled: true,
    shippingUpdateEnabled: true,
    deliveryNotificationEnabled: true,
    customMessageTemplate:
      "Thank you for your order! Your order #{orderId} has been confirmed and will be processed shortly. Track your order at {trackingUrl}",
    twilioAccountSid: "",
    twilioAuthToken: "",
    twilioPhoneNumber: "",
  })

  const [customMessage, setCustomMessage] = useState({
    phone: "",
    message: "",
    orderId: "",
  })

  useEffect(() => {
    fetchNotifications()
    fetchSMSSettings()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/sms-notifications")
      const data = await response.json()

      if (data.success) {
        setNotifications(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const fetchSMSSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/sms-settings")
      const data = await response.json()

      if (data.success && data.data) {
        setSmsSettings(data.data)
      }
    } catch (error) {
      console.error("Error fetching SMS settings:", error)
      toast({
        title: "Error",
        description: "Failed to load SMS settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveSMSSettings = async () => {
    try {
      setSending(true)
      const response = await fetch("/api/sms-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(smsSettings),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "SMS settings updated successfully",
        })
      } else {
        throw new Error(data.message || "Failed to update settings")
      }
    } catch (error) {
      console.error("Error saving SMS settings:", error)
      toast({
        title: "Error",
        description: "Failed to save SMS settings",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const sendCustomMessage = async () => {
    try {
      if (!customMessage.phone || !customMessage.message) {
        toast({
          title: "Error",
          description: "Phone number and message are required",
          variant: "destructive",
        })
        return
      }

      setSending(true)
      const response = await fetch("/api/sms-notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customMessage),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "SMS sent successfully",
        })
        setCustomMessage({ phone: "", message: "", orderId: "" })
        fetchNotifications() // Refresh notifications list
      } else {
        throw new Error(data.message || "Failed to send SMS")
      }
    } catch (error) {
      console.error("Error sending SMS:", error)
      toast({
        title: "Error",
        description: "Failed to send SMS",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading SMS settings...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gold-text">SMS Notifications</h1>
          <p className="text-beige mt-2">Manage SMS notifications and custom messages</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[#111] border-[#333]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-beige text-sm font-medium">Total Sent</p>
                <p className="text-2xl font-bold text-white">{notifications.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111] border-[#333]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-beige text-sm font-medium">Delivered</p>
                <p className="text-2xl font-bold text-white">
                  {notifications.filter((n) => n.status === "delivered").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111] border-[#333]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-beige text-sm font-medium">Failed</p>
                <p className="text-2xl font-bold text-white">
                  {notifications.filter((n) => n.status === "failed").length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111] border-[#333]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-beige text-sm font-medium">Today</p>
                <p className="text-2xl font-bold text-white">
                  {
                    notifications.filter((n) => {
                      const today = new Date().toDateString()
                      return new Date(n.createdAt).toDateString() === today
                    }).length
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SMS Settings */}
        <Card className="bg-[#111] border-[#333]">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Settings className="h-5 w-5 mr-2 text-[#D4AF37]" />
              SMS Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="smsEnabled" className="text-gray-300">
                Enable SMS Notifications
              </Label>
              <Switch
                id="smsEnabled"
                checked={smsSettings.enabled}
                onCheckedChange={(checked) => setSmsSettings((prev) => ({ ...prev, enabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="orderConfirmation" className="text-gray-300">
                Order Confirmation SMS
              </Label>
              <Switch
                id="orderConfirmation"
                checked={smsSettings.orderConfirmationEnabled}
                onCheckedChange={(checked) =>
                  setSmsSettings((prev) => ({ ...prev, orderConfirmationEnabled: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="shippingUpdate" className="text-gray-300">
                Shipping Update SMS
              </Label>
              <Switch
                id="shippingUpdate"
                checked={smsSettings.shippingUpdateEnabled}
                onCheckedChange={(checked) => setSmsSettings((prev) => ({ ...prev, shippingUpdateEnabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="deliveryNotification" className="text-gray-300">
                Delivery Notification SMS
              </Label>
              <Switch
                id="deliveryNotification"
                checked={smsSettings.deliveryNotificationEnabled}
                onCheckedChange={(checked) =>
                  setSmsSettings((prev) => ({ ...prev, deliveryNotificationEnabled: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="messageTemplate" className="text-gray-300">
                Custom Message Template
              </Label>
              <Textarea
                id="messageTemplate"
                value={smsSettings.customMessageTemplate}
                onChange={(e) => setSmsSettings((prev) => ({ ...prev, customMessageTemplate: e.target.value }))}
                className="bg-[#222] border-[#444] text-white min-h-[100px]"
                placeholder="Enter your custom message template..."
              />
              <p className="text-xs text-gray-500">
                Use {"{orderId}"}, {"{customerName}"}, {"{trackingUrl}"} as placeholders
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white">Twilio Configuration</h4>

              <div className="space-y-2">
                <Label htmlFor="twilioSid" className="text-gray-300">
                  Twilio Account SID
                </Label>
                <Input
                  id="twilioSid"
                  type="password"
                  value={smsSettings.twilioAccountSid}
                  onChange={(e) => setSmsSettings((prev) => ({ ...prev, twilioAccountSid: e.target.value }))}
                  className="bg-[#222] border-[#444] text-white"
                  placeholder="Enter Twilio Account SID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twilioToken" className="text-gray-300">
                  Twilio Auth Token
                </Label>
                <Input
                  id="twilioToken"
                  type="password"
                  value={smsSettings.twilioAuthToken}
                  onChange={(e) => setSmsSettings((prev) => ({ ...prev, twilioAuthToken: e.target.value }))}
                  className="bg-[#222] border-[#444] text-white"
                  placeholder="Enter Twilio Auth Token"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twilioPhone" className="text-gray-300">
                  Twilio Phone Number
                </Label>
                <Input
                  id="twilioPhone"
                  value={smsSettings.twilioPhoneNumber}
                  onChange={(e) => setSmsSettings((prev) => ({ ...prev, twilioPhoneNumber: e.target.value }))}
                  className="bg-[#222] border-[#444] text-white"
                  placeholder="+1234567890"
                />
              </div>
            </div>

            <Button
              onClick={saveSMSSettings}
              disabled={sending}
              className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-black"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Settings className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Send Custom Message */}
        <Card className="bg-[#111] border-[#333]">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Send className="h-5 w-5 mr-2 text-[#D4AF37]" />
              Send Custom Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="customerPhone" className="text-gray-300">
                Customer Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="customerPhone"
                  value={customMessage.phone}
                  onChange={(e) => setCustomMessage((prev) => ({ ...prev, phone: e.target.value }))}
                  className="bg-[#222] border-[#444] text-white pl-10"
                  placeholder="+1234567890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderId" className="text-gray-300">
                Order ID (Optional)
              </Label>
              <Input
                id="orderId"
                value={customMessage.orderId}
                onChange={(e) => setCustomMessage((prev) => ({ ...prev, orderId: e.target.value }))}
                className="bg-[#222] border-[#444] text-white"
                placeholder="GF123456789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customMessageText" className="text-gray-300">
                Message
              </Label>
              <Textarea
                id="customMessageText"
                value={customMessage.message}
                onChange={(e) => setCustomMessage((prev) => ({ ...prev, message: e.target.value }))}
                className="bg-[#222] border-[#444] text-white min-h-[120px]"
                rows={5}
                placeholder="Enter your custom message..."
              />
              <p className="text-xs text-gray-500">Maximum 160 characters for SMS</p>
            </div>

            <Button
              onClick={sendCustomMessage}
              disabled={sending || !customMessage.phone || !customMessage.message}
              className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-black"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notifications */}
      <Card className="bg-[#111] border-[#333]">
        <CardHeader>
          <CardTitle className="text-white">Recent SMS Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No SMS notifications sent yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.slice(0, 10).map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-4 bg-[#222] rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-white">{notification.phone}</span>
                      <Badge
                        variant={notification.status === "delivered" ? "default" : "destructive"}
                        className={notification.status === "delivered" ? "bg-green-500" : "bg-red-500"}
                      >
                        {notification.status}
                      </Badge>
                      {notification.orderId && (
                        <span className="text-sm text-beige">Order: {notification.orderId}</span>
                      )}
                    </div>
                    <p className="text-beige text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
