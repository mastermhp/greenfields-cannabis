"use client"

import { motion } from "framer-motion"
import { Award } from "lucide-react"

export default function LoyaltyCard({ tier, points, name, since, memberID }) {
  // Define tier-specific styles
  const tierStyles = {
    silver: {
      gradient: "bg-gradient-to-r from-[#C0C0C0] to-[#E8E8E8]",
      icon: "bg-gray-800",
      textColor: "text-gray-800",
    },
    gold: {
      gradient: "bg-gradient-to-r from-[#D4AF37] to-[#FBD341]",
      icon: "bg-black",
      textColor: "text-black",
    },
    diamond: {
      gradient: "bg-gradient-to-r from-[#9EAEFF] to-[#D4AF37]",
      icon: "bg-black",
      textColor: "text-black",
    },
  }

  const style = tierStyles[tier] || tierStyles.silver

  return (
    <motion.div
      className={`relative h-48 rounded-xl overflow-hidden ${style.gradient} p-6 shadow-lg`}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Card Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=400')] bg-repeat opacity-20"></div>
        <div className="absolute right-0 bottom-0 w-64 h-64 rounded-full bg-white/10 -mr-20 -mb-20"></div>
        <div className="absolute left-0 top-0 w-32 h-32 rounded-full bg-black/10 -ml-10 -mt-10"></div>
      </div>

      {/* Card Content */}
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center mb-1">
              <div className={`w-6 h-6 rounded-full ${style.icon} flex items-center justify-center mr-2`}>
                <Award size={14} className="text-white" />
              </div>
              <h3 className={`font-bold text-lg uppercase ${style.textColor}`}>{tier} Member</h3>
            </div>
            <p className={`text-sm ${style.textColor} opacity-80`}>Member since {since}</p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-medium ${style.textColor} opacity-80`}>Available Points</p>
            <p className={`text-2xl font-bold ${style.textColor}`}>{points}</p>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className={`text-lg font-bold ${style.textColor}`}>{name}</p>
            <p className={`text-xs ${style.textColor} opacity-80`}>ID: {memberID}</p>
          </div>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill={tier === "silver" ? "#333" : "#FFF"}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
