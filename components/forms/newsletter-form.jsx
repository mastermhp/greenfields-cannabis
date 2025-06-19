"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send, Check, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

const NewsletterForm = ({ className = "", variant = "default" }) => {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      console.log("Submitting newsletter subscription for:", email)

      // Save to database
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      console.log("Newsletter API response:", data)

      if (data.success) {
        setSuccess(true)
        setEmail("")

        toast({
          title: "Subscription Successful",
          description: data.message || "Thank you for subscribing to our newsletter!",
        })

        // Reset success state after 3 seconds
        setTimeout(() => {
          setSuccess(false)
        }, 3000)
      } else {
        console.error("Newsletter subscription failed:", data)
        toast({
          title: "Subscription Failed",
          description: data.error || "There was an error subscribing to the newsletter. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error)
      toast({
        title: "Subscription Failed",
        description: "There was an error subscribing to the newsletter. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Footer variant (compact)
  if (variant === "footer") {
    return (
      <form onSubmit={handleSubmit} className={`relative ${className}`}>
        <div className="flex flex-col space-y-3">
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || success}
            className="bg-[#111] border-[#333] focus:border-[#D4AF37] rounded-none h-12 text-white"
          />
          <Button
            type="submit"
            disabled={loading || success}
            className={`rounded-none h-12 ${
              success ? "bg-green-600 hover:bg-green-700" : "bg-[#D4AF37] hover:bg-[#B8860B]"
            } text-black`}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : success ? (
              <>
                <Check size={18} className="mr-2" />
                Subscribed
              </>
            ) : (
              <>
                <Send size={18} className="mr-2" />
                Subscribe
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
        </p>
      </form>
    )
  }

  // Default variant (full featured)
  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || success}
            className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12 pr-10"
          />
        </div>

        <Button
          type="submit"
          disabled={loading || success}
          className={`h-12 rounded-none ${
            success ? "bg-green-600 hover:bg-green-700" : "bg-[#D4AF37] hover:bg-[#B8860B]"
          } text-black`}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
            />
          ) : success ? (
            <>
              <Check size={18} className="mr-2" />
              Subscribed
            </>
          ) : (
            <>
              <Send size={18} className="mr-2" />
              Subscribe
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        By subscribing, you agree to receive marketing emails from Greenfields. You can unsubscribe at any time.
      </p>
    </form>
  )
}

export default NewsletterForm
