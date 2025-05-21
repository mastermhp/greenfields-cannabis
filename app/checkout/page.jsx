"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { CreditCard, Check, ChevronRight, ChevronDown, MapPin, Truck, Calendar, Clock, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/hooks/use-cart"

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { cartItems, cartTotal, clearCart } = useCart()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  })

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    saveCard: false,
  })

  const [deliveryMethod, setDeliveryMethod] = useState("standard")
  const [specialInstructions, setSpecialInstructions] = useState("")

  const shippingCost =
    deliveryMethod === "standard" ? (cartTotal > 100 ? 0 : 9.99) : deliveryMethod === "express" ? 19.99 : 29.99

  const taxRate = 0.08 // 8% tax rate
  const taxAmount = cartTotal * taxRate
  const orderTotal = cartTotal + shippingCost + taxAmount

  const handleShippingChange = (e) => {
    const { name, value } = e.target
    setShippingInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handlePaymentChange = (e) => {
    const { name, value, type, checked } = e.target
    setPaymentInfo((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleNextStep = (e) => {
    e.preventDefault()

    if (step === 1) {
      // Validate shipping info
      const requiredFields = ["firstName", "lastName", "email", "phone", "address", "city", "state", "zipCode"]
      const missingFields = requiredFields.filter((field) => !shippingInfo[field])

      if (missingFields.length > 0) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        return
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(shippingInfo.email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        })
        return
      }

      // Phone validation
      const phoneRegex = /^\d{10}$/
      if (!phoneRegex.test(shippingInfo.phone.replace(/\D/g, ""))) {
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid 10-digit phone number.",
          variant: "destructive",
        })
        return
      }
    }

    if (step === 2) {
      // Validate payment info
      const requiredFields = ["cardNumber", "cardName", "expiryDate", "cvv"]
      const missingFields = requiredFields.filter((field) => !paymentInfo[field])

      if (missingFields.length > 0) {
        toast({
          title: "Missing Information",
          description: "Please fill in all payment details.",
          variant: "destructive",
        })
        return
      }

      // Card number validation (simple check for 16 digits)
      const cardNumberRegex = /^\d{16}$/
      if (!cardNumberRegex.test(paymentInfo.cardNumber.replace(/\D/g, ""))) {
        toast({
          title: "Invalid Card Number",
          description: "Please enter a valid 16-digit card number.",
          variant: "destructive",
        })
        return
      }

      // Expiry date validation (MM/YY format)
      const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/
      if (!expiryRegex.test(paymentInfo.expiryDate)) {
        toast({
          title: "Invalid Expiry Date",
          description: "Please enter a valid expiry date in MM/YY format.",
          variant: "destructive",
        })
        return
      }

      // CVV validation (3 or 4 digits)
      const cvvRegex = /^\d{3,4}$/
      if (!cvvRegex.test(paymentInfo.cvv)) {
        toast({
          title: "Invalid CVV",
          description: "Please enter a valid 3 or 4 digit CVV code.",
          variant: "destructive",
        })
        return
      }
    }

    setStep(step + 1)
    window.scrollTo(0, 0)
  }

  const handlePreviousStep = () => {
    setStep(step - 1)
    window.scrollTo(0, 0)
  }

  const handlePlaceOrder = async () => {
    setLoading(true)

    // Simulate order processing
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Clear cart after successful order
      clearCart()

      // Redirect to confirmation page
      router.push("/order-confirmation")
    } catch (error) {
      toast({
        title: "Order Failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")

    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }

    return v
  }

  if (cartItems.length === 0) {
    router.push("/cart")
    return null
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.h1
          className="text-3xl md:text-4xl font-bold mb-8 gold-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Checkout
        </motion.h1>

        {/* Checkout Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? "bg-[#D4AF37] text-black" : "bg-[#333] text-white"}`}
              >
                1
              </div>
              <span className="text-sm mt-2 text-beige">Shipping</span>
            </div>

            <div className={`flex-1 h-0.5 mx-2 ${step >= 2 ? "bg-[#D4AF37]" : "bg-[#333]"}`}></div>

            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? "bg-[#D4AF37] text-black" : "bg-[#333] text-white"}`}
              >
                2
              </div>
              <span className="text-sm mt-2 text-beige">Payment</span>
            </div>

            <div className={`flex-1 h-0.5 mx-2 ${step >= 3 ? "bg-[#D4AF37]" : "bg-[#333]"}`}></div>

            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? "bg-[#D4AF37] text-black" : "bg-[#333] text-white"}`}
              >
                3
              </div>
              <span className="text-sm mt-2 text-beige">Review</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <motion.div
            className="lg:w-2/3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-[#111] border border-[#333] mb-6">
              {/* Step 1: Shipping Information */}
              {step === 1 && (
                <div>
                  <div className="p-6 border-b border-[#333]">
                    <h2 className="text-xl font-bold flex items-center">
                      <MapPin className="mr-2 text-[#D4AF37]" size={20} />
                      Shipping Information
                    </h2>
                  </div>

                  <form onSubmit={handleNextStep} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-beige mb-2">
                          First Name *
                        </label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={shippingInfo.firstName}
                          onChange={handleShippingChange}
                          required
                          className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-beige mb-2">
                          Last Name *
                        </label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={shippingInfo.lastName}
                          onChange={handleShippingChange}
                          required
                          className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-beige mb-2">
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={shippingInfo.email}
                          onChange={handleShippingChange}
                          required
                          className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-beige mb-2">
                          Phone Number *
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={shippingInfo.phone}
                          onChange={handleShippingChange}
                          required
                          className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <label htmlFor="address" className="block text-sm font-medium text-beige mb-2">
                        Street Address *
                      </label>
                      <Input
                        id="address"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleShippingChange}
                        required
                        className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                      />
                    </div>

                    <div className="mb-6">
                      <label htmlFor="apartment" className="block text-sm font-medium text-beige mb-2">
                        Apartment, Suite, etc. (optional)
                      </label>
                      <Input
                        id="apartment"
                        name="apartment"
                        value={shippingInfo.apartment}
                        onChange={handleShippingChange}
                        className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-beige mb-2">
                          City *
                        </label>
                        <Input
                          id="city"
                          name="city"
                          value={shippingInfo.city}
                          onChange={handleShippingChange}
                          required
                          className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                        />
                      </div>
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-beige mb-2">
                          State/Province *
                        </label>
                        <Input
                          id="state"
                          name="state"
                          value={shippingInfo.state}
                          onChange={handleShippingChange}
                          required
                          className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                        />
                      </div>
                      <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium text-beige mb-2">
                          ZIP/Postal Code *
                        </label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          value={shippingInfo.zipCode}
                          onChange={handleShippingChange}
                          required
                          className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <label htmlFor="country" className="block text-sm font-medium text-beige mb-2">
                        Country *
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={shippingInfo.country}
                        onChange={handleShippingChange}
                        required
                        className="w-full bg-black border border-[#333] focus:border-[#D4AF37] rounded-none h-12 px-3"
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="Mexico">Mexico</option>
                      </select>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-4">Delivery Method</h3>

                      <div className="space-y-4">
                        <div
                          className={`border ${deliveryMethod === "standard" ? "border-[#D4AF37]" : "border-[#333]"} p-4 cursor-pointer`}
                          onClick={() => setDeliveryMethod("standard")}
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full border ${deliveryMethod === "standard" ? "border-[#D4AF37]" : "border-[#333]"} flex items-center justify-center mr-3`}
                            >
                              {deliveryMethod === "standard" && (
                                <div className="w-3 h-3 rounded-full bg-[#D4AF37]"></div>
                              )}
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between">
                                <span className="font-medium">Standard Shipping</span>
                                <span>{cartTotal > 100 ? "Free" : "$9.99"}</span>
                              </div>
                              <p className="text-sm text-beige">Delivery in 3-5 business days</p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`border ${deliveryMethod === "express" ? "border-[#D4AF37]" : "border-[#333]"} p-4 cursor-pointer`}
                          onClick={() => setDeliveryMethod("express")}
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full border ${deliveryMethod === "express" ? "border-[#D4AF37]" : "border-[#333]"} flex items-center justify-center mr-3`}
                            >
                              {deliveryMethod === "express" && (
                                <div className="w-3 h-3 rounded-full bg-[#D4AF37]"></div>
                              )}
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between">
                                <span className="font-medium">Express Shipping</span>
                                <span>$19.99</span>
                              </div>
                              <p className="text-sm text-beige">Delivery in 1-2 business days</p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`border ${deliveryMethod === "same-day" ? "border-[#D4AF37]" : "border-[#333]"} p-4 cursor-pointer`}
                          onClick={() => setDeliveryMethod("same-day")}
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full border ${deliveryMethod === "same-day" ? "border-[#D4AF37]" : "border-[#333]"} flex items-center justify-center mr-3`}
                            >
                              {deliveryMethod === "same-day" && (
                                <div className="w-3 h-3 rounded-full bg-[#D4AF37]"></div>
                              )}
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between">
                                <span className="font-medium">Same-Day Delivery</span>
                                <span>$29.99</span>
                              </div>
                              <p className="text-sm text-beige">Available in select areas only</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label htmlFor="specialInstructions" className="block text-sm font-medium text-beige mb-2">
                        Special Instructions (optional)
                      </label>
                      <Textarea
                        id="specialInstructions"
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        placeholder="Add any special delivery instructions"
                        className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none resize-none"
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="bg-[#D4AF37] hover:bg-[#B8860B] text-black text-lg py-6 px-8 rounded-none"
                      >
                        Continue to Payment <ChevronRight className="ml-2" size={18} />
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 2: Payment Information */}
              {step === 2 && (
                <div>
                  <div className="p-6 border-b border-[#333]">
                    <h2 className="text-xl font-bold flex items-center">
                      <CreditCard className="mr-2 text-[#D4AF37]" size={20} />
                      Payment Information
                    </h2>
                  </div>

                  <form onSubmit={handleNextStep} className="p-6">
                    <div className="mb-6">
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-beige mb-2">
                        Card Number *
                      </label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        value={paymentInfo.cardNumber}
                        onChange={(e) =>
                          handlePaymentChange({
                            target: {
                              name: "cardNumber",
                              value: formatCardNumber(e.target.value),
                            },
                          })
                        }
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                        className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                      />
                    </div>

                    <div className="mb-6">
                      <label htmlFor="cardName" className="block text-sm font-medium text-beige mb-2">
                        Name on Card *
                      </label>
                      <Input
                        id="cardName"
                        name="cardName"
                        value={paymentInfo.cardName}
                        onChange={handlePaymentChange}
                        required
                        className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-beige mb-2">
                          Expiry Date (MM/YY) *
                        </label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          value={paymentInfo.expiryDate}
                          onChange={(e) =>
                            handlePaymentChange({
                              target: {
                                name: "expiryDate",
                                value: formatExpiryDate(e.target.value),
                              },
                            })
                          }
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                          className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                        />
                      </div>
                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-beige mb-2">
                          CVV *
                        </label>
                        <Input
                          id="cvv"
                          name="cvv"
                          value={paymentInfo.cvv}
                          onChange={handlePaymentChange}
                          placeholder="123"
                          maxLength={4}
                          required
                          className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center">
                        <input
                          id="saveCard"
                          name="saveCard"
                          type="checkbox"
                          checked={paymentInfo.saveCard}
                          onChange={handlePaymentChange}
                          className="h-4 w-4 bg-black border-[#333] focus:ring-[#D4AF37] text-[#D4AF37]"
                        />
                        <label htmlFor="saveCard" className="ml-2 block text-sm text-beige">
                          Save this card for future purchases
                        </label>
                      </div>
                    </div>

                    <div className="bg-[#D4AF37]/10 border border-[#D4AF37] p-4 mb-6 flex items-start">
                      <ShieldCheck className="text-[#D4AF37] mr-3 mt-1 flex-shrink-0" size={20} />
                      <p className="text-sm text-beige">
                        Your payment information is secure. We use industry-standard encryption to protect your data.
                      </p>
                    </div>

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        onClick={handlePreviousStep}
                        variant="outline"
                        className="border-[#333] text-white hover:bg-[#222] hover:text-white"
                      >
                        Back to Shipping
                      </Button>
                      <Button
                        type="submit"
                        className="bg-[#D4AF37] hover:bg-[#B8860B] text-black text-lg py-6 px-8 rounded-none"
                      >
                        Review Order <ChevronRight className="ml-2" size={18} />
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 3: Review Order */}
              {step === 3 && (
                <div>
                  <div className="p-6 border-b border-[#333]">
                    <h2 className="text-xl font-bold flex items-center">
                      <Check className="mr-2 text-[#D4AF37]" size={20} />
                      Review Your Order
                    </h2>
                  </div>

                  <div className="p-6">
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Shipping Information</h3>
                        <button onClick={() => setStep(1)} className="text-[#D4AF37] text-sm hover:underline">
                          Edit
                        </button>
                      </div>

                      <div className="bg-black border border-[#333] p-4">
                        <p className="mb-1">
                          <span className="font-medium">
                            {shippingInfo.firstName} {shippingInfo.lastName}
                          </span>
                        </p>
                        <p className="text-beige mb-1">{shippingInfo.address}</p>
                        {shippingInfo.apartment && <p className="text-beige mb-1">{shippingInfo.apartment}</p>}
                        <p className="text-beige mb-1">
                          {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
                        </p>
                        <p className="text-beige mb-1">{shippingInfo.country}</p>
                        <p className="text-beige mb-1">
                          <span className="font-medium">Email:</span> {shippingInfo.email}
                        </p>
                        <p className="text-beige">
                          <span className="font-medium">Phone:</span> {shippingInfo.phone}
                        </p>
                      </div>
                    </div>

                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Payment Method</h3>
                        <button onClick={() => setStep(2)} className="text-[#D4AF37] text-sm hover:underline">
                          Edit
                        </button>
                      </div>

                      <div className="bg-black border border-[#333] p-4">
                        <div className="flex items-center">
                          <CreditCard className="text-[#D4AF37] mr-3" size={20} />
                          <div>
                            <p className="font-medium">Credit Card</p>
                            <p className="text-beige">**** **** **** {paymentInfo.cardNumber.slice(-4)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Delivery Method</h3>
                        <button onClick={() => setStep(1)} className="text-[#D4AF37] text-sm hover:underline">
                          Edit
                        </button>
                      </div>

                      <div className="bg-black border border-[#333] p-4">
                        <div className="flex items-center">
                          {deliveryMethod === "standard" ? (
                            <Truck className="text-[#D4AF37] mr-3" size={20} />
                          ) : deliveryMethod === "express" ? (
                            <Calendar className="text-[#D4AF37] mr-3" size={20} />
                          ) : (
                            <Clock className="text-[#D4AF37] mr-3" size={20} />
                          )}

                          <div>
                            <p className="font-medium">
                              {deliveryMethod === "standard"
                                ? "Standard Shipping"
                                : deliveryMethod === "express"
                                  ? "Express Shipping"
                                  : "Same-Day Delivery"}
                            </p>
                            <p className="text-beige">
                              {deliveryMethod === "standard"
                                ? "Delivery in 3-5 business days"
                                : deliveryMethod === "express"
                                  ? "Delivery in 1-2 business days"
                                  : "Delivery today"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-4">Order Items</h3>

                      <div className="bg-black border border-[#333] divide-y divide-[#333]">
                        {cartItems.map((item) => (
                          <div key={item.id} className="p-4 flex items-center">
                            <div className="w-16 h-16 bg-[#222] relative mr-4">
                              <Image
                                src={
                                  item.images[0] ||
                                  "https://images.unsplash.com/photo-1603909223429-69bb7101f420?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                }
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>

                            <div className="flex-grow">
                              <div className="flex justify-between">
                                <div>
                                  <h4 className="font-medium">{item.name}</h4>
                                  <p className="text-sm text-beige capitalize">{item.category}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">${item.price.toFixed(2)}</p>
                                  <p className="text-sm text-beige">Qty: {item.quantity}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        onClick={handlePreviousStep}
                        variant="outline"
                        className="border-[#333] text-white hover:bg-[#222] hover:text-white"
                      >
                        Back to Payment
                      </Button>
                      <Button
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="bg-[#D4AF37] hover:bg-[#B8860B] text-black text-lg py-6 px-8 rounded-none"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          "Place Order"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            className="lg:w-1/3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-[#111] border border-[#333] p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-beige">Items ({cartItems.length})</span>
                  <button
                    className="text-[#D4AF37] text-sm hover:underline flex items-center"
                    onClick={() => {
                      const summaryEl = document.getElementById("order-summary-items")
                      if (summaryEl) {
                        summaryEl.classList.toggle("hidden")
                      }
                    }}
                  >
                    <span>Details</span>
                    <ChevronDown size={16} className="ml-1" />
                  </button>
                </div>

                <div
                  id="order-summary-items"
                  className="hidden bg-black border border-[#333] divide-y divide-[#333] mb-4"
                >
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-3 flex justify-between">
                      <div className="flex items-center">
                        <span className="text-sm text-beige mr-2">{item.quantity}x</span>
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-beige">Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-beige">Shipping</span>
                  <span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-beige">Tax (8%)</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>

                <div className="border-t border-[#333] pt-4 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-[#D4AF37]">${orderTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="border-t border-[#333] pt-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center">
                    <ShieldCheck className="text-[#D4AF37] mr-3" size={20} />
                    <span className="text-sm text-beige">Secure checkout</span>
                  </div>
                  <div className="flex items-center">
                    <Truck className="text-[#D4AF37] mr-3" size={20} />
                    <span className="text-sm text-beige">Free shipping over $100</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="text-[#D4AF37] mr-3" size={20} />
                    <span className="text-sm text-beige">21+ age verification at delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
