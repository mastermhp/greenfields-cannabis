"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Search, Package, Truck, CheckCircle, AlertCircle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export default function TrackOrderPage() {
  const { toast } = useToast()
  const [orderNumber, setOrderNumber] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [orderStatus, setOrderStatus] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)

      if (orderNumber && email) {
        // Mock order data
        setOrderStatus({
          number: orderNumber,
          date: "May 15, 2023",
          status: "In Transit",
          items: [
            {
              id: 1,
              name: "Premium Indica Blend",
              quantity: 2,
              price: 59.99,
              image: "/placeholder.svg?height=100&width=100",
            },
            { id: 2, name: "CBD Tincture", quantity: 1, price: 45.99, image: "/placeholder.svg?height=100&width=100" },
          ],
          shipping: {
            address: "123 Main St, Los Angeles, CA 90001",
            method: "Express Shipping",
            tracking: "GF1234567890",
            estimatedDelivery: "May 20, 2023",
          },
          timeline: [
            { status: "Order Placed", date: "May 15, 2023", completed: true },
            { status: "Processing", date: "May 16, 2023", completed: true },
            { status: "Shipped", date: "May 17, 2023", completed: true },
            { status: "In Transit", date: "May 18, 2023", completed: true },
            { status: "Out for Delivery", date: "May 20, 2023", completed: false },
            { status: "Delivered", date: "May 20, 2023", completed: false },
          ],
        })
      } else {
        toast({
          title: "Error",
          description: "Please enter a valid order number and email address.",
          variant: "destructive",
        })
      }
    }, 1500)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Order Placed":
        return <Package className="text-[#D4AF37]" size={24} />
      case "Processing":
        return <Package className="text-[#D4AF37]" size={24} />
      case "Shipped":
        return <Truck className="text-[#D4AF37]" size={24} />
      case "In Transit":
        return <Truck className="text-[#D4AF37]" size={24} />
      case "Out for Delivery":
        return <Truck className="text-[#D4AF37]" size={24} />
      case "Delivered":
        return <CheckCircle className="text-[#D4AF37]" size={24} />
      default:
        return <AlertCircle className="text-[#D4AF37]" size={24} />
    }
  }

  return (
    <div className="bg-black min-h-screen py-40">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/track1.jpeg"
            alt="Track Order"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/80" />
        </div>

        <div className="container mx-auto px-4 z-10 text-center">
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 gold-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Track Your Order
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl mb-8 text-beige max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Enter your order details below to check the status of your premium cannabis delivery
          </motion.p>
        </div>
      </section>

      {/* Track Order Form */}
      <section className="py-20 bg-gradient-to-b from-black to-[#111]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              className="bg-[#111] p-8 border border-[#333]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-2xl font-bold mb-6">Enter Your Order Information</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="orderNumber" className="block text-beige mb-2">
                    Order Number
                  </label>
                  <Input
                    id="orderNumber"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g., GF12345678"
                    required
                    className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-beige mb-2">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter the email used for your order"
                    required
                    className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#D4AF37] hover:bg-[#B8860B] text-black text-lg py-6 px-8 rounded-none w-full"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Tracking...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Search className="mr-2" size={20} />
                      Track Order
                    </span>
                  )}
                </Button>
              </form>
            </motion.div>

            {/* Order Status Results */}
            {orderStatus && (
              <motion.div
                className="mt-12 bg-[#111] border border-[#333]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="p-8 border-b border-[#333]">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold gold-text">Order #{orderStatus.number}</h2>
                      <p className="text-beige">Placed on {orderStatus.date}</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <span className="bg-[#D4AF37]/20 text-[#D4AF37] px-4 py-2 font-medium">{orderStatus.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Shipping Information</h3>
                      <p className="text-beige mb-2">{orderStatus.shipping.address}</p>
                      <p className="text-beige mb-2">Method: {orderStatus.shipping.method}</p>
                      <p className="text-beige">Estimated Delivery: {orderStatus.shipping.estimatedDelivery}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Tracking Details</h3>
                      <p className="text-beige mb-2">Tracking Number: {orderStatus.shipping.tracking}</p>
                      <Button variant="outline" className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 mt-2">
                        View Carrier Details
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Order Timeline */}
                <div className="p-8 border-b border-[#333]">
                  <h3 className="text-xl font-bold mb-6">Order Progress</h3>

                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#333]"></div>

                    {/* Timeline Items */}
                    <div className="space-y-8">
                      {orderStatus.timeline.map((item, index) => (
                        <div key={index} className="relative flex items-start">
                          <div
                            className={`absolute left-6 top-3 w-0.5 h-full ${index === orderStatus.timeline.length - 1 ? "bg-transparent" : "bg-[#333]"}`}
                          ></div>
                          <div
                            className={`z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${item.completed ? "bg-[#D4AF37]/20 border-[#D4AF37]" : "bg-black border-[#333]"}`}
                          >
                            {getStatusIcon(item.status)}
                          </div>
                          <div className="ml-6">
                            <h4 className={`text-lg font-semibold ${item.completed ? "text-white" : "text-gray-400"}`}>
                              {item.status}
                            </h4>
                            <p className={`${item.completed ? "text-beige" : "text-gray-500"}`}>{item.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-8">
                  <h3 className="text-xl font-bold mb-6">Order Items</h3>

                  <div className="space-y-6">
                    {orderStatus.items.map((item) => (
                      <div key={item.id} className="flex items-center">
                        <div className="w-20 h-20 bg-[#222] mr-4 flex-shrink-0">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-beige">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#D4AF37] font-medium">${item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 text-center">
                    <Button asChild className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
                      <Link href="/products">
                        Continue Shopping <ChevronRight className="ml-2" size={16} />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
