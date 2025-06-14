"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Gift, Users, Percent, DollarSign, Award, Edit, Trash2, Plus, Save, X } from "lucide-react"

const LoyaltyPage = () => {
  const [activeTab, setActiveTab] = useState("program")
  const [isEditing, setIsEditing] = useState(false)
  const [programSettings, setProgramSettings] = useState({
    enabled: true,
    pointsPerDollar: 10,
    pointsPerDollarNotes: "",
    minimumRedeemPoints: 500,
    minimumRedeemPointsNotes: "",
    pointsExpiration: 90,
    pointsExpirationNotes: "",
    welcomeBonus: 100,
    welcomeBonusNotes: "",
    referralBonus: 200,
    referralBonusNotes: "",
    birthdayBonus: 50,
    birthdayBonusNotes: "",
  })

  const [referralSettings, setReferralSettings] = useState({
    referrerPoints: 200,
    referrerPointsNotes: "",
    newCustomerPoints: 100,
    newCustomerPointsNotes: "",
    monthlyReferralLimit: 10,
    monthlyReferralLimitNotes: "",
    minimumPurchaseAmount: 25,
    minimumPurchaseAmountNotes: "",
    referralLinkExpiration: 30,
    referralLinkExpirationNotes: "",
    requireAccountCreation: true,
    requireAccountCreationNotes: "",
    requireFirstPurchase: true,
    requireFirstPurchaseNotes: "",
    emailSubject: "Join Greenfields Cannabis - Get 100 Bonus Points!",
    emailSubjectNotes: "",
    emailContent:
      "Hey there! I thought you might enjoy Greenfields Cannabis. Use my referral link to sign up and get 100 bonus points on your first purchase! [REFERRAL_LINK]",
    emailContentNotes: "",
  })

  const [tiers, setTiers] = useState([
    { name: "Bronze", threshold: 0, discount: 5, freeShipping: false, birthdayBonus: true, notes: "" },
    { name: "Silver", threshold: 1000, discount: 10, freeShipping: true, birthdayBonus: true, notes: "" },
    { name: "Gold", threshold: 5000, discount: 15, freeShipping: true, birthdayBonus: true, notes: "" },
    { name: "Platinum", threshold: 10000, discount: 20, freeShipping: true, birthdayBonus: true, notes: "" },
  ])

  const [rewards, setRewards] = useState([
    { id: 1, name: "$5 Off Coupon", pointsCost: 500, description: "Get $5 off your next purchase", notes: "" },
    { id: 2, name: "$10 Off Coupon", pointsCost: 1000, description: "Get $10 off your next purchase", notes: "" },
    { id: 3, name: "Free Shipping", pointsCost: 750, description: "Free shipping on your next order", notes: "" },
    {
      id: 4,
      name: "Free Product",
      pointsCost: 2000,
      description: "Get a free product with your next purchase",
      notes: "",
    },
  ])

  const handleSettingChange = (setting, value) => {
    setProgramSettings((prev) => ({
      ...prev,
      [setting]: value,
    }))
  }

  const handleReferralSettingChange = (setting, value) => {
    setReferralSettings((prev) => ({
      ...prev,
      [setting]: value,
    }))
  }

  const saveLoyaltySettings = () => {
    toast({
      title: "Settings Saved",
      description: "Loyalty program settings have been updated successfully.",
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gold-text">Loyalty Program</h1>
          <p className="text-beige mt-2">Manage your customer loyalty program and rewards</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="program-status"
              checked={programSettings.enabled}
              onCheckedChange={(checked) => {
                handleSettingChange("enabled", checked)
                toast({
                  title: "Program Status Updated",
                  description: `Loyalty program is now ${checked ? "active" : "inactive"}`,
                })
              }}
            />
            <Label htmlFor="program-status" className="text-beige">
              {programSettings.enabled ? "Program Active" : "Program Inactive"}
            </Label>
          </div>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-2 hover:border-[#D4AF37] hover:cursor-pointer transition-all duration-500 hover:text-[#D4AF37] text-black"
            >
              <Edit size={16} className="mr-2" />
              Edit Program
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                onClick={saveLoyaltySettings}
                className="bg-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-2 hover:border-[#D4AF37] hover:cursor-pointer transition-all duration-500 hover:text-[#D4AF37] text-black"
              >
                <Save size={16} className="mr-2" />
                Save Changes
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline" className="border-[#333]">
                <X size={16} className="mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="program" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#111] border border-[#333]">
          <TabsTrigger value="program" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
            <Gift size={16} className="mr-2" />
            Program Settings
          </TabsTrigger>
          <TabsTrigger value="tiers" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
            <Award size={16} className="mr-2" />
            Loyalty Tiers
          </TabsTrigger>
          <TabsTrigger value="rewards" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
            <Percent size={16} className="mr-2" />
            Rewards
          </TabsTrigger>
          <TabsTrigger value="referrals" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
            <Users size={16} className="mr-2" />
            Referral Program
          </TabsTrigger>
        </TabsList>

        {/* Program Settings Tab */}
        <TabsContent value="program" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="bg-[#111] border-[#333]">
              <CardHeader>
                <CardTitle className="text-white">Program Settings</CardTitle>
                <CardDescription className="text-beige">Configure your loyalty program settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="points-per-dollar" className="text-beige">
                        Points Per Dollar
                      </Label>
                      <div className="flex items-center">
                        <Input
                          id="points-per-dollar"
                          type="number"
                          value={programSettings.pointsPerDollar}
                          onChange={(e) => handleSettingChange("pointsPerDollar", Number.parseInt(e.target.value))}
                          disabled={!isEditing}
                          className="bg-[#222] border-[#333] text-white"
                        />
                        <span className="ml-2 text-beige">points</span>
                      </div>
                      <p className="text-xs text-beige">Number of points earned per dollar spent</p>
                      {isEditing && (
                        <Textarea
                          placeholder="Add notes about points per dollar..."
                          value={programSettings.pointsPerDollarNotes}
                          onChange={(e) => handleSettingChange("pointsPerDollarNotes", e.target.value)}
                          className="bg-[#222] border-[#333] text-white"
                          rows={2}
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minimum-redeem" className="text-beige">
                        Minimum Points to Redeem
                      </Label>
                      <div className="flex items-center">
                        <Input
                          id="minimum-redeem"
                          type="number"
                          value={programSettings.minimumRedeemPoints}
                          onChange={(e) => handleSettingChange("minimumRedeemPoints", Number.parseInt(e.target.value))}
                          disabled={!isEditing}
                          className="bg-[#222] border-[#333] text-white"
                        />
                        <span className="ml-2 text-beige">points</span>
                      </div>
                      <p className="text-xs text-beige">Minimum points required for redemption</p>
                      {isEditing && (
                        <Textarea
                          placeholder="Add notes about minimum redemption..."
                          value={programSettings.minimumRedeemPointsNotes}
                          onChange={(e) => handleSettingChange("minimumRedeemPointsNotes", e.target.value)}
                          className="bg-[#222] border-[#333] text-white"
                          rows={2}
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="points-expiration" className="text-beige">
                        Points Expiration
                      </Label>
                      <div className="flex items-center">
                        <Input
                          id="points-expiration"
                          type="number"
                          value={programSettings.pointsExpiration}
                          onChange={(e) => handleSettingChange("pointsExpiration", Number.parseInt(e.target.value))}
                          disabled={!isEditing}
                          className="bg-[#222] border-[#333] text-white"
                        />
                        <span className="ml-2 text-beige">days</span>
                      </div>
                      <p className="text-xs text-beige">Number of days until points expire (0 = never)</p>
                      {isEditing && (
                        <Textarea
                          placeholder="Add notes about points expiration..."
                          value={programSettings.pointsExpirationNotes}
                          onChange={(e) => handleSettingChange("pointsExpirationNotes", e.target.value)}
                          className="bg-[#222] border-[#333] text-white"
                          rows={2}
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="welcome-bonus" className="text-beige">
                        Welcome Bonus
                      </Label>
                      <div className="flex items-center">
                        <Input
                          id="welcome-bonus"
                          type="number"
                          value={programSettings.welcomeBonus}
                          onChange={(e) => handleSettingChange("welcomeBonus", Number.parseInt(e.target.value))}
                          disabled={!isEditing}
                          className="bg-[#222] border-[#333] text-white"
                        />
                        <span className="ml-2 text-beige">points</span>
                      </div>
                      <p className="text-xs text-beige">Points awarded for new account creation</p>
                      {isEditing && (
                        <Textarea
                          placeholder="Add notes about welcome bonus..."
                          value={programSettings.welcomeBonusNotes}
                          onChange={(e) => handleSettingChange("welcomeBonusNotes", e.target.value)}
                          className="bg-[#222] border-[#333] text-white"
                          rows={2}
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referral-bonus" className="text-beige">
                        Referral Bonus
                      </Label>
                      <div className="flex items-center">
                        <Input
                          id="referral-bonus"
                          type="number"
                          value={programSettings.referralBonus}
                          onChange={(e) => handleSettingChange("referralBonus", Number.parseInt(e.target.value))}
                          disabled={!isEditing}
                          className="bg-[#222] border-[#333] text-white"
                        />
                        <span className="ml-2 text-beige">points</span>
                      </div>
                      <p className="text-xs text-beige">Points awarded for successful referrals</p>
                      {isEditing && (
                        <Textarea
                          placeholder="Add notes about referral bonus..."
                          value={programSettings.referralBonusNotes}
                          onChange={(e) => handleSettingChange("referralBonusNotes", e.target.value)}
                          className="bg-[#222] border-[#333] text-white"
                          rows={2}
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birthday-bonus" className="text-beige">
                        Birthday Bonus
                      </Label>
                      <div className="flex items-center">
                        <Input
                          id="birthday-bonus"
                          type="number"
                          value={programSettings.birthdayBonus}
                          onChange={(e) => handleSettingChange("birthdayBonus", Number.parseInt(e.target.value))}
                          disabled={!isEditing}
                          className="bg-[#222] border-[#333] text-white"
                        />
                        <span className="ml-2 text-beige">points</span>
                      </div>
                      <p className="text-xs text-beige">Points awarded on customer's birthday</p>
                      {isEditing && (
                        <Textarea
                          placeholder="Add notes about birthday bonus..."
                          value={programSettings.birthdayBonusNotes}
                          onChange={(e) => handleSettingChange("birthdayBonusNotes", e.target.value)}
                          className="bg-[#222] border-[#333] text-white"
                          rows={2}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Loyalty Tiers Tab */}
        <TabsContent value="tiers" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="bg-[#111] border-[#333]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">Loyalty Tiers</CardTitle>
                  <CardDescription className="text-beige">
                    Configure your loyalty tier levels and benefits
                  </CardDescription>
                </div>
                {isEditing && (
                  <Button className="bg-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-2 hover:border-[#D4AF37] hover:cursor-pointer transition-all duration-500 hover:text-[#D4AF37] text-black">
                    <Plus size={16} className="mr-2" />
                    Add Tier
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tiers.map((tier, index) => (
                    <div key={tier.name} className="bg-[#222] border border-[#333] rounded-lg p-4 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              index === 0
                                ? "bg-[#CD7F32]"
                                : index === 1
                                  ? "bg-[#C0C0C0]"
                                  : index === 2
                                    ? "bg-[#D4AF37]"
                                    : "bg-[#E5E4E2]"
                            } text-black font-bold`}
                          >
                            {tier.name.charAt(0)}
                          </div>
                          {isEditing ? (
                            <Input
                              value={tier.name}
                              onChange={(e) => {
                                const newTiers = [...tiers]
                                newTiers[index].name = e.target.value
                                setTiers(newTiers)
                              }}
                              className="bg-[#333] border-[#444] text-white w-32"
                            />
                          ) : (
                            <h3 className="text-lg font-medium text-white">{tier.name}</h3>
                          )}
                        </div>

                        {isEditing && (
                          <Button variant="destructive" size="sm">
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-beige">Points Threshold</Label>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={tier.threshold}
                              onChange={(e) => {
                                const newTiers = [...tiers]
                                newTiers[index].threshold = Number.parseInt(e.target.value)
                                setTiers(newTiers)
                              }}
                              className="bg-[#333] border-[#444] text-white"
                            />
                          ) : (
                            <p className="text-white font-medium">{tier.threshold.toLocaleString()} points</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-beige">Discount</Label>
                          {isEditing ? (
                            <div className="flex items-center">
                              <Input
                                type="number"
                                value={tier.discount}
                                onChange={(e) => {
                                  const newTiers = [...tiers]
                                  newTiers[index].discount = Number.parseInt(e.target.value)
                                  setTiers(newTiers)
                                }}
                                className="bg-[#333] border-[#444] text-white"
                              />
                              <span className="ml-2 text-beige">%</span>
                            </div>
                          ) : (
                            <p className="text-white font-medium">{tier.discount}% off</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-beige">Benefits</Label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={tier.freeShipping}
                                onCheckedChange={(checked) => {
                                  if (isEditing) {
                                    const newTiers = [...tiers]
                                    newTiers[index].freeShipping = checked
                                    setTiers(newTiers)
                                  }
                                }}
                                disabled={!isEditing}
                              />
                              <Label className="text-white">Free Shipping</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={tier.birthdayBonus}
                                onCheckedChange={(checked) => {
                                  if (isEditing) {
                                    const newTiers = [...tiers]
                                    newTiers[index].birthdayBonus = checked
                                    setTiers(newTiers)
                                  }
                                }}
                                disabled={!isEditing}
                              />
                              <Label className="text-white">Birthday Bonus</Label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="space-y-2">
                          <Label className="text-beige">Notes</Label>
                          <Textarea
                            placeholder="Add notes about this tier..."
                            value={tier.notes}
                            onChange={(e) => {
                              const newTiers = [...tiers]
                              newTiers[index].notes = e.target.value
                              setTiers(newTiers)
                            }}
                            className="bg-[#333] border-[#444] text-white"
                            rows={2}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="bg-[#111] border-[#333]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">Rewards Catalog</CardTitle>
                  <CardDescription className="text-beige">
                    Manage the rewards customers can redeem with their points
                  </CardDescription>
                </div>
                {isEditing && (
                  <Button className="bg-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-2 hover:border-[#D4AF37] hover:cursor-pointer transition-all duration-500 hover:text-[#D4AF37] text-black">
                    <Plus size={16} className="mr-2" />
                    Add Reward
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rewards.map((reward) => (
                    <div key={reward.id} className="bg-[#222] border border-[#333] rounded-lg p-4 space-y-4">
                      <div className="flex justify-between">
                        {isEditing ? (
                          <Input
                            value={reward.name}
                            onChange={(e) => {
                              const newRewards = rewards.map((r) =>
                                r.id === reward.id ? { ...r, name: e.target.value } : r,
                              )
                              setRewards(newRewards)
                            }}
                            className="bg-[#333] border-[#444] text-white"
                          />
                        ) : (
                          <h3 className="text-lg font-medium text-white">{reward.name}</h3>
                        )}

                        {isEditing && (
                          <Button variant="destructive" size="sm">
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <DollarSign size={16} className="text-[#D4AF37]" />
                        {isEditing ? (
                          <div className="flex items-center">
                            <Input
                              type="number"
                              value={reward.pointsCost}
                              onChange={(e) => {
                                const newRewards = rewards.map((r) =>
                                  r.id === reward.id ? { ...r, pointsCost: Number.parseInt(e.target.value) } : r,
                                )
                                setRewards(newRewards)
                              }}
                              className="bg-[#333] border-[#444] text-white w-24"
                            />
                            <span className="ml-2 text-beige">points</span>
                          </div>
                        ) : (
                          <p className="text-[#D4AF37] font-medium">{reward.pointsCost.toLocaleString()} points</p>
                        )}
                      </div>

                      {isEditing ? (
                        <Input
                          value={reward.description}
                          onChange={(e) => {
                            const newRewards = rewards.map((r) =>
                              r.id === reward.id ? { ...r, description: e.target.value } : r,
                            )
                            setRewards(newRewards)
                          }}
                          className="bg-[#333] border-[#444] text-white"
                        />
                      ) : (
                        <p className="text-beige">{reward.description}</p>
                      )}

                      {isEditing && (
                        <div className="space-y-2">
                          <Label className="text-beige">Notes</Label>
                          <Textarea
                            placeholder="Add notes about this reward..."
                            value={reward.notes}
                            onChange={(e) => {
                              const newRewards = rewards.map((r) =>
                                r.id === reward.id ? { ...r, notes: e.target.value } : r,
                              )
                              setRewards(newRewards)
                            }}
                            className="bg-[#333] border-[#444] text-white"
                            rows={2}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="bg-[#111] border-[#333]">
              <CardHeader>
                <CardTitle className="text-white">Referral Program</CardTitle>
                <CardDescription className="text-beige">Configure your customer referral program</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="referrer-points" className="text-beige">
                        Referrer Points
                      </Label>
                      <div className="flex items-center">
                        <Input
                          id="referrer-points"
                          type="number"
                          value={referralSettings.referrerPoints}
                          onChange={(e) =>
                            handleReferralSettingChange("referrerPoints", Number.parseInt(e.target.value))
                          }
                          disabled={!isEditing}
                          className="bg-[#222] border-[#333] text-white"
                        />
                        <span className="ml-2 text-beige">points</span>
                      </div>
                      <p className="text-xs text-beige">Points awarded to the referrer</p>
                      {isEditing && (
                        <Textarea
                          placeholder="Add notes about referrer points..."
                          value={referralSettings.referrerPointsNotes}
                          onChange={(e) => handleReferralSettingChange("referrerPointsNotes", e.target.value)}
                          className="bg-[#222] border-[#333] text-white"
                          rows={2}
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referee-points" className="text-beige">
                        New Customer Points
                      </Label>
                      <div className="flex items-center">
                        <Input
                          id="referee-points"
                          type="number"
                          value={referralSettings.newCustomerPoints}
                          onChange={(e) =>
                            handleReferralSettingChange("newCustomerPoints", Number.parseInt(e.target.value))
                          }
                          disabled={!isEditing}
                          className="bg-[#222] border-[#333] text-white"
                        />
                        <span className="ml-2 text-beige">points</span>
                      </div>
                      <p className="text-xs text-beige">Points awarded to the new customer</p>
                      {isEditing && (
                        <Textarea
                          placeholder="Add notes about new customer points..."
                          value={referralSettings.newCustomerPointsNotes}
                          onChange={(e) => handleReferralSettingChange("newCustomerPointsNotes", e.target.value)}
                          className="bg-[#222] border-[#333] text-white"
                          rows={2}
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referral-limit" className="text-beige">
                        Monthly Referral Limit
                      </Label>
                      <div className="flex items-center">
                        <Input
                          id="referral-limit"
                          type="number"
                          value={referralSettings.monthlyReferralLimit}
                          onChange={(e) =>
                            handleReferralSettingChange("monthlyReferralLimit", Number.parseInt(e.target.value))
                          }
                          disabled={!isEditing}
                          className="bg-[#222] border-[#333] text-white"
                        />
                        <span className="ml-2 text-beige">referrals</span>
                      </div>
                      <p className="text-xs text-beige">Maximum referrals per month (0 = unlimited)</p>
                      {isEditing && (
                        <Textarea
                          placeholder="Add notes about monthly referral limit..."
                          value={referralSettings.monthlyReferralLimitNotes}
                          onChange={(e) => handleReferralSettingChange("monthlyReferralLimitNotes", e.target.value)}
                          className="bg-[#222] border-[#333] text-white"
                          rows={2}
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-beige">Referral Qualification</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={referralSettings.requireAccountCreation}
                            onCheckedChange={(checked) =>
                              handleReferralSettingChange("requireAccountCreation", checked)
                            }
                            disabled={!isEditing}
                          />
                          <Label className="text-white">Account Creation</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={referralSettings.requireFirstPurchase}
                            onCheckedChange={(checked) => handleReferralSettingChange("requireFirstPurchase", checked)}
                            disabled={!isEditing}
                          />
                          <Label className="text-white">First Purchase</Label>
                        </div>
                      </div>
                      {isEditing && (
                        <Textarea
                          placeholder="Add notes about referral qualification..."
                          value={referralSettings.requireAccountCreationNotes}
                          onChange={(e) => handleReferralSettingChange("requireAccountCreationNotes", e.target.value)}
                          className="bg-[#222] border-[#333] text-white"
                          rows={2}
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-beige">Minimum Purchase Amount</Label>
                      <div className="flex items-center">
                        <span className="text-beige mr-2">$</span>
                        <Input
                          type="number"
                          value={referralSettings.minimumPurchaseAmount}
                          onChange={(e) =>
                            handleReferralSettingChange("minimumPurchaseAmount", Number.parseInt(e.target.value))
                          }
                          disabled={!isEditing}
                          className="bg-[#222] border-[#333] text-white"
                        />
                      </div>
                      <p className="text-xs text-beige">Minimum purchase amount to qualify for referral bonus</p>
                      {isEditing && (
                        <Textarea
                          placeholder="Add notes about minimum purchase amount..."
                          value={referralSettings.minimumPurchaseAmountNotes}
                          onChange={(e) => handleReferralSettingChange("minimumPurchaseAmountNotes", e.target.value)}
                          className="bg-[#222] border-[#333] text-white"
                          rows={2}
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-beige">Referral Link Expiration</Label>
                      <div className="flex items-center">
                        <Input
                          type="number"
                          value={referralSettings.referralLinkExpiration}
                          onChange={(e) =>
                            handleReferralSettingChange("referralLinkExpiration", Number.parseInt(e.target.value))
                          }
                          disabled={!isEditing}
                          className="bg-[#222] border-[#333] text-white"
                        />
                        <span className="ml-2 text-beige">days</span>
                      </div>
                      <p className="text-xs text-beige">Days until referral link expires (0 = never)</p>
                      {isEditing && (
                        <Textarea
                          placeholder="Add notes about referral link expiration..."
                          value={referralSettings.referralLinkExpirationNotes}
                          onChange={(e) => handleReferralSettingChange("referralLinkExpirationNotes", e.target.value)}
                          className="bg-[#222] border-[#333] text-white"
                          rows={2}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-[#222] border border-[#333] rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-4">Referral Email Template</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-beige">Email Subject</Label>
                      <Input
                        value={referralSettings.emailSubject}
                        onChange={(e) => handleReferralSettingChange("emailSubject", e.target.value)}
                        disabled={!isEditing}
                        className="bg-[#333] border-[#444] text-white"
                      />
                      {isEditing && (
                        <Textarea
                          placeholder="Add notes about email subject..."
                          value={referralSettings.emailSubjectNotes}
                          onChange={(e) => handleReferralSettingChange("emailSubjectNotes", e.target.value)}
                          className="bg-[#333] border-[#444] text-white"
                          rows={2}
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-beige">Email Content</Label>
                      <textarea
                        rows={5}
                        value={referralSettings.emailContent}
                        onChange={(e) => handleReferralSettingChange("emailContent", e.target.value)}
                        disabled={!isEditing}
                        className="w-full bg-[#333] border border-[#444] rounded-md p-2 text-white resize-none"
                        placeholder="Use [REFERRAL_LINK] placeholder for the referral link"
                      />
                      <p className="text-xs text-beige">
                        Use [REFERRAL_LINK] as placeholder for the actual referral link
                      </p>
                      {isEditing && (
                        <Textarea
                          placeholder="Add notes about email content..."
                          value={referralSettings.emailContentNotes}
                          onChange={(e) => handleReferralSettingChange("emailContentNotes", e.target.value)}
                          className="bg-[#333] border-[#444] text-white"
                          rows={2}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default LoyaltyPage
