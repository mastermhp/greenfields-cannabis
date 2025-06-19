"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  // Add debugging for token
  console.log("useAuth: accessToken present:", !!context.accessToken)
  if (context.accessToken) {
    console.log("useAuth: token length:", context.accessToken.length)
    console.log("useAuth: token preview:", context.accessToken.substring(0, 20) + "...")
  }

  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [accessToken, setAccessToken] = useState(null)
  const router = useRouter()
  const { toast } = useToast()

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Get token function
  const getToken = () => {
    // Always try localStorage first for the most up-to-date token
    const storedToken = localStorage.getItem("accessToken")
    if (storedToken) {
      // Update state if it's different from what we have
      if (storedToken !== accessToken) {
        setAccessToken(storedToken)
      }
      return storedToken
    }

    // Fallback to state if localStorage is empty
    if (accessToken) {
      return accessToken
    }

    return null
  }

  // Update the checkAuth function to properly handle the token
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        console.log("No token found in localStorage")
        setLoading(false)
        return
      }

      console.log("Token found in localStorage, length:", token.length)
      console.log("Token preview:", token.substring(0, 20) + "...")

      // Validate token format
      if (!token.includes(".") || token.split(".").length !== 3) {
        console.log("Invalid token format in localStorage")
        localStorage.removeItem("accessToken")
        setLoading(false)
        return
      }

      setAccessToken(token)

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
        setIsAuthenticated(true)
        console.log("User authenticated:", userData.user)
      } else if (response.status === 401) {
        // Token expired, try to refresh
        console.log("Token expired, attempting refresh")
        const refreshSuccess = await refreshToken()
        if (!refreshSuccess) {
          setLoading(false)
          return
        }
      } else {
        // Clear invalid token
        console.log("Invalid token, clearing from storage")
        localStorage.removeItem("accessToken")
        setAccessToken(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("accessToken")
      setAccessToken(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshToken = async () => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include", // Include HTTP-only cookies
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Token refreshed successfully")
        localStorage.setItem("accessToken", data.accessToken)
        setAccessToken(data.accessToken)
        setUser(data.user)
        setIsAuthenticated(true)
        return true
      } else {
        // Refresh failed, user needs to login again
        console.log("Token refresh failed, logging out")
        logout()
        return false
      }
    } catch (error) {
      console.error("Token refresh failed:", error)
      logout()
      return false
    }
  }

  // Update the login function to ensure token is properly stored
  const login = async (email, password, rememberMe = false, isAdminLogin = false) => {
    try {
      const endpoint = isAdminLogin ? "/api/admin-login" : "/api/auth/login"
      console.log(`Attempting ${isAdminLogin ? "admin" : "user"} login for ${email}`)

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies
        body: JSON.stringify({ email, password, rememberMe }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("Login successful, token received")

        // Validate token format
        if (!data.accessToken || !data.accessToken.includes(".") || data.accessToken.split(".").length !== 3) {
          console.error("Received invalid token format from server")
          toast({
            title: "Login Error",
            description: "Authentication error. Please try again.",
            variant: "destructive",
          })
          return { success: false, error: "Invalid token format" }
        }

        console.log("Token length:", data.accessToken.length)
        console.log("Token preview:", data.accessToken.substring(0, 20) + "...")

        // Store token in localStorage and state
        localStorage.setItem("accessToken", data.accessToken)
        setAccessToken(data.accessToken)
        setUser(data.user)
        setIsAuthenticated(true)

        // Show success toast
        toast({
          title: isAdminLogin ? "Admin Login Successful" : "Login Successful",
          description: `Welcome back${data.user?.name ? ", " + data.user.name : ""}!`,
        })

        // Redirect based on role
        if (isAdminLogin && (data.user?.role === "admin" || data.user?.isAdmin)) {
          router.push("/admin")
        } else {
          const redirectPath = localStorage.getItem("redirectAfterLogin") || "/"
          localStorage.removeItem("redirectAfterLogin")
          router.push(redirectPath)
        }

        return { success: true, user: data.user }
      } else {
        console.error("Login failed:", data.error)
        // Show error toast
        toast({
          title: "Login Failed",
          description: data.error || "Invalid credentials. Please try again.",
          variant: "destructive",
        })

        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error("Login failed:", error)

      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })

      return { success: false, error: "Login failed. Please try again." }
    }
  }

  const register = async (name, email, password, confirmPassword) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Registration Successful",
          description: "Your account has been created. You can now log in.",
        })

        return { success: true, message: data.message }
      } else {
        toast({
          title: "Registration Failed",
          description: data.error || "Could not create account. Please try again.",
          variant: "destructive",
        })

        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error("Registration failed:", error)

      toast({
        title: "Registration Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })

      return { success: false, error: "Registration failed. Please try again." }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("accessToken")
      setAccessToken(null)
      setUser(null)
      setIsAuthenticated(false)
      router.push("/")
    }
  }

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Reset Email Sent",
          description: "Check your email for password reset instructions.",
        })
        return { success: true, message: data.message }
      } else {
        toast({
          title: "Reset Failed",
          description: data.error || "Could not send reset email. Please try again.",
          variant: "destructive",
        })
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error("Forgot password failed:", error)
      toast({
        title: "Reset Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return { success: false, error: "Reset failed. Please try again." }
    }
  }

  // Reset password function
  const resetPassword = async (token, password, confirmPassword) => {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password, confirmPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Password Reset Successful",
          description: "Your password has been updated. You can now log in.",
        })
        return { success: true, message: data.message }
      } else {
        toast({
          title: "Reset Failed",
          description: data.error || "Could not reset password. Please try again.",
          variant: "destructive",
        })
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error("Reset password failed:", error)
      toast({
        title: "Reset Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return { success: false, error: "Reset failed. Please try again." }
    }
  }

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const token = getToken()
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to update your profile.",
          variant: "destructive",
        })
        return { success: false, error: "Not authenticated" }
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        })
        return { success: true, user: data.user }
      } else {
        toast({
          title: "Update Failed",
          description: data.error || "Could not update profile. Please try again.",
          variant: "destructive",
        })
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error("Profile update failed:", error)
      toast({
        title: "Update Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return { success: false, error: "Update failed. Please try again." }
    }
  }

  // Change password
  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      const token = getToken()
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to change your password.",
          variant: "destructive",
        })
        return { success: false, error: "Not authenticated" }
      }

      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully.",
        })
        return { success: true, message: data.message }
      } else {
        toast({
          title: "Change Failed",
          description: data.error || "Could not change password. Please try again.",
          variant: "destructive",
        })
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error("Password change failed:", error)
      toast({
        title: "Change Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return { success: false, error: "Change failed. Please try again." }
    }
  }

  // Delete account
  const deleteAccount = async (password) => {
    try {
      const token = getToken()
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to delete your account.",
          variant: "destructive",
        })
        return { success: false, error: "Not authenticated" }
      }

      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Account Deleted",
          description: "Your account has been deleted successfully.",
        })
        logout()
        return { success: true, message: data.message }
      } else {
        toast({
          title: "Delete Failed",
          description: data.error || "Could not delete account. Please try again.",
          variant: "destructive",
        })
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error("Account deletion failed:", error)
      toast({
        title: "Delete Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return { success: false, error: "Delete failed. Please try again." }
    }
  }

  // Admin login function
  const adminLogin = async (email, password, rememberMe = false) => {
    return await login(email, password, rememberMe, true)
  }

  // Check if user is admin
  const isAdmin = () => {
    return user && (user.role === "admin" || user.isAdmin)
  }

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!user) return false
    if (isAdmin()) return true
    return user.permissions && user.permissions.includes(permission)
  }

  // Refresh user data
  const refreshUser = async () => {
    try {
      const token = getToken()
      if (!token) return false

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
        return true
      }
      return false
    } catch (error) {
      console.error("User refresh failed:", error)
      return false
    }
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    accessToken,
    getToken,
    login,
    register,
    logout,
    refreshToken,
    checkAuth,
    setUser,
    setIsAuthenticated,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    deleteAccount,
    adminLogin,
    isAdmin,
    hasPermission,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
