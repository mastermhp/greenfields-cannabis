"use client"

import { useState, useEffect } from "react"

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/categories")
      const data = await response.json()

      if (data.success) {
        // Transform the categories to match the expected format
        const formattedCategories = data.categories.map((category) => ({
          id: category.value || category.slug || category._id,
          name: category.label || category.name,
          slug: category.value || category.slug,
          description: category.description || `Explore our ${category.label || category.name} collection`,
          image: category.image || "/placeholder.svg?height=200&width=200",
        }))
        setCategories(formattedCategories)
      } else {
        setError(data.error || "Failed to fetch categories")
      }
    } catch (err) {
      console.error("Error fetching categories:", err)
      setError("Failed to fetch categories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return { categories, loading, error, refetch: () => fetchCategories() }
}
