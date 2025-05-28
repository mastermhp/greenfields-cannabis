"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [accessToken, setAccessToken] = useState(null)
  const { toast } = useToast()
  const router = useRouter()

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Check for access token in localStorage or cookies
      const storedToken = localStorage.getItem("accessToken") || getCookie("accessToken")

      if (!storedToken) {
        setLoading(false)
        return
      }

      setAccessToken(storedToken)

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
      } else {
        // Token invalid, clear it
        localStorage.removeItem("accessToken")
        setAccessToken(null)
      }
    } catch (error) {
      console.error("Auth check error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCookie = (name) => {
    if (typeof document === "undefined") return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(";").shift()
    return null
  }

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password, rememberMe }),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        setIsAuthenticated(true)
        setAccessToken(data.accessToken)
        localStorage.setItem("accessToken", data.accessToken)

        toast({
          title: "Welcome back!",
          description: data.message,
          variant: "default",
        })

        // Redirect based on user role
        if (data.user.isAdmin || data.user.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/")
        }

        return {
          success: true,
          user: data.user,
          message: data.message,
        }
      } else {
        toast({
          title: "Login Failed",
          description: data.error,
          variant: "destructive",
        })

        return {
          success: false,
          error: data.error,
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Connection Error",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive",
      })

      return {
        success: false,
        error: "Network error. Please try again.",
      }
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

      if (data.success) {
        toast({
          title: "Account Created!",
          description: data.message,
          variant: "default",
        })

        return {
          success: true,
          message: data.message,
        }
      } else {
        toast({
          title: "Registration Failed",
          description: data.error,
          variant: "destructive",
        })

        return {
          success: false,
          error: data.error,
        }
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Connection Error",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive",
      })

      return {
        success: false,
        error: "Network error. Please try again.",
      }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        variant: "default",
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      setAccessToken(null)
      localStorage.removeItem("accessToken")
      router.push("/")
    }
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        accessToken,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
