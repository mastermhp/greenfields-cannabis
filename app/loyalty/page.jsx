"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Award, Gift, TrendingUp, Zap, ChevronRight, Star, Clock, ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

export default function LoyaltyProgramPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()

  // Mock loyalty data
  const [loyaltyData, setLoyaltyData] = useState({
    points: 750,
    tier: "Silver",
    nextTier: "Gold",
    pointsToNextTier: 250,
    totalPointsForNextTier: 1000,
    availableRewards: [
      {
        id: 1,
        name: "10% Off Your Next Order",
        points: 500,
        code: "LOYAL10",
        expiresIn: "30 days after redemption",
      },
      {
        id: 2,
        name: "Free Express Shipping",
        points: 300,
        code: "FREEEXPRESS",
        expiresIn: "60 days after redemption",
      },
      {
        id: 3,
        name: "Exclusive Product Access",
        points: 1000,
        code: "EXCLUSIVE",
        expiresIn: "14 days after redemption",
      },
    ],
    recentActivity: [
      {
        id: 1,
        type: "Purchase",
        description: "Order #GF123456",
        points: 150,
        date: "May 15, 2023",
      },
      {
        id: 2,
        type: "Referral",
        description: "Friend signup: John D.",
        points: 200,
        date: "April 28, 2023",
      },
      {
        id: 3,
        type: "Review",
        description: "Product review: Golden Sunset",
        points: 50,
        date: "April 10, 2023",
      },
    ],
  })

  const tiers = [
    {
      name: "Bronze",
      pointsRequired: 0,
      benefits: ["Earn 1 point per $1 spent", "Birthday reward", "Access to loyalty rewards"],
      color: "#CD7F32",
    },
    {
      name: "Silver",
      pointsRequired: 500,
      benefits: [
        "Earn 1.5 points per $1 spent",
        "Free standard shipping",
        "Early access to sales",
        "Exclusive monthly offers",
      ],
      color: "#C0C0C0",
    },
    {
      name: "Gold",
      pointsRequired: 1000,
      benefits: [
        "Earn 2 points per $1 spent",
        "Free express shipping",
        "Priority customer service",
        "Exclusive product access",
        "Double points days",
      ],
      color: "#D4AF37",
    },
    {
      name: "Platinum",
      pointsRequired: 2500,
      benefits: [
        "Earn 3 points per $1 spent",
        "Free same-day delivery",
        "Personal shopping concierge",
        "VIP events and tastings",
        "Customized product recommendations",
        "Anniversary gift",
      ],
      color: "#E5E4E2",
    },
  ]

  const handleRedeemReward = (reward) => {
    if (loyaltyData.points < reward.points) {
      toast({
        title: "Insufficient Points",
        description: `You need ${reward.points - loyaltyData.points} more points to redeem this reward.`,
        variant: "destructive",
      })
      return
    }

    // Update points
    setLoyaltyData((prev) => ({
      ...prev,
      points: prev.points - reward.points,
    }))

    // Show success message
    toast({
      title: "Reward Redeemed!",
      description: `You've successfully redeemed ${reward.name}. Your code is ${reward.code}.`,
    })
  }

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Award size={80} className="mx-auto mb-6 text-[#D4AF37]" />
            <h1 className="text-3xl md:text-4xl font-bold mb-4 gold-text">Greenfields Loyalty Program</h1>
            <p className="text-beige text-lg mb-8">
              Sign in or create an account to access our exclusive loyalty program and start earning rewards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-[#D4AF37] hover:bg-[#B8860B] text-black text-lg py-6 px-8 rounded-none">
                <Link href="/login">
                  Sign In <ArrowRight className="ml-2" size={20} />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 text-lg py-6 px-8 rounded-none"
              >
                <Link href="/register">Create Account</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.h1
          className="text-3xl md:text-4xl font-bold mb-8 gold-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Loyalty Program
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Current Status */}
            <motion.div
              className="bg-[#111] border border-[#333] mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="p-6 border-b border-[#333]">
                <h2 className="text-xl font-bold flex items-center">
                  <Award className="mr-2 text-[#D4AF37]" size={20} />
                  Your Loyalty Status
                </h2>
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="w-24 h-24 rounded-full bg-[#222] relative overflow-hidden flex-shrink-0">
                    <Image
                      src={
                        user?.avatar ||
                        "https://images.unsplash.com/photo-1603909223429-69bb7101f420?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      }
                      alt={user?.name || "User"}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-grow text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-1">{user?.name || "User"}</h3>
                    <div className="flex items-center justify-center md:justify-start mb-4">
                      <div
                        className="px-3 py-1 text-sm font-medium mr-2"
                        style={{
                          backgroundColor: `${tiers.find((t) => t.name === loyaltyData.tier)?.color}20`,
                          color: tiers.find((t) => t.name === loyaltyData.tier)?.color,
                        }}
                      >
                        {loyaltyData.tier} Member
                      </div>
                      <span className="text-[#D4AF37] font-bold">{loyaltyData.points} Points</span>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress to {loyaltyData.nextTier}</span>
                        <span>
                          {loyaltyData.points}/{loyaltyData.totalPointsForNextTier} points
                        </span>
                      </div>
                      <Progress
                        value={(loyaltyData.points / loyaltyData.totalPointsForNextTier) * 100}
                        className="h-2 bg-[#333]"
                        indicatorClassName="bg-[#D4AF37]"
                      />
                      <p className="text-sm text-beige mt-2">
                        Earn {loyaltyData.pointsToNextTier} more points to reach {loyaltyData.nextTier} status
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <Button asChild className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
                        <Link href="/products">
                          Shop & Earn <ShoppingBag className="ml-2" size={16} />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="border-[#333] hover:border-[#D4AF37]">
                        <Link href="/account/referrals">Refer Friends</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Available Rewards */}
            <motion.div
              className="bg-[#111] border border-[#333] mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="p-6 border-b border-[#333]">
                <h2 className="text-xl font-bold flex items-center">
                  <Gift className="mr-2 text-[#D4AF37]" size={20} />
                  Available Rewards
                </h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {loyaltyData.availableRewards.map((reward) => (
                    <div
                      key={reward.id}
                      className={`border ${loyaltyData.points >= reward.points ? "border-[#D4AF37]" : "border-[#333]"} p-4`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold">{reward.name}</h3>
                        <span
                          className={`text-sm font-medium px-2 py-1 ${loyaltyData.points >= reward.points ? "bg-[#D4AF37]/20 text-[#D4AF37]" : "bg-[#333] text-gray-400"}`}
                        >
                          {reward.points} Points
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-beige mb-4">
                        <Clock size={14} className="mr-1" />
                        <span>Expires: {reward.expiresIn}</span>
                      </div>
                      <Button
                        onClick={() => handleRedeemReward(reward)}
                        disabled={loyaltyData.points < reward.points}
                        className={`w-full ${
                          loyaltyData.points >= reward.points
                            ? "bg-[#D4AF37] hover:bg-[#B8860B] text-black"
                            : "bg-[#333] text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {loyaltyData.points >= reward.points
                          ? "Redeem Reward"
                          : `Need ${reward.points - loyaltyData.points} more points`}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              className="bg-[#111] border border-[#333]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="p-6 border-b border-[#333]">
                <h2 className="text-xl font-bold flex items-center">
                  <TrendingUp className="mr-2 text-[#D4AF37]" size={20} />
                  Recent Activity
                </h2>
              </div>

              <div className="p-6">
                <div className="divide-y divide-[#333]">
                  {loyaltyData.recentActivity.map((activity) => (
                    <div key={activity.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{activity.type}</h3>
                          <p className="text-sm text-beige">{activity.description}</p>
                          <p className="text-sm text-beige">{activity.date}</p>
                        </div>
                        <span className="text-[#D4AF37] font-bold">+{activity.points} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Membership Tiers */}
            <motion.div
              className="bg-[#111] border border-[#333] mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="p-6 border-b border-[#333]">
                <h2 className="text-xl font-bold flex items-center">
                  <Zap className="mr-2 text-[#D4AF37]" size={20} />
                  Membership Tiers
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {tiers.map((tier, index) => (
                    <div
                      key={tier.name}
                      className={`border p-4 ${tier.name === loyaltyData.tier ? `border-[${tier.color}]` : "border-[#333]"}`}
                      style={{ borderColor: tier.name === loyaltyData.tier ? tier.color : "#333" }}
                    >
                      <div className="flex items-center mb-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                          style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
                        >
                          <Star size={16} />
                        </div>
                        <h3 className="font-bold" style={{ color: tier.color }}>
                          {tier.name}
                        </h3>
                      </div>

                      <p className="text-sm text-beige mb-3">
                        {tier.pointsRequired > 0 ? `${tier.pointsRequired}+ points required` : "Starting tier"}
                      </p>

                      <ul className="text-sm space-y-2">
                        {tier.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start">
                            <ChevronRight size={14} className="mr-2 mt-1 flex-shrink-0" style={{ color: tier.color }} />
                            <span className="text-beige">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Ways to Earn */}
            <motion.div
              className="bg-[#111] border border-[#333]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="p-6 border-b border-[#333]">
                <h2 className="text-xl font-bold flex items-center">
                  <TrendingUp className="mr-2 text-[#D4AF37]" size={20} />
                  Ways to Earn Points
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <ShoppingBag className="text-[#D4AF37] mr-3 mt-1 flex-shrink-0" size={18} />
                    <div>
                      <h3 className="font-medium mb-1">Make a Purchase</h3>
                      <p className="text-sm text-beige">Earn points for every dollar spent based on your tier level.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Star className="text-[#D4AF37] mr-3 mt-1 flex-shrink-0" size={18} />
                    <div>
                      <h3 className="font-medium mb-1">Write a Review</h3>
                      <p className="text-sm text-beige">Earn 50 points for each product review you submit.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Award className="text-[#D4AF37] mr-3 mt-1 flex-shrink-0" size={18} />
                    <div>
                      <h3 className="font-medium mb-1">Refer a Friend</h3>
                      <p className="text-sm text-beige">Earn 200 points when a friend makes their first purchase.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Gift className="text-[#D4AF37] mr-3 mt-1 flex-shrink-0" size={18} />
                    <div>
                      <h3 className="font-medium mb-1">Birthday Bonus</h3>
                      <p className="text-sm text-beige">Receive 100 bonus points during your birthday month.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className="text-[#D4AF37] mr-3 mt-1 flex-shrink-0" size={18} />
                    <div>
                      <h3 className="font-medium mb-1">Special Promotions</h3>
                      <p className="text-sm text-beige">Watch for limited-time offers to earn bonus points.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
