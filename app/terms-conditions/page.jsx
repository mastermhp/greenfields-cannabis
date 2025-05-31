"use client"

import { useState, useEffect } from "react"

const TermsConditionsPage = () => {
  const [content, setContent] = useState({
    termsConditions: "Default terms and conditions content...",
    privacyPolicy: "Default privacy policy content...",
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
        console.error("Error fetching terms content:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Terms & Conditions</h1>
      {loading ? (
        <p>Loading terms and conditions...</p>
      ) : (
        <div className="prose">{content.termsConditions || "Fallback terms and conditions text."}</div>
      )}
    </div>
  )
}

export default TermsConditionsPage
