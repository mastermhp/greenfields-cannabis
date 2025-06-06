"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Eye,
  User,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  X,
  Ban,
  CheckCircle,
  AlertCircle,
  Clock,
  Package,
  Truck,
  RefreshCw,
  Download,
  UserCheck,
  UserX,
  Crown,
  Shield,
  PlusCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const AdminUsers = () => {
  const { toast } = useToast()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [viewUserDialog, setViewUserDialog] = useState(false)
  const [userOrders, setUserOrders] = useState([])
  const [userStats, setUserStats] = useState(null)
  const [loadingUserData, setLoadingUserData] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true)

      // Get the access token from localStorage
      const accessToken = localStorage.getItem("accessToken")

      if (!accessToken) {
        toast({
          title: "Error",
          description: "Authentication required. Please log in again.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      const data = await response.json()

      if (data.success) {
        console.log("Fetched users:", data.data)
        setUsers(data.data)
        setFilteredUsers(data.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch user orders and stats
  const fetchUserDetails = async (userId) => {
    try {
      setLoadingUserData(true)

      // Get the access token from localStorage
      const accessToken = localStorage.getItem("accessToken")

      if (!accessToken) {
        toast({
          title: "Error",
          description: "Authentication required. Please log in again.",
          variant: "destructive",
        })
        return
      }

      // Fetch user orders
      const ordersResponse = await fetch(`/api/orders/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      const ordersData = await ordersResponse.json()

      if (ordersData.success) {
        setUserOrders(ordersData.data || [])

        // Calculate user statistics
        const orders = ordersData.data || []
        const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0)
        const completedOrders = orders.filter((order) => order.status === "delivered").length
        const pendingOrders = orders.filter(
          (order) => order.status === "pending" || order.status === "processing",
        ).length
        const cancelledOrders = orders.filter((order) => order.status === "cancelled").length
        const averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0
        const lastOrderDate = orders.length > 0 ? new Date(Math.max(...orders.map((o) => new Date(o.createdAt)))) : null
        const firstOrderDate =
          orders.length > 0 ? new Date(Math.min(...orders.map((o) => new Date(o.createdAt)))) : null

        setUserStats({
          totalOrders: orders.length,
          totalSpent,
          completedOrders,
          pendingOrders,
          cancelledOrders,
          averageOrderValue,
          lastOrderDate,
          firstOrderDate,
          favoriteProducts: [], // This would need to be calculated from order items
          loyaltyPoints: 0, // This would come from a loyalty system
        })
      } else {
        console.error("Failed to fetch user orders:", ordersData.error)
        setUserOrders([])
        setUserStats(null)
      }
    } catch (error) {
      console.error("Error fetching user details:", error)
      setUserOrders([])
      setUserStats(null)
    } finally {
      setLoadingUserData(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    let filtered = users

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.phone?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => {
        if (statusFilter === "active") return user.status === "active" || !user.status
        if (statusFilter === "inactive") return user.status === "inactive"
        if (statusFilter === "banned") return user.status === "banned"
        return true
      })
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => {
        if (roleFilter === "customer") return user.role === "customer" || !user.role
        if (roleFilter === "admin") return user.role === "admin"
        if (roleFilter === "moderator") return user.role === "moderator"
        return true
      })
    }

    setFilteredUsers(filtered)
  }, [searchQuery, statusFilter, roleFilter, users])

  const getStatusBadge = (status) => {
    const variants = {
      active: "bg-green-500/20 text-green-400",
      inactive: "bg-yellow-500/20 text-yellow-400",
      banned: "bg-red-500/20 text-red-400",
    }

    const icons = {
      active: <CheckCircle size={16} />,
      inactive: <Clock size={16} />,
      banned: <Ban size={16} />,
    }

    const displayStatus = status || "active"

    return (
      <Badge className={`${variants[displayStatus] || "bg-green-500/20 text-green-400"} border-0`}>
        {icons[displayStatus] || <CheckCircle size={16} />}
        <span className="ml-1 capitalize">{displayStatus}</span>
      </Badge>
    )
  }

  const getRoleBadge = (role) => {
    const variants = {
      admin: "bg-purple-500/20 text-purple-400",
      moderator: "bg-blue-500/20 text-blue-400",
      customer: "bg-gray-500/20 text-gray-400",
    }

    const icons = {
      admin: <Crown size={16} />,
      moderator: <Shield size={16} />,
      customer: <User size={16} />,
    }

    const displayRole = role || "customer"

    return (
      <Badge className={`${variants[displayRole] || "bg-gray-500/20 text-gray-400"} border-0`}>
        {icons[displayRole] || <User size={16} />}
        <span className="ml-1 capitalize">{displayRole}</span>
      </Badge>
    )
  }

  const viewUser = async (user) => {
    setSelectedUser(user)
    setViewUserDialog(true)
    setActiveTab("profile")
    await fetchUserDetails(user.id)
  }

  const updateUserStatus = async (userId, newStatus) => {
    try {
      // Get the access token from localStorage
      const accessToken = localStorage.getItem("accessToken")

      if (!accessToken) {
        toast({
          title: "Error",
          description: "Authentication required. Please log in again.",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update local state
        setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)))

        toast({
          title: "User Updated",
          description: `User status updated to ${newStatus}`,
        })

        // Update selected user if viewing
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser({ ...selectedUser, status: newStatus })
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update user status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating user status:", error)
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={16} className="text-yellow-400" />
      case "processing":
        return <Package size={16} className="text-blue-400" />
      case "shipped":
        return <Truck size={16} className="text-purple-400" />
      case "delivered":
        return <CheckCircle size={16} className="text-green-400" />
      case "cancelled":
        return <AlertCircle size={16} className="text-red-400" />
      default:
        return <Clock size={16} className="text-gray-400" />
    }
  }

  const getOrderStatusBadge = (status) => {
    const variants = {
      pending: "bg-yellow-500/20 text-yellow-400",
      processing: "bg-blue-500/20 text-blue-400",
      shipped: "bg-purple-500/20 text-purple-400",
      delivered: "bg-green-500/20 text-green-400",
      cancelled: "bg-red-500/20 text-red-400",
    }

    return (
      <Badge className={`${variants[status] || "bg-gray-500/20 text-gray-400"} border-0`}>
        {getOrderStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-[#333] rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-[#333] rounded w-64 mt-2 animate-pulse"></div>
          </div>
        </div>

        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-[#111] border border-[#333] rounded-lg p-6 animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <div className="h-6 bg-[#333] rounded w-32"></div>
                  <div className="h-4 bg-[#333] rounded w-48"></div>
                </div>
                <div className="h-6 bg-[#333] rounded w-20"></div>
              </div>
              <div className="h-4 bg-[#333] rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gold-text">Users Management</h1>
          <p className="text-beige mt-2">Manage customer accounts and user data</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={fetchUsers}
            disabled={loading}
            className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh Users
          </Button>
          <Button className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
            <PlusCircle size={16} className="mr-2" />
            Add Users
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: "Total Users",
            value: users.length,
            color: "text-blue-400",
            icon: <User className="h-8 w-8 text-blue-400" />,
          },
          {
            title: "Active Users",
            value: users.filter((u) => u.status === "active" || !u.status).length,
            color: "text-green-400",
            icon: <UserCheck className="h-8 w-8 text-green-400" />,
          },
          {
            title: "Inactive Users",
            value: users.filter((u) => u.status === "inactive").length,
            color: "text-yellow-400",
            icon: <Clock className="h-8 w-8 text-yellow-400" />,
          },
          {
            title: "Banned Users",
            value: users.filter((u) => u.status === "banned").length,
            color: "text-red-400",
            icon: <UserX className="h-8 w-8 text-red-400" />,
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-[#111] border-[#333] hover:border-[#D4AF37]/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-beige text-sm">{stat.title}</p>
                    <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                  </div>
                  {stat.icon}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className="bg-[#111] border-[#333]">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search users by name, email, ID, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black border-[#333] focus:border-[#D4AF37]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-black border-[#333]">
                  <SelectValue placeholder="User Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-[#333]">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[140px] bg-black border-[#333]">
                  <SelectValue placeholder="User Role" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-[#333]">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("all")
                  setRoleFilter("all")
                }}
                className="border-[#333] hover:bg-[#222] hover:text-[#D4AF37]"
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-[#111] border-[#333] hover:border-[#D4AF37]/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-center space-x-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-[#D4AF37] text-black">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{user.name || "Unknown User"}</h3>
                        {getStatusBadge(user.status)}
                        {getRoleBadge(user.role)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-beige">Contact Info</p>
                          <p className="text-white">{user.email || "No email"}</p>
                          <p className="text-gray-400">{user.phone || "No phone"}</p>
                        </div>

                        <div>
                          <p className="text-beige">User ID</p>
                          <p className="text-white font-mono text-xs">{user.id}</p>
                          <p className="text-gray-400">Joined: {formatDate(user.createdAt)}</p>
                        </div>

                        <div>
                          <p className="text-beige">Location</p>
                          <p className="text-white">
                            {user.city || "Unknown"}, {user.state || "Unknown"}
                          </p>
                          <p className="text-gray-400">{user.country || "Unknown"}</p>
                        </div>

                        <div>
                          <p className="text-beige">Last Activity</p>
                          <p className="text-white">{formatDate(user.lastLoginAt || user.updatedAt)}</p>
                          <p className="text-gray-400">
                            {user.isOnline ? (
                              <span className="text-green-400">● Online</span>
                            ) : (
                              <span className="text-gray-400">● Offline</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => viewUser(user)} className="border-[#333]">
                      <Eye size={16} className="mr-2" />
                      View Details
                    </Button>

                    {/* {user.status !== "banned" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateUserStatus(user.id, "banned")}
                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                      >
                        <Ban size={16} className="mr-2" />
                        Ban User
                      </Button>
                    )}

                    {user.status === "banned" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateUserStatus(user.id, "active")}
                        className="border-green-500 text-green-400 hover:bg-green-500/10"
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Unban User
                      </Button>
                    )} */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card className="bg-[#111] border-[#333]">
          <CardContent className="p-12 text-center">
            <User size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No users found</h3>
            <p className="text-beige">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      )}

      {/* View User Dialog */}
      <Dialog open={viewUserDialog} onOpenChange={setViewUserDialog}>
        <DialogContent className="bg-[#111] border border-[#333] text-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <User className="mr-2" size={20} />
              User Details
              {selectedUser && (
                <div className="ml-3 flex items-center space-x-2">
                  {getStatusBadge(selectedUser.status)}
                  {getRoleBadge(selectedUser.role)}
                </div>
              )}
            </DialogTitle>
            <DialogDescription className="text-beige">
              {selectedUser && `Member since ${formatDate(selectedUser.createdAt)}`}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-[#222] border border-[#333]">
                  <TabsTrigger
                    value="profile"
                    className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                  >
                    Profile
                  </TabsTrigger>
                  <TabsTrigger
                    value="orders"
                    className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                  >
                    Order History
                  </TabsTrigger>
                  <TabsTrigger
                    value="stats"
                    className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                  >
                    Statistics
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                  >
                    Activity
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-4 space-y-4">
                  {/* User Profile Header */}
                  <div className="bg-[#222] p-6 rounded-lg">
                    <div className="flex items-center space-x-6">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={selectedUser.avatar || "/placeholder.svg"} alt={selectedUser.name} />
                        <AvatarFallback className="bg-[#D4AF37] text-black text-2xl">
                          {selectedUser.name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-2">{selectedUser.name || "Unknown User"}</h2>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {getStatusBadge(selectedUser.status)}
                          {getRoleBadge(selectedUser.role)}
                          {selectedUser.isEmailVerified && (
                            <Badge className="bg-blue-500/20 text-blue-400 border-0">
                              <Mail size={16} className="mr-1" />
                              Email Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-beige">
                          User ID: <span className="font-mono text-xs">{selectedUser.id}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-[#222] p-4 rounded-lg">
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <Mail size={20} className="mr-2 text-red-400" />
                        Contact Information
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-beige">Email:</span>
                          <span>{selectedUser.email || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-beige">Phone:</span>
                          <span>{selectedUser.phone || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-beige">Email Verified:</span>
                          <span className={selectedUser.isEmailVerified ? "text-green-400" : "text-red-400"}>
                            {selectedUser.isEmailVerified ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#222] p-4 rounded-lg">
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <MapPin size={20} className="mr-2 text-green-400" />
                        Location
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-beige">City:</span>
                          <span>{selectedUser.city || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-beige">State:</span>
                          <span>{selectedUser.state || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-beige">Country:</span>
                          <span>{selectedUser.country || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-beige">Timezone:</span>
                          <span>{selectedUser.timezone || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="bg-[#222] p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3 flex items-center">
                      <Calendar size={20} className="mr-2 text-purple-400" />
                      Account Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-beige text-sm">Account Created</p>
                        <p className="text-white">{formatDate(selectedUser.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-beige text-sm">Last Updated</p>
                        <p className="text-white">{formatDate(selectedUser.updatedAt)}</p>
                      </div>
                      <div>
                        <p className="text-beige text-sm">Last Login</p>
                        <p className="text-white">{formatDate(selectedUser.lastLoginAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="bg-[#222] p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">User Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-beige text-sm">Marketing Emails</p>
                        <p className="text-white">
                          {selectedUser.preferences?.marketingEmails ? "Enabled" : "Disabled"}
                        </p>
                      </div>
                      <div>
                        <p className="text-beige text-sm">SMS Notifications</p>
                        <p className="text-white">
                          {selectedUser.preferences?.smsNotifications ? "Enabled" : "Disabled"}
                        </p>
                      </div>
                      <div>
                        <p className="text-beige text-sm">Newsletter</p>
                        <p className="text-white">
                          {selectedUser.preferences?.newsletter ? "Subscribed" : "Unsubscribed"}
                        </p>
                      </div>
                      <div>
                        <p className="text-beige text-sm">Language</p>
                        <p className="text-white">{selectedUser.preferences?.language || "English"}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="orders" className="mt-4 space-y-4">
                  {loadingUserData ? (
                    <div className="bg-[#222] p-8 rounded-lg text-center">
                      <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
                      <p className="text-beige">Loading order history...</p>
                    </div>
                  ) : userOrders.length > 0 ? (
                    <div className="space-y-4">
                      {userOrders.map((order, index) => (
                        <div key={order.id} className="bg-[#222] p-4 rounded-lg">
                          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-semibold">Order #{order.id}</h4>
                                {getOrderStatusBadge(order.status)}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-beige">Order Date</p>
                                  <p className="text-white">{formatDate(order.createdAt)}</p>
                                </div>
                                <div>
                                  <p className="text-beige">Items</p>
                                  <p className="text-white">{order.items?.length || 0} item(s)</p>
                                </div>
                                
                                <div className="flex gap-3">
                                  <p className="text-beige">Total:</p>
                                  <p className="text-[#D4AF37] font-medium">${order.total?.toFixed(2)}</p>
                                </div>
                              </div>
                            </div>

                            {/* <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-[#333]"
                                onClick={() => {
                                  // This would open the order details
                                  toast({
                                    title: "Feature Coming Soon",
                                    description: "Order details view will be available in the next update.",
                                  })
                                }}
                              >
                                <Eye size={16} className="mr-2" />
                                View Order
                              </Button>
                            </div> */}
                          </div>

                          {/* Order Items Preview */}
                          {order.items && order.items.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-[#333]">
                              <p className="text-beige text-sm mb-2">Items:</p>
                              <div className="flex flex-wrap gap-2">
                                {order.items.slice(0, 3).map((item, itemIndex) => (
                                  <Badge key={itemIndex} variant="outline" className="border-[#333] text-xs">
                                    {item.name} x{item.quantity}
                                  </Badge>
                                ))}
                                {order.items.length > 3 && (
                                  <Badge variant="outline" className="border-[#333] text-xs">
                                    +{order.items.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#222] p-8 rounded-lg text-center">
                      <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">No Orders Found</h3>
                      <p className="text-beige">This user hasn't placed any orders yet.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="stats" className="mt-4 space-y-4">
                  {loadingUserData ? (
                    <div className="bg-[#222] p-8 rounded-lg text-center">
                      <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
                      <p className="text-beige">Loading statistics...</p>
                    </div>
                  ) : userStats ? (
                    <div className="space-y-4">
                      {/* Order Statistics */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        <div className="bg-[#222] p-4 rounded-lg text-center">
                          <ShoppingBag className="mx-auto mb-2 text-blue-400" size={24} />
                          <p className="text-2xl font-bold text-white">{userStats.totalOrders}</p>
                          <p className="text-beige text-sm">Total Orders</p>
                        </div>

                        <div className="bg-[#222] p-4 rounded-lg text-center">
                          <DollarSign className="mx-auto mb-2 text-green-400" size={24} />
                          <p className="text-2xl font-bold text-white">${userStats.totalSpent.toFixed(2)}</p>
                          <p className="text-beige text-sm">Total Spent</p>
                        </div>

                        <div className="bg-[#222] p-4 rounded-lg text-center">
                          <DollarSign className="mx-auto mb-2 text-green-400" size={24} />
                          <p className="text-2xl font-bold text-white">${userStats.totalSpent.toFixed(2)}</p>
                          <p className="text-beige text-sm">Total Spent</p>
                        </div>

                        <div className="bg-[#222] p-4 rounded-lg text-center">
                          <Package className="mx-auto mb-2 text-yellow-400" size={24} />
                          <p className="text-2xl font-bold text-white">${userStats.averageOrderValue.toFixed(2)}</p>
                          <p className="text-beige text-sm">Average Order</p>
                        </div>

                        <div className="bg-[#222] p-4 rounded-lg text-center">
                          <Calendar className="mx-auto mb-2 text-purple-400" size={24} />
                          <p className="text-2xl font-bold text-white">
                            {userStats.lastOrderDate ? formatDate(userStats.lastOrderDate).split(",")[0] : "N/A"}
                          </p>
                          <p className="text-beige text-sm">Last Order</p>
                        </div>
                      </div>

                      {/* Order Status Breakdown */}
                      <div className="bg-[#222] p-4 rounded-lg">
                        <h3 className="font-semibold text-lg mb-3">Order Status Breakdown</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between p-3 bg-[#111] rounded-lg">
                            <div className="flex items-center">
                              <CheckCircle size={20} className="text-green-400 mr-2" />
                              <span>Completed</span>
                            </div>
                            <Badge className="bg-green-500/20 text-green-400 border-0">
                              {userStats.completedOrders}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-[#111] rounded-lg">
                            <div className="flex items-center">
                              <Clock size={20} className="text-yellow-400 mr-2" />
                              <span>Pending</span>
                            </div>
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-0">
                              {userStats.pendingOrders}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-[#111] rounded-lg">
                            <div className="flex items-center">
                              <AlertCircle size={20} className="text-red-400 mr-2" />
                              <span>Cancelled</span>
                            </div>
                            <Badge className="bg-red-500/20 text-red-400 border-0">{userStats.cancelledOrders}</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Spending Over Time */}
                      <div className="bg-[#222] p-4 rounded-lg">
                        <h3 className="font-semibold mb-3">Customer Lifetime</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-beige text-sm">First Order</p>
                            <p className="text-white">
                              {userStats.firstOrderDate ? formatDate(userStats.firstOrderDate) : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-beige text-sm">Last Order</p>
                            <p className="text-white">
                              {userStats.lastOrderDate ? formatDate(userStats.lastOrderDate) : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-beige text-sm">Customer For</p>
                            <p className="text-white">
                              {userStats.firstOrderDate
                                ? `${Math.floor((new Date() - new Date(userStats.firstOrderDate)) / (1000 * 60 * 60 * 24 * 30))} months`
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-beige text-sm">Loyalty Points</p>
                            <p className="text-[#D4AF37]">
                              {selectedUser.loyaltyPoints || userStats.loyaltyPoints || 0} points
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#222] p-8 rounded-lg text-center">
                      <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">No Statistics Available</h3>
                      <p className="text-beige">We couldn't find any statistics for this user.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="mt-4 space-y-4">
                  <div className="bg-[#222] p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Recent Activity</h3>

                    {loadingUserData ? (
                      <div className="text-center py-8">
                        <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
                        <p className="text-beige">Loading activity...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Login Activity */}
                        <div>
                          <h4 className="text-sm text-beige mb-2">Login Activity</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-[#111] rounded-lg">
                              <div className="flex items-center">
                                <User size={16} className="text-blue-400 mr-2" />
                                <span>Last Login</span>
                              </div>
                              <span>{formatDate(selectedUser.lastLoginAt || selectedUser.updatedAt)}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-[#111] rounded-lg">
                              <div className="flex items-center">
                                <Shield size={16} className="text-green-400 mr-2" />
                                <span>Account Status</span>
                              </div>
                              <span>{getStatusBadge(selectedUser.status)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Recent Actions */}
                        <div>
                          <h4 className="text-sm text-beige mb-2">Recent Actions</h4>
                          <div className="space-y-2">
                            {userOrders && userOrders.length > 0 ? (
                              userOrders.slice(0, 3).map((order, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-[#111] rounded-lg">
                                  <div className="flex items-center">
                                    <ShoppingBag size={16} className="text-[#D4AF37] mr-2" />
                                    <span>Placed Order #{order.id}</span>
                                  </div>
                                  <span>{formatDate(order.createdAt)}</span>
                                </div>
                              ))
                            ) : (
                              <div className="p-3 bg-[#111] rounded-lg text-center text-gray-400">
                                No recent activity found
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-end gap-2 pt-4 border-t border-[#333]">
                <Button variant="outline" onClick={() => setViewUserDialog(false)} className="border-[#333]">
                  Close
                </Button>

                {/* {selectedUser.status !== "banned" ? (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      updateUserStatus(selectedUser.id, "banned")
                      setViewUserDialog(false)
                    }}
                    className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/50"
                  >
                    <Ban size={16} className="mr-2" />
                    Ban User
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      updateUserStatus(selectedUser.id, "active")
                      setViewUserDialog(false)
                    }}
                    className="border-green-500 text-green-400 hover:bg-green-500/10"
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Unban User
                  </Button>
                )} */}

                {/* <Button className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
                  <Mail size={16} className="mr-2" />
                  Contact User
                </Button> */}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminUsers
