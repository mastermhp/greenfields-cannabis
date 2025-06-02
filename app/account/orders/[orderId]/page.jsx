"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  Download,
  FileText,
  Phone,
  Mail,
  ShoppingBag,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, accessToken } = useAuth()
  const { toast } = useToast()
  const [order, setOrder] = useState(null)
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && params.orderId) {
      fetchOrderDetails()
    }
  }, [user, params.orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      console.log("Fetching order details for:", params.orderId)
      console.log("Using access token:", accessToken ? "Present" : "Missing")

      if (!accessToken) {
        throw new Error("No access token available")
      }

      // Fetch order details
      const orderResponse = await fetch(`/api/orders/${params.orderId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Order response status:", orderResponse.status)
      console.log("Order response ok:", orderResponse.ok)

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text()
        console.error("Order response error:", errorText)
        throw new Error(`Failed to fetch order details: ${orderResponse.status} - ${errorText}`)
      }

      const orderData = await orderResponse.json()
      console.log("Order data received:", orderData)

      if (orderData.success) {
        setOrder(orderData.data)

        // Fetch associated invoice
        try {
          console.log("Fetching invoice for order:", params.orderId)
          const invoiceResponse = await fetch(`/api/invoices?orderId=${params.orderId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          })

          console.log("Invoice response status:", invoiceResponse.status)

          if (invoiceResponse.ok) {
            const invoiceData = await invoiceResponse.json()
            console.log("Invoice data:", invoiceData)

            if (invoiceData.success && invoiceData.data) {
              setInvoice(invoiceData.data)
            }
          }
        } catch (invoiceError) {
          console.log("No invoice found for this order:", invoiceError)
        }
      } else {
        throw new Error(orderData.error || "Order not found")
      }
    } catch (error) {
      console.error("Error fetching order details:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load order details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadInvoice = async () => {
    if (!invoice) return

    try {
      const response = await fetch(`/api/invoices/${invoice.id}/download`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to download invoice")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `invoice-${invoice.invoiceNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: "Invoice downloaded successfully",
      })
    } catch (error) {
      console.error("Error downloading invoice:", error)
      toast({
        title: "Error",
        description: "Failed to download invoice",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "shipped":
      case "out_for_delivery":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "processing":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "pending":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="w-5 h-5" />
      case "shipped":
      case "out_for_delivery":
        return <Truck className="w-5 h-5" />
      case "processing":
        return <Package className="w-5 h-5" />
      case "pending":
        return <Clock className="w-5 h-5" />
      default:
        return <Package className="w-5 h-5" />
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

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-beige mb-6">Please log in to view order details.</p>
          <Button asChild className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black py-40">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
            <div className="h-64 bg-gray-700 rounded"></div>
            <div className="h-48 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black py-40">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-4">Order Not Found</h2>
            <p className="text-beige mb-6">
              The order you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button asChild className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
              <Link href="/account">Back to Account</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-40">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="ghost" onClick={() => router.back()} className="text-[#D4AF37] hover:bg-[#D4AF37]/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold gold-text">Order Details</h1>
              <p className="text-beige mt-2">Order #{order.id}</p>
            </div>

            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Badge className={`${getStatusColor(order.status)} flex items-center space-x-2 px-4 py-2 text-base`}>
                {getStatusIcon(order.status)}
                <span>{formatStatus(order.status)}</span>
              </Badge>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="bg-[#111] border-[#333]">
                <CardHeader>
                  <CardTitle className="text-white">Order Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-white font-medium">Order Placed</h3>
                        <p className="text-beige text-sm">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>

                    {order.status !== "pending" && (
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              ["processing", "shipped", "out_for_delivery", "delivered"].includes(order.status)
                                ? "bg-blue-500/20"
                                : "bg-gray-500/20"
                            }`}
                          >
                            <Package
                              className={`w-5 h-5 ${
                                ["processing", "shipped", "out_for_delivery", "delivered"].includes(order.status)
                                  ? "text-blue-400"
                                  : "text-gray-400"
                              }`}
                            />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-white font-medium">Processing</h3>
                          <p className="text-beige text-sm">Your order is being prepared</p>
                        </div>
                      </div>
                    )}

                    {["shipped", "out_for_delivery", "delivered"].includes(order.status) && (
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <Truck className="w-5 h-5 text-blue-400" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-white font-medium">Shipped</h3>
                          <p className="text-beige text-sm">
                            {order.trackingNumber ? `Tracking: ${order.trackingNumber}` : "On its way to you"}
                          </p>
                        </div>
                      </div>
                    )}

                    {order.status === "delivered" && (
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-white font-medium">Delivered</h3>
                          <p className="text-beige text-sm">Your order has been delivered</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-[#111] border-[#333]">
                <CardHeader>
                  <CardTitle className="text-white">Order Items</CardTitle>
                  <CardDescription className="text-beige">
                    {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""} in this order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-[#222] rounded-lg">
                        <div className="w-16 h-16 bg-[#333] rounded overflow-hidden">
                          <Image
                            src={item.image || "/placeholder.svg?height=64&width=64"}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{item.name}</h3>
                          <p className="text-beige text-sm">{item.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-beige text-sm">Qty: {item.quantity}</span>
                            <span className="text-[#D4AF37] font-medium">${item.price?.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Invoice Section */}
            {invoice && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="bg-[#111] border-[#333]">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-[#D4AF37]" />
                      Invoice
                    </CardTitle>
                    <CardDescription className="text-beige">Invoice details for this order</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">Invoice #{invoice.invoiceNumber}</h3>
                          <p className="text-beige text-sm">
                            Created: {formatDate(invoice.createdAt)} • Due: {formatDate(invoice.dueDate)}
                          </p>
                        </div>
                        <Badge
                          className={
                            invoice.status === "paid"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </div>

                      <Separator className="bg-[#333]" />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-beige text-sm">Subtotal</p>
                          <p className="text-white font-medium">${invoice.totals?.subtotal?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-beige text-sm">Tax</p>
                          <p className="text-white font-medium">${invoice.totals?.tax?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-beige text-sm">Shipping</p>
                          <p className="text-white font-medium">${invoice.totals?.shipping?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-beige text-sm">Total</p>
                          <p className="text-[#D4AF37] font-bold text-lg">${invoice.totals?.total?.toFixed(2)}</p>
                        </div>
                      </div>

                      <Button className="w-full bg-[#D4AF37]  hover:bg-[#D4AF37]/20 hover:border-2 hover:border-[#D4AF37] hover:cursor-pointer transition-all duration-500 text-black hover:text-[#D4AF37]">
                      {/* <Button onClick={downloadInvoice} className="w-full bg-[#D4AF37]  hover:bg-[#D4AF37]/20 hover:border-2 hover:border-[#D4AF37] hover:cursor-pointer transition-all duration-500 text-black hover:text-[#D4AF37]"> */}
                        <Link href={`/account/invoices?order=${order.id}`}>
                        {/* <Download className="w-4 h-4 mr-2" /> */}
                         Invoice 
                         </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="bg-[#111] border-[#333]">
                <CardHeader>
                  <CardTitle className="text-white">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-beige">Order Date</span>
                    <span className="text-white">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-beige">Order Total</span>
                    <span className="text-[#D4AF37] font-bold">${order.total?.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-beige">Payment Status</span>
                    <Badge
                      className={
                        order.paymentStatus === "paid"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }
                    >
                      {order.paymentStatus || "pending"}
                    </Badge>
                  </div>
                  {order.trackingNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-beige">Tracking</span>
                      <span className="text-white font-mono text-sm">{order.trackingNumber}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Customer Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-[#111] border-[#333]">
                <CardHeader>
                  <CardTitle className="text-white">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-[#D4AF37]" />
                    <div>
                      <p className="text-white font-medium">{order.customer?.name}</p>
                      <p className="text-beige text-sm">{order.customer?.email}</p>
                    </div>
                  </div>
                  {order.customer?.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-[#D4AF37]" />
                      <p className="text-white">{order.customer.phone}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="bg-[#111] border-[#333]">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-[#D4AF37]" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-white space-y-1">
                      <p>{order.shippingAddress.name}</p>
                      <p className="text-beige">{order.shippingAddress.street}</p>
                      <p className="text-beige">
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                      </p>
                      <p className="text-beige">{order.shippingAddress.country}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Payment Method */}
            {order.paymentMethod && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="bg-[#111] border-[#333]">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <CreditCard className="w-4 h-4 mr-2 text-[#D4AF37]" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-white">
                      <p>{order.paymentMethod.type || "Credit Card"}</p>
                      {order.paymentMethod.last4 && (
                        <p className="text-beige text-sm">**** **** **** {order.paymentMethod.last4}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="bg-[#111] border-[#333]">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.trackingNumber && (
                    <Button
                      variant="outline"
                      className="w-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
                      asChild
                    >
                      <Link href={`/track-order?order=${order.id}&email=${order.customer?.email}`}>
                        <Truck className="w-4 h-4 mr-2" />
                        Track Package
                      </Link>
                    </Button>
                  )}

                  <Button variant="outline" className="w-full border-[#333] text-white hover:bg-[#222]" asChild>
                    <Link href="/contact">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact Support
                    </Link>
                  </Button>

                  <Button className="w-full bg-[#D4AF37]  hover:bg-[#D4AF37]/20 hover:border-2 hover:border-[#D4AF37] hover:cursor-pointer transition-all duration-500 text-black hover:text-[#D4AF37]" asChild>
                    <Link href="/products">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Shop Again
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
