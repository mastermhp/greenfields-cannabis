"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle, Package, ArrowRight, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

export default function OrderConfirmationPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  // Generate a random order number
  const orderNumber = `GF${Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0")}`

  // Generate a random delivery date (3-5 days from now)
  const deliveryDate = new Date()
  deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 3) + 3)
  const formattedDeliveryDate = deliveryDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  // Redirect if user navigates directly to this page without checkout
  useEffect(() => {
    const hasCompletedCheckout = sessionStorage.getItem("completedCheckout")
    if (!hasCompletedCheckout) {
      // For demo purposes, we'll set this to true instead of redirecting
      sessionStorage.setItem("completedCheckout", "true")
      // In a real app, you might want to redirect:
      // router.push('/cart')
    }

    // Clean up session storage
    return () => {
      sessionStorage.removeItem("completedCheckout")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <div className="inline-block bg-[#D4AF37]/20 p-6 rounded-full mb-6">
              <CheckCircle className="text-[#D4AF37] mx-auto" size={64} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 gold-text">Order Confirmed!</h1>
            <p className="text-xl text-beige mb-2">Thank you for your purchase</p>
            <p className="text-beige">We've sent a confirmation email to your inbox with all the details.</p>
          </div>

          <div className="bg-[#111] border border-[#333] p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between mb-6 pb-6 border-b border-[#333]">
              <div>
                <h2 className="text-lg font-bold mb-2">Order Information</h2>
                <p className="text-beige mb-1">
                  <span className="font-medium">Order Number:</span> {orderNumber}
                </p>
                <p className="text-beige">
                  <span className="font-medium">Order Date:</span> {new Date().toLocaleDateString()}
                </p>
              </div>

              <div className="mt-4 md:mt-0 md:text-right">
                <h2 className="text-lg font-bold mb-2">Estimated Delivery</h2>
                <div className="flex items-center md:justify-end text-beige mb-1">
                  <Calendar className="mr-2 text-[#D4AF37]" size={16} />
                  <span>{formattedDeliveryDate}</span>
                </div>
                <div className="flex items-center md:justify-end text-beige">
                  <Clock className="mr-2 text-[#D4AF37]" size={16} />
                  <span>Between 9:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center mb-4">
                <Package className="text-[#D4AF37] mr-2" size={20} />
                <h2 className="text-lg font-bold">Delivery Status</h2>
              </div>

              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#333]"></div>

                {/* Timeline Items */}
                <div className="space-y-8">
                  <div className="relative flex items-start">
                    <div className="z-10 flex items-center justify-center w-12 h-12 rounded-full bg-[#D4AF37]/20 border-2 border-[#D4AF37]">
                      <CheckCircle className="text-[#D4AF37]" size={20} />
                    </div>
                    <div className="ml-6">
                      <h4 className="text-lg font-semibold">Order Confirmed</h4>
                      <p className="text-beige">{new Date().toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="relative flex items-start">
                    <div className="z-10 flex items-center justify-center w-12 h-12 rounded-full bg-black border-2 border-[#333]">
                      <Package className="text-gray-400" size={20} />
                    </div>
                    <div className="ml-6">
                      <h4 className="text-lg font-semibold text-gray-400">Processing</h4>
                      <p className="text-gray-500">Pending</p>
                    </div>
                  </div>

                  <div className="relative flex items-start">
                    <div className="z-10 flex items-center justify-center w-12 h-12 rounded-full bg-black border-2 border-[#333]">
                      <Package className="text-gray-400" size={20} />
                    </div>
                    <div className="ml-6">
                      <h4 className="text-lg font-semibold text-gray-400">Shipped</h4>
                      <p className="text-gray-500">Pending</p>
                    </div>
                  </div>

                  <div className="relative flex items-start">
                    <div className="z-10 flex items-center justify-center w-12 h-12 rounded-full bg-black border-2 border-[#333]">
                      <CheckCircle className="text-gray-400" size={20} />
                    </div>
                    <div className="ml-6">
                      <h4 className="text-lg font-semibold text-gray-400">Delivered</h4>
                      <p className="text-gray-500">Pending</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 mb-12">
            <div className="flex-1 bg-[#111] border border-[#333] p-6">
              <h2 className="text-lg font-bold mb-4">What's Next?</h2>
              <ul className="space-y-3 text-beige">
                <li className="flex items-start">
                  <span className="inline-block w-5 h-5 bg-[#D4AF37] text-black rounded-full flex-shrink-0 flex items-center justify-center mr-3 mt-0.5">
                    1
                  </span>
                  <span>You'll receive an email confirmation with your order details.</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-5 h-5 bg-[#D4AF37] text-black rounded-full flex-shrink-0 flex items-center justify-center mr-3 mt-0.5">
                    2
                  </span>
                  <span>We'll process your order and prepare it for shipping.</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-5 h-5 bg-[#D4AF37] text-black rounded-full flex-shrink-0 flex items-center justify-center mr-3 mt-0.5">
                    3
                  </span>
                  <span>You'll receive a shipping confirmation with tracking information.</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-5 h-5 bg-[#D4AF37] text-black rounded-full flex-shrink-0 flex items-center justify-center mr-3 mt-0.5">
                    4
                  </span>
                  <span>
                    Your order will be delivered to your address. Age verification (21+) required upon delivery.
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex-1 bg-[#111] border border-[#333] p-6">
              <h2 className="text-lg font-bold mb-4">Need Help?</h2>
              <p className="text-beige mb-4">
                If you have any questions or concerns about your order, our customer service team is here to help.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Clock className="text-[#D4AF37] mr-3" size={18} />
                  <span className="text-beige">Available 7 days a week, 9AM - 8PM</span>
                </div>
                <div className="flex items-center">
                  <Package className="text-[#D4AF37] mr-3" size={18} />
                  <Link href="/track-order" className="text-[#D4AF37] hover:underline">
                    Track your order
                  </Link>
                </div>
                <div className="flex items-center">
                  <Calendar className="text-[#D4AF37] mr-3" size={18} />
                  <Link href="/contact" className="text-[#D4AF37] hover:underline">
                    Contact customer service
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
              <Link href="/products">
                Continue Shopping <ArrowRight className="ml-2" size={16} />
              </Link>
            </Button>

            {isAuthenticated ? (
              <Button asChild variant="outline" className="border-[#333] hover:border-[#D4AF37]">
                <Link href="/account">View My Orders</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="border-[#333] hover:border-[#D4AF37]">
                <Link href="/track-order">Track Order</Link>
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
