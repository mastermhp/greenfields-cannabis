"use client"

import { Suspense } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import LoginForm from "@/components/auth/login-form"

// Main login page component
export default function LoginPage() {
  return (
    <div className="min-h-screen py-40 bg-black flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="hidden md:block md:w-1/2 relative">
          <Image
            src="/login2.jpeg"
            alt="Cannabis Login"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/70"></div>

          <div className="absolute inset-0 flex flex-col justify-center items-center p-12 z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 gold-text">Premium Cannabis Experience</h2>
              <p className="text-beige text-lg mb-8 max-w-md">
                Login to access your account and explore our exclusive collection of premium cannabis products.
              </p>
              <div className="flex justify-center space-x-4">
                <div className="bg-[#111] p-4 border border-[#333] w-24 h-24 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold gold-text">100+</span>
                  <span className="text-sm text-beige">Products</span>
                </div>
                <div className="bg-[#111] p-4 border border-[#333] w-24 h-24 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold gold-text">24/7</span>
                  <span className="text-sm text-beige">Support</span>
                </div>
                <div className="bg-[#111] p-4 border border-[#333] w-24 h-24 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold gold-text">Fast</span>
                  <span className="text-sm text-beige">Delivery</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Login Form - Wrapped in Suspense */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#111] py-4 text-center">
        <p className="text-beige text-sm">© {new Date().getFullYear()} Greenfields Group Inc. All rights reserved.</p>
      </div>
    </div>
  )
}

// Skeleton loader for the login form
function LoginFormSkeleton() {
  return (
    <div className="w-full max-w-md animate-pulse">
      <div className="flex justify-center mb-8">
        <div className="w-20 h-20 rounded-full bg-gray-700"></div>
      </div>
      <div className="h-6 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
      <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto mb-8"></div>

      <div className="h-24 bg-gray-700 rounded mb-6"></div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
        </div>

        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
        </div>

        <div className="flex justify-between">
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
        </div>

        <div className="h-12 bg-gray-700 rounded"></div>

        <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto"></div>
      </div>
    </div>
  )
}
