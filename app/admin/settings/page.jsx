"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    storeName: "",
    storeDescription: "",
    storeEmail: "",
    storePhone: "",
    storeAddress: "",
    currency: "USD",
    timezone: "America/Los_Angeles",
    taxRate: 8.5,
    ageVerificationRequired: true,
    maintenanceMode: false,
  })

  // Shipping Settings
  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: 100,
    standardShippingCost: 9.99,
    expressShippingCost: 19.99,
    sameDayShippingCost: 29.99,
    standardDeliveryDays: "3-5",
    expressDeliveryDays: "1-2",
    sameDayDeliveryHours: "3-4",
    shippingZones: ["California", "Nevada", "Oregon", "Washington"],
    packagingFee: 0,
    handlingFee: 0,
  })

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    stripeEnabled: true,
    paypalEnabled: true,
    cashOnDeliveryEnabled: false,
    cryptoEnabled: false,
    minimumOrderAmount: 25,
    maximumOrderAmount: 5000,
    processingFee: 2.9,
    refundPolicy: "30 days",
  })

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)

        // Fetch general settings
        const generalRes = await fetch("/api/settings?type=general")
        if (generalRes.ok) {
          const data = await generalRes.json()
          if (data.success && data.data) {
            setGeneralSettings(data.data)
          }
        }

        // Fetch shipping settings
        const shippingRes = await fetch("/api/settings?type=shipping")
        if (shippingRes.ok) {
          const data = await shippingRes.json()
          if (data.success && data.data) {
            setShippingSettings(data.data)
          }
        }

        // Fetch payment settings
        const paymentRes = await fetch("/api/settings?type=payment")
        if (paymentRes.ok) {
          const data = await paymentRes.json()
          if (data.success && data.data) {
            setPaymentSettings(data.data)
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
        toast({
          title: "Error",
          description: "Failed to load settings. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // Handle saving settings
  const saveSettings = async (type) => {
    try {
      setSaving(true)

      let settingsData
      switch (type) {
        case "general":
          settingsData = generalSettings
          break
        case "shipping":
          settingsData = shippingSettings
          break
        case "payment":
          settingsData = paymentSettings
          break
        default:
          throw new Error("Invalid settings type")
      }

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          settings: settingsData,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Settings updated successfully",
        })
      } else {
        throw new Error(data.message || "Failed to update settings")
      }
    } catch (error) {
      console.error(`Error saving ${type} settings:`, error)
      toast({
        title: "Error",
        description: error.message || `Failed to save ${type} settings`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Handle input changes for general settings
  const handleGeneralChange = (e) => {
    const { name, value, type, checked } = e.target
    setGeneralSettings({
      ...generalSettings,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  // Handle input changes for shipping settings
  const handleShippingChange = (e) => {
    const { name, value } = e.target
    setShippingSettings({
      ...shippingSettings,
      [name]: value,
    })
  }

  // Handle input changes for payment settings
  const handlePaymentChange = (e) => {
    const { name, value, type, checked } = e.target
    setPaymentSettings({
      ...paymentSettings,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading settings...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Store Settings</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure your store's basic information and settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    name="storeName"
                    value={generalSettings.storeName}
                    onChange={handleGeneralChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Store Email</Label>
                  <Input
                    id="storeEmail"
                    name="storeEmail"
                    type="email"
                    value={generalSettings.storeEmail}
                    onChange={handleGeneralChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storePhone">Store Phone</Label>
                  <Input
                    id="storePhone"
                    name="storePhone"
                    value={generalSettings.storePhone}
                    onChange={handleGeneralChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeAddress">Store Address</Label>
                  <Input
                    id="storeAddress"
                    name="storeAddress"
                    value={generalSettings.storeAddress}
                    onChange={handleGeneralChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={generalSettings.currency}
                    onValueChange={(value) => setGeneralSettings({ ...generalSettings, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={generalSettings.timezone}
                    onValueChange={(value) => setGeneralSettings({ ...generalSettings, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    name="taxRate"
                    type="number"
                    step="0.01"
                    value={generalSettings.taxRate}
                    onChange={handleGeneralChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeDescription">Store Description</Label>
                <textarea
                  id="storeDescription"
                  name="storeDescription"
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  value={generalSettings.storeDescription}
                  onChange={handleGeneralChange}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ageVerificationRequired"
                  name="ageVerificationRequired"
                  checked={generalSettings.ageVerificationRequired}
                  onCheckedChange={(checked) =>
                    setGeneralSettings({ ...generalSettings, ageVerificationRequired: checked })
                  }
                />
                <Label htmlFor="ageVerificationRequired">Require Age Verification</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenanceMode"
                  name="maintenanceMode"
                  checked={generalSettings.maintenanceMode}
                  onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, maintenanceMode: checked })}
                />
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              </div>

              <Button onClick={() => saveSettings("general")} disabled={saving} className="w-full md:w-auto">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save General Settings"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Settings</CardTitle>
              <CardDescription>Configure your store's shipping options and costs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="freeShippingThreshold">Free Shipping Threshold ($)</Label>
                  <Input
                    id="freeShippingThreshold"
                    name="freeShippingThreshold"
                    type="number"
                    step="0.01"
                    value={shippingSettings.freeShippingThreshold}
                    onChange={(e) =>
                      setShippingSettings({
                        ...shippingSettings,
                        freeShippingThreshold: Number.parseFloat(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="standardShippingCost">Standard Shipping Cost ($)</Label>
                  <Input
                    id="standardShippingCost"
                    name="standardShippingCost"
                    type="number"
                    step="0.01"
                    value={shippingSettings.standardShippingCost}
                    onChange={(e) =>
                      setShippingSettings({
                        ...shippingSettings,
                        standardShippingCost: Number.parseFloat(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expressShippingCost">Express Shipping Cost ($)</Label>
                  <Input
                    id="expressShippingCost"
                    name="expressShippingCost"
                    type="number"
                    step="0.01"
                    value={shippingSettings.expressShippingCost}
                    onChange={(e) =>
                      setShippingSettings({
                        ...shippingSettings,
                        expressShippingCost: Number.parseFloat(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sameDayShippingCost">Same Day Shipping Cost ($)</Label>
                  <Input
                    id="sameDayShippingCost"
                    name="sameDayShippingCost"
                    type="number"
                    step="0.01"
                    value={shippingSettings.sameDayShippingCost}
                    onChange={(e) =>
                      setShippingSettings({
                        ...shippingSettings,
                        sameDayShippingCost: Number.parseFloat(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="standardDeliveryDays">Standard Delivery Time (days)</Label>
                  <Input
                    id="standardDeliveryDays"
                    name="standardDeliveryDays"
                    value={shippingSettings.standardDeliveryDays}
                    onChange={(e) => setShippingSettings({ ...shippingSettings, standardDeliveryDays: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expressDeliveryDays">Express Delivery Time (days)</Label>
                  <Input
                    id="expressDeliveryDays"
                    name="expressDeliveryDays"
                    value={shippingSettings.expressDeliveryDays}
                    onChange={(e) => setShippingSettings({ ...shippingSettings, expressDeliveryDays: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sameDayDeliveryHours">Same Day Delivery Time (hours)</Label>
                  <Input
                    id="sameDayDeliveryHours"
                    name="sameDayDeliveryHours"
                    value={shippingSettings.sameDayDeliveryHours}
                    onChange={(e) => setShippingSettings({ ...shippingSettings, sameDayDeliveryHours: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="packagingFee">Packaging Fee ($)</Label>
                  <Input
                    id="packagingFee"
                    name="packagingFee"
                    type="number"
                    step="0.01"
                    value={shippingSettings.packagingFee}
                    onChange={(e) =>
                      setShippingSettings({ ...shippingSettings, packagingFee: Number.parseFloat(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="handlingFee">Handling Fee ($)</Label>
                  <Input
                    id="handlingFee"
                    name="handlingFee"
                    type="number"
                    step="0.01"
                    value={shippingSettings.handlingFee}
                    onChange={(e) =>
                      setShippingSettings({ ...shippingSettings, handlingFee: Number.parseFloat(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingZones">Shipping Zones (comma separated)</Label>
                <Input
                  id="shippingZones"
                  name="shippingZones"
                  value={shippingSettings.shippingZones.join(", ")}
                  onChange={(e) =>
                    setShippingSettings({
                      ...shippingSettings,
                      shippingZones: e.target.value.split(",").map((zone) => zone.trim()),
                    })
                  }
                />
              </div>

              <Button onClick={() => saveSettings("shipping")} disabled={saving} className="w-full md:w-auto">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Shipping Settings"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure your store's payment options and policies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minimumOrderAmount">Minimum Order Amount ($)</Label>
                  <Input
                    id="minimumOrderAmount"
                    name="minimumOrderAmount"
                    type="number"
                    step="0.01"
                    value={paymentSettings.minimumOrderAmount}
                    onChange={(e) =>
                      setPaymentSettings({ ...paymentSettings, minimumOrderAmount: Number.parseFloat(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maximumOrderAmount">Maximum Order Amount ($)</Label>
                  <Input
                    id="maximumOrderAmount"
                    name="maximumOrderAmount"
                    type="number"
                    step="0.01"
                    value={paymentSettings.maximumOrderAmount}
                    onChange={(e) =>
                      setPaymentSettings({ ...paymentSettings, maximumOrderAmount: Number.parseFloat(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="processingFee">Processing Fee (%)</Label>
                  <Input
                    id="processingFee"
                    name="processingFee"
                    type="number"
                    step="0.01"
                    value={paymentSettings.processingFee}
                    onChange={(e) =>
                      setPaymentSettings({ ...paymentSettings, processingFee: Number.parseFloat(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refundPolicy">Refund Policy (days)</Label>
                  <Input
                    id="refundPolicy"
                    name="refundPolicy"
                    value={paymentSettings.refundPolicy}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, refundPolicy: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Payment Methods</h3>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="stripeEnabled"
                    checked={paymentSettings.stripeEnabled}
                    onCheckedChange={(checked) => setPaymentSettings({ ...paymentSettings, stripeEnabled: checked })}
                  />
                  <Label htmlFor="stripeEnabled">Enable Stripe</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="paypalEnabled"
                    checked={paymentSettings.paypalEnabled}
                    onCheckedChange={(checked) => setPaymentSettings({ ...paymentSettings, paypalEnabled: checked })}
                  />
                  <Label htmlFor="paypalEnabled">Enable PayPal</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="cashOnDeliveryEnabled"
                    checked={paymentSettings.cashOnDeliveryEnabled}
                    onCheckedChange={(checked) =>
                      setPaymentSettings({ ...paymentSettings, cashOnDeliveryEnabled: checked })
                    }
                  />
                  <Label htmlFor="cashOnDeliveryEnabled">Enable Cash on Delivery</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="cryptoEnabled"
                    checked={paymentSettings.cryptoEnabled}
                    onCheckedChange={(checked) => setPaymentSettings({ ...paymentSettings, cryptoEnabled: checked })}
                  />
                  <Label htmlFor="cryptoEnabled">Enable Cryptocurrency</Label>
                </div>
              </div>

              <Button onClick={() => saveSettings("payment")} disabled={saving} className="w-full md:w-auto">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Payment Settings"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
