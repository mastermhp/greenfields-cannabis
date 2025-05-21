"use client"

import { motion } from "framer-motion"
import Image from "next/image"

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      <div className="relative w-24 h-24 mb-8">
        <Image
          src="/logo.png"
          alt="Greenfields Logo"
          width={160}
          height={96}
          className="absolute inset-0"
        />
        <motion.div
          className="absolute inset-0 border-2 border-transparent border-t-[#D4AF37] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>
      <motion.h2
        className="text-2xl font-bold gold-text mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        GREENFIELDS
      </motion.h2>
      <motion.p className="text-beige" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        Loading premium cannabis experience...
      </motion.p>
    </div>
  )
}

export default Loader
