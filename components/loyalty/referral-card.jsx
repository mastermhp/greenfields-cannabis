"use client"

import { motion } from "framer-motion"
import { Users, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ReferralCard({ code, onCopy }) {
  return (
    <motion.div
      className="bg-[#111] border border-[#333] p-6 rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-[#D4AF37] text-black flex items-center justify-center mr-3">
          <Users size={20} />
        </div>
        <h3 className="text-lg font-bold">Refer & Earn</h3>
      </div>

      <p className="text-beige mb-4">Share your referral code with friends and both of you will be rewarded!</p>

      <div className="bg-[#222] border border-[#333] p-3 mb-4 flex justify-between items-center">
        <span className="font-mono">{code}</span>
        <Button onClick={onCopy} size="sm" className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
          Copy
        </Button>
      </div>

      <div className="flex items-center">
        <Gift size={16} className="text-[#D4AF37] mr-2" />
        <span className="text-sm text-beige">You get 500 points, they get 250 points</span>
      </div>
    </motion.div>
  )
}
