"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

export const useProducts = (options = {}) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()
  const { accessToken } = useAuth()

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()

      if (options.category && options.category !== "all") {
        params.append("category", options.category)
      }

      if (options.search) {
        params.append("search", options.search)
      }

      if (options.featured) {
        params.append("featured", "true")
      }

      if (options.limit) {
        params.append("limit", options.limit.toString())
      }

      const url = `/api/products${params.toString() ? `?${params.toString()}` : ""}`
      console.log("Fetching products from:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Products API response:", data)

      if (data.success) {
        setProducts(data.products || [])
      } else {
        throw new Error(data.error || "Failed to fetch products")
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      setError(error.message)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [options.category, options.search, options.featured, options.limit])

  const deleteProduct = useCallback(
    async (productId) => {
      try {
        console.log("Deleting product:", productId)

        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
          credentials: "include",
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Delete API Error:", errorText)

          let errorMessage = "Failed to delete product"
          try {
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.error || errorData.message || errorMessage
          } catch {
            errorMessage = `Server error (${response.status})`
          }

          throw new Error(errorMessage)
        }

        const result = await response.json()

        if (result.success) {
          toast({
            title: "Success",
            description: "Product deleted successfully",
          })
          return true
        } else {
          throw new Error(result.error || "Failed to delete product")
        }
      } catch (error) {
        console.error("Error deleting product:", error)
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
        return false
      }
    },
    [accessToken, toast],
  )

  const refetch = useCallback(() => {
    return fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    loading,
    error,
    deleteProduct,
    refetch,
  }
}

export const useCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/categories", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Categories API response:", data)

      if (data.success) {
        setCategories(data.categories || [])
      } else {
        throw new Error(data.error || "Failed to fetch categories")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      setError(error.message)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [])

  const refetch = useCallback(() => {
    return fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    loading,
    error,
    refetch,
  }
}
