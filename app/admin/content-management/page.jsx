"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Loader2, Save, FileText, ImageIcon, Globe } from "lucide-react"

export default function ContentManagementPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("about")

  // Content states for different pages
  const [aboutContent, setAboutContent] = useState({
    heroTitle: "",
    heroSubtitle: "",
    missionTitle: "",
    missionText: "",
    valuesTitle: "",
    valuesText: "",
    teamTitle: "",
    teamText: "",
    amelieDescription: "",
    baylieDescription: "",
    chloeDescription: "",
    promiseTitle: "",
    promiseText: "",
    journeyTitle: "",
    journeyText: "",
  })

  const [contactContent, setContactContent] = useState({
    heroTitle: "",
    heroSubtitle: "",
    address: "",
    phone: "",
    email: "",
    businessHours: "",
    mapTitle: "",
    mapDescription: "",
    socialLinks: "",
  })

  const [homeContent, setHomeContent] = useState({
    heroTitle: "",
    heroSubtitle: "",
    featuredTitle: "",
    featuredSubtitle: "",
    aboutTitle: "",
    aboutText: "",
    testimonialsTitle: "",
    ctaTitle: "",
    ctaText: "",
  })

  const [policyContent, setPolicyContent] = useState({
    shippingPolicy: "",
    returnPolicy: "",
    privacyPolicy: "",
    termsConditions: "",
  })

  // Fetch content on component mount
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)

        // Fetch content for all pages
        const [aboutRes, contactRes, homeRes, policyRes] = await Promise.all([
          fetch("/api/content-management?page=about"),
          fetch("/api/content-management?page=contact"),
          fetch("/api/content-management?page=home"),
          fetch("/api/content-management?page=policies"),
        ])

        const [aboutData, contactData, homeData, policyData] = await Promise.all([
          aboutRes.json(),
          contactRes.json(),
          homeRes.json(),
          policyRes.json(),
        ])

        if (aboutData.success && aboutData.data) {
          setAboutContent(aboutData.data)
        }

        if (contactData.success && contactData.data) {
          setContactContent(contactData.data)
        }

        if (homeData.success && homeData.data) {
          setHomeContent(homeData.data)
        }

        if (policyData.success && policyData.data) {
          setPolicyContent(policyData.data)
        }
      } catch (error) {
        console.error("Error fetching content:", error)
        toast({
          title: "Error",
          description: "Failed to load content. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  // Save content function
  const saveContent = async (page, content) => {
    try {
      setSaving(true)

      const response = await fetch("/api/content-management", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page,
          section: "main",
          content,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: `${page} content updated successfully`,
        })
      } else {
        throw new Error(data.message || "Failed to update content")
      }
    } catch (error) {
      console.error(`Error saving ${page} content:`, error)
      toast({
        title: "Error",
        description: error.message || `Failed to save ${page} content`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading content...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold gold-text mb-2">Content Management</h1>
          <p className="text-beige">Manage website content for different pages</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="about" className="flex items-center gap-2">
              <FileText size={16} />
              About Page
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Globe size={16} />
              Contact Page
            </TabsTrigger>
            <TabsTrigger value="home" className="flex items-center gap-2">
              <ImageIcon size={16} />
              Home Page
            </TabsTrigger>
            <TabsTrigger value="policies" className="flex items-center gap-2">
              <FileText size={16} />
              Policies
            </TabsTrigger>
          </TabsList>

          {/* About Page Content */}
          <TabsContent value="about">
            <Card className="bg-[#111] border-[#333]">
              <CardHeader>
                <CardTitle className="text-white">About Page Content</CardTitle>
                <CardDescription>Manage content for the about page sections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="aboutHeroTitle" className="text-gray-300">
                      Hero Title
                    </Label>
                    <Input
                      id="aboutHeroTitle"
                      value={aboutContent.heroTitle}
                      onChange={(e) => setAboutContent((prev) => ({ ...prev, heroTitle: e.target.value }))}
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aboutHeroSubtitle" className="text-gray-300">
                      Hero Subtitle
                    </Label>
                    <Input
                      id="aboutHeroSubtitle"
                      value={aboutContent.heroSubtitle}
                      onChange={(e) => setAboutContent((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aboutMissionTitle" className="text-gray-300">
                      Mission Title
                    </Label>
                    <Input
                      id="aboutMissionTitle"
                      value={aboutContent.missionTitle}
                      onChange={(e) => setAboutContent((prev) => ({ ...prev, missionTitle: e.target.value }))}
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aboutValuesTitle" className="text-gray-300">
                      Values Title
                    </Label>
                    <Input
                      id="aboutValuesTitle"
                      value={aboutContent.valuesTitle}
                      onChange={(e) => setAboutContent((prev) => ({ ...prev, valuesTitle: e.target.value }))}
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amelieDescription" className="text-gray-300">
                      Amelie Description
                    </Label>
                    <Input
                      id="amelieDescription"
                      value={aboutContent.amelieDescription}
                      onChange={(e) => setAboutContent((prev) => ({ ...prev, amelieDescription: e.target.value }))}
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="baylieDescription" className="text-gray-300">
                      Baylie Description
                    </Label>
                    <Input
                      id="baylieDescription"
                      value={aboutContent.baylieDescription}
                      onChange={(e) => setAboutContent((prev) => ({ ...prev, baylieDescription: e.target.value }))}
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chloeDescription" className="text-gray-300">
                      Chloe Description
                    </Label>
                    <Input
                      id="chloeDescription"
                      value={aboutContent.chloeDescription}
                      onChange={(e) => setAboutContent((prev) => ({ ...prev, chloeDescription: e.target.value }))}
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teamTitle" className="text-gray-300">
                      Team Title
                    </Label>
                    <Input
                      id="teamTitle"
                      value={aboutContent.teamTitle}
                      onChange={(e) => setAboutContent((prev) => ({ ...prev, teamTitle: e.target.value }))}
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="promiseTitle" className="text-gray-300">
                      Promise Title
                    </Label>
                    <Input
                      id="promiseTitle"
                      value={aboutContent.promiseTitle}
                      onChange={(e) => setAboutContent((prev) => ({ ...prev, promiseTitle: e.target.value }))}
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="journeyTitle" className="text-gray-300">
                      Journey Title
                    </Label>
                    <Input
                      id="journeyTitle"
                      value={aboutContent.journeyTitle}
                      onChange={(e) => setAboutContent((prev) => ({ ...prev, journeyTitle: e.target.value }))}
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aboutMissionText" className="text-gray-300">
                    Mission Text
                  </Label>
                  <Textarea
                    id="aboutMissionText"
                    value={aboutContent.missionText}
                    onChange={(e) => setAboutContent((prev) => ({ ...prev, missionText: e.target.value }))}
                    className="bg-[#222] border-[#444] text-white min-h-[120px]"
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aboutValuesText" className="text-gray-300">
                    Values Text
                  </Label>
                  <Textarea
                    id="aboutValuesText"
                    value={aboutContent.valuesText}
                    onChange={(e) => setAboutContent((prev) => ({ ...prev, valuesText: e.target.value }))}
                    className="bg-[#222] border-[#444] text-white min-h-[120px]"
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamText" className="text-gray-300">
                    Team Text
                  </Label>
                  <Textarea
                    id="teamText"
                    value={aboutContent.teamText}
                    onChange={(e) => setAboutContent((prev) => ({ ...prev, teamText: e.target.value }))}
                    className="bg-[#222] border-[#444] text-white min-h-[120px]"
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="promiseText" className="text-gray-300">
                    Promise Text
                  </Label>
                  <Textarea
                    id="promiseText"
                    value={aboutContent.promiseText}
                    onChange={(e) => setAboutContent((prev) => ({ ...prev, promiseText: e.target.value }))}
                    className="bg-[#222] border-[#444] text-white min-h-[120px]"
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="journeyText" className="text-gray-300">
                    Journey Text
                  </Label>
                  <Textarea
                    id="journeyText"
                    value={aboutContent.journeyText}
                    onChange={(e) => setAboutContent((prev) => ({ ...prev, journeyText: e.target.value }))}
                    className="bg-[#222] border-[#444] text-white min-h-[120px]"
                    rows={5}
                  />
                </div>

                <Button
                  onClick={() => saveContent("about", aboutContent)}
                  disabled={saving}
                  className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save About Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Page Content */}
          <TabsContent value="contact">
            <Card className="bg-[#111] border-[#333]">
              <CardHeader>
                <CardTitle className="text-white">Contact Page Content</CardTitle>
                <CardDescription>Manage content for the contact page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contactHeroTitle" className="text-gray-300">
                      Hero Title
                    </Label>
                    <Input
                      id="contactHeroTitle"
                      value={contactContent.heroTitle}
                      onChange={(e) => setContactContent((prev) => ({ ...prev, heroTitle: e.target.value }))}
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactHeroSubtitle" className="text-gray-300">
                      Hero Subtitle
                    </Label>
                    <Input
                      id="contactHeroSubtitle"
                      value={contactContent.heroSubtitle}
                      onChange={(e) => setContactContent((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactAddress" className="text-gray-300">
                      Address
                    </Label>
                    <Input
                      id="contactAddress"
                      value={contactContent.address}
                      onChange={(e) => setContactContent((prev) => ({ ...prev, address: e.target.value }))}
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone" className="text-gray-300">
                      Phone
                    </Label>
                    <Input
                      id="contactPhone"
                      value={contactContent.phone}
                      onChange={(e) => setContactContent((prev) => ({ ...prev, phone: e.target.value }))}
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className="text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="contactEmail"
                      value={contactContent.email}
                      onChange={(e) => setContactContent((prev) => ({ ...prev, email: e.target.value }))}
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactBusinessHours" className="text-gray-300">
                      Business Hours
                    </Label>
                    <Input
                      id="contactBusinessHours"
                      value={contactContent.businessHours}
                      onChange={(e) => setContactContent((prev) => ({ ...prev, businessHours: e.target.value }))}
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactSocialLinks" className="text-gray-300">
                      Social Links
                    </Label>
                    <Input
                      id="contactSocialLinks"
                      value={contactContent.socialLinks}
                      onChange={(e) => setContactContent((prev) => ({ ...prev, socialLinks: e.target.value }))}
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => saveContent("contact", contactContent)}
                  disabled={saving}
                  className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Contact Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Home Page Content */}
          <TabsContent value="home">
            <Card className="bg-[#111] border-[#333]">
              <CardHeader>
                <CardTitle className="text-white">Home Page Content</CardTitle>
                <CardDescription>Manage content for the home page sections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="homeHeroTitle" className="text-gray-300">
                      Hero Title
                    </Label>
                    <Input
                      id="homeHeroTitle"
                      value={homeContent.heroTitle}
                      onChange={(e) => setHomeContent((prev) => ({ ...prev, heroTitle: e.target.value }))}
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="homeHeroSubtitle" className="text-gray-300">
                      Hero Subtitle
                    </Label>
                    <Input
                      id="homeHeroSubtitle"
                      value={homeContent.heroSubtitle}
                      onChange={(e) => setHomeContent((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="homeFeaturedTitle" className="text-gray-300">
                      Featured Section Title
                    </Label>
                    <Input
                      id="homeFeaturedTitle"
                      value={homeContent.featuredTitle}
                      onChange={(e) => setHomeContent((prev) => ({ ...prev, featuredTitle: e.target.value }))}
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="homeAboutTitle" className="text-gray-300">
                      About Section Title
                    </Label>
                    <Input
                      id="homeAboutTitle"
                      value={homeContent.aboutTitle}
                      onChange={(e) => setHomeContent((prev) => ({ ...prev, aboutTitle: e.target.value }))}
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="homeAboutText" className="text-gray-300">
                    About Section Text
                  </Label>
                  <Textarea
                    id="homeAboutText"
                    value={homeContent.aboutText}
                    onChange={(e) => setHomeContent((prev) => ({ ...prev, aboutText: e.target.value }))}
                    className="bg-[#222] border-[#444] text-white min-h-[120px]"
                    rows={5}
                  />
                </div>

                <Button
                  onClick={() => saveContent("home", homeContent)}
                  disabled={saving}
                  className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Home Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Policies Content */}
          <TabsContent value="policies">
            <Card className="bg-[#111] border-[#333]">
              <CardHeader>
                <CardTitle className="text-white">Policy Pages Content</CardTitle>
                <CardDescription>Manage content for policy and information pages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="shippingPolicy" className="text-gray-300">
                    Shipping Policy
                  </Label>
                  <Textarea
                    id="shippingPolicy"
                    value={policyContent.shippingPolicy}
                    onChange={(e) => setPolicyContent((prev) => ({ ...prev, shippingPolicy: e.target.value }))}
                    className="bg-[#222] border-[#444] text-white min-h-[150px]"
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="returnPolicy" className="text-gray-300">
                    Return Policy
                  </Label>
                  <Textarea
                    id="returnPolicy"
                    value={policyContent.returnPolicy}
                    onChange={(e) => setPolicyContent((prev) => ({ ...prev, returnPolicy: e.target.value }))}
                    className="bg-[#222] border-[#444] text-white min-h-[150px]"
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privacyPolicy" className="text-gray-300">
                    Privacy Policy
                  </Label>
                  <Textarea
                    id="privacyPolicy"
                    value={policyContent.privacyPolicy}
                    onChange={(e) => setPolicyContent((prev) => ({ ...prev, privacyPolicy: e.target.value }))}
                    className="bg-[#222] border-[#444] text-white min-h-[150px]"
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="termsConditions" className="text-gray-300">
                    Terms & Conditions
                  </Label>
                  <Textarea
                    id="termsConditions"
                    value={policyContent.termsConditions}
                    onChange={(e) => setPolicyContent((prev) => ({ ...prev, termsConditions: e.target.value }))}
                    className="bg-[#222] border-[#444] text-white min-h-[150px]"
                    rows={6}
                  />
                </div>

                <Button
                  onClick={() => saveContent("policies", policyContent)}
                  disabled={saving}
                  className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Policy Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
