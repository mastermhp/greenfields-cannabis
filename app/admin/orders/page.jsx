"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Edit,
  X,
  Printer,
  CreditCard,
  DollarSign,
  Calendar,
  MapPin,
  User,
  ShoppingBag,
  ArrowUpDown,
  Save,
  Trash2,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const AdminOrders = () => {
  const { toast } = useToast()
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [updatingOrder, setUpdatingOrder] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [viewOrderDialog, setViewOrderDialog] = useState(false)
  const [editOrderDialog, setEditOrderDialog] = useState(false)
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" })
  const [editedOrder, setEditedOrder] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  // Fetch orders from API
  const fetchOrders = async () => {
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

      const response = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
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

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customer?.id?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Apply payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter((order) => order.paymentStatus === paymentFilter)
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date()
      let dateLimit = new Date()

      switch (dateFilter) {
        case "today":
          dateLimit.setHours(0, 0, 0, 0)
          break
        case "yesterday":
          dateLimit.setDate(dateLimit.getDate() - 1)
          dateLimit.setHours(0, 0, 0, 0)
          const yesterdayEnd = new Date(dateLimit)
          yesterdayEnd.setDate(yesterdayEnd.getDate() + 1)
          filtered = filtered.filter(
            (order) => new Date(order.createdAt) >= dateLimit && new Date(order.createdAt) < yesterdayEnd,
          )
          break
        case "last7days":
          dateLimit.setDate(dateLimit.getDate() - 7)
          break
        case "last30days":
          dateLimit.setDate(dateLimit.getDate() - 30)
          break
        case "thisMonth":
          dateLimit = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case "lastMonth":
          const lastMonth = now.getMonth() - 1
          const year = lastMonth < 0 ? now.getFullYear() - 1 : now.getFullYear()
          const month = lastMonth < 0 ? 11 : lastMonth
          dateLimit = new Date(year, month, 1)
          const lastMonthEnd = new Date(year, month + 1, 1)
          filtered = filtered.filter(
            (order) => new Date(order.createdAt) >= dateLimit && new Date(order.createdAt) < lastMonthEnd,
          )
          break
      }

      if (dateFilter !== "yesterday" && dateFilter !== "lastMonth") {
        filtered = filtered.filter((order) => new Date(order.createdAt) >= dateLimit)
      }
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortConfig.key === "total") {
        return sortConfig.direction === "asc" ? (a.total || 0) - (b.total || 0) : (b.total || 0) - (a.total || 0)
      }

      if (sortConfig.key === "items") {
        return sortConfig.direction === "asc"
          ? (a.items?.length || 0) - (b.items?.length || 0)
          : (b.items?.length || 0) - (a.items?.length || 0)
      }

      if (sortConfig.key === "createdAt" || sortConfig.key === "updatedAt") {
        return sortConfig.direction === "asc"
          ? new Date(a[sortConfig.key]) - new Date(b[sortConfig.key])
          : new Date(b[sortConfig.key]) - new Date(a[sortConfig.key])
      }

      // Default string comparison
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1
      }
      return 0
    })

    setFilteredOrders(filtered)
  }, [searchQuery, statusFilter, paymentFilter, dateFilter, orders, sortConfig])

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
      <Badge className={`${variants[status] || "bg-gray-500/20 text-gray-400"} border-0`}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status) => {
    const variants = {
      paid: "bg-green-500/20 text-green-400",
      pending: "bg-yellow-500/20 text-yellow-400",
      failed: "bg-red-500/20 text-red-400",
      refunded: "bg-blue-500/20 text-blue-400",
    }

    const icons = {
      paid: <DollarSign size={16} />,
      pending: <Clock size={16} />,
      failed: <AlertCircle size={16} />,
      refunded: <RefreshCw size={16} />,
    }

    return (
      <Badge className={`${variants[status] || "bg-gray-500/20 text-gray-400"} border-0`}>
        {icons[status] || <DollarSign size={16} />}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    )
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId)
      console.log(`Updating order ${orderId} to status: ${newStatus}`)

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

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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

        // If we're viewing this order, update the selected order too
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({
            ...selectedOrder,
            status: newStatus,
            trackingNumber: data.data.trackingNumber || selectedOrder.trackingNumber,
            updatedAt: new Date().toISOString(),
          })
        }

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

  const updatePaymentStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId)
      console.log(`Updating order ${orderId} payment status to: ${newStatus}`)

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

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          paymentStatus: newStatus,
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
                  paymentStatus: newStatus,
                  updatedAt: new Date().toISOString(),
                }
              : order,
          ),
        )

        toast({
          title: "Payment Status Updated",
          description: `Order ${orderId} payment status updated to ${newStatus}`,
        })

        // If we're viewing this order, update the selected order too
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({
            ...selectedOrder,
            paymentStatus: newStatus,
            updatedAt: new Date().toISOString(),
          })
        }

        // Refresh orders to ensure consistency
        setTimeout(() => {
          fetchOrders()
        }, 1000)
      } else {
        console.error("Update failed:", data)
        toast({
          title: "Error",
          description: data.error || "Failed to update payment status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      })
    } finally {
      setUpdatingOrder(null)
    }
  }

  const cancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      await updateOrderStatus(orderId, "cancelled")
    }
  }

  const viewOrder = (order) => {
    setSelectedOrder(order)
    setViewOrderDialog(true)
  }

  const editOrder = (order) => {
    setSelectedOrder(order)
    setEditedOrder({
      ...order,
      items: [...(order.items || [])],
      shippingAddress: { ...(order.shippingAddress || {}) },
      billingAddress: { ...(order.billingAddress || {}) },
    })
    setEditOrderDialog(true)
  }

  const handleSaveOrder = async () => {
    try {
      setIsUpdating(true)

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

      // Calculate new total based on items
      const subtotal = editedOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const tax = subtotal * (editedOrder.taxRate || 0.08)
      const shipping = editedOrder.shippingCost || 0
      const total = subtotal + tax + shipping

      const orderToUpdate = {
        ...editedOrder,
        subtotal,
        tax,
        total,
        updatedAt: new Date().toISOString(),
      }

      // Remove _id field to avoid MongoDB immutable field error
      if (orderToUpdate._id) {
        delete orderToUpdate._id
      }

      const response = await fetch(`/api/orders/${editedOrder.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(orderToUpdate),
      })

      const data = await response.json()

      if (data.success) {
        // Update local state
        setOrders((prevOrders) =>
          prevOrders.map((order) => (order.id === editedOrder.id ? { ...orderToUpdate } : order)),
        )

        toast({
          title: "Order Updated",
          description: `Order ${editedOrder.id} has been updated successfully`,
        })

        setEditOrderDialog(false)

        // Refresh orders
        fetchOrders()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update order",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving order:", error)
      toast({
        title: "Error",
        description: "Failed to save order changes",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const updateItemQuantity = (index, quantity) => {
    const newItems = [...editedOrder.items]
    newItems[index] = {
      ...newItems[index],
      quantity: Number.parseInt(quantity) || 1,
    }

    setEditedOrder({
      ...editedOrder,
      items: newItems,
    })
  }

  const removeItem = (index) => {
    const newItems = [...editedOrder.items]
    newItems.splice(index, 1)

    setEditedOrder({
      ...editedOrder,
      items: newItems,
    })
  }

  const printInvoice = (order) => {
    // Create a printable invoice
    const printWindow = window.open("", "_blank")
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 5px; color: #D4AF37; }
            .order-info { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
            .addresses { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .address-block { width: 45%; }
            .payment-info { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Greenfields Cannabis</div>
            <h2>Invoice</h2>
          </div>
          
          <div class="order-info">
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
            ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ""}
          </div>
          
          <div class="addresses">
            <div class="address-block">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> ${order.customer?.name || "N/A"}</p>
              <p><strong>Email:</strong> ${order.customer?.email || "N/A"}</p>
              <p><strong>Phone:</strong> ${order.customer?.phone || "N/A"}</p>
              <p><strong>Customer ID:</strong> ${order.customer?.id || "N/A"}</p>
            </div>
            
            <div class="address-block">
              <h3>Shipping Address</h3>
              ${
                order.shippingAddress
                  ? `
                <p>${order.shippingAddress.street || ""}</p>
                <p>${order.shippingAddress.city || ""}, ${order.shippingAddress.state || ""} ${order.shippingAddress.zip || ""}</p>
                <p>${order.shippingAddress.country || ""}</p>
              `
                  : "<p>No shipping address provided</p>"
              }
            </div>
          </div>
          
          <h3>Order Items</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${
                order.items
                  ?.map(
                    (item) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price?.toFixed(2)}</td>
                  <td>$${(item.price * item.quantity)?.toFixed(2)}</td>
                </tr>
              `,
                  )
                  .join("") || ""
              }
            </tbody>
          </table>
          
          <div class="payment-info">
            <h3>Payment Information</h3>
            <p><strong>Payment Method:</strong> ${order.paymentMethod || "N/A"}</p>
            <p><strong>Payment ID:</strong> ${order.paymentId || "N/A"}</p>
          </div>
          
          <div class="total">
            <p><strong>Subtotal:</strong> $${(order.subtotal || 0).toFixed(2)}</p>
            <p><strong>Tax:</strong> $${(order.tax || 0).toFixed(2)}</p>
            <p><strong>Shipping:</strong> $${(order.shippingCost || 0).toFixed(2)}</p>
            <p style="font-size: 18px;"><strong>Total: $${order.total?.toFixed(2)}</strong></p>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Greenfields Cannabis | 123 Cannabis Street, Green Valley, CA 90210 | info@greenfields.com | (555) 123-4567</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 500)
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

  const handleSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown size={14} className="ml-1 text-gray-400" />
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUpDown size={14} className="ml-1 text-[#D4AF37]" />
    ) : (
      <ArrowUpDown size={14} className="ml-1 text-[#D4AF37]" />
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
            <RefreshCw size={16} className="mr-2" />
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
          {
            title: "Total Orders",
            value: orders.length,
            color: "text-blue-400",
            icon: <ShoppingBag className="h-8 w-8 text-blue-400" />,
          },
          {
            title: "Pending",
            value: orders.filter((o) => o.status === "pending").length,
            color: "text-yellow-400",
            icon: <Clock className="h-8 w-8 text-yellow-400" />,
          },
          {
            title: "Processing",
            value: orders.filter((o) => o.status === "processing").length,
            color: "text-purple-400",
            icon: <Package className="h-8 w-8 text-purple-400" />,
          },
          {
            title: "Delivered",
            value: orders.filter((o) => o.status === "delivered").length,
            color: "text-green-400",
            icon: <CheckCircle className="h-8 w-8 text-green-400" />,
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
                placeholder="Search orders, customers, customer ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black border-[#333] focus:border-[#D4AF37]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-black border-[#333]">
                  <SelectValue placeholder="Order Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-[#333]">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-[140px] bg-black border-[#333]">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-[#333]">
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[140px] bg-black border-[#333]">
                  <SelectValue placeholder="Date Filter" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-[#333]">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("all")
                  setPaymentFilter("all")
                  setDateFilter("all")
                }}
                className="border-[#333] hover:bg-[#222] hover:text-[#D4AF37]"
              >
                <X size={16} />
              </Button>
            </div>
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
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-white">{order.id}</h3>
                      {getStatusBadge(order.status)}
                      {getPaymentStatusBadge(order.paymentStatus || "pending")}
                      {updatingOrder === order.id && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-0">Updating...</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-beige">Customer</p>
                        <p className="text-white font-medium">{order.customer?.name || "Guest"}</p>
                        <p className="text-gray-400">{order.customer?.email || "No email"}</p>
                      </div>

                      <div>
                        <p className="text-beige">Customer ID</p>
                        <p className="text-white font-mono text-xs">{order.customer?.id || "N/A"}</p>
                        <p className="text-gray-400">Order Date: {formatDate(order.createdAt)}</p>
                      </div>

                      <div>
                        <p className="text-beige">Order Details</p>
                        <p className="text-white">{order.items?.length || 0} item(s)</p>
                        <p className="text-[#D4AF37] font-medium">Total: ${order.total?.toFixed(2)}</p>
                      </div>

                      <div>
                        <p className="text-beige">Last Updated</p>
                        <p className="text-white">{formatDate(order.updatedAt || order.createdAt)}</p>
                        {order.trackingNumber && <p className="text-gray-400 text-xs">Track: {order.trackingNumber}</p>}
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
                          className="hover:bg-[#222]"
                        >
                          <Clock size={16} className="mr-2 text-yellow-400" />
                          Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateOrderStatus(order.id, "processing")}
                          disabled={order.status === "processing"}
                          className="hover:bg-[#222]"
                        >
                          <Package size={16} className="mr-2 text-blue-400" />
                          Processing
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateOrderStatus(order.id, "shipped")}
                          disabled={order.status === "shipped"}
                          className="hover:bg-[#222]"
                        >
                          <Truck size={16} className="mr-2 text-purple-400" />
                          Shipped
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateOrderStatus(order.id, "delivered")}
                          disabled={order.status === "delivered"}
                          className="hover:bg-[#222]"
                        >
                          <CheckCircle size={16} className="mr-2 text-green-400" />
                          Delivered
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateOrderStatus(order.id, "cancelled")}
                          disabled={order.status === "cancelled"}
                          className="text-red-400 hover:bg-[#222]"
                        >
                          <AlertCircle size={16} className="mr-2" />
                          Cancelled
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#333]"
                          disabled={updatingOrder === order.id}
                        >
                          Payment
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#111] border-[#333]">
                        <DropdownMenuItem
                          onClick={() => updatePaymentStatus(order.id, "paid")}
                          disabled={order.paymentStatus === "paid"}
                          className="hover:bg-[#222]"
                        >
                          <DollarSign size={16} className="mr-2 text-green-400" />
                          Paid
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updatePaymentStatus(order.id, "pending")}
                          disabled={order.paymentStatus === "pending"}
                          className="hover:bg-[#222]"
                        >
                          <Clock size={16} className="mr-2 text-yellow-400" />
                          Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updatePaymentStatus(order.id, "failed")}
                          disabled={order.paymentStatus === "failed"}
                          className="hover:bg-[#222]"
                        >
                          <AlertCircle size={16} className="mr-2 text-red-400" />
                          Failed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updatePaymentStatus(order.id, "refunded")}
                          disabled={order.paymentStatus === "refunded"}
                          className="hover:bg-[#222]"
                        >
                          <RefreshCw size={16} className="mr-2 text-blue-400" />
                          Refunded
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="border-[#333]">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#111] border-[#333]">
                        <DropdownMenuItem onClick={() => viewOrder(order)} className="hover:bg-[#222]">
                          <Eye size={16} className="mr-2" />
                          View Order
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editOrder(order)} className="hover:bg-[#222]">
                          <Edit size={16} className="mr-2" />
                          Edit Order
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => printInvoice(order)} className="hover:bg-[#222]">
                          <Printer size={16} className="mr-2" />
                          Print Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => cancelOrder(order.id)}
                          disabled={order.status === "cancelled" || order.status === "delivered"}
                          className="text-red-400 hover:bg-[#222]"
                        >
                          <X size={16} className="mr-2" />
                          Cancel Order
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

      {/* View Order Dialog */}
      <Dialog open={viewOrderDialog} onOpenChange={setViewOrderDialog}>
        <DialogContent className="bg-[#111] border border-[#333] text-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <ShoppingBag className="mr-2" size={20} />
              Order Details
              <Badge className="ml-3">{selectedOrder?.id}</Badge>
            </DialogTitle>
            <DialogDescription className="text-beige">
              Created on {selectedOrder && formatDate(selectedOrder.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-[#222] border border-[#333]">
                  <TabsTrigger
                    value="details"
                    className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                  >
                    Order Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="customer"
                    className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                  >
                    Customer Info
                  </TabsTrigger>
                  <TabsTrigger
                    value="shipping"
                    className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                  >
                    Shipping & Payment
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                  >
                    Order History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-4 space-y-4">
                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-[#222] p-3 rounded-lg flex-1">
                      <p className="text-sm text-beige mb-1">Order Status</p>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                    <div className="bg-[#222] p-3 rounded-lg flex-1">
                      <p className="text-sm text-beige mb-1">Payment Status</p>
                      {getPaymentStatusBadge(selectedOrder.paymentStatus || "pending")}
                    </div>
                    <div className="bg-[#222] p-3 rounded-lg flex-1">
                      <p className="text-sm text-beige mb-1">Last Updated</p>
                      <p className="text-white text-sm">
                        {formatDate(selectedOrder.updatedAt || selectedOrder.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="bg-[#222] p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <ShoppingBag size={16} className="mr-2" />
                      Order Items ({selectedOrder.items?.length || 0})
                    </h3>
                    <div className="border border-[#333] rounded">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#333] bg-[#1a1a1a]">
                            <th className="text-left p-3">Item</th>
                            <th className="text-center p-3">Qty</th>
                            <th className="text-right p-3">Price</th>
                            <th className="text-right p-3">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.items?.map((item, index) => (
                            <tr key={index} className="border-b border-[#333]">
                              <td className="p-3">
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  {item.variant && <p className="text-xs text-beige">{item.variant}</p>}
                                  {item.sku && <p className="text-xs text-gray-400">SKU: {item.sku}</p>}
                                </div>
                              </td>
                              <td className="p-3 text-center">{item.quantity}</td>
                              <td className="p-3 text-right">${item.price?.toFixed(2)}</td>
                              <td className="p-3 text-right">${(item.price * item.quantity)?.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Order Totals */}
                  <div className="bg-[#222] p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <DollarSign size={16} className="mr-2" />
                      Order Summary
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-beige">Subtotal:</span>
                        <span>${(selectedOrder.subtotal || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-beige">Tax:</span>
                        <span>${(selectedOrder.tax || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-beige">Shipping:</span>
                        <span>${(selectedOrder.shippingCost || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t border-[#333] pt-2 mt-2">
                        <span className="font-bold">Total:</span>
                        <span className="font-bold text-[#D4AF37]">${selectedOrder.total?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Information */}
                  {selectedOrder.trackingNumber && (
                    <div className="bg-[#222] p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 flex items-center">
                        <Truck size={16} className="mr-2" />
                        Tracking Information
                      </h3>
                      <p className="text-beige">
                        Tracking Number: <span className="text-white font-mono">{selectedOrder.trackingNumber}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Shipped on {selectedOrder.shippedAt ? formatDate(selectedOrder.shippedAt) : "N/A"}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="customer" className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer Information */}
                    <div className="bg-[#222] p-4 rounded-lg">
                      <h3 className="font-semibold mb-3 flex items-center">
                        <User size={16} className="mr-2" />
                        Customer Information
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-beige">Name:</span>
                          <span>{selectedOrder.customer?.name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-beige">Email:</span>
                          <span>{selectedOrder.customer?.email || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-beige">Phone:</span>
                          <span>{selectedOrder.customer?.phone || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-beige">Customer ID:</span>
                          <span className="font-mono text-xs">{selectedOrder.customer?.id || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Notes */}
                    <div className="bg-[#222] p-4 rounded-lg">
                      <h3 className="font-semibold mb-3">Customer Notes</h3>
                      <p className="text-beige italic">
                        {selectedOrder.customerNotes || "No notes provided by customer"}
                      </p>
                    </div>
                  </div>

                  {/* Customer Order History */}
                  <div className="bg-[#222] p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Customer Order History</h3>
                    <p className="text-beige text-sm">
                      This is the customer's order. View their profile for complete order history.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 border-[#333]"
                      onClick={() => {
                        // This would navigate to the customer profile
                        toast({
                          title: "Feature Coming Soon",
                          description: "Customer profile view will be available in the next update.",
                        })
                      }}
                    >
                      View Customer Profile
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="shipping" className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Shipping Address */}
                    <div className="bg-[#222] p-4 rounded-lg">
                      <h3 className="font-semibold mb-3 flex items-center">
                        <MapPin size={16} className="mr-2" />
                        Shipping Address
                      </h3>
                      {selectedOrder.shippingAddress ? (
                        <div className="space-y-1">
                          <p>{selectedOrder.shippingAddress.name || selectedOrder.customer?.name}</p>
                          <p>{selectedOrder.shippingAddress.street}</p>
                          <p>
                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{" "}
                            {selectedOrder.shippingAddress.zip}
                          </p>
                          <p>{selectedOrder.shippingAddress.country}</p>
                          {selectedOrder.shippingAddress.phone && <p>Phone: {selectedOrder.shippingAddress.phone}</p>}
                        </div>
                      ) : (
                        <p className="text-beige">No shipping address provided</p>
                      )}
                    </div>

                    {/* Billing Address */}
                    <div className="bg-[#222] p-4 rounded-lg">
                      <h3 className="font-semibold mb-3 flex items-center">
                        <CreditCard size={16} className="mr-2" />
                        Billing Address
                      </h3>
                      {selectedOrder.billingAddress ? (
                        <div className="space-y-1">
                          <p>{selectedOrder.billingAddress.name || selectedOrder.customer?.name}</p>
                          <p>{selectedOrder.billingAddress.street}</p>
                          <p>
                            {selectedOrder.billingAddress.city}, {selectedOrder.billingAddress.state}{" "}
                            {selectedOrder.billingAddress.zip}
                          </p>
                          <p>{selectedOrder.billingAddress.country}</p>
                          {selectedOrder.billingAddress.phone && <p>Phone: {selectedOrder.billingAddress.phone}</p>}
                        </div>
                      ) : selectedOrder.shippingAddress ? (
                        <div>
                          <p className="text-beige italic mb-2">Same as shipping address</p>
                          <div className="space-y-1">
                            <p>{selectedOrder.shippingAddress.name || selectedOrder.customer?.name}</p>
                            <p>{selectedOrder.shippingAddress.street}</p>
                            <p>
                              {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{" "}
                              {selectedOrder.shippingAddress.zip}
                            </p>
                            <p>{selectedOrder.shippingAddress.country}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-beige">No billing address provided</p>
                      )}
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="bg-[#222] p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <DollarSign size={16} className="mr-2" />
                      Payment Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-beige">Payment Method:</span>
                        <span className="capitalize">{selectedOrder.paymentMethod || "N/A"}</span>
                      </div>
                      {selectedOrder.paymentId && (
                        <div className="flex justify-between">
                          <span className="text-beige">Payment ID:</span>
                          <span className="font-mono text-xs">{selectedOrder.paymentId}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-beige">Payment Status:</span>
                        <span>{getPaymentStatusBadge(selectedOrder.paymentStatus || "pending")}</span>
                      </div>
                      {selectedOrder.paymentDate && (
                        <div className="flex justify-between">
                          <span className="text-beige">Payment Date:</span>
                          <span>{formatDate(selectedOrder.paymentDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipping Method */}
                  <div className="bg-[#222] p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <Truck size={16} className="mr-2" />
                      Shipping Method
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-beige">Method:</span>
                        <span className="capitalize">{selectedOrder.shippingMethod || "Standard"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-beige">Cost:</span>
                        <span>${(selectedOrder.shippingCost || 0).toFixed(2)}</span>
                      </div>
                      {selectedOrder.estimatedDelivery && (
                        <div className="flex justify-between">
                          <span className="text-beige">Estimated Delivery:</span>
                          <span>{selectedOrder.estimatedDelivery}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-4 space-y-4">
                  {/* Order Timeline */}
                  <div className="bg-[#222] p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <Calendar size={16} className="mr-2" />
                      Order Timeline
                    </h3>
                    <div className="space-y-4">
                      <div className="flex">
                        <div className="mr-4 relative">
                          <div className="w-4 h-4 rounded-full bg-green-400"></div>
                          <div className="absolute top-4 bottom-0 left-1/2 w-0.5 bg-[#333] -translate-x-1/2"></div>
                        </div>
                        <div>
                          <p className="font-medium">Order Created</p>
                          <p className="text-sm text-beige">{formatDate(selectedOrder.createdAt)}</p>
                          <p className="text-xs text-gray-400 mt-1">Order #{selectedOrder.id} was created</p>
                        </div>
                      </div>

                      {selectedOrder.status !== "pending" && (
                        <div className="flex">
                          <div className="mr-4 relative">
                            <div className="w-4 h-4 rounded-full bg-blue-400"></div>
                            <div className="absolute top-4 bottom-0 left-1/2 w-0.5 bg-[#333] -translate-x-1/2"></div>
                          </div>
                          <div>
                            <p className="font-medium">Order Processing</p>
                            <p className="text-sm text-beige">
                              {selectedOrder.processingDate
                                ? formatDate(selectedOrder.processingDate)
                                : "Date not recorded"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Order status changed to processing</p>
                          </div>
                        </div>
                      )}

                      {(selectedOrder.status === "shipped" || selectedOrder.status === "delivered") && (
                        <div className="flex">
                          <div className="mr-4 relative">
                            <div className="w-4 h-4 rounded-full bg-purple-400"></div>
                            <div className="absolute top-4 bottom-0 left-1/2 w-0.5 bg-[#333] -translate-x-1/2"></div>
                          </div>
                          <div>
                            <p className="font-medium">Order Shipped</p>
                            <p className="text-sm text-beige">
                              {selectedOrder.shippedAt ? formatDate(selectedOrder.shippedAt) : "Date not recorded"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Order was shipped
                              {selectedOrder.trackingNumber
                                ? ` with tracking number ${selectedOrder.trackingNumber}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedOrder.status === "delivered" && (
                        <div className="flex">
                          <div className="mr-4">
                            <div className="w-4 h-4 rounded-full bg-green-400"></div>
                          </div>
                          <div>
                            <p className="font-medium">Order Delivered</p>
                            <p className="text-sm text-beige">
                              {selectedOrder.deliveredAt ? formatDate(selectedOrder.deliveredAt) : "Date not recorded"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Order was successfully delivered</p>
                          </div>
                        </div>
                      )}

                      {selectedOrder.status === "cancelled" && (
                        <div className="flex">
                          <div className="mr-4">
                            <div className="w-4 h-4 rounded-full bg-red-400"></div>
                          </div>
                          <div>
                            <p className="font-medium">Order Cancelled</p>
                            <p className="text-sm text-beige">
                              {selectedOrder.cancelledAt ? formatDate(selectedOrder.cancelledAt) : "Date not recorded"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Order was cancelled
                              {selectedOrder.cancellationReason ? ` - ${selectedOrder.cancellationReason}` : ""}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Admin Notes */}
                  <div className="bg-[#222] p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Admin Notes</h3>
                    <div className="space-y-2">
                      {selectedOrder.adminNotes ? (
                        <p className="text-beige">{selectedOrder.adminNotes}</p>
                      ) : (
                        <p className="text-gray-400 italic">No admin notes for this order</p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#333]"
                        onClick={() => {
                          // This would open a dialog to add/edit admin notes
                          toast({
                            title: "Feature Coming Soon",
                            description: "Admin notes editing will be available in the next update.",
                          })
                        }}
                      >
                        Add/Edit Notes
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => selectedOrder && printInvoice(selectedOrder)}
                className="border-[#333]"
              >
                <Printer size={16} className="mr-2" />
                Print Invoice
              </Button>
              <Button
                variant="outline"
                onClick={() => selectedOrder && editOrder(selectedOrder)}
                className="border-[#333]"
              >
                <Edit size={16} className="mr-2" />
                Edit Order
              </Button>
            </div>
            <Button onClick={() => setViewOrderDialog(false)} className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={editOrderDialog} onOpenChange={setEditOrderDialog}>
        <DialogContent className="bg-[#111] border border-[#333] text-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <Edit className="mr-2" size={20} />
              Edit Order
              <Badge className="ml-3">{editedOrder?.id}</Badge>
            </DialogTitle>
            <DialogDescription className="text-beige">
              Make changes to the order details. Be careful when modifying order information.
            </DialogDescription>
          </DialogHeader>

          {editedOrder && (
            <div className="space-y-6">
              <Tabs defaultValue="items" className="w-full">
                <TabsList className="bg-[#222] border border-[#333]">
                  <TabsTrigger
                    value="items"
                    className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                  >
                    Order Items
                  </TabsTrigger>
                  <TabsTrigger
                    value="addresses"
                    className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                  >
                    Addresses
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                  >
                    Order Settings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="items" className="mt-4 space-y-4">
                  <div className="bg-[#222] p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Order Items</h3>
                    <div className="space-y-3">
                      {editedOrder.items?.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-[#1a1a1a] rounded">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-beige">${item.price?.toFixed(2)} each</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={`qty-${index}`} className="text-sm">
                              Qty:
                            </Label>
                            <Input
                              id={`qty-${index}`}
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(index, e.target.value)}
                              className="w-20 bg-black border-[#333]"
                            />
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${(item.price * item.quantity)?.toFixed(2)}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="border-red-500 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Order Totals */}
                    <div className="mt-4 p-3 bg-[#1a1a1a] rounded">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>
                            ${editedOrder.items?.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>
                            $
                            {(
                              editedOrder.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) *
                              (editedOrder.taxRate || 0.08)
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping:</span>
                          <span>${(editedOrder.shippingCost || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-[#333] pt-2 font-bold">
                          <span>Total:</span>
                          <span className="text-[#D4AF37]">
                            $
                            {(
                              editedOrder.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) +
                              editedOrder.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) *
                                (editedOrder.taxRate || 0.08) +
                              (editedOrder.shippingCost || 0)
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="addresses" className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Shipping Address */}
                    <div className="bg-[#222] p-4 rounded-lg">
                      <h3 className="font-semibold mb-3">Shipping Address</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="shipping-name">Full Name</Label>
                          <Input
                            id="shipping-name"
                            value={editedOrder.shippingAddress?.name || ""}
                            onChange={(e) =>
                              setEditedOrder({
                                ...editedOrder,
                                shippingAddress: {
                                  ...editedOrder.shippingAddress,
                                  name: e.target.value,
                                },
                              })
                            }
                            className="bg-black border-[#333]"
                          />
                        </div>
                        <div>
                          <Label htmlFor="shipping-street">Street Address</Label>
                          <Input
                            id="shipping-street"
                            value={editedOrder.shippingAddress?.street || ""}
                            onChange={(e) =>
                              setEditedOrder({
                                ...editedOrder,
                                shippingAddress: {
                                  ...editedOrder.shippingAddress,
                                  street: e.target.value,
                                },
                              })
                            }
                            className="bg-black border-[#333]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="shipping-city">City</Label>
                            <Input
                              id="shipping-city"
                              value={editedOrder.shippingAddress?.city || ""}
                              onChange={(e) =>
                                setEditedOrder({
                                  ...editedOrder,
                                  shippingAddress: {
                                    ...editedOrder.shippingAddress,
                                    city: e.target.value,
                                  },
                                })
                              }
                              className="bg-black border-[#333]"
                            />
                          </div>
                          <div>
                            <Label htmlFor="shipping-state">State</Label>
                            <Input
                              id="shipping-state"
                              value={editedOrder.shippingAddress?.state || ""}
                              onChange={(e) =>
                                setEditedOrder({
                                  ...editedOrder,
                                  shippingAddress: {
                                    ...editedOrder.shippingAddress,
                                    state: e.target.value,
                                  },
                                })
                              }
                              className="bg-black border-[#333]"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="shipping-zip">ZIP Code</Label>
                            <Input
                              id="shipping-zip"
                              value={editedOrder.shippingAddress?.zip || ""}
                              onChange={(e) =>
                                setEditedOrder({
                                  ...editedOrder,
                                  shippingAddress: {
                                    ...editedOrder.shippingAddress,
                                    zip: e.target.value,
                                  },
                                })
                              }
                              className="bg-black border-[#333]"
                            />
                          </div>
                          <div>
                            <Label htmlFor="shipping-country">Country</Label>
                            <Input
                              id="shipping-country"
                              value={editedOrder.shippingAddress?.country || ""}
                              onChange={(e) =>
                                setEditedOrder({
                                  ...editedOrder,
                                  shippingAddress: {
                                    ...editedOrder.shippingAddress,
                                    country: e.target.value,
                                  },
                                })
                              }
                              className="bg-black border-[#333]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Billing Address */}
                    <div className="bg-[#222] p-4 rounded-lg">
                      <h3 className="font-semibold mb-3">Billing Address</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="billing-name">Full Name</Label>
                          <Input
                            id="billing-name"
                            value={editedOrder.billingAddress?.name || ""}
                            onChange={(e) =>
                              setEditedOrder({
                                ...editedOrder,
                                billingAddress: {
                                  ...editedOrder.billingAddress,
                                  name: e.target.value,
                                },
                              })
                            }
                            className="bg-black border-[#333]"
                          />
                        </div>
                        <div>
                          <Label htmlFor="billing-street">Street Address</Label>
                          <Input
                            id="billing-street"
                            value={editedOrder.billingAddress?.street || ""}
                            onChange={(e) =>
                              setEditedOrder({
                                ...editedOrder,
                                billingAddress: {
                                  ...editedOrder.billingAddress,
                                  street: e.target.value,
                                },
                              })
                            }
                            className="bg-black border-[#333]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="billing-city">City</Label>
                            <Input
                              id="billing-city"
                              value={editedOrder.billingAddress?.city || ""}
                              onChange={(e) =>
                                setEditedOrder({
                                  ...editedOrder,
                                  billingAddress: {
                                    ...editedOrder.billingAddress,
                                    city: e.target.value,
                                  },
                                })
                              }
                              className="bg-black border-[#333]"
                            />
                          </div>
                          <div>
                            <Label htmlFor="billing-state">State</Label>
                            <Input
                              id="billing-state"
                              value={editedOrder.billingAddress?.state || ""}
                              onChange={(e) =>
                                setEditedOrder({
                                  ...editedOrder,
                                  billingAddress: {
                                    ...editedOrder.billingAddress,
                                    state: e.target.value,
                                  },
                                })
                              }
                              className="bg-black border-[#333]"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="billing-zip">ZIP Code</Label>
                            <Input
                              id="billing-zip"
                              value={editedOrder.billingAddress?.zip || ""}
                              onChange={(e) =>
                                setEditedOrder({
                                  ...editedOrder,
                                  billingAddress: {
                                    ...editedOrder.billingAddress,
                                    zip: e.target.value,
                                  },
                                })
                              }
                              className="bg-black border-[#333]"
                            />
                          </div>
                          <div>
                            <Label htmlFor="billing-country">Country</Label>
                            <Input
                              id="billing-country"
                              value={editedOrder.billingAddress?.country || ""}
                              onChange={(e) =>
                                setEditedOrder({
                                  ...editedOrder,
                                  billingAddress: {
                                    ...editedOrder.billingAddress,
                                    country: e.target.value,
                                  },
                                })
                              }
                              className="bg-black border-[#333]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Order Status */}
                    <div className="bg-[#222] p-4 rounded-lg">
                      <h3 className="font-semibold mb-3">Order Status</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="order-status">Status</Label>
                          <Select
                            value={editedOrder.status}
                            onValueChange={(value) =>
                              setEditedOrder({
                                ...editedOrder,
                                status: value,
                              })
                            }
                          >
                            <SelectTrigger className="bg-black border-[#333]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#111] border-[#333]">
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="payment-status">Payment Status</Label>
                          <Select
                            value={editedOrder.paymentStatus || "pending"}
                            onValueChange={(value) =>
                              setEditedOrder({
                                ...editedOrder,
                                paymentStatus: value,
                              })
                            }
                          >
                            <SelectTrigger className="bg-black border-[#333]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#111] border-[#333]">
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                              <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="tracking-number">Tracking Number</Label>
                          <Input
                            id="tracking-number"
                            value={editedOrder.trackingNumber || ""}
                            onChange={(e) =>
                              setEditedOrder({
                                ...editedOrder,
                                trackingNumber: e.target.value,
                              })
                            }
                            className="bg-black border-[#333]"
                            placeholder="Enter tracking number"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Shipping & Costs */}
                    <div className="bg-[#222] p-4 rounded-lg">
                      <h3 className="font-semibold mb-3">Shipping & Costs</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="shipping-method">Shipping Method</Label>
                          <Select
                            value={editedOrder.shippingMethod || "standard"}
                            onValueChange={(value) =>
                              setEditedOrder({
                                ...editedOrder,
                                shippingMethod: value,
                              })
                            }
                          >
                            <SelectTrigger className="bg-black border-[#333]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#111] border-[#333]">
                              <SelectItem value="standard">Standard Shipping</SelectItem>
                              <SelectItem value="express">Express Shipping</SelectItem>
                              <SelectItem value="overnight">Overnight Shipping</SelectItem>
                              <SelectItem value="pickup">Store Pickup</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="shipping-cost">Shipping Cost</Label>
                          <Input
                            id="shipping-cost"
                            type="number"
                            step="0.01"
                            min="0"
                            value={editedOrder.shippingCost || 0}
                            onChange={(e) =>
                              setEditedOrder({
                                ...editedOrder,
                                shippingCost: Number.parseFloat(e.target.value) || 0,
                              })
                            }
                            className="bg-black border-[#333]"
                          />
                        </div>
                        <div>
                          <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                          <Input
                            id="tax-rate"
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            value={editedOrder.taxRate || 0.08}
                            onChange={(e) =>
                              setEditedOrder({
                                ...editedOrder,
                                taxRate: Number.parseFloat(e.target.value) || 0.08,
                              })
                            }
                            className="bg-black border-[#333]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="bg-[#222] p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Order Notes</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="customer-notes">Customer Notes</Label>
                        <Textarea
                          id="customer-notes"
                          value={editedOrder.customerNotes || ""}
                          onChange={(e) =>
                            setEditedOrder({
                              ...editedOrder,
                              customerNotes: e.target.value,
                            })
                          }
                          className="bg-black border-[#333]"
                          placeholder="Notes from customer..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="admin-notes">Admin Notes</Label>
                        <Textarea
                          id="admin-notes"
                          value={editedOrder.adminNotes || ""}
                          onChange={(e) =>
                            setEditedOrder({
                              ...editedOrder,
                              adminNotes: e.target.value,
                            })
                          }
                          className="bg-black border-[#333]"
                          placeholder="Internal notes for staff..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setEditOrderDialog(false)}
              disabled={isUpdating}
              className="border-[#333]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveOrder}
              disabled={isUpdating}
              className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
            >
              {isUpdating ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminOrders
