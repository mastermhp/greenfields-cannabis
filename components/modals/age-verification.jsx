"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

const AgeVerification = ({ isOpen, onVerified }) => {
  const [day, setDay] = useState("")
  const [month, setMonth] = useState("")
  const [year, setYear] = useState("")
  const [error, setError] = useState("")

  const handleVerify = () => {
    // Reset error
    setError("")

    // Validate inputs
    if (!day || !month || !year) {
      setError("Please enter your complete date of birth.")
      return
    }

    // Convert to numbers
    const dayNum = Number.parseInt(day, 10)
    const monthNum = Number.parseInt(month, 10)
    const yearNum = Number.parseInt(year, 10)

    // Basic validation
    if (
      isNaN(dayNum) ||
      isNaN(monthNum) ||
      isNaN(yearNum) ||
      dayNum < 1 ||
      dayNum > 31 ||
      monthNum < 1 ||
      monthNum > 12 ||
      yearNum < 1900 ||
      yearNum > new Date().getFullYear()
    ) {
      setError("Please enter a valid date of birth.")
      return
    }

    // Calculate age
    const birthDate = new Date(yearNum, monthNum - 1, dayNum)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    // Check if 21 or older
    if (age < 21) {
      setError("You must be 21 years or older to enter this website.")
      return
    }

    // Verify age
    onVerified()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
        <motion.div
          className="bg-[#111] border border-[#333] max-w-md w-full p-8 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-[#B8860B]"></div>

          <div className="text-center mb-8">
            <Image
              src="/logo.png"
              alt="Greenfields Logo"
              width={80}
              height={80}
              className="mx-auto mb-4 w-32 h-32"
            />
            <h2 className="text-2xl md:text-3xl font-bold text-[#D4AF37]">Age Verification</h2>
          </div>

          <div className="mb-8">
            <div className="flex items-start bg-[#D4AF37]/10 border border-[#D4AF37] p-4 mb-6">
              <AlertTriangle className="text-[#D4AF37] mr-3 mt-1 flex-shrink-0" size={20} />
              <p className="text-sm">
                You must be 21 years or older to enter this website. Please verify your age to continue.
              </p>
            </div>

            <p className="text-gray-300 text-center mb-6">Please enter your date of birth</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label htmlFor="month" className="block text-sm text-gray-300 mb-1">
                  Month
                </label>
                <input
                  type="number"
                  id="month"
                  min="1"
                  max="12"
                  placeholder="MM"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full bg-black border border-[#333] focus:border-[#D4AF37] p-3 text-center text-white"
                />
              </div>
              <div>
                <label htmlFor="day" className="block text-sm text-gray-300 mb-1">
                  Day
                </label>
                <input
                  type="number"
                  id="day"
                  min="1"
                  max="31"
                  placeholder="DD"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full bg-black border border-[#333] focus:border-[#D4AF37] p-3 text-center text-white"
                />
              </div>
              <div>
                <label htmlFor="year" className="block text-sm text-gray-300 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  id="year"
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="YYYY"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-black border border-[#333] focus:border-[#D4AF37] p-3 text-center text-white"
                />
              </div>
            </div>

            {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}
          </div>

          <div className="flex flex-col space-y-4">
            <Button
              onClick={handleVerify}
              className="bg-[#D4AF37] hover:bg-[#B8860B] text-black text-lg py-6 rounded-none"
            >
              I am 21 or older
            </Button>

            <a
              href="https://www.google.com"
              className="text-center text-gray-300 hover:text-[#D4AF37] text-sm transition-colors"
            >
              I am not 21
            </a>
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            By entering this site you are agreeing to the Terms of Use and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default AgeVerification
