"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Search, Package, Truck, CheckCircle, AlertCircle, ChevronRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export default function TrackOrderPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [orderNumber, setOrderNumber] = useState(searchParams.get("order") || "")
  const [email, setEmail] = useState(searchParams.get("email") || "")
  const [loading, setLoading] = useState(false)
  const [orderStatus, setOrderStatus] = useState(null)

  useEffect(() => {
    // Auto-track if URL params are provided
    if (orderNumber && email) {
      handleSubmit(null, true)
    }
  }, [])

  const handleSubmit = async (e, autoTrack = false) => {
    if (e) e.preventDefault()

    if (!orderNumber || !email) {
      toast({
        title: "Error",
        description: "Please enter both order number and email address.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          email: email.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setOrderStatus(data.data)
        if (!autoTrack) {
          toast({
            title: "Order Found",
            description: "Your order details have been loaded.",
          })
        }
      } else {
        setOrderStatus(null)
        toast({
          title: "Order Not Found",
          description: data.error || "Please check your order number and email address.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error tracking order:", error)
      setOrderStatus(null)
      toast({
        title: "Error",
        description: "Failed to track order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshOrder = () => {
    if (orderNumber && email) {
      handleSubmit(null, true)
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Package className="text-[#D4AF37]" size={24} />
      case "processing":
        return <Package className="text-[#D4AF37]" size={24} />
      case "shipped":
        return <Truck className="text-[#D4AF37]" size={24} />
      case "out_for_delivery":
        return <Truck className="text-[#D4AF37]" size={24} />
      case "delivered":
        return <CheckCircle className="text-[#D4AF37]" size={24} />
      case "cancelled":
        return <AlertCircle className="text-red-500" size={24} />
      default:
        return <Package className="text-[#D4AF37]" size={24} />
    }
  }

  const getStatusColor = (status, isCompleted) => {
    if (!isCompleted) return "text-gray-400"

    switch (status?.toLowerCase()) {
      case "delivered":
        return "text-green-400"
      case "cancelled":
        return "text-red-400"
      default:
        return "text-[#D4AF37]"
    }
  }

  const formatStatus = (status) => {
    return status?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Unknown"
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getOrderTimeline = (order) => {
    const timeline = [
      { status: "pending", label: "Order Placed", completed: false },
      { status: "processing", label: "Processing", completed: false },
      { status: "shipped", label: "Shipped", completed: false },
      { status: "out_for_delivery", label: "Out for Delivery", completed: false },
      { status: "delivered", label: "Delivered", completed: false },
    ]

    const currentStatus = order.status?.toLowerCase()
    const statusOrder = ["pending", "processing", "shipped", "out_for_delivery", "delivered"]
    const currentIndex = statusOrder.indexOf(currentStatus)

    return timeline.map((item, index) => ({
      ...item,
      completed: index <= currentIndex,
      date: index <= currentIndex ? formatDate(order.updatedAt) : null,
    }))
  }

  return (
    <div className="bg-black min-h-screen py-40">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/track1.jpeg" alt="Track Order" fill className="object-cover" priority />
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
                      <RefreshCw className="animate-spin mr-3 h-5 w-5" />
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
                      <h2 className="text-2xl font-bold gold-text">Order #{orderStatus.id}</h2>
                      <p className="text-beige">Placed on {formatDate(orderStatus.createdAt)}</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center space-x-3">
                      <span
                        className={`px-4 py-2 font-medium rounded-full ${
                          orderStatus.status === "delivered"
                            ? "bg-green-500/20 text-green-400"
                            : orderStatus.status === "cancelled"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-[#D4AF37]/20 text-[#D4AF37]"
                        }`}
                      >
                        {formatStatus(orderStatus.status)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshOrder}
                        disabled={loading}
                        className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
                      >
                        <RefreshCw size={16} className={`${loading ? "animate-spin" : ""}`} />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Shipping Information</h3>
                      <p className="text-beige mb-2">{orderStatus.shipping?.address}</p>
                      <p className="text-beige mb-2">Method: {orderStatus.shipping?.method || "Standard Delivery"}</p>
                      <p className="text-beige">Payment: {orderStatus.paymentMethod || "Card"}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Order Details</h3>
                      <p className="text-beige mb-2">Total: ${orderStatus.total?.toFixed(2)}</p>
                      <p className="text-beige mb-2">Items: {orderStatus.items?.length || 0}</p>
                      {orderStatus.trackingNumber && (
                        <p className="text-beige">Tracking: {orderStatus.trackingNumber}</p>
                      )}
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
                      {getOrderTimeline(orderStatus).map((item, index) => (
                        <div key={index} className="relative flex items-start">
                          <div
                            className={`z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                              item.completed ? "bg-[#D4AF37]/20 border-[#D4AF37]" : "bg-black border-[#333]"
                            }`}
                          >
                            {getStatusIcon(item.status)}
                          </div>
                          <div className="ml-6">
                            <h4 className={`text-lg font-semibold ${getStatusColor(item.status, item.completed)}`}>
                              {item.label}
                            </h4>
                            {item.date && <p className="text-beige">{item.date}</p>}
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
                    {orderStatus.items?.map((item, index) => (
                      <div key={index} className="flex items-center">
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
                          <p className="text-[#D4AF37] font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-[#333]">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-xl font-bold text-[#D4AF37]">${orderStatus.total?.toFixed(2)}</span>
                    </div>
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
