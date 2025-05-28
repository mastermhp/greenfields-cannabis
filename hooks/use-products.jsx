"use client"

import { useState, useEffect } from "react"

export function useProducts(options = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()

        if (options.category) {
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

        const response = await fetch(`/api/products?${params.toString()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }

        const data = await response.json()

        // If we requested featured products but got none, fetch regular products as fallback
        if (options.featured && data.products.length === 0) {
          const fallbackParams = new URLSearchParams()
          if (options.category) fallbackParams.append("category", options.category)
          if (options.limit) fallbackParams.append("limit", options.limit.toString())

          const fallbackResponse = await fetch(`/api/products?${fallbackParams.toString()}`, {
            cache: "no-store",
          })

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            setProducts(fallbackData.products || [])
          } else {
            setProducts([])
          }
        } else {
          setProducts(data.products || [])
        }
      } catch (err) {
        console.error("Error fetching products:", err)
        setError(err.message)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [options.category, options.search, options.featured, options.limit])

  return { products, loading, error }
}

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCategories = async () => {
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
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return { categories, loading, error, refetch: () => fetchCategories() }
}
