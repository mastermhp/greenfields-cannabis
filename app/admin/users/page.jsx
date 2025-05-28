"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

const AdminUsers = () => {
  const { toast } = useToast()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    let filtered = users

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.phone?.includes(searchQuery),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }, [searchQuery, statusFilter, users])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/users")
      const data = await response.json()

      if (response.ok) {
        setUsers(data.data || [])
        setFilteredUsers(data.data || [])
      } else {
        throw new Error(data.error || "Failed to fetch users")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateUserStatus = async (userId, newStatus) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (response.ok) {
        setUsers(users.map((user) => (user._id === userId ? { ...user, status: newStatus } : user)))
        toast({
          title: "User Updated",
          description: `User status updated to ${newStatus}`,
        })
      } else {
        throw new Error(data.error || "Failed to update user")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: "DELETE",
        })

        const data = await response.json()

        if (response.ok) {
          setUsers(users.filter((user) => user._id !== userId))
          toast({
            title: "User Deleted",
            description: "User has been successfully deleted.",
          })
        } else {
          throw new Error(data.error || "Failed to delete user")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      }
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      active: "bg-green-500/20 text-green-400",
      inactive: "bg-gray-500/20 text-gray-400",
      suspended: "bg-red-500/20 text-red-400",
    }

    return (
      <Badge className={`${variants[status]} border-0`}>
        {status === "active" && <CheckCircle size={12} className="mr-1" />}
        {status === "suspended" && <Ban size={12} className="mr-1" />}
        <span className="capitalize">{status}</span>
      </Badge>
    )
  }

  const getLoyaltyBadge = (tier) => {
    const variants = {
      silver: "bg-gray-300/20 text-gray-300",
      gold: "bg-yellow-500/20 text-yellow-400",
      diamond: "bg-blue-500/20 text-blue-400",
    }

    return (
      <Badge className={`${variants[tier]} border-0`}>
        <Award size={12} className="mr-1" />
        <span className="capitalize">{tier}</span>
      </Badge>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
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
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#333] rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#333] rounded w-1/4"></div>
                  <div className="h-3 bg-[#333] rounded w-1/3"></div>
                </div>
              </div>
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
          <p className="text-beige mt-2">Manage customer accounts and permissions</p>
        </div>
        <Button className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
          <UserPlus size={16} className="mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Total Users", value: users.length, color: "text-blue-400" },
          { title: "Active Users", value: users.filter((u) => u.status === "active").length, color: "text-green-400" },
          { title: "Suspended", value: users.filter((u) => u.status === "suspended").length, color: "text-red-400" },
          { title: "Admins", value: users.filter((u) => u.role === "admin").length, color: "text-purple-400" },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-[#111] border-[#333]">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-beige text-sm">{stat.title}</p>
                  <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
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
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black border-[#333] focus:border-[#D4AF37]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-black border border-[#333] rounded-md text-white focus:border-[#D4AF37]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user, index) => (
          <motion.div
            key={user._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-[#111] border-[#333] hover:border-[#D4AF37]/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-[#D4AF37] text-black">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                        {getStatusBadge(user.status)}
                        {user.role === "admin" && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-0">Admin</Badge>
                        )}
                        {user.role === "customer" && user.loyaltyTier && getLoyaltyBadge(user.loyaltyTier)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Mail size={14} className="text-gray-400" />
                          <span className="text-beige">{user.email}</span>
                        </div>

                        {user.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone size={14} className="text-gray-400" />
                            <span className="text-beige">{user.phone}</span>
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-beige">Joined {formatDate(user.createdAt)}</span>
                        </div>

                        {user.role === "customer" && (
                          <div className="text-beige">
                            {user.totalOrders || 0} orders • ${(user.totalSpent || 0).toFixed(2)} spent
                          </div>
                        )}
                      </div>

                      {user.role === "customer" && (
                        <div className="mt-3 p-3 bg-[#222] rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-beige">Loyalty Points</span>
                            <span className="text-[#D4AF37] font-medium">{user.loyaltyPoints || 0} pts</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="border-[#333]">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#111] border-[#333]">
                        <DropdownMenuItem>
                          <Edit size={16} className="mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        {user.status === "active" ? (
                          <DropdownMenuItem onClick={() => updateUserStatus(user._id, "suspended")}>
                            <Ban size={16} className="mr-2" />
                            Suspend User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => updateUserStatus(user._id, "active")}>
                            <CheckCircle size={16} className="mr-2" />
                            Activate User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => deleteUser(user._id)}
                          className="text-red-400 focus:text-red-400"
                        >
                          <Trash2 size={16} className="mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#111] border-[#333]">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>View Orders</DropdownMenuItem>
                        <DropdownMenuItem>Send Message</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
            <UserPlus size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No users found</h3>
            <p className="text-beige">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AdminUsers
