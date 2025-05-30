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
  ShoppingBag,
  RefreshCw,
  Plus,
  Trash,
  Edit,
  AlertCircle,
  Gift,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"
import LoyaltyCard from "@/components/loyalty/loyalty-card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AccountPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated, logout, accessToken } = useAuth()
  const { addToCart } = useCart()
  const [activeTab, setActiveTab] = useState("overview")

  // Data states
  const [orders, setOrders] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [addresses, setAddresses] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loyaltyInfo, setLoyaltyInfo] = useState({
    tier: "bronze",
    points: 0,
    nextTier: "silver",
    pointsToNextTier: 500,
  })
  const [userProfile, setUserProfile] = useState(null)

  // Loading states
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadingWishlist, setLoadingWishlist] = useState(false)
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [loadingPayments, setLoadingPayments] = useState(false)
  const [loadingLoyalty, setLoadingLoyalty] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(false)

  // Dialog states
  const [addressDialog, setAddressDialog] = useState(false)
  const [paymentDialog, setPaymentDialog] = useState(false)
  const [profileDialog, setProfileDialog] = useState(false)
  const [passwordDialog, setPasswordDialog] = useState(false)
  const [deleteAccountDialog, setDeleteAccountDialog] = useState(false)

  // Form states
  const [addressForm, setAddressForm] = useState({
    id: null,
    name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    default: false,
  })

  const [paymentForm, setPaymentForm] = useState({
    id: null,
    type: "visa",
    cardNumber: "",
    nameOnCard: "",
    expMonth: "",
    expYear: "",
    cvv: "",
    default: false,
  })

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [communicationPrefs, setCommunicationPrefs] = useState({
    orderUpdates: true,
    promotions: true,
    news: true,
  })

  // Error states
  const [addressError, setAddressError] = useState("")
  const [paymentError, setPaymentError] = useState("")
  const [profileError, setProfileError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/account")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchUserOrders()
      fetchWishlist()
      fetchAddresses()
      fetchPaymentMethods()
      fetchLoyaltyInfo()
      fetchUserProfile()
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
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Authorization: `Bearer ${accessToken}`,
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

  const fetchWishlist = async () => {
    if (!user?.id) return

    setLoadingWishlist(true)
    try {
      const response = await fetch(`/api/user/wishlist`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch wishlist")
      }

      const data = await response.json()
      console.log("Wishlist data:", data)

      if (data.success) {
        setWishlist(data.data || [])
      } else {
        console.error("Wishlist fetch error:", data.message)
        toast({
          title: "Error",
          description: data.message || "Failed to fetch wishlist",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to fetch wishlist",
        variant: "destructive",
      })
    } finally {
      setLoadingWishlist(false)
    }
  }

  const fetchAddresses = async () => {
    if (!user?.id) return

    setLoadingAddresses(true)
    try {
      const response = await fetch(`/api/user/addresses`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch addresses")
      }

      const data = await response.json()
      console.log("Addresses data:", data)

      if (data.success) {
        setAddresses(data.data || [])
      } else {
        console.error("Addresses fetch error:", data.message)
        toast({
          title: "Error",
          description: data.message || "Failed to fetch addresses",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching addresses:", error)
      toast({
        title: "Error",
        description: "Failed to fetch addresses",
        variant: "destructive",
      })
    } finally {
      setLoadingAddresses(false)
    }
  }

  const fetchPaymentMethods = async () => {
    if (!user?.id) return

    setLoadingPayments(true)
    try {
      const response = await fetch(`/api/user/payment-methods`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch payment methods")
      }

      const data = await response.json()
      console.log("Payment methods data:", data)

      if (data.success) {
        setPaymentMethods(data.data || [])
      } else {
        console.error("Payment methods fetch error:", data.message)
        toast({
          title: "Error",
          description: data.message || "Failed to fetch payment methods",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error)
      toast({
        title: "Error",
        description: "Failed to fetch payment methods",
        variant: "destructive",
      })
    } finally {
      setLoadingPayments(false)
    }
  }

  const fetchLoyaltyInfo = async () => {
    if (!user?.id) return

    setLoadingLoyalty(true)
    try {
      const response = await fetch(`/api/user/loyalty`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch loyalty info")
      }

      const data = await response.json()
      console.log("Loyalty info data:", data)

      if (data.success) {
        setLoyaltyInfo(
          data.data || {
            tier: "bronze",
            points: 0,
            nextTier: "silver",
            pointsToNextTier: 500,
          },
        )
      } else {
        console.error("Loyalty info fetch error:", data.message)
      }
    } catch (error) {
      console.error("Error fetching loyalty info:", error)
    } finally {
      setLoadingLoyalty(false)
    }
  }

  const fetchUserProfile = async () => {
    if (!user?.id) return

    setLoadingProfile(true)
    try {
      const response = await fetch(`/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user profile")
      }

      const data = await response.json()
      console.log("User profile data:", data)

      if (data.success) {
        setUserProfile(data.data || null)

        // Initialize profile form
        if (data.data) {
          const nameParts = data.data.name ? data.data.name.split(" ") : ["", ""]
          setProfileForm({
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(" ") || "",
            email: data.data.email || "",
            phone: data.data.phone || "",
          })

          setCommunicationPrefs({
            orderUpdates: data.data.preferences?.orderUpdates ?? true,
            promotions: data.data.preferences?.promotions ?? true,
            news: data.data.preferences?.news ?? true,
          })
        }
      } else {
        console.error("User profile fetch error:", data.message)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      setLoadingProfile(false)
    }
  }

  // Wishlist operations
  const addToWishlist = async (productId) => {
    try {
      const response = await fetch(`/api/user/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ productId }),
      })

      const data = await response.json()

      if (data.success) {
        fetchWishlist() // Refresh wishlist
        toast({
          title: "Added to Wishlist",
          description: "Product added to your wishlist",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to add to wishlist",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to add to wishlist",
        variant: "destructive",
      })
    }
  }

  const removeFromWishlist = async (productId) => {
    try {
      const response = await fetch(`/api/user/wishlist/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        fetchWishlist() // Refresh wishlist
        toast({
          title: "Removed from Wishlist",
          description: "Product removed from your wishlist",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to remove from wishlist",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to remove from wishlist",
        variant: "destructive",
      })
    }
  }

  // Address operations
  const openAddressDialog = (address = null) => {
    if (address) {
      setAddressForm({
        id: address.id,
        name: address.name,
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country,
        default: address.default,
      })
    } else {
      setAddressForm({
        id: null,
        name: "",
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "United States",
        default: addresses.length === 0, // First address is default
      })
    }
    setAddressError("")
    setAddressDialog(true)
  }

  const saveAddress = async () => {
    // Validate form
    if (!addressForm.name || !addressForm.street || !addressForm.city || !addressForm.state || !addressForm.zip) {
      setAddressError("Please fill in all required fields")
      return
    }

    try {
      const method = addressForm.id ? "PUT" : "POST"
      const url = addressForm.id ? `/api/user/addresses/${addressForm.id}` : `/api/user/addresses`

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(addressForm),
      })

      const data = await response.json()

      if (data.success) {
        fetchAddresses() // Refresh addresses
        setAddressDialog(false)
        toast({
          title: addressForm.id ? "Address Updated" : "Address Added",
          description: addressForm.id ? "Your address has been updated" : "New address has been added",
        })
      } else {
        setAddressError(data.message || "Failed to save address")
      }
    } catch (error) {
      console.error("Error saving address:", error)
      setAddressError("An error occurred while saving your address")
    }
  }

  const deleteAddress = async (addressId) => {
    try {
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        fetchAddresses() // Refresh addresses
        toast({
          title: "Address Deleted",
          description: "Your address has been deleted",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete address",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting address:", error)
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive",
      })
    }
  }

  const setDefaultAddress = async (addressId) => {
    try {
      const response = await fetch(`/api/user/addresses/${addressId}/default`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        fetchAddresses() // Refresh addresses
        toast({
          title: "Default Address Updated",
          description: "Your default address has been updated",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update default address",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error setting default address:", error)
      toast({
        title: "Error",
        description: "Failed to update default address",
        variant: "destructive",
      })
    }
  }

  // Payment method operations
  const openPaymentDialog = (payment = null) => {
    if (payment) {
      setPaymentForm({
        id: payment.id,
        type: payment.type,
        cardNumber: `**** **** **** ${payment.last4}`,
        nameOnCard: payment.nameOnCard || "",
        expMonth: payment.expMonth || "",
        expYear: payment.expYear || "",
        cvv: "",
        default: payment.default,
      })
    } else {
      setPaymentForm({
        id: null,
        type: "visa",
        cardNumber: "",
        nameOnCard: "",
        expMonth: "",
        expYear: "",
        cvv: "",
        default: paymentMethods.length === 0, // First payment is default
      })
    }
    setPaymentError("")
    setPaymentDialog(true)
  }

  const savePaymentMethod = async () => {
    // Validate form
    if (
      !paymentForm.cardNumber ||
      !paymentForm.nameOnCard ||
      !paymentForm.expMonth ||
      !paymentForm.expYear ||
      (!paymentForm.id && !paymentForm.cvv)
    ) {
      setPaymentError("Please fill in all required fields")
      return
    }

    try {
      const method = paymentForm.id ? "PUT" : "POST"
      const url = paymentForm.id ? `/api/user/payment-methods/${paymentForm.id}` : `/api/user/payment-methods`

      // Don't send full card number if it starts with asterisks (editing existing card)
      const formData = { ...paymentForm }
      if (formData.cardNumber.startsWith("*")) {
        delete formData.cardNumber
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        fetchPaymentMethods() // Refresh payment methods
        setPaymentDialog(false)
        toast({
          title: paymentForm.id ? "Payment Method Updated" : "Payment Method Added",
          description: paymentForm.id ? "Your payment method has been updated" : "New payment method has been added",
        })
      } else {
        setPaymentError(data.message || "Failed to save payment method")
      }
    } catch (error) {
      console.error("Error saving payment method:", error)
      setPaymentError("An error occurred while saving your payment method")
    }
  }

  const deletePaymentMethod = async (paymentId) => {
    try {
      const response = await fetch(`/api/user/payment-methods/${paymentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        fetchPaymentMethods() // Refresh payment methods
        toast({
          title: "Payment Method Deleted",
          description: "Your payment method has been deleted",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete payment method",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting payment method:", error)
      toast({
        title: "Error",
        description: "Failed to delete payment method",
        variant: "destructive",
      })
    }
  }

  const setDefaultPaymentMethod = async (paymentId) => {
    try {
      const response = await fetch(`/api/user/payment-methods/${paymentId}/default`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        fetchPaymentMethods() // Refresh payment methods
        toast({
          title: "Default Payment Method Updated",
          description: "Your default payment method has been updated",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update default payment method",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error setting default payment method:", error)
      toast({
        title: "Error",
        description: "Failed to update default payment method",
        variant: "destructive",
      })
    }
  }

  // Profile operations
  const openProfileDialog = () => {
    const nameParts = user?.name ? user.name.split(" ") : ["", ""]
    setProfileForm({
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      email: user?.email || "",
      phone: userProfile?.phone || "",
    })
    setProfileError("")
    setProfileDialog(true)
  }

  const saveProfile = async () => {
    // Validate form
    if (!profileForm.firstName || !profileForm.email) {
      setProfileError("Please fill in all required fields")
      return
    }

    try {
      const response = await fetch(`/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: `${profileForm.firstName} ${profileForm.lastName}`.trim(),
          email: profileForm.email,
          phone: profileForm.phone,
        }),
      })

      const data = await response.json()

      if (data.success) {
        fetchUserProfile() // Refresh profile
        setProfileDialog(false)
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated",
        })
      } else {
        setProfileError(data.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setProfileError("An error occurred while updating your profile")
    }
  }

  // Password operations
  const openPasswordDialog = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setPasswordError("")
    setPasswordDialog(true)
  }

  const changePassword = async () => {
    // Validate form
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("Please fill in all fields")
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters")
      return
    }

    try {
      const response = await fetch(`/api/user/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPasswordDialog(false)
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully",
        })
      } else {
        setPasswordError(data.message || "Failed to change password")
      }
    } catch (error) {
      console.error("Error changing password:", error)
      setPasswordError("An error occurred while changing your password")
    }
  }

  // Communication preferences
  const saveCommunicationPreferences = async () => {
    try {
      const response = await fetch(`/api/user/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(communicationPrefs),
      })

      const data = await response.json()

      if (data.success) {
        fetchUserProfile() // Refresh profile
        toast({
          title: "Preferences Saved",
          description: "Your communication preferences have been updated",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update preferences",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating preferences:", error)
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      })
    }
  }

  // Account deletion
  const confirmDeleteAccount = () => {
    setDeleteAccountDialog(true)
  }

  const deleteAccount = async () => {
    try {
      const response = await fetch(`/api/user/delete-account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        logout()
        router.push("/")
        toast({
          title: "Account Deleted",
          description: "Your account has been permanently deleted",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete account",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      })
    } finally {
      setDeleteAccountDialog(false)
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

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    })

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
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
                  {wishlist.length > 0 && (
                    <span className="ml-auto bg-[#D4AF37] text-black text-xs px-2 py-1 rounded-full">
                      {wishlist.length}
                    </span>
                  )}
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
                  <span className="font-medium capitalize">{loyaltyInfo.tier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-beige">Available Points</span>
                  <span className="font-medium">{loyaltyInfo.points}</span>
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
                        tier={loyaltyInfo.tier}
                        points={loyaltyInfo.points}
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

                    {loadingAddresses ? (
                      <div className="flex items-center justify-center py-4">
                        <RefreshCw className="animate-spin text-[#D4AF37]" size={20} />
                      </div>
                    ) : addresses.length > 0 ? (
                      <div>
                        {addresses.find((a) => a.default) ? (
                          <>
                            <p className="font-medium">{addresses.find((a) => a.default).name}</p>
                            <p className="text-beige">{addresses.find((a) => a.default).street}</p>
                            <p className="text-beige">
                              {addresses.find((a) => a.default).city}, {addresses.find((a) => a.default).state}{" "}
                              {addresses.find((a) => a.default).zip}
                            </p>
                            <p className="text-beige">{addresses.find((a) => a.default).country}</p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium">{addresses[0].name}</p>
                            <p className="text-beige">{addresses[0].street}</p>
                            <p className="text-beige">
                              {addresses[0].city}, {addresses[0].state} {addresses[0].zip}
                            </p>
                            <p className="text-beige">{addresses[0].country}</p>
                          </>
                        )}
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

                    {loadingPayments ? (
                      <div className="flex items-center justify-center py-4">
                        <RefreshCw className="animate-spin text-[#D4AF37]" size={20} />
                      </div>
                    ) : paymentMethods.length > 0 ? (
                      <div>
                        {paymentMethods.find((p) => p.default) ? (
                          <>
                            <p className="font-medium capitalize">{paymentMethods.find((p) => p.default).type}</p>
                            <p className="text-beige">**** **** **** {paymentMethods.find((p) => p.default).last4}</p>
                            <p className="text-beige">
                              Expires: {paymentMethods.find((p) => p.default).expMonth}/
                              {paymentMethods.find((p) => p.default).expYear}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium capitalize">{paymentMethods[0].type}</p>
                            <p className="text-beige">**** **** **** {paymentMethods[0].last4}</p>
                            <p className="text-beige">
                              Expires: {paymentMethods[0].expMonth}/{paymentMethods[0].expYear}
                            </p>
                          </>
                        )}
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

                    {loadingWishlist ? (
                      <div className="flex items-center justify-center py-4">
                        <RefreshCw className="animate-spin text-[#D4AF37]" size={20} />
                      </div>
                    ) : wishlist.length > 0 ? (
                      <p className="text-beige">{wishlist.length} items in your wishlist</p>
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

              {/* Wishlist Tab */}
              <TabsContent value="wishlist" className="mt-0">
                <div className="bg-[#111] border border-[#333] p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                    <Heart className="mr-2 text-[#D4AF37]" size={20} />
                    My Wishlist
                  </h2>

                  {loadingWishlist ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="animate-spin text-[#D4AF37] mr-2" size={24} />
                      <span className="text-beige">Loading wishlist...</span>
                    </div>
                  ) : wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {wishlist.map((item) => (
                        <div key={item.id} className="bg-[#222] border border-[#333] p-4 flex">
                          <div className="w-20 h-20 bg-[#333] relative mr-4">
                            <Image
                              src={item.image || "/placeholder.svg?height=100&width=100"}
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
                              <span className="font-medium">${item.price?.toFixed(2)}</span>
                              <div className="space-x-2">
                                <Button
                                  size="sm"
                                  className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
                                  onClick={() => handleAddToCart(item)}
                                >
                                  Add to Cart
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-[#333] text-white hover:bg-[#333]"
                                  onClick={() => removeFromWishlist(item.id)}
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
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center">
                      <MapPin className="mr-2 text-[#D4AF37]" size={20} />
                      My Addresses
                    </h2>
                    <Button className="bg-[#D4AF37] hover:bg-[#B8860B] text-black" onClick={() => openAddressDialog()}>
                      <Plus size={16} className="mr-2" />
                      Add Address
                    </Button>
                  </div>

                  {loadingAddresses ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="animate-spin text-[#D4AF37] mr-2" size={24} />
                      <span className="text-beige">Loading addresses...</span>
                    </div>
                  ) : addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((address) => (
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
                              onClick={() => openAddressDialog(address)}
                            >
                              <Edit size={14} className="mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#333] text-white hover:bg-[#333]"
                              onClick={() => deleteAddress(address.id)}
                            >
                              <Trash size={14} className="mr-1" />
                              Remove
                            </Button>
                            {!address.default && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-[#333] text-white hover:bg-[#333]"
                                onClick={() => setDefaultAddress(address.id)}
                              >
                                Set as Default
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="mx-auto text-[#333] mb-4" size={48} />
                      <h3 className="text-lg font-medium mb-2">No Addresses Saved</h3>
                      <p className="text-beige mb-4">Add a shipping address to speed up checkout.</p>
                      <Button
                        className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
                        onClick={() => openAddressDialog()}
                      >
                        Add New Address
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Payment Methods Tab */}
              <TabsContent value="payment" className="mt-0">
                <div className="bg-[#111] border border-[#333] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center">
                      <CreditCard className="mr-2 text-[#D4AF37]" size={20} />
                      Payment Methods
                    </h2>
                    <Button className="bg-[#D4AF37] hover:bg-[#B8860B] text-black" onClick={() => openPaymentDialog()}>
                      <Plus size={16} className="mr-2" />
                      Add Payment Method
                    </Button>
                  </div>

                  {loadingPayments ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="animate-spin text-[#D4AF37] mr-2" size={24} />
                      <span className="text-beige">Loading payment methods...</span>
                    </div>
                  ) : paymentMethods.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paymentMethods.map((method) => (
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

                          <p className="text-beige mb-4">
                            Expires: {method.expMonth}/{method.expYear}
                          </p>

                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
                              onClick={() => openPaymentDialog(method)}
                            >
                              <Edit size={14} className="mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#333] text-white hover:bg-[#333]"
                              onClick={() => deletePaymentMethod(method.id)}
                            >
                              <Trash size={14} className="mr-1" />
                              Remove
                            </Button>
                            {!method.default && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-[#333] text-white hover:bg-[#333]"
                                onClick={() => setDefaultPaymentMethod(method.id)}
                              >
                                Set as Default
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="mx-auto text-[#333] mb-4" size={48} />
                      <h3 className="text-lg font-medium mb-2">No Payment Methods Saved</h3>
                      <p className="text-beige mb-4">Add a payment method to speed up checkout.</p>
                      <Button
                        className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
                        onClick={() => openPaymentDialog()}
                      >
                        Add Payment Method
                      </Button>
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
                      tier={loyaltyInfo.tier}
                      points={loyaltyInfo.points}
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
                        <span>{loyaltyInfo.points}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-beige">Current Tier</span>
                        <span className="capitalize">{loyaltyInfo.tier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-beige">Next Tier</span>
                        <span className="capitalize">{loyaltyInfo.nextTier}</span>
                      </div>
                    </div>

                    <div className="bg-[#222] border border-[#333] p-4">
                      <h3 className="font-medium mb-3">Next Tier Progress</h3>
                      <div className="mb-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-beige">Points to {loyaltyInfo.nextTier}</span>
                          <span className="text-sm text-beige">{loyaltyInfo.pointsToNextTier} more</span>
                        </div>
                        <div className="w-full bg-[#333] h-2">
                          <div
                            className="bg-[#D4AF37] h-2"
                            style={{
                              width: `${(loyaltyInfo.points / (loyaltyInfo.points + loyaltyInfo.pointsToNextTier)) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-sm text-beige">
                        Earn {loyaltyInfo.pointsToNextTier} more points to reach {loyaltyInfo.nextTier} status
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
                              className="w-full bg-black border border-[#333] p-2 text-white"
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-beige mb-1">Last Name</label>
                            <input
                              type="text"
                              value={user?.name?.split(" ")[1] || ""}
                              className="w-full bg-black border border-[#333] p-2 text-white"
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm text-beige mb-1">Email</label>
                          <input
                            type="email"
                            value={user?.email || ""}
                            className="w-full bg-black border border-[#333] p-2 text-white"
                            readOnly
                          />
                        </div>
                        <Button
                          variant="outline"
                          className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
                          onClick={openProfileDialog}
                        >
                          Edit Profile
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3">Password</h3>
                      <div className="bg-[#222] border border-[#333] p-4">
                        <p className="text-beige mb-4">Change your account password</p>
                        <Button
                          variant="outline"
                          className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
                          onClick={openPasswordDialog}
                        >
                          Change Password
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3">Communication Preferences</h3>
                      <div className="bg-[#222] border border-[#333] p-4">
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="emailOrders"
                              checked={communicationPrefs.orderUpdates}
                              onCheckedChange={(checked) =>
                                setCommunicationPrefs({ ...communicationPrefs, orderUpdates: checked })
                              }
                            />
                            <label htmlFor="emailOrders" className="text-beige">
                              Order confirmations and updates
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="emailPromos"
                              checked={communicationPrefs.promotions}
                              onCheckedChange={(checked) =>
                                setCommunicationPrefs({ ...communicationPrefs, promotions: checked })
                              }
                            />
                            <label htmlFor="emailPromos" className="text-beige">
                              Promotions and discounts
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="emailNews"
                              checked={communicationPrefs.news}
                              onCheckedChange={(checked) =>
                                setCommunicationPrefs({ ...communicationPrefs, news: checked })
                              }
                            />
                            <label htmlFor="emailNews" className="text-beige">
                              News and product updates
                            </label>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
                          onClick={saveCommunicationPreferences}
                        >
                          Save Preferences
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3 text-red-500">Danger Zone</h3>
                      <div className="bg-[#222] border border-red-900/30 p-4">
                        <p className="text-beige mb-4">Permanently delete your account and all associated data.</p>
                        <Button
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-500/10"
                          onClick={confirmDeleteAccount}
                        >
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

        {/* Address Dialog */}
        <Dialog open={addressDialog} onOpenChange={setAddressDialog}>
          <DialogContent className="bg-[#111] border border-[#333] text-white">
            <DialogHeader>
              <DialogTitle>{addressForm.id ? "Edit Address" : "Add New Address"}</DialogTitle>
            </DialogHeader>

            {addressError && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-300 mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{addressError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="address-name">Address Name</Label>
                <Input
                  id="address-name"
                  placeholder="Home, Work, etc."
                  className="bg-[#222] border-[#333] text-white"
                  value={addressForm.name}
                  onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="street">Street Address</Label>
                <Textarea
                  id="street"
                  placeholder="123 Main St, Apt 4B"
                  className="bg-[#222] border-[#333] text-white"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    className="bg-[#222] border-[#333] text-white"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    className="bg-[#222] border-[#333] text-white"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    placeholder="ZIP Code"
                    className="bg-[#222] border-[#333] text-white"
                    value={addressForm.zip}
                    onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={addressForm.country}
                    onValueChange={(value) => setAddressForm({ ...addressForm, country: value })}
                  >
                    <SelectTrigger className="bg-[#222] border-[#333] text-white">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#222] border-[#333] text-white">
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="Mexico">Mexico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="default-address"
                  checked={addressForm.default}
                  onCheckedChange={(checked) => setAddressForm({ ...addressForm, default: checked })}
                />
                <Label htmlFor="default-address">Set as default address</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setAddressDialog(false)}>
                  Cancel
                </Button>
                <Button className="bg-[#D4AF37] hover:bg-[#B8860B] text-black" onClick={saveAddress}>
                  {addressForm.id ? "Update" : "Add"} Address
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Method Dialog */}
        <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
          <DialogContent className="bg-[#111] border border-[#333] text-white">
            <DialogHeader>
              <DialogTitle>{paymentForm.id ? "Edit Payment Method" : "Add New Payment Method"}</DialogTitle>
            </DialogHeader>

            {paymentError && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-300 mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{paymentError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="card-type">Card Type</Label>
                <Select
                  value={paymentForm.type}
                  onValueChange={(value) => setPaymentForm({ ...paymentForm, type: value })}
                >
                  <SelectTrigger className="bg-[#222] border-[#333] text-white">
                    <SelectValue placeholder="Select card type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#222] border-[#333] text-white">
                    <SelectItem value="visa">Visa</SelectItem>
                    <SelectItem value="mastercard">Mastercard</SelectItem>
                    <SelectItem value="amex">American Express</SelectItem>
                    <SelectItem value="discover">Discover</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="card-number">Card Number</Label>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  className="bg-[#222] border-[#333] text-white"
                  value={paymentForm.cardNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="name-on-card">Name on Card</Label>
                <Input
                  id="name-on-card"
                  placeholder="John Doe"
                  className="bg-[#222] border-[#333] text-white"
                  value={paymentForm.nameOnCard}
                  onChange={(e) => setPaymentForm({ ...paymentForm, nameOnCard: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="exp-month">Exp Month</Label>
                  <Select
                    value={paymentForm.expMonth}
                    onValueChange={(value) => setPaymentForm({ ...paymentForm, expMonth: value })}
                  >
                    <SelectTrigger className="bg-[#222] border-[#333] text-white">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#222] border-[#333] text-white">
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1).padStart(2, "0")}>
                          {String(i + 1).padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="exp-year">Exp Year</Label>
                  <Select
                    value={paymentForm.expYear}
                    onValueChange={(value) => setPaymentForm({ ...paymentForm, expYear: value })}
                  >
                    <SelectTrigger className="bg-[#222] border-[#333] text-white">
                      <SelectValue placeholder="YYYY" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#222] border-[#333] text-white">
                      {Array.from({ length: 10 }, (_, i) => (
                        <SelectItem key={i} value={String(new Date().getFullYear() + i)}>
                          {new Date().getFullYear() + i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    className="bg-[#222] border-[#333] text-white"
                    value={paymentForm.cvv}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="default-payment"
                  checked={paymentForm.default}
                  onCheckedChange={(checked) => setPaymentForm({ ...paymentForm, default: checked })}
                />
                <Label htmlFor="default-payment">Set as default payment method</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setPaymentDialog(false)}>
                  Cancel
                </Button>
                <Button className="bg-[#D4AF37] hover:bg-[#B8860B] text-black" onClick={savePaymentMethod}>
                  {paymentForm.id ? "Update" : "Add"} Payment Method
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Profile Dialog */}
        <Dialog open={profileDialog} onOpenChange={setProfileDialog}>
          <DialogContent className="bg-[#111] border border-[#333] text-white">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>

            {profileError && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-300 mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{profileError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first-name">First Name</Label>
                  <Input
                    id="first-name"
                    placeholder="First Name"
                    className="bg-[#222] border-[#333] text-white"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input
                    id="last-name"
                    placeholder="Last Name"
                    className="bg-[#222] border-[#333] text-white"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  className="bg-[#222] border-[#333] text-white"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  className="bg-[#222] border-[#333] text-white"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setProfileDialog(false)}>
                  Cancel
                </Button>
                <Button className="bg-[#D4AF37] hover:bg-[#B8860B] text-black" onClick={saveProfile}>
                  Update Profile
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Password Dialog */}
        <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
          <DialogContent className="bg-[#111] border border-[#333] text-white">
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
            </DialogHeader>

            {passwordError && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-300 mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="Enter current password"
                  className="bg-[#222] border-[#333] text-white"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  className="bg-[#222] border-[#333] text-white"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  className="bg-[#222] border-[#333] text-white"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setPasswordDialog(false)}>
                  Cancel
                </Button>
                <Button className="bg-[#D4AF37] hover:bg-[#B8860B] text-black" onClick={changePassword}>
                  Change Password
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Account Dialog */}
        <Dialog open={deleteAccountDialog} onOpenChange={setDeleteAccountDialog}>
          <DialogContent className="bg-[#111] border border-[#333] text-white">
            <DialogHeader>
              <DialogTitle className="text-red-500">Delete Account</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This action cannot be undone. This will permanently delete your account and remove all your data from
                  our servers.
                </AlertDescription>
              </Alert>

              <p className="text-beige">
                Are you sure you want to delete your account? All your orders, wishlist, addresses, and other data will
                be permanently removed.
              </p>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setDeleteAccountDialog(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={deleteAccount}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
