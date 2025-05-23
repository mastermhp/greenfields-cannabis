"use client"

import { motion } from "framer-motion"

export default function ValueCard({ value, index }) {
  return (
    <motion.div
      className="bg-black p-8 border border-[#333] hover:border-[#D4AF37] transition-all duration-300"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10, boxShadow: "0 10px 30px rgba(212, 175, 55, 0.2)" }}
    >
      <value.icon size={48} className="text-[#D4AF37] mb-4" />
      <h3 className="text-xl font-bold mb-2 gold-text">{value.title}</h3>
      <p className="text-beige">{value.description}</p>
    </motion.div>
  )
}
