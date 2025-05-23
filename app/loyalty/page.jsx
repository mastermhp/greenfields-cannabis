"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Award,
  Gift,
  Users,
  ChevronRight,
  Star,
  Clock,
  Percent,
  Truck,
  GiftIcon,
  Calendar,
  Copy,
  Share2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import LoyaltyCard from "@/components/loyalty/loyalty-card"
import { Input } from "@/components/ui/input"

export default function LoyaltyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [referralCode, setReferralCode] = useState(
    "GREENFIELDS-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
  )
  const [referralLink, setReferralLink] = useState("")
  const [referralEmail, setReferralEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock user loyalty data - in a real app, this would come from an API
  const [loyaltyData, setLoyaltyData] = useState({
    tier: "silver",
    points: 750,
    pointsToNextTier: 250,
    totalSpent: 1250.75,
    purchaseCount: 8,
    uniqueProductCount: 6,
    referrals: 2,
    availableRewards: [
      { id: 1, name: "10% Off Next Order", points: 500, code: "LOYAL10", claimed: false },
      { id: 2, name: "Free Shipping", points: 300, code: "FREESHIP", claimed: true },
      { id: 3, name: "Free Pre-Roll", points: 800, code: "FREEPREROLL", claimed: false },
    ],
    rewardHistory: [
      { id: 101, name: "Free Shipping", points: 300, redeemedOn: "2023-11-15" },
      { id: 102, name: "15% Off Order", points: 600, redeemedOn: "2023-10-22" },
    ],
    nextMilestone: {
      type: "purchase",
      current: 8,
      target: 10,
      reward: "Gold Tier Status",
    },
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/loyalty")
    }

    // Set the referral link based on the current domain
    setReferralLink(`${window.location.origin}/register?ref=${referralCode}`)
  }, [isAuthenticated, router, referralCode])

  const tierRequirements = {
    silver: {
      purchases: 5,
      uniqueProducts: 3,
      spend: 500,
      benefits: [
        { icon: Percent, text: "5% discount on all orders" },
        { icon: Clock, text: "Early access to new products" },
        { icon: Gift, text: "Birthday reward (100 points)" },
      ],
    },
    gold: {
      purchases: 10,
      uniqueProducts: 6,
      spend: 1000,
      benefits: [
        { icon: Percent, text: "10% discount on all orders" },
        { icon: Truck, text: "Free shipping on all orders" },
        { icon: Gift, text: "Birthday reward (200 points)" },
        { icon: Clock, text: "Priority customer service" },
      ],
    },
    diamond: {
      purchases: 20,
      uniqueProducts: 12,
      spend: 2500,
      benefits: [
        { icon: Percent, text: "15% discount on all orders" },
        { icon: Truck, text: "Free express shipping" },
        { icon: Gift, text: "Birthday reward (500 points)" },
        { icon: GiftIcon, text: "Quarterly free product" },
        { icon: Calendar, text: "Exclusive event invitations" },
      ],
    },
  }

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referralCode)
    toast({
      title: "Referral Code Copied!",
      description: "Your referral code has been copied to clipboard.",
    })
  }

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
    toast({
      title: "Referral Link Copied!",
      description: "Your referral link has been copied to clipboard.",
    })
  }

  const handleSendReferral = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate email
    if (!referralEmail || !/^\S+@\S+\.\S+$/.test(referralEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Referral Sent!",
      description: `Invitation sent to ${referralEmail}`,
    })

    setReferralEmail("")
    setIsSubmitting(false)
  }

  const handleClaimReward = (rewardId) => {
    // Update the local state to mark the reward as claimed
    setLoyaltyData((prev) => ({
      ...prev,
      availableRewards: prev.availableRewards.map((reward) =>
        reward.id === rewardId ? { ...reward, claimed: true } : reward,
      ),
      points: prev.points - prev.availableRewards.find((r) => r.id === rewardId).points,
      rewardHistory: [
        {
          id: Math.floor(Math.random() * 1000) + 200,
          name: prev.availableRewards.find((r) => r.id === rewardId).name,
          points: prev.availableRewards.find((r) => r.id === rewardId).points,
          redeemedOn: new Date().toISOString().split("T")[0],
        },
        ...prev.rewardHistory,
      ],
    }))

    toast({
      title: "Reward Claimed!",
      description: `Your reward has been added to your account.`,
    })
  }

  // Calculate progress percentages for the current tier
  const calculateProgress = () => {
    const currentTier = loyaltyData.tier
    const nextTier = currentTier === "silver" ? "gold" : currentTier === "gold" ? "diamond" : null

    if (!nextTier) return { purchases: 100, products: 100, spend: 100 }

    const purchaseProgress = Math.min(100, (loyaltyData.purchaseCount / tierRequirements[nextTier].purchases) * 100)
    const productProgress = Math.min(
      100,
      (loyaltyData.uniqueProductCount / tierRequirements[nextTier].uniqueProducts) * 100,
    )
    const spendProgress = Math.min(100, (loyaltyData.totalSpent / tierRequirements[nextTier].spend) * 100)

    return { purchases: purchaseProgress, products: productProgress, spend: spendProgress }
  }

  const progress = calculateProgress()

  return (
    <div className="min-h-screen bg-black py-44 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold gold-text">Greenfields Rewards</h1>
          <p className="text-beige mt-2">
            Earn points, unlock exclusive benefits, and elevate your cannabis experience.
          </p>
        </motion.div>

        {isAuthenticated ? (
          <>
            {/* Current Tier Status Card */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <LoyaltyCard
                tier={loyaltyData.tier}
                points={loyaltyData.points}
                name={user?.name || "Member"}
                since="2023"
                memberID={user?.id || "000000"}
              />
            </motion.div>

            {/* Tabs Navigation */}
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="grid grid-cols-3 md:grid-cols-5 bg-[#111] border border-[#333] rounded-none p-1">
                <TabsTrigger
                  value="overview"
                  className="rounded-none data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="benefits"
                  className="rounded-none data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                >
                  Benefits
                </TabsTrigger>
                <TabsTrigger
                  value="rewards"
                  className="rounded-none data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                >
                  Rewards
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="rounded-none data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                >
                  History
                </TabsTrigger>
                <TabsTrigger
                  value="referrals"
                  className="rounded-none data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                >
                  Referrals
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-[#111] border border-[#333] p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                      <Award className="mr-2 text-[#D4AF37]" size={20} />
                      Your Loyalty Status
                    </h2>

                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-beige">Current Tier</span>
                        <span className="font-medium capitalize">{loyaltyData.tier}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-beige">Available Points</span>
                        <span className="font-medium">{loyaltyData.points} pts</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-beige">Total Spent</span>
                        <span className="font-medium">${loyaltyData.totalSpent.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-beige">Purchases Made</span>
                        <span className="font-medium">{loyaltyData.purchaseCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-beige">Unique Products Tried</span>
                        <span className="font-medium">{loyaltyData.uniqueProductCount}</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-3">Next Tier Progress</h3>

                      {loyaltyData.tier !== "diamond" ? (
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-beige">
                                Purchases ({loyaltyData.purchaseCount}/
                                {tierRequirements[loyaltyData.tier === "silver" ? "gold" : "diamond"].purchases})
                              </span>
                              <span className="text-sm text-beige">{progress.purchases.toFixed(0)}%</span>
                            </div>
                            <Progress
                              value={progress.purchases}
                              className="h-2 bg-[#333]"
                              indicatorClassName="bg-[#D4AF37]"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-beige">
                                Unique Products ({loyaltyData.uniqueProductCount}/
                                {tierRequirements[loyaltyData.tier === "silver" ? "gold" : "diamond"].uniqueProducts})
                              </span>
                              <span className="text-sm text-beige">{progress.products.toFixed(0)}%</span>
                            </div>
                            <Progress
                              value={progress.products}
                              className="h-2 bg-[#333]"
                              indicatorClassName="bg-[#D4AF37]"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-beige">
                                Total Spend (${loyaltyData.totalSpent.toFixed(0)}/$
                                {tierRequirements[loyaltyData.tier === "silver" ? "gold" : "diamond"].spend})
                              </span>
                              <span className="text-sm text-beige">{progress.spend.toFixed(0)}%</span>
                            </div>
                            <Progress
                              value={progress.spend}
                              className="h-2 bg-[#333]"
                              indicatorClassName="bg-[#D4AF37]"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#D4AF37]/10 border border-[#D4AF37] p-4">
                          <p className="text-center text-beige">
                            Congratulations! You've reached our highest Diamond tier status. Enjoy all the exclusive
                            benefits and rewards.
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3">Next Milestone</h3>
                      <div className="bg-[#222] p-4 border border-[#333]">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-beige text-sm">
                              {loyaltyData.nextMilestone.type === "purchase"
                                ? `Make ${loyaltyData.nextMilestone.target - loyaltyData.nextMilestone.current} more purchases`
                                : `Try ${loyaltyData.nextMilestone.target - loyaltyData.nextMilestone.current} more products`}
                            </p>
                            <p className="font-medium mt-1">{loyaltyData.nextMilestone.reward}</p>
                          </div>
                          <div>
                            <div className="w-12 h-12 rounded-full bg-[#333] flex items-center justify-center">
                              <span className="text-[#D4AF37] font-bold">
                                {Math.round(
                                  (loyaltyData.nextMilestone.current / loyaltyData.nextMilestone.target) * 100,
                                )}
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-[#111] border border-[#333] p-6">
                      <h2 className="text-xl font-bold mb-4 flex items-center">
                        <Gift className="mr-2 text-[#D4AF37]" size={20} />
                        Available Rewards
                      </h2>

                      {loyaltyData.availableRewards.filter((r) => !r.claimed).length > 0 ? (
                        <div className="space-y-4">
                          {loyaltyData.availableRewards
                            .filter((r) => !r.claimed)
                            .map((reward) => (
                              <div
                                key={reward.id}
                                className="flex justify-between items-center p-3 bg-[#222] border border-[#333]"
                              >
                                <div>
                                  <p className="font-medium">{reward.name}</p>
                                  <p className="text-sm text-beige">Code: {reward.code}</p>
                                </div>
                                <Button
                                  onClick={() => handleClaimReward(reward.id)}
                                  className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
                                >
                                  Claim
                                </Button>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-beige mb-3">No rewards available to claim right now.</p>
                          <Button asChild className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
                            <Link href="/products">Shop to Earn Points</Link>
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="bg-[#111] border border-[#333] p-6">
                      <h2 className="text-xl font-bold mb-4 flex items-center">
                        <Users className="mr-2 text-[#D4AF37]" size={20} />
                        Referral Program
                      </h2>

                      <div className="mb-4">
                        <p className="text-beige mb-3">
                          Invite friends and earn 500 points for each successful referral. Your friends will also
                          receive 250 points on their first purchase!
                        </p>
                      </div>

                      <div className="flex items-center justify-between bg-[#222] border border-[#333] p-3 mb-4">
                        <span className="font-mono">{referralCode}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyReferralCode}
                          className="border-[#D4AF37] text-[#D4AF37]"
                        >
                          <Copy size={16} className="mr-1" /> Copy
                        </Button>
                      </div>

                      <Button
                        onClick={() => setActiveTab("referrals")}
                        className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-black"
                      >
                        Invite Friends <ChevronRight size={16} className="ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Benefits Tab */}
              <TabsContent value="benefits" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {["silver", "gold", "diamond"].map((tier) => (
                    <div
                      key={tier}
                      className={`bg-[#111] border ${loyaltyData.tier === tier ? "border-[#D4AF37]" : "border-[#333]"} p-6 relative`}
                    >
                      {loyaltyData.tier === tier && (
                        <div className="absolute top-0 right-0 bg-[#D4AF37] text-black px-3 py-1 text-sm font-medium">
                          Current
                        </div>
                      )}

                      <div className="flex items-center mb-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            tier === "silver"
                              ? "bg-gray-300"
                              : tier === "gold"
                                ? "bg-[#D4AF37]"
                                : "bg-gradient-to-r from-[#9EAEFF] to-[#D4AF37]"
                          } text-black`}
                        >
                          <Award size={24} />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-xl font-bold capitalize">{tier}</h3>
                          <p className="text-sm text-beige">
                            {tier === "silver" ? "Entry Level" : tier === "gold" ? "Mid Tier" : "Premium Tier"}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-lg font-medium mb-2">Requirements</h4>
                        <ul className="space-y-2 text-beige">
                          <li className="flex justify-between">
                            <span>Purchases</span>
                            <span>{tierRequirements[tier].purchases}+</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Unique Products</span>
                            <span>{tierRequirements[tier].uniqueProducts}+</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Total Spend</span>
                            <span>${tierRequirements[tier].spend}+</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-medium mb-2">Benefits</h4>
                        <ul className="space-y-3">
                          {tierRequirements[tier].benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center">
                              <benefit.icon size={16} className="text-[#D4AF37] mr-2" />
                              <span className="text-beige">{benefit.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {loyaltyData.tier !== tier && (
                        <div className="mt-6">
                          {(tier === "gold" && loyaltyData.tier === "silver") ||
                          (tier === "diamond" && loyaltyData.tier === "gold") ? (
                            <Button className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-black" asChild>
                              <Link href="/products">Shop to Upgrade</Link>
                            </Button>
                          ) : tier === "silver" ? (
                            <div className="text-center text-beige">Already achieved</div>
                          ) : (
                            <div className="text-center text-beige">
                              Upgrade to {loyaltyData.tier === "silver" ? "Gold" : "Diamond"} first
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Rewards Tab */}
              <TabsContent value="rewards" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-[#111] border border-[#333] p-6">
                    <h2 className="text-xl font-bold mb-4">Available Rewards</h2>

                    {loyaltyData.availableRewards.filter((r) => !r.claimed).length > 0 ? (
                      <div className="space-y-4">
                        {loyaltyData.availableRewards
                          .filter((r) => !r.claimed)
                          .map((reward) => (
                            <div key={reward.id} className="bg-[#222] border border-[#333] p-4">
                              <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium">{reward.name}</h3>
                                <span className="text-[#D4AF37] font-medium">{reward.points} pts</span>
                              </div>
                              <p className="text-sm text-beige mb-3">Use code: {reward.code}</p>
                              <Button
                                onClick={() => handleClaimReward(reward.id)}
                                className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-black"
                              >
                                Claim Reward
                              </Button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-beige mb-3">No rewards available to claim right now.</p>
                        <Button asChild className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
                          <Link href="/products">Shop to Earn Points</Link>
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#111] border border-[#333] p-6">
                    <h2 className="text-xl font-bold mb-4">Points Summary</h2>

                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-2xl font-bold">{loyaltyData.points}</span>
                        <span className="text-beige">Available Points</span>
                      </div>

                      <div className="bg-[#222] p-4 border border-[#333] mb-4">
                        <h3 className="font-medium mb-2">How to Earn Points</h3>
                        <ul className="space-y-2 text-sm text-beige">
                          <li className="flex justify-between">
                            <span>Every $1 spent</span>
                            <span>1 point</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Write a product review</span>
                            <span>50 points</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Refer a friend</span>
                            <span>500 points</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Birthday bonus</span>
                            <span>100-500 points</span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-[#222] p-4 border border-[#333]">
                        <h3 className="font-medium mb-2">Upcoming Rewards</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-beige">Free Pre-Roll</span>
                            <div className="flex items-center">
                              <span className="text-sm mr-2">{loyaltyData.points}/800</span>
                              <Progress
                                value={(loyaltyData.points / 800) * 100}
                                className="w-20 h-2 bg-[#333]"
                                indicatorClassName="bg-[#D4AF37]"
                              />
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-beige">15% Off Order</span>
                            <div className="flex items-center">
                              <span className="text-sm mr-2">{loyaltyData.points}/1000</span>
                              <Progress
                                value={(loyaltyData.points / 1000) * 100}
                                className="w-20 h-2 bg-[#333]"
                                indicatorClassName="bg-[#D4AF37]"
                              />
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-beige">Free Accessory</span>
                            <div className="flex items-center">
                              <span className="text-sm mr-2">{loyaltyData.points}/1500</span>
                              <Progress
                                value={(loyaltyData.points / 1500) * 100}
                                className="w-20 h-2 bg-[#333]"
                                indicatorClassName="bg-[#D4AF37]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button asChild className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-black">
                      <Link href="/products">Shop to Earn More Points</Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="mt-6">
                <div className="bg-[#111] border border-[#333] p-6">
                  <h2 className="text-xl font-bold mb-6">Reward History</h2>

                  {loyaltyData.rewardHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-[#222] border-b border-[#333]">
                          <tr>
                            <th className="py-3 px-4 text-left">Reward</th>
                            <th className="py-3 px-4 text-left">Points Used</th>
                            <th className="py-3 px-4 text-left">Date Redeemed</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#333]">
                          {loyaltyData.rewardHistory.map((reward, index) => (
                            <tr key={reward.id} className={index % 2 === 0 ? "bg-[#1a1a1a]" : ""}>
                              <td className="py-3 px-4">{reward.name}</td>
                              <td className="py-3 px-4">{reward.points}</td>
                              <td className="py-3 px-4">{reward.redeemedOn}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-beige mb-3">You haven't redeemed any rewards yet.</p>
                      <Button asChild className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
                        <Link href="/products">Shop to Earn Points</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Referrals Tab */}
              <TabsContent value="referrals" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-[#111] border border-[#333] p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                      <Users className="mr-2 text-[#D4AF37]" size={20} />
                      Refer Friends & Earn
                    </h2>

                    <div className="mb-6">
                      <p className="text-beige mb-4">
                        Share your unique referral code with friends and earn 500 points for each successful referral.
                        Your friends will also receive 250 points on their first purchase!
                      </p>

                      <div className="bg-[#222] border border-[#333] p-4 mb-4">
                        <h3 className="font-medium mb-2">Your Referral Code</h3>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-lg">{referralCode}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyReferralCode}
                            className="border-[#D4AF37] text-[#D4AF37]"
                          >
                            <Copy size={16} className="mr-1" /> Copy
                          </Button>
                        </div>
                      </div>

                      <div className="bg-[#222] border border-[#333] p-4 mb-6">
                        <h3 className="font-medium mb-2">Your Referral Link</h3>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm truncate mr-2">{referralLink}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyReferralLink}
                            className="border-[#D4AF37] text-[#D4AF37] whitespace-nowrap"
                          >
                            <Copy size={16} className="mr-1" /> Copy
                          </Button>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          variant="outline"
                          className="flex-1 border-[#D4AF37] text-[#D4AF37]"
                          onClick={() => {
                            window.open(
                              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
                              "_blank",
                            )
                          }}
                        >
                          Share on Facebook
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-[#D4AF37] text-[#D4AF37]"
                          onClick={() => {
                            window.open(
                              `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join me on Greenfields and get 250 points on your first purchase! ${referralLink}`)}`,
                              "_blank",
                            )
                          }}
                        >
                          Share on Twitter
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3">Email a Friend</h3>
                      <form onSubmit={handleSendReferral}>
                        <div className="mb-4">
                          <Input
                            type="email"
                            placeholder="Friend's email address"
                            value={referralEmail}
                            onChange={(e) => setReferralEmail(e.target.value)}
                            className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                            required
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-black"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center">
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Sending...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <Share2 size={18} className="mr-2" /> Send Invitation
                            </span>
                          )}
                        </Button>
                      </form>
                    </div>
                  </div>

                  <div>
                    <div className="bg-[#111] border border-[#333] p-6 mb-6">
                      <h2 className="text-xl font-bold mb-4">Your Referrals</h2>

                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-beige">Total Referrals</span>
                          <span className="font-medium">{loyaltyData.referrals}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-beige">Points Earned</span>
                          <span className="font-medium">{loyaltyData.referrals * 500} pts</span>
                        </div>
                      </div>

                      <div className="bg-[#222] border border-[#333] p-4">
                        <h3 className="font-medium mb-3">Recent Referrals</h3>
                        {loyaltyData.referrals > 0 ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-[#333] rounded-full mr-2"></div>
                                <span>j****@gmail.com</span>
                              </div>
                              <span className="text-[#D4AF37]">+500 pts</span>
                            </div>
                            {loyaltyData.referrals > 1 && (
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-[#333] rounded-full mr-2"></div>
                                  <span>s****@outlook.com</span>
                                </div>
                                <span className="text-[#D4AF37]">+500 pts</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-beige text-center py-2">No referrals yet</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#111] border border-[#333] p-6">
                      <h2 className="text-xl font-bold mb-4">How It Works</h2>

                      <div className="space-y-4">
                        <div className="flex">
                          <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-black flex items-center justify-center font-bold mr-3 flex-shrink-0">
                            1
                          </div>
                          <div>
                            <h3 className="font-medium">Share Your Code</h3>
                            <p className="text-sm text-beige">Share your unique referral code or link with friends</p>
                          </div>
                        </div>

                        <div className="flex">
                          <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-black flex items-center justify-center font-bold mr-3 flex-shrink-0">
                            2
                          </div>
                          <div>
                            <h3 className="font-medium">Friend Signs Up</h3>
                            <p className="text-sm text-beige">Your friend creates an account using your code</p>
                          </div>
                        </div>

                        <div className="flex">
                          <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-black flex items-center justify-center font-bold mr-3 flex-shrink-0">
                            3
                          </div>
                          <div>
                            <h3 className="font-medium">Friend Makes Purchase</h3>
                            <p className="text-sm text-beige">Your friend completes their first purchase</p>
                          </div>
                        </div>

                        <div className="flex">
                          <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-black flex items-center justify-center font-bold mr-3 flex-shrink-0">
                            4
                          </div>
                          <div>
                            <h3 className="font-medium">Both Get Rewarded</h3>
                            <p className="text-sm text-beige">You earn 500 points, your friend gets 250 points</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="bg-[#111] border border-[#333] p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Sign In to Access Rewards</h2>
            <p className="text-beige mb-6">Please sign in or create an account to access your loyalty rewards.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
                <Link href="/login?redirect=/loyalty">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="border-[#D4AF37] text-[#D4AF37]">
                <Link href="/register?redirect=/loyalty">Create Account</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Program Overview for All Users */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-6 gold-text">Greenfields Rewards Program</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-[#111] border border-[#333] p-6">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37] text-black flex items-center justify-center mb-4">
                <Star size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Earn Points</h3>
              <p className="text-beige">
                Earn points with every purchase, product review, and referral. The more you shop, the more you earn.
              </p>
            </div>

            <div className="bg-[#111] border border-[#333] p-6">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37] text-black flex items-center justify-center mb-4">
                <Award size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Unlock Tiers</h3>
              <p className="text-beige">
                Progress through Silver, Gold, and Diamond tiers to unlock exclusive benefits and higher reward rates.
              </p>
            </div>

            <div className="bg-[#111] border border-[#333] p-6">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37] text-black flex items-center justify-center mb-4">
                <Gift size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Redeem Rewards</h3>
              <p className="text-beige">
                Use your points to claim discounts, free products, exclusive merchandise, and special experiences.
              </p>
            </div>
          </div>

          <div className="bg-[#111] border border-[#333] p-8">
            <h3 className="text-xl font-bold mb-4 text-center">Membership Tiers</h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#333]">
                    <th className="py-3 px-4 text-left"></th>
                    <th className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mb-1">
                          <Award size={16} className="text-black" />
                        </div>
                        <span>Silver</span>
                      </div>
                    </th>
                    <th className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center mb-1">
                          <Award size={16} className="text-black" />
                        </div>
                        <span>Gold</span>
                      </div>
                    </th>
                    <th className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#9EAEFF] to-[#D4AF37] flex items-center justify-center mb-1">
                          <Award size={16} className="text-black" />
                        </div>
                        <span>Diamond</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#333]">
                    <td className="py-3 px-4 font-medium">Requirements</td>
                    <td className="py-3 px-4 text-center">5+ purchases</td>
                    <td className="py-3 px-4 text-center">10+ purchases</td>
                    <td className="py-3 px-4 text-center">20+ purchases</td>
                  </tr>
                  <tr className="border-b border-[#333]">
                    <td className="py-3 px-4 font-medium">Point Multiplier</td>
                    <td className="py-3 px-4 text-center">1x</td>
                    <td className="py-3 px-4 text-center">1.5x</td>
                    <td className="py-3 px-4 text-center">2x</td>
                  </tr>
                  <tr className="border-b border-[#333]">
                    <td className="py-3 px-4 font-medium">Discount</td>
                    <td className="py-3 px-4 text-center">5%</td>
                    <td className="py-3 px-4 text-center">10%</td>
                    <td className="py-3 px-4 text-center">15%</td>
                  </tr>
                  <tr className="border-b border-[#333]">
                    <td className="py-3 px-4 font-medium">Free Shipping</td>
                    <td className="py-3 px-4 text-center">On orders $100+</td>
                    <td className="py-3 px-4 text-center">All orders</td>
                    <td className="py-3 px-4 text-center">Express shipping</td>
                  </tr>
                  <tr className="border-b border-[#333]">
                    <td className="py-3 px-4 font-medium">Birthday Reward</td>
                    <td className="py-3 px-4 text-center">100 points</td>
                    <td className="py-3 px-4 text-center">200 points</td>
                    <td className="py-3 px-4 text-center">500 points</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Special Perks</td>
                    <td className="py-3 px-4 text-center">Early access</td>
                    <td className="py-3 px-4 text-center">Priority service</td>
                    <td className="py-3 px-4 text-center">Exclusive events</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
