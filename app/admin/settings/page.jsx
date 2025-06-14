"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Loader2, Save, Settings, Globe, Facebook, Twitter, Instagram, Youtube } from "lucide-react"

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    siteName: "Greenfields Cannabis",
    siteDescription: "Premium cannabis products crafted with care",
    contactEmail: "info@greenfields.com",
    contactPhone: "+1 (800) 420-6969",
    address: "123 Cannabis Boulevard\nLos Angeles, CA 90210",
    businessHours: "Monday - Friday: 9:00 AM - 8:00 PM\nSaturday - Sunday: 10:00 AM - 6:00 PM",
    socialLinks: {
      facebook: "",
      twitter: "",
      instagram: "",
      youtube: "",
    },
  })

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/settings")
        const data = await response.json()

        if (data.success && data.data) {
          setSettings((prev) => ({
            ...prev,
            ...data.data,
            socialLinks: {
              ...prev.socialLinks,
              ...(data.data.socialLinks || {}),
            },
          }))
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

  // Save settings function
  const saveSettings = async () => {
    try {
      setSaving(true)

      const accessToken = localStorage.getItem("accessToken")

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ data: settings }),
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
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSocialLinkChange = (platform, value) => {
    setSettings((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }))
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold gold-text mb-2">Site Settings</h1>
          <p className="text-beige">Manage your website settings and configuration</p>
        </div>

        <div className="space-y-8">
          {/* General Settings */}
          <Card className="bg-[#111] border-[#333]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings size={20} />
                General Settings
              </CardTitle>
              <CardDescription>Basic website information and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-300">Site Name</Label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => handleInputChange("siteName", e.target.value)}
                    placeholder="Your site name"
                    className="bg-[#222] border-[#444] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Contact Email</Label>
                  <Input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                    placeholder="contact@yoursite.com"
                    className="bg-[#222] border-[#444] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Contact Phone</Label>
                  <Input
                    value={settings.contactPhone}
                    onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="bg-[#222] border-[#444] text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Site Description</Label>
                <Textarea
                  value={settings.siteDescription}
                  onChange={(e) => handleInputChange("siteDescription", e.target.value)}
                  placeholder="Brief description of your website"
                  className="bg-[#222] border-[#444] text-white min-h-[80px]"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Business Address</Label>
                <Textarea
                  value={settings.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Your business address"
                  className="bg-[#222] border-[#444] text-white min-h-[80px]"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Business Hours</Label>
                <Textarea
                  value={settings.businessHours}
                  onChange={(e) => handleInputChange("businessHours", e.target.value)}
                  placeholder="Your business hours"
                  className="bg-[#222] border-[#444] text-white min-h-[80px]"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Media Links */}
          <Card className="bg-[#111] border-[#333]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe size={20} />
                Social Media Links
              </CardTitle>
              <CardDescription>Configure your social media presence in the footer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Facebook size={16} className="text-blue-500" />
                    Facebook URL
                  </Label>
                  <Input
                    value={settings.socialLinks?.facebook || ""}
                    onChange={(e) => handleSocialLinkChange("facebook", e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                    className="bg-[#222] border-[#444] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Twitter size={16} className="text-blue-400" />
                    Twitter URL
                  </Label>
                  <Input
                    value={settings.socialLinks?.twitter || ""}
                    onChange={(e) => handleSocialLinkChange("twitter", e.target.value)}
                    placeholder="https://twitter.com/yourhandle"
                    className="bg-[#222] border-[#444] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Instagram size={16} className="text-pink-500" />
                    Instagram URL
                  </Label>
                  <Input
                    value={settings.socialLinks?.instagram || ""}
                    onChange={(e) => handleSocialLinkChange("instagram", e.target.value)}
                    placeholder="https://instagram.com/yourhandle"
                    className="bg-[#222] border-[#444] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Youtube size={16} className="text-red-500" />
                    YouTube URL
                  </Label>
                  <Input
                    value={settings.socialLinks?.youtube || ""}
                    onChange={(e) => handleSocialLinkChange("youtube", e.target.value)}
                    placeholder="https://youtube.com/yourchannel"
                    className="bg-[#222] border-[#444] text-white"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-300">
                  <strong>Note:</strong> These social media links will appear in the footer of your website. Leave any
                  field empty to hide that social media icon from the footer.
                </p>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={saveSettings}
            disabled={saving}
            className="bg-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-2 hover:border-[#D4AF37] hover:cursor-pointer transition-all duration-500 hover:text-[#D4AF37] text-black"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
