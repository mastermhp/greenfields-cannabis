"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
        setIsAuthenticated(true)
      } else if (response.status === 401) {
        // Token expired, try to refresh
        await refreshToken()
      } else {
        // Clear invalid token
        localStorage.removeItem("accessToken")
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("accessToken")
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
        localStorage.setItem("accessToken", data.accessToken)
        setUser(data.user)
        setIsAuthenticated(true)
        return true
      } else {
        // Refresh failed, user needs to login again
        logout()
        return false
      }
    } catch (error) {
      console.error("Token refresh failed:", error)
      logout()
      return false
    }
  }

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies
        body: JSON.stringify({ email, password, rememberMe }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("accessToken", data.accessToken)
        setUser(data.user)
        setIsAuthenticated(true)
        return { success: true, user: data.user }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error("Login failed:", error)
      return { success: false, error: "Login failed. Please try again." }
    }
  }

  const adminLogin = async (email, password) => {
    try {
      const response = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("accessToken", data.accessToken)
        setUser(data.user)
        setIsAuthenticated(true)
        return { success: true, user: data.user }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error("Admin login failed:", error)
      return { success: false, error: "Admin login failed. Please try again." }
    }
  }

  const register = async (userData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error("Registration failed:", error)
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
      setUser(null)
      setIsAuthenticated(false)
      router.push("/")
    }
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    adminLogin,
    register,
    logout,
    refreshToken,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
