"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Eye, Package, Truck, CheckCircle, Clock, AlertCircle, MoreHorizontal, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

const AdminOrders = () => {
  const { toast } = useToast()
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [updatingOrder, setUpdatingOrder] = useState(null)

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/orders")
      const data = await response.json()

      if (data.success) {
        console.log("Fetched orders:", data.data)
        setOrders(data.data)
        setFilteredOrders(data.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch orders",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    let filtered = orders

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customer.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }, [searchQuery, statusFilter, orders])

  const getStatusIcon = (status) => {
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

  const getStatusBadge = (status) => {
    const variants = {
      pending: "bg-yellow-500/20 text-yellow-400",
      processing: "bg-blue-500/20 text-blue-400",
      shipped: "bg-purple-500/20 text-purple-400",
      delivered: "bg-green-500/20 text-green-400",
      cancelled: "bg-red-500/20 text-red-400",
    }

    return (
      <Badge className={`${variants[status]} border-0`}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    )
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId)
      console.log(`Updating order ${orderId} to status: ${newStatus}`)

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          trackingNumber: newStatus === "shipped" ? `TRK${Date.now()}` : undefined,
        }),
      })

      const data = await response.json()
      console.log("Update response:", data)

      if (data.success) {
        // Update local state immediately
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: newStatus,
                  trackingNumber: data.data.trackingNumber || order.trackingNumber,
                  updatedAt: new Date().toISOString(),
                }
              : order,
          ),
        )

        toast({
          title: "Order Updated",
          description: `Order ${orderId} status updated to ${newStatus}`,
        })

        // Refresh orders to ensure consistency
        setTimeout(() => {
          fetchOrders()
        }, 1000)
      } else {
        console.error("Update failed:", data)
        toast({
          title: "Error",
          description: data.error || "Failed to update order",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    } finally {
      setUpdatingOrder(null)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
          <h1 className="text-3xl font-bold gold-text">Orders Management</h1>
          <p className="text-beige mt-2">Track and manage customer orders</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={fetchOrders}
            disabled={loading}
            className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            Refresh Orders
          </Button>
          <Button className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
            <Download size={16} className="mr-2" />
            Export Orders
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Total Orders", value: orders.length, color: "text-blue-400" },
          { title: "Pending", value: orders.filter((o) => o.status === "pending").length, color: "text-yellow-400" },
          {
            title: "Processing",
            value: orders.filter((o) => o.status === "processing").length,
            color: "text-purple-400",
          },
          { title: "Delivered", value: orders.filter((o) => o.status === "delivered").length, color: "text-green-400" },
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
                placeholder="Search orders, customers..."
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
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-[#111] border-[#333] hover:border-[#D4AF37]/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h3 className="text-xl font-semibold text-white">{order.id}</h3>
                      {getStatusBadge(order.status)}
                      <Badge
                        className={`${order.paymentStatus === "paid" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"} border-0`}
                      >
                        {order.paymentStatus}
                      </Badge>
                      {updatingOrder === order.id && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-0">Updating...</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-beige">Customer</p>
                        <p className="text-white font-medium">{order.customer.name}</p>
                        <p className="text-gray-400">{order.customer.email}</p>
                      </div>

                      <div>
                        <p className="text-beige">Order Date</p>
                        <p className="text-white">{formatDate(order.createdAt)}</p>
                        <p className="text-gray-400">Updated: {formatDate(order.updatedAt)}</p>
                      </div>

                      <div>
                        <p className="text-beige">Items</p>
                        <p className="text-white">{order.items?.length || 0} item(s)</p>
                        <p className="text-gray-400">Total: ${order.total?.toFixed(2)}</p>
                      </div>
                    </div>

                    {order.trackingNumber && (
                      <div className="mt-3 p-3 bg-[#222] rounded-lg">
                        <p className="text-beige text-sm">Tracking Number</p>
                        <p className="text-white font-mono">{order.trackingNumber}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#333]"
                          disabled={updatingOrder === order.id}
                        >
                          {updatingOrder === order.id ? "Updating..." : "Update Status"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#111] border-[#333]">
                        <DropdownMenuItem
                          onClick={() => updateOrderStatus(order.id, "pending")}
                          disabled={order.status === "pending"}
                        >
                          <Clock size={16} className="mr-2" />
                          Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateOrderStatus(order.id, "processing")}
                          disabled={order.status === "processing"}
                        >
                          <Package size={16} className="mr-2" />
                          Processing
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateOrderStatus(order.id, "shipped")}
                          disabled={order.status === "shipped"}
                        >
                          <Truck size={16} className="mr-2" />
                          Shipped
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateOrderStatus(order.id, "delivered")}
                          disabled={order.status === "delivered"}
                        >
                          <CheckCircle size={16} className="mr-2" />
                          Delivered
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateOrderStatus(order.id, "cancelled")}
                          disabled={order.status === "cancelled"}
                          className="text-red-400"
                        >
                          <AlertCircle size={16} className="mr-2" />
                          Cancelled
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
                        <DropdownMenuItem>
                          <Eye size={16} className="mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download size={16} className="mr-2" />
                          Download Invoice
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card className="bg-[#111] border-[#333]">
          <CardContent className="p-12 text-center">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No orders found</h3>
            <p className="text-beige">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AdminOrders
