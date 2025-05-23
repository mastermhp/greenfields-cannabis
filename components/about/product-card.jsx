"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export default function ProductCard({ product, index }) {
  return (
    <motion.div
      className="relative group overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
    >
      <div className="aspect-square relative overflow-hidden">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80"></div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 transform transition-transform duration-500">
        <div className="flex items-center mb-2">
          <span className="text-2xl mr-2">{product.icon}</span>
          <h3 className="text-2xl font-bold gold-text">{product.title}</h3>
        </div>
        <h4 className="text-lg mb-2 text-[#D4AF37]/70">{product.subtitle}</h4>
        <p className="text-beige text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          {product.description}
        </p>
      </div>

      <div className="absolute top-4 right-4">
        <div className="bg-black/80 border border-[#D4AF37] px-3 py-1 text-sm">
          <span className="gold-text">{product.type}</span>
        </div>
      </div>
    </motion.div>
  )
}
