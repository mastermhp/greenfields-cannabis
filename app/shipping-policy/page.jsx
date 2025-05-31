"use client"

import { useState, useEffect } from "react"

const ShippingPolicyPage = () => {
  const [content, setContent] = useState({
    shippingPolicy: "Default shipping policy content...",
    returnPolicy: "Default return policy content...",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch("/api/content-management?page=policies")
        const data = await response.json()
        if (data.success && data.data) {
          setContent((prev) => ({ ...prev, ...data.data }))
        }
      } catch (error) {
        console.error("Error fetching policy content:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Shipping Policy</h1>
      {loading ? (
        <p>Loading shipping policy...</p>
      ) : (
        <p>{content.shippingPolicy || "Fallback shipping policy text."}</p>
      )}
    </div>
  )
}

export default ShippingPolicyPage
