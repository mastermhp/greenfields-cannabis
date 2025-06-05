"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import {
  Loader2,
  Search,
  Users,
  UserCheck,
  UserX,
  Shield,
  ChevronDown,
  ChevronUp,
  MapPin,
  CreditCard,
  ShoppingBag,
  Calendar,
  Mail,
  User,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function UsersPage() {
  const { getToken } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredUsers, setFilteredUsers] = useState([])
  const [expandedUsers, setExpandedUsers] = useState(new Set())

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    // Filter users based on search term
    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user._id?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredUsers(filtered)
  }, [users, searchTerm])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = getToken()

      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      if (data.success) {
        setUsers(data.data || [])
      } else {
        throw new Error(data.error || "Failed to fetch users")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleUserExpansion = (userId) => {
    const newExpanded = new Set(expandedUsers)
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId)
    } else {
      newExpanded.add(userId)
    }
    setExpandedUsers(newExpanded)
  }

  const formatDate = (date) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0)
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400">Active</Badge>
      case "inactive":
        return <Badge className="bg-red-500/20 text-red-400">Inactive</Badge>
      case "suspended":
        return <Badge className="bg-yellow-500/20 text-yellow-400">Suspended</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">Unknown</Badge>
    }
  }

  const getRoleBadge = (role, isAdmin) => {
    if (isAdmin || role === "admin") {
      return <Badge className="bg-purple-500/20 text-purple-400">Admin</Badge>
    }
    return <Badge className="bg-blue-500/20 text-blue-400">Customer</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading users...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gold-text">User Management</h1>
          <p className="text-beige mt-2">Manage customer accounts and information</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[#111] border-[#333]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-beige text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-white">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111] border-[#333]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-beige text-sm font-medium">Active Users</p>
                <p className="text-2xl font-bold text-white">
                  {users.filter((user) => user.status === "active").length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111] border-[#333]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-beige text-sm font-medium">Admins</p>
                <p className="text-2xl font-bold text-white">
                  {users.filter((user) => user.role === "admin" || user.isAdmin).length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111] border-[#333]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-beige text-sm font-medium">New This Month</p>
                <p className="text-2xl font-bold text-white">
                  {
                    users.filter((user) => {
                      const userDate = new Date(user.createdAt)
                      const now = new Date()
                      return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear()
                    }).length
                  }
                </p>
              </div>
              <UserX className="h-8 w-8 text-[#D4AF37]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-[#111] border-[#333]">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#222] border-[#444] text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="bg-[#111] border-[#333]">
        <CardHeader>
          <CardTitle className="text-white">All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">
                {users.length === 0 ? "No users found." : "No users match your search criteria."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <Collapsible key={user._id} open={expandedUsers.has(user._id)}>
                  <div className="border border-[#333] rounded-lg p-4 hover:bg-[#222] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-black" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{user.name || "N/A"}</h3>
                          <p className="text-sm text-beige">{user.email}</p>
                          <p className="text-xs text-gray-400">ID: {user._id}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex space-x-2 mb-1">
                            {getStatusBadge(user.status)}
                            {getRoleBadge(user.role, user.isAdmin)}
                          </div>
                          <p className="text-xs text-beige">Joined: {formatDate(user.createdAt)}</p>
                        </div>

                        <CollapsibleTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserExpansion(user._id)}
                            className="border-[#333]"
                          >
                            {expandedUsers.has(user._id) ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                View Details
                              </>
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>

                    <CollapsibleContent className="mt-4">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-[#333]">
                        {/* Contact Information */}
                        <div>
                          <h4 className="font-semibold text-white mb-3 flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            Contact Information
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-beige">Email:</span>
                              <span className="text-white">{user.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-beige">Phone:</span>
                              <span className="text-white">{user.phone || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-beige">Email Verified:</span>
                              <span className="text-white">{user.emailVerified ? "Yes" : "No"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Addresses */}
                        <div>
                          <h4 className="font-semibold text-white mb-3 flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            Addresses ({user.addresses?.length || 0})
                          </h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {user.addresses && user.addresses.length > 0 ? (
                              user.addresses.map((address, index) => (
                                <div key={index} className="text-xs bg-[#222] p-2 rounded border border-[#333]">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-white">{address.type || "Address"}</span>
                                    {address.isDefault && (
                                      <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] text-xs">Default</Badge>
                                    )}
                                  </div>
                                  <p className="text-beige">
                                    {address.street}, {address.city}
                                  </p>
                                  <p className="text-beige">
                                    {address.state} {address.zip}, {address.country}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-400 text-sm">No addresses saved</p>
                            )}
                          </div>
                        </div>

                        {/* Payment Methods */}
                        <div>
                          <h4 className="font-semibold text-white mb-3 flex items-center">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Payment Methods ({user.paymentMethods?.length || 0})
                          </h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {user.paymentMethods && user.paymentMethods.length > 0 ? (
                              user.paymentMethods.map((payment, index) => (
                                <div key={index} className="text-xs bg-[#222] p-2 rounded border border-[#333]">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-white">
                                      {payment.type === "card" ? `**** ${payment.last4}` : payment.type}
                                    </span>
                                    {payment.isDefault && (
                                      <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] text-xs">Default</Badge>
                                    )}
                                  </div>
                                  <p className="text-beige">
                                    {payment.brand} {payment.type === "card" ? "Card" : ""}
                                  </p>
                                  {payment.expiryMonth && payment.expiryYear && (
                                    <p className="text-beige">
                                      Expires: {payment.expiryMonth}/{payment.expiryYear}
                                    </p>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-400 text-sm">No payment methods saved</p>
                            )}
                          </div>
                        </div>

                        {/* Order Statistics */}
                        <div>
                          <h4 className="font-semibold text-white mb-3 flex items-center">
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Order Statistics
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-beige">Total Orders:</span>
                              <span className="text-white">{user.orderStats?.totalOrders || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-beige">Total Spent:</span>
                              <span className="text-[#D4AF37]">{formatCurrency(user.orderStats?.totalSpent || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-beige">Avg Order:</span>
                              <span className="text-white">{formatCurrency(user.orderStats?.averageOrder || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-beige">Last Order:</span>
                              <span className="text-white">{formatDate(user.orderStats?.lastOrderDate)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Recent Orders */}
                        <div className="lg:col-span-2">
                          <h4 className="font-semibold text-white mb-3 flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Recent Orders ({user.recentOrders?.length || 0})
                          </h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {user.recentOrders && user.recentOrders.length > 0 ? (
                              user.recentOrders.map((order, index) => (
                                <div key={index} className="text-xs bg-[#222] p-2 rounded border border-[#333]">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-white">Order #{order.orderId}</span>
                                    <Badge
                                      className={
                                        order.status === "completed"
                                          ? "bg-green-500/20 text-green-400"
                                          : order.status === "pending"
                                            ? "bg-yellow-500/20 text-yellow-400"
                                            : "bg-red-500/20 text-red-400"
                                      }
                                    >
                                      {order.status}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-beige">{formatDate(order.createdAt)}</span>
                                    <span className="text-[#D4AF37]">{formatCurrency(order.total)}</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-400 text-sm">No recent orders</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
