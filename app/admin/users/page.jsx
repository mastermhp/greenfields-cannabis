"use client"

import { useState, useEffect } from "react"
import {
  User,
  Ban,
  CheckCircle,
  AlertCircle,
  Clock,
  Package,
  Truck,
  Crown,
  Shield,
  FileText,
  ImageIcon,
  PlusCircle,
  X,
  RefreshCw,
  ShoppingBag,
  Upload,
  Eye,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const AdminUsersComponent = () => {
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

  const [addUserDialog, setAddUserDialog] = useState(false)
  const [addUserForm, setAddUserForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    status: "active",
  })
  const [addingUser, setAddingUser] = useState(false)

  const [selectedAttachment, setSelectedAttachment] = useState(null)
  const [userAttachments, setUserAttachments] = useState([])
  const [loadingAttachments, setLoadingAttachments] = useState(false)
  const [manualOrderDialog, setManualOrderDialog] = useState(false)
  const [manualOrderForm, setManualOrderForm] = useState({
    items: [{ productId: "", product: null, quantity: 1 }],
    shippingAddress: "",
    notes: "",
    paymentMethod: "cash",
  })
  const [creatingOrder, setCreatingOrder] = useState(false)
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [uploadingDocument, setUploadingDocument] = useState(false)
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState("")
  const [documentPreviewDialog, setDocumentPreviewDialog] = useState(false)

  // Fix the fetchProducts function to properly handle the response data
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true)
      const accessToken = localStorage.getItem("accessToken")

      const response = await fetch("/api/products", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const data = await response.json()

      // Fix: Check for products array in the response
      if (data.success && data.products) {
        console.log("Fetched products:", data.products.length)
        setProducts(data.products)
      } else {
        console.error("No products found in response:", data)
        setProducts([])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      setProducts([])
    } finally {
      setLoadingProducts(false)
    }
  }

  const addOrderItem = () => {
    setManualOrderForm((prev) => ({
      ...prev,
      items: [...prev.items, { productId: "", product: null, quantity: 1 }],
    }))
  }

  const removeOrderItem = (index) => {
    setManualOrderForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const updateOrderItem = (index, field, value) => {
    setManualOrderForm((prev) => {
      const newItems = [...prev.items]
      if (field === "productId") {
        const selectedProduct = products.find((p) => p.id === value)
        newItems[index] = {
          ...newItems[index],
          productId: value,
          product: selectedProduct,
        }
      } else {
        newItems[index] = {
          ...newItems[index],
          [field]: value,
        }
      }
      return {
        ...prev,
        items: newItems,
      }
    })
  }

  const calculateOrderTotal = () => {
    return manualOrderForm.items.reduce((total, item) => {
      if (item.product) {
        return total + item.product.price * item.quantity
      }
      return total
    }, 0)
  }

  const createManualOrder = async () => {
    try {
      setCreatingOrder(true)
      const accessToken = localStorage.getItem("accessToken")

      // Validate that all items have products selected
      const validItems = manualOrderForm.items.filter((item) => item.product && item.quantity > 0)

      if (validItems.length === 0) {
        toast({
          title: "Error",
          description: "Please select at least one product",
          variant: "destructive",
        })
        return
      }

      const subtotal = validItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      const tax = subtotal * 0.08 // 8% tax
      const shipping = 0 // Free shipping for manual orders
      const total = subtotal + tax + shipping

      const orderData = {
        customer: {
          id: selectedUser.id,
          name: selectedUser.name,
          email: selectedUser.email,
          phone: selectedUser.phone || "",
        },
        items: validItems.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          category: item.product.category,
          sku: item.product.sku || "",
          image: item.product.images?.[0] || "",
        })),
        subtotal,
        tax,
        shipping,
        total,
        shippingAddress: {
          street: manualOrderForm.shippingAddress || selectedUser.street || "",
          city: selectedUser.city || "",
          state: selectedUser.state || "",
          zip: selectedUser.zip || "",
          country: "United States",
          name: selectedUser.name,
        },
        billingAddress: {
          street: selectedUser.street || "",
          city: selectedUser.city || "",
          state: selectedUser.state || "",
          zip: selectedUser.zip || "",
          country: "United States",
          name: selectedUser.name,
        },
        paymentMethod: manualOrderForm.paymentMethod,
        paymentStatus: "paid", // Manual orders are considered paid
        notes: manualOrderForm.notes,
        status: "processing", // Start as processing
        adminCreated: true,
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Order Created",
          description: `Order ${data.data.id} created successfully for $${total.toFixed(2)}`,
        })
        setManualOrderDialog(false)
        setManualOrderForm({
          items: [{ productId: "", product: null, quantity: 1 }],
          shippingAddress: "",
          notes: "",
          paymentMethod: "cash",
        })
        // Refresh user orders
        fetchUserDetails(selectedUser.id)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create order",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating manual order:", error)
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      })
    } finally {
      setCreatingOrder(false)
    }
  }

  const openManualOrderDialog = async () => {
    setManualOrderDialog(true)
    await fetchProducts()
  }

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

  const handleAttachmentUpload = async (file) => {
    if (!file) return

    try {
      setUploadingDocument(true)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("userId", selectedUser.id)
      formData.append("documentType", "general")

      // Get the access token from localStorage
      const accessToken = localStorage.getItem("accessToken")

      const response = await fetch("/api/user-documents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Document uploaded successfully",
        })
        fetchUserAttachments(selectedUser.id)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to upload document",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error uploading attachment:", error)
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      })
    } finally {
      setUploadingDocument(false)
    }
  }

  const fetchUserAttachments = async (userId) => {
    try {
      setLoadingAttachments(true)
      const accessToken = localStorage.getItem("accessToken")
      const response = await fetch(`/api/user-documents?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setUserAttachments(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching attachments:", error)
    } finally {
      setLoadingAttachments(false)
    }
  }

  const deleteUserAttachment = async (documentId) => {
    try {
      const accessToken = localStorage.getItem("accessToken")
      const response = await fetch(`/api/user-documents/${documentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Document deleted successfully",
        })
        fetchUserAttachments(selectedUser.id)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete document",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting attachment:", error)
      toast({
        title: "Error",
        description: "Failed to delete document",
      })
    }
  }

  const previewDocument = (document) => {
    setDocumentPreviewUrl(document.url)
    setDocumentPreviewDialog(true)
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

      // Fetch user attachments
      await fetchUserAttachments(userId)
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

  const addUser = async () => {
    try {
      // Validation
      if (!addUserForm.name || !addUserForm.email || !addUserForm.password) {
        toast({
          title: "Error",
          description: "Name, email, and password are required",
          variant: "destructive",
        })
        return
      }

      if (addUserForm.password !== addUserForm.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        })
        return
      }

      if (addUserForm.password.length < 6) {
        toast({
          title: "Error",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        })
        return
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(addUserForm.email)) {
        toast({
          title: "Error",
          description: "Please enter a valid email address",
          variant: "destructive",
        })
        return
      }

      setAddingUser(true)

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

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: addUserForm.name,
          email: addUserForm.email.toLowerCase(),
          password: addUserForm.password,
          role: addUserForm.role,
          phone: addUserForm.phone,
          street: addUserForm.street,
          city: addUserForm.city,
          state: addUserForm.state,
          zip: addUserForm.zip,
          country: addUserForm.country,
          status: addUserForm.status,
          adminCreated: true,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "User Added",
          description: `User ${addUserForm.name} has been created successfully`,
        })

        // Reset form
        setAddUserForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "customer",
          phone: "",
          street: "",
          city: "",
          state: "",
          zip: "",
          country: "United States",
          status: "active",
        })

        // Close dialog
        setAddUserDialog(false)

        // Refresh users list
        await fetchUsers()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create user",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding user:", error)
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      })
    } finally {
      setAddingUser(false)
    }
  }

  const handleAddUserFormChange = (field, value) => {
    setAddUserForm((prev) => ({
      ...prev,
      [field]: value,
    }))
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

  const getDocumentIcon = (fileType) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon size={20} className="text-blue-400" />
    } else if (fileType.includes("pdf")) {
      return <FileText size={20} className="text-red-400" />
    } else {
      return <FileText size={20} className="text-gray-400" />
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Users</h2>
          <p className="text-muted-foreground">Manage users and their accounts.</p>
        </div>
        <Button onClick={() => setAddUserDialog(true)}>Add User</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          type="search"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-black border-[#333]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-[#111] border-[#333]">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="bg-black border-[#333]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent className="bg-[#111] border-[#333]">
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-700 hover:bg-[#111]">
                <td className="px-5 py-5 text-sm">
                  <div className="flex items-center">
                    <div className="ml-3">
                      <p className="text-white whitespace-no-wrap">{user.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-5 text-sm">
                  <p className="text-gray-200 whitespace-no-wrap">{user.email}</p>
                </td>
                <td className="px-5 py-5 text-sm">
                  <span className="relative inline-block px-3 py-1 font-semibold leading-tight">
                    {getRoleBadge(user.role)}
                  </span>
                </td>
                <td className="px-5 py-5 text-sm">
                  <span className="relative inline-block px-3 py-1 font-semibold leading-tight">
                    {getStatusBadge(user.status)}
                  </span>
                </td>
                <td className="px-5 py-5 text-sm">
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => viewUser(user)} className="border-[#333]">
                      View
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View User Dialog */}
      <Dialog open={viewUserDialog} onOpenChange={setViewUserDialog}>
        <DialogContent className="bg-[#111] border border-[#333] text-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">User Details</DialogTitle>
            <DialogDescription className="text-beige">
              View and manage user information, orders, and documents.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* Tabs */}
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="flex border-b border-[#333]">
                  <TabsTrigger
                    value="profile"
                    className={`flex-1 rounded-none ${activeTab === "profile" ? "border-b-2 border-[#D4AF37]" : ""}`}
                    onClick={() => setActiveTab("profile")}
                  >
                    Profile
                  </TabsTrigger>
                  <TabsTrigger
                    value="orders"
                    className={`flex-1 rounded-none ${activeTab === "orders" ? "border-b-2 border-[#D4AF37]" : ""}`}
                    onClick={() => setActiveTab("orders")}
                  >
                    Orders
                  </TabsTrigger>
                  <TabsTrigger
                    value="documents"
                    className={`flex-1 rounded-none ${activeTab === "documents" ? "border-b-2 border-[#D4AF37]" : ""}`}
                    onClick={() => setActiveTab("documents")}
                  >
                    Documents
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="mt-4 space-y-4">
                  <h3 className="text-lg font-semibold">User Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-beige">Name:</p>
                      <p className="text-white">{selectedUser.name}</p>
                    </div>
                    <div>
                      <p className="text-beige">Email:</p>
                      <p className="text-white">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-beige">Role:</p>
                      <p className="text-white">{getRoleBadge(selectedUser.role)}</p>
                    </div>
                    <div>
                      <p className="text-beige">Status:</p>
                      <p className="text-white">{getStatusBadge(selectedUser.status)}</p>
                    </div>
                    <div>
                      <p className="text-beige">Phone:</p>
                      <p className="text-white">{selectedUser.phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-beige">Address:</p>
                      <p className="text-white">
                        {selectedUser.street || "N/A"}, {selectedUser.city || "N/A"}, {selectedUser.state || "N/A"},{" "}
                        {selectedUser.zip || "N/A"}, {selectedUser.country || "N/A"}
                      </p>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mt-4">Update Status</h3>
                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateUserStatus(selectedUser.id, "active")}
                      className="border-[#333]"
                    >
                      Mark as Active
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateUserStatus(selectedUser.id, "inactive")}
                      className="border-[#333]"
                    >
                      Mark as Inactive
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateUserStatus(selectedUser.id, "banned")}
                      className="border-[#333]"
                    >
                      Ban User
                    </Button>
                  </div>

                  {userStats && (
                    <div className="space-y-4 mt-4">
                      <h3 className="text-lg font-semibold">User Statistics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-beige">Total Orders:</p>
                          <p className="text-white">{userStats.totalOrders}</p>
                        </div>
                        <div>
                          <p className="text-beige">Total Spent:</p>
                          <p className="text-white">${userStats.totalSpent.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-beige">Completed Orders:</p>
                          <p className="text-white">{userStats.completedOrders}</p>
                        </div>
                        <div>
                          <p className="text-beige">Pending Orders:</p>
                          <p className="text-white">{userStats.pendingOrders}</p>
                        </div>
                        <div>
                          <p className="text-beige">Cancelled Orders:</p>
                          <p className="text-white">{userStats.cancelledOrders}</p>
                        </div>
                        <div>
                          <p className="text-beige">Average Order Value:</p>
                          <p className="text-white">${userStats.averageOrderValue.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-beige">First Order Date:</p>
                          <p className="text-white">{formatDate(userStats.firstOrderDate)}</p>
                        </div>
                        <div>
                          <p className="text-beige">Last Order Date:</p>
                          <p className="text-white">{formatDate(userStats.lastOrderDate)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders" className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">User Orders</h3>
                    <Button variant="outline" size="sm" onClick={openManualOrderDialog} className="border-[#333]">
                      Create Order
                    </Button>
                  </div>
                  {loadingUserData ? (
                    <p className="text-gray-400">Loading orders...</p>
                  ) : userOrders.length === 0 ? (
                    <p className="text-gray-400">No orders found for this user.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full leading-normal">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                              Order ID
                            </th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                              Total
                            </th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {userOrders.map((order) => (
                            <tr key={order.id} className="border-b border-gray-700 hover:bg-[#111]">
                              <td className="px-5 py-5 text-sm">
                                <p className="text-white whitespace-no-wrap">{order.id}</p>
                              </td>
                              <td className="px-5 py-5 text-sm">
                                <p className="text-gray-200 whitespace-no-wrap">{formatDate(order.createdAt)}</p>
                              </td>
                              <td className="px-5 py-5 text-sm">
                                <p className="text-white whitespace-no-wrap">${order.total.toFixed(2)}</p>
                              </td>
                              <td className="px-5 py-5 text-sm">
                                <span className="relative inline-block px-3 py-1 font-semibold leading-tight">
                                  {getOrderStatusBadge(order.status)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="mt-4 space-y-4">
                  <div className="bg-[#222] p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">User Documents</h3>
                      <div>
                        <input
                          type="file"
                          id="attachment-upload"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0]
                            if (file) {
                              handleAttachmentUpload(file)
                            }
                          }}
                        />
                        <Button
                          onClick={() => document.getElementById("attachment-upload").click()}
                          className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
                          disabled={uploadingDocument}
                        >
                          <Upload size={16} className="mr-2" />
                          {uploadingDocument ? "Uploading..." : "Upload Document"}
                        </Button>
                      </div>
                    </div>

                    {loadingAttachments ? (
                      <div className="text-center py-8">
                        <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
                        <p className="text-beige">Loading documents...</p>
                      </div>
                    ) : userAttachments.length > 0 ? (
                      <div className="space-y-3">
                        {userAttachments.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-[#111] rounded-lg">
                            <div>
                              <p className="font-medium">{doc.fileName || doc.name || "Document"}</p>
                              <p className="text-sm text-beige">
                                Uploaded: {formatDate(doc.createdAt)} • {doc.fileType}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {doc.verified && (
                                <Badge className="bg-green-500/20 text-green-400 border-0">Verified</Badge>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => previewDocument(doc)}
                                className="border-[#333]"
                              >
                                <Eye size={16} className="mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteUserAttachment(doc.id)}
                                className="border-red-500 text-red-400 hover:bg-red-500/10"
                              >
                                <X size={16} className="mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">No Documents</h3>
                        <p className="text-beige">No documents have been uploaded for this user.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addUserDialog} onOpenChange={setAddUserDialog}>
        <DialogContent className="bg-[#111] border border-[#333] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Add New User</DialogTitle>
            <DialogDescription className="text-beige">
              Create a new user account and set their initial details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-beige mb-2">Name</label>
              <Input
                type="text"
                placeholder="Enter name"
                value={addUserForm.name}
                onChange={(e) => handleAddUserFormChange("name", e.target.value)}
                className="bg-black border-[#333] focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-beige mb-2">Email</label>
              <Input
                type="email"
                placeholder="Enter email"
                value={addUserForm.email}
                onChange={(e) => handleAddUserFormChange("email", e.target.value)}
                className="bg-black border-[#333] focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-beige mb-2">Password</label>
              <Input
                type="password"
                placeholder="Enter password"
                value={addUserForm.password}
                onChange={(e) => handleAddUserFormChange("password", e.target.value)}
                className="bg-black border-[#333] focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-beige mb-2">Confirm Password</label>
              <Input
                type="password"
                placeholder="Confirm password"
                value={addUserForm.confirmPassword}
                onChange={(e) => handleAddUserFormChange("confirmPassword", e.target.value)}
                className="bg-black border-[#333] focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-beige mb-2">Role</label>
              <Select value={addUserForm.role} onValueChange={(value) => handleAddUserFormChange("role", value)}>
                <SelectTrigger className="bg-black border-[#333]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-[#333]">
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-beige mb-2">Phone</label>
              <Input
                type="tel"
                placeholder="Enter phone number"
                value={addUserForm.phone}
                onChange={(e) => handleAddUserFormChange("phone", e.target.value)}
                className="bg-black border-[#333] focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-beige mb-2">Street</label>
              <Input
                type="text"
                placeholder="Enter street address"
                value={addUserForm.street}
                onChange={(e) => handleAddUserFormChange("street", e.target.value)}
                className="bg-black border-[#333] focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-beige mb-2">City</label>
              <Input
                type="text"
                placeholder="Enter city"
                value={addUserForm.city}
                onChange={(e) => handleAddUserFormChange("city", e.target.value)}
                className="bg-black border-[#333] focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-beige mb-2">State</label>
              <Input
                type="text"
                placeholder="Enter state"
                value={addUserForm.state}
                onChange={(e) => handleAddUserFormChange("state", e.target.value)}
                className="bg-black border-[#333] focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-beige mb-2">Zip</label>
              <Input
                type="text"
                placeholder="Enter zip code"
                value={addUserForm.zip}
                onChange={(e) => handleAddUserFormChange("zip", e.target.value)}
                className="bg-black border-[#333] focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-beige mb-2">Country</label>
              <Input
                type="text"
                placeholder="Enter country"
                value={addUserForm.country}
                onChange={(e) => handleAddUserFormChange("country", e.target.value)}
                className="bg-black border-[#333] focus:border-[#D4AF37]"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-beige mb-2">Status</label>
              <Select value={addUserForm.status} onValueChange={(value) => handleAddUserFormChange("status", value)}>
                <SelectTrigger className="bg-black border-[#333]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-[#333]">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#333]">
            <Button variant="outline" onClick={() => setAddUserDialog(false)} className="border-[#333]">
              Cancel
            </Button>
            <Button onClick={addUser} disabled={addingUser} className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
              {addingUser ? <>Adding User...</> : "Add User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Order Dialog */}
      <Dialog open={manualOrderDialog} onOpenChange={setManualOrderDialog}>
        <DialogContent className="bg-[#111] border border-[#333] text-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <PlusCircle className="mr-2" size={20} />
              Create Manual Order for {selectedUser?.name}
            </DialogTitle>
            <DialogDescription className="text-beige">Select products and create an order manually</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Order Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Order Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOrderItem}
                  className="border-[#333] text-[#D4AF37] hover:bg-[#D4AF37]/10"
                >
                  <PlusCircle size={16} className="mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {manualOrderForm.items.map((item, index) => (
                  <div key={index} className="bg-[#222] p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-beige mb-2">Product</label>
                        <Select
                          value={item.productId}
                          onValueChange={(value) => updateOrderItem(index, "productId", value)}
                        >
                          <SelectTrigger className="bg-black border-[#333]">
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111] border-[#333] max-h-60">
                            {loadingProducts ? (
                              <div className="p-2 text-center text-gray-400">Loading products...</div>
                            ) : products.length === 0 ? (
                              <div className="p-2 text-center text-gray-400">No products available</div>
                            ) : (
                              products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{product.name}</span>
                                    <span className="text-[#D4AF37] ml-2">${product.price}</span>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {item.product && (
                          <div className="mt-2 text-xs text-gray-400">
                            <p>Category: {item.product.category}</p>
                            <p>Stock: {item.product.stock || 0} available</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-beige mb-2">Quantity</label>
                        <Input
                          type="number"
                          min="1"
                          max={item.product?.stock || 999}
                          value={item.quantity}
                          onChange={(e) => updateOrderItem(index, "quantity", Number.parseInt(e.target.value) || 1)}
                          className="bg-black border-[#333] focus:border-[#D4AF37]"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-beige">Subtotal</p>
                          <p className="text-[#D4AF37] font-medium">
                            ${item.product ? (item.product.price * item.quantity).toFixed(2) : "0.00"}
                          </p>
                        </div>
                        {manualOrderForm.items.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeOrderItem(index)}
                            className="border-red-500 text-red-400 hover:bg-red-500/10"
                          >
                            <X size={16} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="bg-[#222] p-4 rounded-lg mt-4">
                <h4 className="font-semibold mb-3">Order Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-beige">Subtotal:</span>
                    <span>${calculateOrderTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-beige">Tax (8%):</span>
                    <span>${(calculateOrderTotal() * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-beige">Shipping:</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t border-[#333] pt-2 mt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span className="text-[#D4AF37]">${(calculateOrderTotal() * 1.08).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <label className="block text-sm font-medium text-beige mb-2">Custom Shipping Address (Optional)</label>
              <Input
                value={manualOrderForm.shippingAddress}
                onChange={(e) => setManualOrderForm((prev) => ({ ...prev, shippingAddress: e.target.value }))}
                placeholder={`Default: ${selectedUser?.street || "User address"}, ${selectedUser?.city || ""}, ${selectedUser?.state || ""}`}
                className="bg-black border-[#333] focus:border-[#D4AF37]"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-beige mb-2">Payment Method</label>
              <Select
                value={manualOrderForm.paymentMethod}
                onValueChange={(value) => setManualOrderForm((prev) => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger className="bg-black border-[#333]">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-[#333]">
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-beige mb-2">Order Notes (Optional)</label>
              <Textarea
                value={manualOrderForm.notes}
                onChange={(e) => setManualOrderForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any special instructions or notes for this order..."
                className="bg-black border-[#333] focus:border-[#D4AF37]"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#333]">
              <Button
                variant="outline"
                onClick={() => {
                  setManualOrderDialog(false)
                  setManualOrderForm({
                    items: [{ productId: "", product: null, quantity: 1 }],
                    shippingAddress: "",
                    notes: "",
                    paymentMethod: "cash",
                  })
                }}
                className="border-[#333]"
                disabled={creatingOrder}
              >
                Cancel
              </Button>
              <Button
                onClick={createManualOrder}
                disabled={creatingOrder || calculateOrderTotal() === 0}
                className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
              >
                {creatingOrder ? (
                  <>
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} className="mr-2" />
                    Create Order (${(calculateOrderTotal() * 1.08).toFixed(2)})
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={documentPreviewDialog} onOpenChange={setDocumentPreviewDialog}>
        <DialogContent className="bg-[#111] border border-[#333] text-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Document Preview</DialogTitle>
            <DialogDescription className="text-beige">Preview the selected document.</DialogDescription>
          </DialogHeader>
          {documentPreviewUrl && <iframe src={documentPreviewUrl} width="100%" height="600px" />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AdminUsers() {
  return <AdminUsersComponent />
}
