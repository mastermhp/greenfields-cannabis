"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  User,
  Package,
  Heart,
  LogOut,
  Settings,
  CreditCard,
  MapPin,
  Award,
  ChevronRight,
  Gift,
  Clock,
  ShoppingBag,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import LoyaltyCard from "@/components/loyalty/loyalty-card"

export default function AccountPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  // Mock user data for other sections - in a real app, this would come from an API
  const [userData, setUserData] = useState({
    wishlist: [
      {
        id: "prod-001",
        name: "Golden Sunset",
        category: "flower",
        price: 59.99,
        image: "/placeholder.svg?height=600&width=600",
      },
      {
        id: "prod-003",
        name: "Cosmic Haze",
        category: "pre-rolls",
        price: 14.99,
        image: "/placeholder.svg?height=600&width=600",
      },
    ],
    addresses: [
      {
        id: 1,
        default: true,
        name: "Home",
        street: "123 Main Street",
        city: "Los Angeles",
        state: "CA",
        zip: "90001",
        country: "United States",
      },
    ],
    paymentMethods: [
      {
        id: 1,
        default: true,
        type: "visa",
        last4: "4242",
        expiry: "05/25",
      },
    ],
    loyaltyInfo: {
      tier: "silver",
      points: 750,
      nextTier: "gold",
      pointsToNextTier: 250,
    },
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/account")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchUserOrders()
    }
  }, [isAuthenticated, user])

  // Auto-refresh orders every 30 seconds when on orders tab
  useEffect(() => {
    let interval
    if (activeTab === "orders" && user?.id) {
      interval = setInterval(() => {
        fetchUserOrders(true) // Silent refresh
      }, 30000) // 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [activeTab, user?.id])

  const fetchUserOrders = async (silent = false) => {
    if (!user?.id) return

    if (!silent) setLoadingOrders(true)
    try {
      console.log(`Fetching orders for user: ${user.id}`)
      const response = await fetch(`/api/orders/user/${user.id}`, {
        cache: "no-store", // Ensure fresh data
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      const data = await response.json()

      console.log("User orders response:", data)

      if (data.success) {
        setOrders(data.data)
        if (!silent) {
          console.log(`Loaded ${data.data.length} orders for user`)
        }
      } else {
        if (!silent) {
          toast({
            title: "Error",
            description: "Failed to fetch orders",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      if (!silent) {
        toast({
          title: "Error",
          description: "Failed to fetch orders",
          variant: "destructive",
        })
      }
    } finally {
      if (!silent) setLoadingOrders(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
    router.push("/")
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-500/20 text-green-400"
      case "shipped":
      case "out_for_delivery":
        return "bg-blue-500/20 text-blue-400"
      case "processing":
        return "bg-yellow-500/20 text-yellow-400"
      case "pending":
        return "bg-orange-500/20 text-orange-400"
      case "cancelled":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
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
    })
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-black py-40 ">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold gold-text">My Account</h1>
          <p className="text-beige mt-2">Manage your orders, wishlist, and account settings.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-[#111] border border-[#333] p-6 mb-6">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#222] overflow-hidden mr-4">
                  <Image
                    src={user?.avatar || "/placeholder.svg?height=100&width=100"}
                    alt={user?.name || "User"}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{user?.name || "User"}</h2>
                  <p className="text-beige text-sm">{user?.email || "user@example.com"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${activeTab === "overview" ? "bg-[#222]" : ""}`}
                  onClick={() => setActiveTab("overview")}
                >
                  <User size={18} className="mr-2" />
                  Account Overview
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${activeTab === "orders" ? "bg-[#222]" : ""}`}
                  onClick={() => setActiveTab("orders")}
                >
                  <Package size={18} className="mr-2" />
                  Orders
                  {orders.length > 0 && (
                    <span className="ml-auto bg-[#D4AF37] text-black text-xs px-2 py-1 rounded-full">
                      {orders.length}
                    </span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${activeTab === "wishlist" ? "bg-[#222]" : ""}`}
                  onClick={() => setActiveTab("wishlist")}
                >
                  <Heart size={18} className="mr-2" />
                  Wishlist
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${activeTab === "addresses" ? "bg-[#222]" : ""}`}
                  onClick={() => setActiveTab("addresses")}
                >
                  <MapPin size={18} className="mr-2" />
                  Addresses
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${activeTab === "payment" ? "bg-[#222]" : ""}`}
                  onClick={() => setActiveTab("payment")}
                >
                  <CreditCard size={18} className="mr-2" />
                  Payment Methods
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${activeTab === "loyalty" ? "bg-[#222]" : ""}`}
                  onClick={() => setActiveTab("loyalty")}
                >
                  <Award size={18} className="mr-2" />
                  Loyalty & Rewards
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${activeTab === "settings" ? "bg-[#222]" : ""}`}
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings size={18} className="mr-2" />
                  Account Settings
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/10"
                  onClick={handleLogout}
                >
                  <LogOut size={18} className="mr-2" />
                  Logout
                </Button>
              </div>
            </div>

            <div className="bg-[#111] border border-[#333] p-6">
              <div className="flex items-center mb-4">
                <Award className="text-[#D4AF37] mr-2" size={20} />
                <h3 className="font-bold">Loyalty Status</h3>
              </div>

              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-beige">Current Tier</span>
                  <span className="font-medium capitalize">{userData.loyaltyInfo.tier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-beige">Available Points</span>
                  <span className="font-medium">{userData.loyaltyInfo.points}</span>
                </div>
              </div>

              <Button asChild className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-black">
                <Link href="/loyalty">
                  View Rewards <ChevronRight size={16} className="ml-1" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-[#111] border border-[#333] p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold flex items-center">
                        <Package className="mr-2 text-[#D4AF37]" size={20} />
                        Recent Orders
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchUserOrders()}
                        disabled={loadingOrders}
                        className="text-[#D4AF37] hover:bg-[#D4AF37]/10"
                      >
                        <RefreshCw size={16} className={`${loadingOrders ? "animate-spin" : ""}`} />
                      </Button>
                    </div>

                    {loadingOrders ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="animate-spin text-[#D4AF37]" size={24} />
                      </div>
                    ) : orders.length > 0 ? (
                      <div className="space-y-4">
                        {orders.slice(0, 2).map((order) => (
                          <div
                            key={order.id}
                            className="flex justify-between items-center p-3 bg-[#222] border border-[#333]"
                          >
                            <div>
                              <p className="font-medium">{order.id}</p>
                              <p className="text-sm text-beige">{formatDate(order.createdAt)}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${order.total?.toFixed(2)}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                {formatStatus(order.status)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-beige">No orders yet.</p>
                    )}

                    <div className="mt-4">
                      <Button
                        variant="outline"
                        className="w-full border-[#333] text-white hover:bg-[#222]"
                        onClick={() => setActiveTab("orders")}
                      >
                        View All Orders
                      </Button>
                    </div>
                  </div>

                  <div className="bg-[#111] border border-[#333] p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                      <Award className="mr-2 text-[#D4AF37]" size={20} />
                      Loyalty & Rewards
                    </h2>

                    <div className="mb-4">
                      <LoyaltyCard
                        tier={userData.loyaltyInfo.tier}
                        points={userData.loyaltyInfo.points}
                        name={user?.name || "Member"}
                        since="2023"
                        memberID={user?.id || "000000"}
                      />
                    </div>

                    <Button asChild className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-black">
                      <Link href="/loyalty">View Rewards Program</Link>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#111] border border-[#333] p-6">
                    <h2 className="font-bold mb-4 flex items-center">
                      <MapPin className="mr-2 text-[#D4AF37]" size={18} />
                      Default Address
                    </h2>

                    {userData.addresses.length > 0 ? (
                      <div>
                        <p className="font-medium">{userData.addresses[0].name}</p>
                        <p className="text-beige">{userData.addresses[0].street}</p>
                        <p className="text-beige">
                          {userData.addresses[0].city}, {userData.addresses[0].state} {userData.addresses[0].zip}
                        </p>
                        <p className="text-beige">{userData.addresses[0].country}</p>
                      </div>
                    ) : (
                      <p className="text-beige">No addresses saved.</p>
                    )}

                    <div className="mt-4">
                      <Button
                        variant="outline"
                        className="w-full border-[#333] text-white hover:bg-[#222]"
                        onClick={() => setActiveTab("addresses")}
                      >
                        Manage Addresses
                      </Button>
                    </div>
                  </div>

                  <div className="bg-[#111] border border-[#333] p-6">
                    <h2 className="font-bold mb-4 flex items-center">
                      <CreditCard className="mr-2 text-[#D4AF37]" size={18} />
                      Payment Method
                    </h2>

                    {userData.paymentMethods.length > 0 ? (
                      <div>
                        <p className="font-medium capitalize">{userData.paymentMethods[0].type}</p>
                        <p className="text-beige">**** **** **** {userData.paymentMethods[0].last4}</p>
                        <p className="text-beige">Expires: {userData.paymentMethods[0].expiry}</p>
                      </div>
                    ) : (
                      <p className="text-beige">No payment methods saved.</p>
                    )}

                    <div className="mt-4">
                      <Button
                        variant="outline"
                        className="w-full border-[#333] text-white hover:bg-[#222]"
                        onClick={() => setActiveTab("payment")}
                      >
                        Manage Payment Methods
                      </Button>
                    </div>
                  </div>

                  <div className="bg-[#111] border border-[#333] p-6">
                    <h2 className="font-bold mb-4 flex items-center">
                      <Heart className="mr-2 text-[#D4AF37]" size={18} />
                      Wishlist
                    </h2>

                    {userData.wishlist.length > 0 ? (
                      <p className="text-beige">{userData.wishlist.length} items in your wishlist</p>
                    ) : (
                      <p className="text-beige">Your wishlist is empty.</p>
                    )}

                    <div className="mt-4">
                      <Button
                        variant="outline"
                        className="w-full border-[#333] text-white hover:bg-[#222]"
                        onClick={() => setActiveTab("wishlist")}
                      >
                        View Wishlist
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="mt-0">
                <div className="bg-[#111] border border-[#333] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center">
                      <Package className="mr-2 text-[#D4AF37]" size={20} />
                      My Orders
                      <span className="ml-2 text-sm text-beige">(Auto-refreshing)</span>
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchUserOrders()}
                      disabled={loadingOrders}
                      className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
                    >
                      <RefreshCw size={16} className={`mr-2 ${loadingOrders ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                  </div>

                  {loadingOrders ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="animate-spin text-[#D4AF37] mr-2" size={24} />
                      <span className="text-beige">Loading orders...</span>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-[#222] border border-[#333] p-4">
                          <div className="flex flex-wrap justify-between items-center mb-4">
                            <div>
                              <p className="font-medium">{order.id}</p>
                              <p className="text-sm text-beige">Placed on {formatDate(order.createdAt)}</p>
                              <p className="text-xs text-gray-400">Last updated: {formatDate(order.updatedAt)}</p>
                            </div>
                            <div className="flex items-center">
                              <span className={`px-3 py-1 text-sm rounded-full mr-3 ${getStatusColor(order.status)}`}>
                                {formatStatus(order.status)}
                              </span>
                              <span className="font-medium">${order.total?.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Items:</h4>
                            <div className="space-y-2">
                              {order.items?.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span className="text-beige">
                                    {item.name} x {item.quantity}
                                  </span>
                                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="text-sm text-beige">
                              {order.items?.length || 0} {order.items?.length === 1 ? "item" : "items"}
                              {order.trackingNumber && <span className="ml-4">Tracking: {order.trackingNumber}</span>}
                            </div>
                            <div className="space-x-3">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-[#333] text-white hover:bg-[#333]"
                                asChild
                              >
                                <Link href={`/track-order?order=${order.id}&email=${order.customer?.email}`}>
                                  Track Order
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag className="mx-auto text-[#333] mb-4" size={48} />
                      <h3 className="text-lg font-medium mb-2">No Orders Yet</h3>
                      <p className="text-beige mb-4">You haven't placed any orders yet.</p>
                      <Button asChild className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
                        <Link href="/products">Start Shopping</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Other tabs remain the same */}
              <TabsContent value="wishlist" className="mt-0">
                <div className="bg-[#111] border border-[#333] p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                    <Heart className="mr-2 text-[#D4AF37]" size={20} />
                    My Wishlist
                  </h2>

                  {userData.wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userData.wishlist.map((item) => (
                        <div key={item.id} className="bg-[#222] border border-[#333] p-4 flex">
                          <div className="w-20 h-20 bg-[#333] relative mr-4">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="flex-grow flex flex-col justify-between">
                            <div>
                              <h3 className="font-medium">{item.name}</h3>
                              <p className="text-sm text-beige capitalize">{item.category}</p>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="font-medium">${item.price.toFixed(2)}</span>
                              <div className="space-x-2">
                                <Button size="sm" className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
                                  Add to Cart
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-[#333] text-white hover:bg-[#333]"
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="mx-auto text-[#333] mb-4" size={48} />
                      <h3 className="text-lg font-medium mb-2">Your Wishlist is Empty</h3>
                      <p className="text-beige mb-4">Save items you love to your wishlist.</p>
                      <Button asChild className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
                        <Link href="/products">Browse Products</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Addresses Tab */}
              <TabsContent value="addresses" className="mt-0">
                <div className="bg-[#111] border border-[#333] p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                    <MapPin className="mr-2 text-[#D4AF37]" size={20} />
                    My Addresses
                  </h2>

                  {userData.addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userData.addresses.map((address) => (
                        <div key={address.id} className="bg-[#222] border border-[#333] p-4 relative">
                          {address.default && (
                            <div className="absolute top-2 right-2 bg-[#D4AF37] text-black text-xs px-2 py-1 rounded-sm">
                              Default
                            </div>
                          )}

                          <h3 className="font-medium mb-2">{address.name}</h3>
                          <p className="text-beige">{address.street}</p>
                          <p className="text-beige">
                            {address.city}, {address.state} {address.zip}
                          </p>
                          <p className="text-beige mb-4">{address.country}</p>

                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
                            >
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="border-[#333] text-white hover:bg-[#333]">
                              Remove
                            </Button>
                            {!address.default && (
                              <Button variant="outline" size="sm" className="border-[#333] text-white hover:bg-[#333]">
                                Set as Default
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}

                      <div className="bg-[#222] border border-dashed border-[#333] p-4 flex items-center justify-center">
                        <Button className="bg-transparent hover:bg-[#333] border border-[#333] text-white">
                          + Add New Address
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="mx-auto text-[#333] mb-4" size={48} />
                      <h3 className="text-lg font-medium mb-2">No Addresses Saved</h3>
                      <p className="text-beige mb-4">Add a shipping address to speed up checkout.</p>
                      <Button className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">Add New Address</Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Payment Methods Tab */}
              <TabsContent value="payment" className="mt-0">
                <div className="bg-[#111] border border-[#333] p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                    <CreditCard className="mr-2 text-[#D4AF37]" size={20} />
                    Payment Methods
                  </h2>

                  {userData.paymentMethods.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userData.paymentMethods.map((method) => (
                        <div key={method.id} className="bg-[#222] border border-[#333] p-4 relative">
                          {method.default && (
                            <div className="absolute top-2 right-2 bg-[#D4AF37] text-black text-xs px-2 py-1 rounded-sm">
                              Default
                            </div>
                          )}

                          <div className="flex items-center mb-4">
                            <div className="w-10 h-6 bg-[#333] mr-3 flex items-center justify-center">
                              <span className="text-xs font-bold uppercase">{method.type}</span>
                            </div>
                            <span className="font-mono">**** {method.last4}</span>
                          </div>

                          <p className="text-beige mb-4">Expires: {method.expiry}</p>

                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="border-[#333] text-white hover:bg-[#333]">
                              Remove
                            </Button>
                            {!method.default && (
                              <Button variant="outline" size="sm" className="border-[#333] text-white hover:bg-[#333]">
                                Set as Default
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}

                      <div className="bg-[#222] border border-dashed border-[#333] p-4 flex items-center justify-center">
                        <Button className="bg-transparent hover:bg-[#333] border border-[#333] text-white">
                          + Add Payment Method
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="mx-auto text-[#333] mb-4" size={48} />
                      <h3 className="text-lg font-medium mb-2">No Payment Methods Saved</h3>
                      <p className="text-beige mb-4">Add a payment method to speed up checkout.</p>
                      <Button className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">Add Payment Method</Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Loyalty Tab */}
              <TabsContent value="loyalty" className="mt-0">
                <div className="bg-[#111] border border-[#333] p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                    <Award className="mr-2 text-[#D4AF37]" size={20} />
                    Loyalty & Rewards
                  </h2>

                  <div className="mb-6">
                    <LoyaltyCard
                      tier={userData.loyaltyInfo.tier}
                      points={userData.loyaltyInfo.points}
                      name={user?.name || "Member"}
                      since="2023"
                      memberID={user?.id || "000000"}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-[#222] border border-[#333] p-4">
                      <h3 className="font-medium mb-3">Points Summary</h3>
                      <div className="flex justify-between mb-2">
                        <span className="text-beige">Available Points</span>
                        <span>{userData.loyaltyInfo.points}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-beige">Current Tier</span>
                        <span className="capitalize">{userData.loyaltyInfo.tier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-beige">Next Tier</span>
                        <span className="capitalize">{userData.loyaltyInfo.nextTier}</span>
                      </div>
                    </div>

                    <div className="bg-[#222] border border-[#333] p-4">
                      <h3 className="font-medium mb-3">Next Tier Progress</h3>
                      <div className="mb-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-beige">Points to {userData.loyaltyInfo.nextTier}</span>
                          <span className="text-sm text-beige">{userData.loyaltyInfo.pointsToNextTier} more</span>
                        </div>
                        <div className="w-full bg-[#333] h-2">
                          <div
                            className="bg-[#D4AF37] h-2"
                            style={{
                              width: `${(userData.loyaltyInfo.points / (userData.loyaltyInfo.points + userData.loyaltyInfo.pointsToNextTier)) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-sm text-beige">
                        Earn {userData.loyaltyInfo.pointsToNextTier} more points to reach{" "}
                        {userData.loyaltyInfo.nextTier} status
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-medium mb-3">Ways to Earn Points</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-[#222] border border-[#333] p-3 text-center">
                        <ShoppingBag className="mx-auto text-[#D4AF37] mb-2" size={24} />
                        <p className="font-medium">Make a Purchase</p>
                        <p className="text-sm text-beige">1 point per $1 spent</p>
                      </div>
                      <div className="bg-[#222] border border-[#333] p-3 text-center">
                        <Gift className="mx-auto text-[#D4AF37] mb-2" size={24} />
                        <p className="font-medium">Refer a Friend</p>
                        <p className="text-sm text-beige">500 points per referral</p>
                      </div>
                      <div className="bg-[#222] border border-[#333] p-3 text-center">
                        <Clock className="mx-auto text-[#D4AF37] mb-2" size={24} />
                        <p className="font-medium">Birthday Bonus</p>
                        <p className="text-sm text-beige">100-500 points</p>
                      </div>
                    </div>
                  </div>

                  <Button asChild className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-black">
                    <Link href="/loyalty">Go to Rewards Program</Link>
                  </Button>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="mt-0">
                <div className="bg-[#111] border border-[#333] p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                    <Settings className="mr-2 text-[#D4AF37]" size={20} />
                    Account Settings
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-3">Personal Information</h3>
                      <div className="bg-[#222] border border-[#333] p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm text-beige mb-1">First Name</label>
                            <input
                              type="text"
                              value={user?.name?.split(" ")[0] || ""}
                              className="w-full bg-black border border-[#333] p-2"
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-beige mb-1">Last Name</label>
                            <input
                              type="text"
                              value={user?.name?.split(" ")[1] || ""}
                              className="w-full bg-black border border-[#333] p-2"
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm text-beige mb-1">Email</label>
                          <input
                            type="email"
                            value={user?.email || ""}
                            className="w-full bg-black border border-[#333] p-2"
                            readOnly
                          />
                        </div>
                        <Button variant="outline" className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10">
                          Edit Profile
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3">Password</h3>
                      <div className="bg-[#222] border border-[#333] p-4">
                        <p className="text-beige mb-4">Change your account password</p>
                        <Button variant="outline" className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10">
                          Change Password
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3">Communication Preferences</h3>
                      <div className="bg-[#222] border border-[#333] p-4">
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center">
                            <input type="checkbox" id="emailOrders" className="mr-2" defaultChecked />
                            <label htmlFor="emailOrders" className="text-beige">
                              Order confirmations and updates
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" id="emailPromos" className="mr-2" defaultChecked />
                            <label htmlFor="emailPromos" className="text-beige">
                              Promotions and discounts
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" id="emailNews" className="mr-2" defaultChecked />
                            <label htmlFor="emailNews" className="text-beige">
                              News and product updates
                            </label>
                          </div>
                        </div>
                        <Button variant="outline" className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10">
                          Save Preferences
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3 text-red-500">Danger Zone</h3>
                      <div className="bg-[#222] border border-red-900/30 p-4">
                        <p className="text-beige mb-4">Permanently delete your account and all associated data.</p>
                        <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
