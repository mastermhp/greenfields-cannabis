"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

export const useProducts = (options = {}) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()

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

      if (options.inStock) {
        params.append("inStock", "true")
      }

      if (options.limit) {
        params.append("limit", options.limit.toString())
      }

      if (options.sort) {
        params.append("sort", options.sort)
      }

      if (options.minPrice !== undefined) {
        params.append("minPrice", options.minPrice.toString())
      }

      if (options.maxPrice !== undefined) {
        params.append("maxPrice", options.maxPrice.toString())
      }

      const url = `/api/products?${params.toString()}`
      console.log("Fetching products from:", url)

      const response = await fetch(url, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setProducts(data.products || data.data || [])
      } else {
        throw new Error(data.error || "Failed to fetch products")
      }
    } catch (err) {
      console.error("Error fetching products:", err)
      setError(err.message)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [
    options.category,
    options.search,
    options.featured,
    options.inStock,
    options.limit,
    options.sort,
    options.minPrice,
    options.maxPrice,
  ])

  const deleteProduct = useCallback(
    async (productId) => {
      try {
        console.log("Deleting product:", productId)
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error(`Failed to delete product: ${response.status}`)
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || "Failed to delete product")
        }

        // Update local state by removing the deleted product
        setProducts((prevProducts) => prevProducts.filter((product) => (product._id || product.id) !== productId))

        toast({
          title: "Success",
          description: "Product deleted successfully",
        })

        return true
      } catch (err) {
        console.error("Error deleting product:", err)
        toast({
          title: "Error",
          description: `Failed to delete product: ${err.message}`,
          variant: "destructive",
        })
        throw err
      }
    },
    [toast],
  )

  const updateProduct = useCallback(
    async (productId, productData) => {
      try {
        console.log("Updating product:", productId, productData)
        const response = await fetch(`/api/products/${productId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        })

        if (!response.ok) {
          throw new Error(`Failed to update product: ${response.status}`)
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || "Failed to update product")
        }

        // Update local state
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            (product._id || product.id) === productId ? { ...product, ...productData } : product,
          ),
        )

        toast({
          title: "Success",
          description: "Product updated successfully",
        })

        return data.data
      } catch (err) {
        console.error("Error updating product:", err)
        toast({
          title: "Error",
          description: `Failed to update product: ${err.message}`,
          variant: "destructive",
        })
        throw err
      }
    },
    [toast],
  )

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    deleteProduct,
    updateProduct,
  }
}

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/categories")
      const data = await response.json()

      if (data.success) {
        setCategories(data.data || [])
      } else {
        throw new Error(data.error || "Failed to fetch categories")
      }
    } catch (err) {
      console.error("Error fetching categories:", err)
      setError(err.message)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return { categories, loading, error, refetch: fetchCategories }
}
