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
  Edit,
  Save,
  MapPin,
  Phone,
  DollarSign,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"

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
  const [editUserDialog, setEditUserDialog] = useState(false)
  const [userOrders, setUserOrders] = useState([])
  const [userStats, setUserStats] = useState(null)
  const [loadingUserData, setLoadingUserData] = useState(false)
  const { getToken } = useAuth() // Move useAuth hook to the top

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

  const [editUserForm, setEditUserForm] = useState({
    name: "",
    email: "",
    role: "customer",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    status: "active",
  })
  const [updatingUser, setUpdatingUser] = useState(false)

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

  // Helper function to get product price
  const getProductPrice = (product) => {
    if (!product) return 0

    // Check different possible price structures
    if (typeof product.price === "number" && product.price > 0) {
      return product.price
    }

    // Check if it's weight-based pricing
    if (product.weightPricing && Array.isArray(product.weightPricing) && product.weightPricing.length > 0) {
      const firstPricing = product.weightPricing[0]
      if (typeof firstPricing.price === "number" && firstPricing.price > 0) {
        return firstPricing.price
      }
    }

    // Check if it's in a pricing object
    if (product.pricing) {
      if (typeof product.pricing.price === "number" && product.pricing.price > 0) {
        return product.pricing.price
      }
      if (typeof product.pricing === "number" && product.pricing > 0) {
        return product.pricing
      }
    }

    // Check for basePrice
    if (typeof product.basePrice === "number" && product.basePrice > 0) {
      return product.basePrice
    }

    // Check for cost (as fallback)
    if (typeof product.cost === "number" && product.cost > 0) {
      return product.cost
    }

    console.warn("No valid price found for product:", product)
    return 0
  }

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
        console.log("Sample product:", data.products[0]) // Debug log
        setProducts(data.products)
      } else if (data.success && data.data) {
        // Alternative response structure
        console.log("Fetched products (alt structure):", data.data.length)
        console.log("Sample product:", data.data[0]) // Debug log
        setProducts(data.data)
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
        const selectedProduct = products.find((p) => (p.id || p._id) === value)
        console.log("Selected product:", selectedProduct) // Debug log
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
    const total = manualOrderForm.items.reduce((total, item) => {
      if (item.product) {
        const price = getProductPrice(item.product)
        console.log(`Item: ${item.product.name}, Price: ${price}, Quantity: ${item.quantity}`) // Debug log
        return total + price * item.quantity
      }
      return total
    }, 0)
    console.log(`Total calculated: ${total}`) // Debug log
    return total
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

      // Calculate totals with proper price handling
      const subtotal = validItems.reduce((sum, item) => {
        const price = getProductPrice(item.product)
        return sum + price * item.quantity
      }, 0)

      if (subtotal <= 0) {
        toast({
          title: "Error",
          description: "Order total must be greater than $0. Please check product prices.",
          variant: "destructive",
        })
        return
      }

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
        items: validItems.map((item) => {
          const price = getProductPrice(item.product)
          return {
            productId: item.product.id || item.product._id,
            name: item.product.name,
            price: price,
            quantity: item.quantity,
            category: item.product.category,
            sku: item.product.sku || "",
            image: item.product.images?.[0] || "",
          }
        }),
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
        status: "received", // Start as received
        adminCreated: true,
      }

      console.log("Creating order with data:", orderData) // Debug log

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()
      console.log("Order creation response:", data) // Debug log

      if (data.success) {
        toast({
          title: "Order Created Successfully",
          description: `Order ${data.data.id} created for $${total.toFixed(2)}`,
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
          title: "Order Creation Failed",
          description: data.error || "Failed to create order",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating manual order:", error)
      toast({
        title: "Order Creation Failed",
        description: "Failed to create order. Please try again.",
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

      // Get the access token using the getToken function from useAuth
      const accessToken = getToken()

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
      const accessToken = getToken()

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
          title: "Document Uploaded",
          description: "Document uploaded successfully",
        })
        fetchUserAttachments(selectedUser.id)
      } else {
        toast({
          title: "Upload Failed",
          description: data.error || "Failed to upload document",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error uploading attachment:", error)
      toast({
        title: "Upload Failed",
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
      const accessToken = getToken()
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
      const accessToken = getToken()
      const response = await fetch(`/api/user-documents/${documentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Document Deleted",
          description: "Document deleted successfully",
        })
        fetchUserAttachments(selectedUser.id)
      } else {
        toast({
          title: "Delete Failed",
          description: data.error || "Failed to delete document",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting attachment:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete document",
        variant: "destructive",
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

      // Get the access token using the getToken function from useAuth
      const accessToken = getToken()

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
          (order) => order.status === "received" || order.status === "processing",
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
    await fetchUserDetails(user.id)
  }

  const editUser = (user) => {
    setSelectedUser(user)
    setEditUserForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "customer",
      phone: user.phone || "",
      street: user.street || "",
      city: user.city || "",
      state: user.state || "",
      zip: user.zip || "",
      country: user.country || "United States",
      status: user.status || "active",
    })
    setEditUserDialog(true)
  }

  const updateUser = async () => {
    try {
      setUpdatingUser(true)

      // Validation
      if (!editUserForm.name || !editUserForm.email) {
        toast({
          title: "Validation Error",
          description: "Name and email are required",
          variant: "destructive",
        })
        return
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(editUserForm.email)) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid email address",
          variant: "destructive",
        })
        return
      }

      const accessToken = getToken()

      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(editUserForm),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "User Updated",
          description: `User ${editUserForm.name} has been updated successfully`,
        })

        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user.id === selectedUser.id ? { ...user, ...editUserForm } : user)),
        )

        // Update selected user
        setSelectedUser({ ...selectedUser, ...editUserForm })

        setEditUserDialog(false)
      } else {
        toast({
          title: "Update Failed",
          description: data.error || "Failed to update user",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update user",
        variant: "destructive",
      })
    } finally {
      setUpdatingUser(false)
    }
  }

  const updateUserStatus = async (userId, newStatus) => {
    try {
      // Get the access token from localStorage
      const accessToken = getToken()

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
          title: "Status Updated",
          description: `User status updated to ${newStatus}`,
        })

        // Update selected user if viewing
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser({ ...selectedUser, status: newStatus })
        }
      } else {
        toast({
          title: "Update Failed",
          description: data.error || "Failed to update user status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating user status:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update user status",
        variant: "destructive",
      })
    }
  }

  const addUser = async () => {
    try {
      console.log("Starting addUser function...")

      // Validation
      if (!addUserForm.name || !addUserForm.email || !addUserForm.password) {
        toast({
          title: "Validation Error",
          description: "Name, email, and password are required",
          variant: "destructive",
        })
        return
      }

      if (addUserForm.password !== addUserForm.confirmPassword) {
        toast({
          title: "Validation Error",
          description: "Passwords do not match",
          variant: "destructive",
        })
        return
      }

      // Enhanced password validation
      const passwordValidation = {
        length: addUserForm.password.length >= 8,
        uppercase: /[A-Z]/.test(addUserForm.password),
        lowercase: /[a-z]/.test(addUserForm.password),
        number: /\d/.test(addUserForm.password),
        special: /[@$!%*?&]/.test(addUserForm.password),
      }

      const isPasswordValid = Object.values(passwordValidation).every(Boolean)

      if (!isPasswordValid) {
        toast({
          title: "Password Requirements Not Met",
          description:
            "Password must contain at least 8 characters, including uppercase, lowercase, number, and special character (@$!%*?&)",
          variant: "destructive",
        })
        return
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(addUserForm.email)) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid email address",
          variant: "destructive",
        })
        return
      }

      console.log("Validation passed, setting loading state...")
      setAddingUser(true)

      // Get the access token using the getToken function from useAuth
      const accessToken = getToken()
      console.log("Retrieved token:", accessToken ? "Token present" : "No token")

      if (!accessToken) {
        console.log("No access token found")
        toast({
          title: "Error",
          description: "Authentication required. Please log in again.",
          variant: "destructive",
        })
        return
      }

      const requestBody = {
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
      }

      console.log("Making API request with body:", requestBody)
      console.log("Using token:", accessToken.substring(0, 20) + "...")

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      })

      console.log("API Response status:", response.status)
      console.log("API Response headers:", Object.fromEntries(response.headers.entries()))

      const data = await response.json()
      console.log("API Response data:", data)

      if (data.success) {
        console.log("User created successfully")
        toast({
          title: "User Created Successfully",
          description: `User ${addUserForm.name} has been created with email ${addUserForm.email}`,
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
        console.log("User creation failed:", data.error)

        // Enhanced error handling for password issues
        if (data.error && data.error.toLowerCase().includes("password")) {
          toast({
            title: "Password Error",
            description:
              "Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Creation Failed",
            description: data.error || "Failed to create user. Please check all fields and try again.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error adding user:", error)
      toast({
        title: "Creation Failed",
        description: "Network error occurred. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      console.log("Setting loading state to false")
      setAddingUser(false)
    }
  }

  const handleAddUserFormChange = (field, value) => {
    setAddUserForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleEditUserFormChange = (field, value) => {
    setEditUserForm((prev) => ({
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
      case "received":
        return <Clock size={16} className="text-blue-400" />
      case "processing":
        return <Package size={16} className="text-yellow-400" />
      case "assigned_to_driver":
        return <User size={16} className="text-orange-400" />
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
      received: "bg-blue-500/20 text-blue-400",
      processing: "bg-yellow-500/20 text-yellow-400",
      assigned_to_driver: "bg-orange-500/20 text-orange-400",
      shipped: "bg-purple-500/20 text-purple-400",
      delivered: "bg-green-500/20 text-green-400",
      cancelled: "bg-red-500/20 text-red-400",
    }

    return (
      <Badge className={`${variants[status] || "bg-gray-500/20 text-gray-400"} border-0`}>
        {getOrderStatusIcon(status)}
        <span className="ml-1 capitalize">{status.replace("_", " ")}</span>
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
                    <Button variant="outline" size="sm" onClick={() => editUser(user)} className="border-[#333]">
                      Edit
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
        <DialogContent className="bg-[#111] border border-[#333] text-white max-w-[98vw] w-[98vw] max-h-[95vh] h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">User Details - {selectedUser?.name}</DialogTitle>
            <DialogDescription className="text-beige">
              Complete user information, orders, and documents.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Basic Info */}
                <div className="bg-[#222] p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <User size={20} className="mr-2 text-[#D4AF37]" />
                    Basic Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-beige text-sm">Name:</p>
                      <p className="text-white">{selectedUser.name}</p>
                    </div>
                    <div>
                      <p className="text-beige text-sm">Email:</p>
                      <p className="text-white text-xs">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-beige text-sm">Role:</p>
                      <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                    </div>
                    <div>
                      <p className="text-beige text-sm">Status:</p>
                      <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-[#222] p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Phone size={20} className="mr-2 text-green-500" />
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-beige text-sm">Phone:</p>
                      <p className="text-white">{selectedUser.phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-beige text-sm">Customer ID:</p>
                      <p className="text-white font-mono text-xs">{selectedUser.id}</p>
                    </div>
                    <div>
                      <p className="text-beige text-sm">Joined:</p>
                      <p className="text-white text-sm">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Address Info */}
                <div className="bg-[#222] p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <MapPin size={20} className="mr-2 text-red-500" />
                    Address
                  </h3>
                  <div className="space-y-1">
                    <p className="text-white text-sm">{selectedUser.street || "N/A"}</p>
                    <p className="text-white text-sm">
                      {selectedUser.city || "N/A"}, {selectedUser.state || "N/A"} {selectedUser.zip || "N/A"}
                    </p>
                    <p className="text-white text-sm">{selectedUser.country || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* User Statistics */}
              {userStats && (
                <div className="bg-[#222] p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <DollarSign size={20} className="mr-2 text-[#D4AF37]" />
                    Order Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#D4AF37]">{userStats.totalOrders}</p>
                      <p className="text-beige text-sm">Total Orders</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">${userStats.totalSpent.toFixed(2)}</p>
                      <p className="text-beige text-sm">Total Spent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">{userStats.completedOrders}</p>
                      <p className="text-beige text-sm">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-400">${userStats.averageOrderValue.toFixed(2)}</p>
                      <p className="text-beige text-sm">Avg Order</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Section */}
              <div className="bg-[#222] p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <ShoppingBag size={20} className="mr-2 text-purple-500" />
                    Recent Orders
                  </h3>
                  <Button variant="outline" size="sm" onClick={openManualOrderDialog} className="border-[#333]">
                    Create Order
                  </Button>
                </div>
                {loadingUserData ? (
                  <p className="text-gray-400">Loading orders...</p>
                ) : userOrders.length === 0 ? (
                  <p className="text-gray-400">No orders found for this user.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {userOrders.slice(0, 10).map((order) => (
                      <div
                        key={order.id || order._id}
                        className="flex items-center justify-between p-3 bg-[#111] rounded"
                      >
                        <div>
                          <p className="text-white font-medium">{order.id || order._id}</p>
                          <p className="text-beige text-sm">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#D4AF37] font-medium">${(order.total || 0).toFixed(2)}</p>
                          {getOrderStatusBadge(order.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Documents Section */}
              <div className="bg-[#222] p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center">
                    <FileText size={20} className="mr-2 text-blue-500" />
                    User Documents
                  </h3>
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
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {userAttachments.map((doc) => (
                      <div
                        key={doc.id || doc._id || `doc-${doc.fileName}`}
                        className="flex items-center justify-between p-3 bg-[#111] rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getDocumentIcon(doc.fileType)}
                          <div>
                            <p className="font-medium">{doc.fileName || doc.name || "Document"}</p>
                            <p className="text-sm text-beige">
                              Uploaded: {formatDate(doc.createdAt)} • {doc.fileType}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {doc.verified && <Badge className="bg-green-500/20 text-green-400 border-0">Verified</Badge>}
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

              {/* Status Update Actions */}
              <div className="bg-[#222] p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Update User Status</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateUserStatus(selectedUser.id, "active")}
                    className="border-green-500 text-green-400 hover:bg-green-500/10"
                  >
                    Mark as Active
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateUserStatus(selectedUser.id, "inactive")}
                    className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
                  >
                    Mark as Inactive
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateUserStatus(selectedUser.id, "banned")}
                    className="border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    Ban User
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editUserDialog} onOpenChange={setEditUserDialog}>
        <DialogContent className="bg-[#111] border border-[#333] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <Edit className="mr-2" size={20} />
              Edit User - {selectedUser?.name}
            </DialogTitle>
            <DialogDescription className="text-beige">Update user information and settings.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-beige mb-2">Name</Label>
                <Input
                  type="text"
                  placeholder="Enter name"
                  value={editUserForm.name}
                  onChange={(e) => handleEditUserFormChange("name", e.target.value)}
                  className="bg-black border-[#333] focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-beige mb-2">Email</Label>
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={editUserForm.email}
                  onChange={(e) => handleEditUserFormChange("email", e.target.value)}
                  className="bg-black border-[#333] focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-beige mb-2">Role</Label>
                <Select value={editUserForm.role} onValueChange={(value) => handleEditUserFormChange("role", value)}>
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
                <Label className="block text-sm font-medium text-beige mb-2">Status</Label>
                <Select
                  value={editUserForm.status}
                  onValueChange={(value) => handleEditUserFormChange("status", value)}
                >
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
              <div>
                <Label className="block text-sm font-medium text-beige mb-2">Phone</Label>
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={editUserForm.phone}
                  onChange={(e) => handleEditUserFormChange("phone", e.target.value)}
                  className="bg-black border-[#333] focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-beige mb-2">Street</Label>
                <Input
                  type="text"
                  placeholder="Enter street address"
                  value={editUserForm.street}
                  onChange={(e) => handleEditUserFormChange("street", e.target.value)}
                  className="bg-black border-[#333] focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-beige mb-2">City</Label>
                <Input
                  type="text"
                  placeholder="Enter city"
                  value={editUserForm.city}
                  onChange={(e) => handleEditUserFormChange("city", e.target.value)}
                  className="bg-black border-[#333] focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-beige mb-2">State</Label>
                <Input
                  type="text"
                  placeholder="Enter state"
                  value={editUserForm.state}
                  onChange={(e) => handleEditUserFormChange("state", e.target.value)}
                  className="bg-black border-[#333] focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-beige mb-2">Zip</Label>
                <Input
                  type="text"
                  placeholder="Enter zip code"
                  value={editUserForm.zip}
                  onChange={(e) => handleEditUserFormChange("zip", e.target.value)}
                  className="bg-black border-[#333] focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-beige mb-2">Country</Label>
                <Input
                  type="text"
                  placeholder="Enter country"
                  value={editUserForm.country}
                  onChange={(e) => handleEditUserFormChange("country", e.target.value)}
                  className="bg-black border-[#333] focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#333]">
            <Button variant="outline" onClick={() => setEditUserDialog(false)} className="border-[#333]">
              Cancel
            </Button>
            <Button onClick={updateUser} disabled={updatingUser} className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
              {updatingUser ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Update User
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addUserDialog} onOpenChange={setAddUserDialog}>
        <DialogContent className="bg-[#111] border border-[#333] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Add New User</DialogTitle>
            <DialogDescription className="text-beige">
              Create a new user account and set their initial details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-beige mb-2">Name</Label>
                <Input
                  type="text"
                  placeholder="Enter name"
                  value={addUserForm.name}
                  onChange={(e) => handleAddUserFormChange("name", e.target.value)}
                  className="bg-black border-[#333] focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-beige mb-2">Email</Label>
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={addUserForm.email}
                  onChange={(e) => handleAddUserFormChange("email", e.target.value)}
                  className="bg-black border-[#333] focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-beige mb-2">Password</Label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={addUserForm.password}
                  onChange={(e) => handleAddUserFormChange("password", e.target.value)}
                  className="bg-black border-[#333] focus:border-[#D4AF37]"
                />

                {/* Password Requirements */}
                {addUserForm.password && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-beige">Password Requirements:</p>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {addUserForm.password.length >= 8 ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <X className="h-4 w-4 text-red-400" />
                        )}
                        <span
                          className={`text-xs ${addUserForm.password.length >= 8 ? "text-green-400" : "text-red-400"}`}
                        >
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/[A-Z]/.test(addUserForm.password) ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <X className="h-4 w-4 text-red-400" />
                        )}
                        <span
                          className={`text-xs ${/[A-Z]/.test(addUserForm.password) ? "text-green-400" : "text-red-400"}`}
                        >
                          One uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/[a-z]/.test(addUserForm.password) ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <X className="h-4 w-4 text-red-400" />
                        )}
                        <span
                          className={`text-xs ${/[a-z]/.test(addUserForm.password) ? "text-green-400" : "text-red-400"}`}
                        >
                          One lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/\d/.test(addUserForm.password) ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <X className="h-4 w-4 text-red-400" />
                        )}
                        <span
                          className={`text-xs ${/\d/.test(addUserForm.password) ? "text-green-400" : "text-red-400"}`}
                        >
                          One number
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/[@$!%*?&]/.test(addUserForm.password) ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <X className="h-4 w-4 text-red-400" />
                        )}
                        <span
                          className={`text-xs ${/[@$!%*?&]/.test(addUserForm.password) ? "text-green-400" : "text-red-400"}`}
                        >
                          One special character (@$!%*?&)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label className="block text-sm font-medium text-beige mb-2">Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={addUserForm.confirmPassword}
                  onChange={(e) => handleAddUserFormChange("confirmPassword", e.target.value)}
                  className="bg-black border-[#333] focus:border-[#D4AF37]"
                />

                {/* Password Match Indicator */}
                {addUserForm.confirmPassword && (
                  <div className="flex items-center space-x-2 mt-2">
                    {addUserForm.password === addUserForm.confirmPassword ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <X className="h-4 w-4 text-red-400" />
                    )}
                    <span
                      className={`text-xs ${addUserForm.password === addUserForm.confirmPassword ? "text-green-400" : "text-red-400"}`}
                    >
                      Passwords match
                    </span>
                  </div>
                )}
              </div>
              <div>
                <Label className="block text-sm font-medium text-beige mb-2">Role</Label>
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
                <Label className="block text-sm font-medium text-beige mb-2">Phone</Label>
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={addUserForm.phone}
                  onChange={(e) => handleAddUserFormChange("phone", e.target.value)}
                  className="bg-black border-[#333] focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-beige mb-2">Street</Label>
                <Input
                  type="text"
                  placeholder="Enter street address"
                  value={addUserForm.street}
                  onChange={(e) => handleAddUserFormChange("street", e.target.value)}
                  className="bg-black border-[#333] focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-beige mb-2">City</Label>
                <Input
                  type="text"
                  placeholder="Enter city"
                  value={addUserForm.city}
                  onChange={(e) => handleAddUserFormChange("city", e.target.value)}
                  className="bg-black border-[#333] focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-beige mb-2">State</Label>
                <Input
                  type="text"
                  placeholder="Enter state"
                  value={addUserForm.state}
                  onChange={(e) => handleAddUserFormChange("state", e.target.value)}
                  className="bg-black border-[#333] focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-beige mb-2">Zip</Label>
                <Input
                  type="text"
                  placeholder="Enter zip code"
                  value={addUserForm.zip}
                  onChange={(e) => handleAddUserFormChange("zip", e.target.value)}
                  className="bg-black border-[#333] focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-beige mb-2">Country</Label>
                <Input
                  type="text"
                  placeholder="Enter country"
                  value={addUserForm.country}
                  onChange={(e) => handleAddUserFormChange("country", e.target.value)}
                  className="bg-black border-[#333] focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#333]">
            <Button variant="outline" onClick={() => setAddUserDialog(false)} className="border-[#333]">
              Cancel
            </Button>
            <Button
              onClick={addUser}
              disabled={
                addingUser ||
                !addUserForm.name ||
                !addUserForm.email ||
                !addUserForm.password ||
                !addUserForm.confirmPassword ||
                addUserForm.password !== addUserForm.confirmPassword ||
                addUserForm.password.length < 8 ||
                !/[A-Z]/.test(addUserForm.password) ||
                !/[a-z]/.test(addUserForm.password) ||
                !/\d/.test(addUserForm.password) ||
                !/[@$!%*?&]/.test(addUserForm.password)
              }
              className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
            >
              {addingUser ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <PlusCircle size={16} className="mr-2" />
                  Add User
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Order Dialog */}
      <Dialog open={manualOrderDialog} onOpenChange={setManualOrderDialog}>
        <DialogContent className="bg-[#111] border border-[#333] text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Create Manual Order</DialogTitle>
            <DialogDescription className="text-beige">Create a new order for {selectedUser?.name}.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Order Items */}
            <div className="space-y-4">
              <Label className="block text-lg font-medium text-white mb-4">Order Items</Label>
              {manualOrderForm.items.map((item, index) => (
                <div key={`order-item-${index}`} className="bg-[#222] p-4 rounded-lg border border-[#333]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    {/* Product Selection */}
                    <div className="md:col-span-2">
                      <Label className="block text-sm font-medium text-beige mb-2">Product</Label>
                      <Select
                        value={item.productId}
                        onValueChange={(value) => updateOrderItem(index, "productId", value)}
                      >
                        <SelectTrigger className="bg-black border-[#333] h-auto min-h-[60px]">
                          <SelectValue placeholder="Select product">
                            {item.product && (
                              <div className="flex items-center space-x-3 py-2">
                                <img
                                  src={item.product.images?.[0] || "/placeholder.svg?height=40&width=40"}
                                  alt={item.product.name}
                                  className="w-10 h-10 rounded object-cover"
                                />
                                <div className="text-left">
                                  <p className="font-medium text-white">{item.product.name}</p>
                                  <p className="text-sm text-[#D4AF37]">${getProductPrice(item.product).toFixed(2)}</p>
                                </div>
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-[#111] border-[#333] max-h-60">
                          {loadingProducts ? (
                            <SelectItem value="loading" disabled>
                              <div className="flex items-center space-x-2">
                                <RefreshCw className="animate-spin" size={16} />
                                <span>Loading products...</span>
                              </div>
                            </SelectItem>
                          ) : products.length === 0 ? (
                            <SelectItem value="no-products" disabled>
                              <div className="flex items-center space-x-2">
                                <AlertCircle size={16} />
                                <span>No products found</span>
                              </div>
                            </SelectItem>
                          ) : (
                            products.map((product) => {
                              const price = getProductPrice(product)
                              return (
                                <SelectItem key={product.id || product._id} value={product.id || product._id}>
                                  <div className="flex items-center space-x-3 py-2 w-full">
                                    <img
                                      src={product.images?.[0] || "/placeholder.svg?height=40&width=40"}
                                      alt={product.name}
                                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1 text-left">
                                      <p className="font-medium text-white">{product.name}</p>
                                      <p className="text-sm text-[#D4AF37]">${price.toFixed(2)}</p>
                                      <p className="text-xs text-gray-400">{product.category}</p>
                                    </div>
                                  </div>
                                </SelectItem>
                              )
                            })
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quantity and Actions */}
                    <div className="space-y-4">
                      <div>
                        <Label className="block text-sm font-medium text-beige mb-2">Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) =>
                            updateOrderItem(index, "quantity", Math.max(1, Number.parseInt(e.target.value) || 1))
                          }
                          className="bg-black border-[#333] focus:border-[#D4AF37]"
                        />
                      </div>

                      {item.product && (
                        <div className="bg-[#333] p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-beige">Subtotal:</span>
                            <span className="font-medium text-[#D4AF37]">
                              ${(getProductPrice(item.product) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeOrderItem(index)}
                            className="w-full border-red-500 text-red-400 hover:bg-red-500/10"
                          >
                            <X size={16} className="mr-1" />
                            Remove Item
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={addOrderItem}
                className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
              >
                <PlusCircle size={16} className="mr-2" />
                Add Another Item
              </Button>
            </div>

            {/* Order Summary */}
            <div className="bg-[#222] p-4 rounded-lg border border-[#333]">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <DollarSign size={20} className="mr-2 text-[#D4AF37]" />
                Order Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-beige">Subtotal:</span>
                  <span className="text-white">${calculateOrderTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-beige">Tax (8%):</span>
                  <span className="text-white">${(calculateOrderTotal() * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-beige">Shipping:</span>
                  <span className="text-white">$0.00</span>
                </div>
                <div className="border-t border-[#333] pt-2 mt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-white">Total:</span>
                    <span className="text-[#D4AF37]">${(calculateOrderTotal() * 1.08).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <Label className="block text-sm font-medium text-beige mb-2">Shipping Address</Label>
              <Textarea
                placeholder={`Default: ${selectedUser?.street || ""} ${selectedUser?.city || ""}, ${selectedUser?.state || ""} ${selectedUser?.zip || ""}`}
                value={manualOrderForm.shippingAddress}
                onChange={(e) => setManualOrderForm((prev) => ({ ...prev, shippingAddress: e.target.value }))}
                className="bg-black border-[#333] focus:border-[#D4AF37]"
                rows={3}
              />
            </div>

            {/* Notes */}
            <div>
              <Label className="block text-sm font-medium text-beige mb-2">Order Notes</Label>
              <Textarea
                placeholder="Add any special instructions or notes for this order..."
                value={manualOrderForm.notes}
                onChange={(e) => setManualOrderForm((prev) => ({ ...prev, notes: e.target.value }))}
                className="bg-black border-[#333] focus:border-[#D4AF37]"
                rows={3}
              />
            </div>

            {/* Payment Method */}
            <div>
              <Label className="block text-sm font-medium text-beige mb-2">Payment Method</Label>
              <Select
                value={manualOrderForm.paymentMethod}
                onValueChange={(value) => setManualOrderForm((prev) => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger className="bg-black border-[#333]">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-[#333]">
                  <SelectItem value="cash">💵 Cash Payment</SelectItem>
                  <SelectItem value="credit">💳 Credit Card</SelectItem>
                  <SelectItem value="debit">💳 Debit Card</SelectItem>
                  <SelectItem value="paypal">🅿️ PayPal</SelectItem>
                  <SelectItem value="bank_transfer">🏦 Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-[#333]">
            <div className="text-left">
              <p className="text-sm text-beige">Creating order for:</p>
              <p className="font-medium text-white">
                {selectedUser?.name} ({selectedUser?.email})
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setManualOrderDialog(false)} className="border-[#333]">
                Cancel
              </Button>
              <Button
                onClick={createManualOrder}
                disabled={creatingOrder || calculateOrderTotal() <= 0}
                className="bg-[#D4AF37] hover:bg-[#B8860B] text-black min-w-[140px]"
              >
                {creatingOrder ? (
                  <>
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} className="mr-2" />
                    Create Order
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={documentPreviewDialog} onOpenChange={setDocumentPreviewDialog}>
        <DialogContent className="bg-[#111] border border-[#333] text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Document Preview</DialogTitle>
            <DialogDescription className="text-beige">Preview the selected document.</DialogDescription>
          </DialogHeader>

          {documentPreviewUrl && (
            <div className="flex justify-center items-center">
              {documentPreviewUrl.endsWith(".pdf") ? (
                <iframe src={documentPreviewUrl} width="100%" height="600px" />
              ) : (
                <img
                  src={documentPreviewUrl || "/placeholder.svg"}
                  alt="Document Preview"
                  className="max-w-full max-h-full"
                />
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[#333]">
            <Button variant="outline" onClick={() => setDocumentPreviewDialog(false)} className="border-[#333]">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminUsersComponent
