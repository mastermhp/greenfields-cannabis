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
    // First try from state
    if (accessToken) {
      return accessToken
    }

    // Then try from localStorage
    const storedToken = localStorage.getItem("accessToken")
    if (storedToken) {
      // Update state if found in localStorage
      setAccessToken(storedToken)
      return storedToken
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
        await refreshToken()
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
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
