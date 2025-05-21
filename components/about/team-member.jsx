"use client"

import Image from "next/image"
import { motion } from "framer-motion"

const TeamMember = ({ member, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="bg-[#111] border border-[#333] overflow-hidden group"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={member.image || "/placeholder.svg"}
          alt={member.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold mb-1">{member.name}</h3>
        <p className="text-[#D4AF37] mb-4">{member.role}</p>
        <p className="text-beige">{member.bio}</p>
      </div>
    </motion.div>
  )
}

export default TeamMember
