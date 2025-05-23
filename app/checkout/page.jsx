"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CreditCard,
  Check,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  ArrowLeft,
  Truck,
  MapPin,
  Info,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"

export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems, cartTotal, clearCart } = useCart()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Form states
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

  const [shippingMethod, setShippingMethod] = useState("standard")
  const [deliveryInstructions, setDeliveryInstructions] = useState("")
  const [deliveryTime, setDeliveryTime] = useState("anytime")
  const [contactPreference, setContactPreference] = useState("text")
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [cardInfo, setCardInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
    saveCard: false,
  })

  // Calculate order summary with cannabis-specific taxes
  const subtotal = cartTotal
  const shipping =
    shippingMethod === "express" ? 19.99 : shippingMethod === "same-day" ? 29.99 : subtotal >= 100 ? 0 : 9.99
  const salesTax = subtotal * 0.0925 // 9.25% sales tax
  const exciseTax = subtotal * 0.15 // 15% excise tax
  const cannabisTax = subtotal * 0.12 // 12% cannabis tax
  const totalTax = salesTax + exciseTax + cannabisTax
  const total = subtotal + shipping + totalTax

  const handleShippingInfoChange = (e) => {
    const { name, value } = e.target
    setShippingInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleCardInfoChange = (e) => {
    const { name, value, type, checked } = e.target
    setCardInfo((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
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

  const validateShippingInfo = () => {
    const { firstName, lastName, email, phone, address, city, state, zipCode } = shippingInfo

    if (!firstName || !lastName || !email || !phone || !address || !city || !state || !zipCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return false
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return false
    }

    // Phone validation - just check for minimum digits
    const phoneDigits = phone.replace(/\D/g, "")
    if (phoneDigits.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const validateDeliveryInfo = () => {
    if (!agreeToTerms) {
      toast({
        title: "Terms Agreement Required",
        description: "Please agree to the age verification and terms of service",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  const validatePaymentInfo = () => {
    if (paymentMethod === "credit-card") {
      const { cardNumber, cardName, expiry, cvv } = cardInfo

      if (!cardNumber || !cardName || !expiry || !cvv) {
        toast({
          title: "Missing Information",
          description: "Please fill in all card details",
          variant: "destructive",
        })
        return false
      }

      // Card number validation (simple check for digits)
      const cardDigits = cardNumber.replace(/\D/g, "")
      if (cardDigits.length < 15) {
        toast({
          title: "Invalid Card Number",
          description: "Please enter a valid card number",
          variant: "destructive",
        })
        return false
      }

      // Expiry date validation (MM/YY format)
      const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/
      if (!expiryRegex.test(expiry)) {
        toast({
          title: "Invalid Expiry Date",
          description: "Please enter a valid expiry date in MM/YY format",
          variant: "destructive",
        })
        return false
      }

      // CVV validation (3 or 4 digits)
      const cvvRegex = /^\d{3,4}$/
      if (!cvvRegex.test(cvv)) {
        toast({
          title: "Invalid CVV",
          description: "Please enter a valid 3 or 4 digit CVV code",
          variant: "destructive",
        })
        return false
      }
    }

    return true
  }

  const handleContinueToDelivery = (e) => {
    e.preventDefault()
    if (validateShippingInfo()) {
      setStep(2)
      window.scrollTo(0, 0)
    }
  }

  const handleContinueToPayment = (e) => {
    e.preventDefault()
    if (validateDeliveryInfo()) {
      setStep(3)
      window.scrollTo(0, 0)
    }
  }

  const handlePlaceOrder = () => {
    if (validatePaymentInfo()) {
      setLoading(true)

      // Simulate order processing
      setTimeout(() => {
        clearCart()
        toast({
          title: "Order Placed Successfully!",
          description: "Thank you for your purchase. Your order is being processed.",
          variant: "success",
        })
        router.push("/order-confirmation")
      }, 2000)
    }
  }

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !loading) {
      router.push("/cart")
    }
  }, [cartItems, loading, router])

  if (cartItems.length === 0 && !loading) {
    return null
  }

  return (
    <div className="bg-black min-h-screen pt-32 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/cart" className="flex items-center text-beige hover:text-[#D4AF37] transition-colors">
            <ArrowLeft size={18} className="mr-2" />
            Back to Cart
          </Link>
        </motion.div>

        <motion.h1
          className="text-3xl md:text-4xl font-bold mb-8 gold-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Checkout
        </motion.h1>

        {/* Checkout Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 1 ? "bg-[#D4AF37] text-black" : "bg-[#333] text-white"
                }`}
              >
                {step > 1 ? <Check size={20} /> : "1"}
              </div>
              <span className="mt-2 text-sm text-beige">Shipping</span>
            </div>

            <div className={`flex-grow mx-2 h-0.5 ${step >= 2 ? "bg-[#D4AF37]" : "bg-[#333]"}`}></div>

            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 2 ? "bg-[#D4AF37] text-black" : "bg-[#333] text-white"
                }`}
              >
                {step > 2 ? <Check size={20} /> : "2"}
              </div>
              <span className="mt-2 text-sm text-beige">Delivery</span>
            </div>

            <div className={`flex-grow mx-2 h-0.5 ${step >= 3 ? "bg-[#D4AF37]" : "bg-[#333]"}`}></div>

            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 3 ? "bg-[#D4AF37] text-black" : "bg-[#333] text-white"
                }`}
              >
                {step > 3 ? <Check size={20} /> : "3"}
              </div>
              <span className="mt-2 text-sm text-beige">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Shipping Information */}
              {step === 1 && (
                <motion.div
                  key="shipping"
                  className="bg-[#111] border border-[#333]"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-6 border-b border-[#333]">
                    <h2 className="text-xl font-bold flex items-center">
                      <MapPin className="mr-2 text-[#D4AF37]" size={20} />
                      Shipping Information
                    </h2>
                  </div>

                  <form onSubmit={handleContinueToDelivery} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="firstName" className="text-beige mb-2 block">
                          First Name *
                        </Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={shippingInfo.firstName}
                          onChange={handleShippingInfoChange}
                          className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                        />
                      </div>

                      <div>
                        <Label htmlFor="lastName" className="text-beige mb-2 block">
                          Last Name *
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={shippingInfo.lastName}
                          onChange={handleShippingInfoChange}
                          className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="email" className="text-beige mb-2 block">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={shippingInfo.email}
                          onChange={handleShippingInfoChange}
                          className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-beige mb-2 block">
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={shippingInfo.phone}
                          onChange={handleShippingInfoChange}
                          className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <Label htmlFor="address" className="text-beige mb-2 block">
                        Street Address *
                      </Label>
                      <Input
                        id="address"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleShippingInfoChange}
                        className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                      />
                    </div>

                    <div className="mb-6">
                      <Label htmlFor="apartment" className="text-beige mb-2 block">
                        Apartment, Suite, etc. (optional)
                      </Label>
                      <Input
                        id="apartment"
                        name="apartment"
                        value={shippingInfo.apartment}
                        onChange={handleShippingInfoChange}
                        className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                      <div className="col-span-2 md:col-span-1">
                        <Label htmlFor="city" className="text-beige mb-2 block">
                          City *
                        </Label>
                        <Input
                          id="city"
                          name="city"
                          value={shippingInfo.city}
                          onChange={handleShippingInfoChange}
                          className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                        />
                      </div>

                      <div>
                        <Label htmlFor="state" className="text-beige mb-2 block">
                          State *
                        </Label>
                        <Input
                          id="state"
                          name="state"
                          value={shippingInfo.state}
                          onChange={handleShippingInfoChange}
                          className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                        />
                      </div>

                      <div>
                        <Label htmlFor="zipCode" className="text-beige mb-2 block">
                          ZIP Code *
                        </Label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          value={shippingInfo.zipCode}
                          onChange={handleShippingInfoChange}
                          className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <Label htmlFor="country" className="text-beige mb-2 block">
                        Country *
                      </Label>
                      <div className="relative">
                        <select
                          id="country"
                          name="country"
                          value={shippingInfo.country}
                          onChange={handleShippingInfoChange}
                          className="w-full bg-black border border-[#333] text-white px-4 py-3 appearance-none focus:border-[#D4AF37] rounded-none"
                        >
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                        </select>
                        <ChevronDown
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                          size={18}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
                        Continue to Delivery <ChevronRight className="ml-2" size={16} />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 2: Delivery Options */}
              {step === 2 && (
                <motion.div
                  key="delivery"
                  className="bg-[#111] border border-[#333]"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-6 border-b border-[#333]">
                    <h2 className="text-xl font-bold flex items-center">
                      <Truck className="mr-2 text-[#D4AF37]" size={20} />
                      Delivery Options
                    </h2>
                  </div>

                  <form onSubmit={handleContinueToPayment} className="p-6">
                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-4">Shipping Method</h3>
                      <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="space-y-4">
                        <div
                          className={`border ${
                            shippingMethod === "standard" ? "border-[#D4AF37]" : "border-[#333]"
                          } p-4 cursor-pointer hover:border-[#D4AF37] transition-colors`}
                        >
                          <div className="flex items-start">
                            <RadioGroupItem
                              value="standard"
                              id="standard"
                              className="mt-1 border-[#333] text-[#D4AF37]"
                            />
                            <Label htmlFor="standard" className="ml-3 cursor-pointer flex-grow">
                              <div className="flex justify-between">
                                <div>
                                  <p className="font-medium">Standard Shipping</p>
                                  <p className="text-sm text-beige">Delivery in 3-5 business days</p>
                                </div>
                                <div className="text-right">
                                  {subtotal >= 100 ? <span className="text-green-500">Free</span> : <span>$9.99</span>}
                                </div>
                              </div>
                            </Label>
                          </div>
                        </div>

                        <div
                          className={`border ${
                            shippingMethod === "express" ? "border-[#D4AF37]" : "border-[#333]"
                          } p-4 cursor-pointer hover:border-[#D4AF37] transition-colors`}
                        >
                          <div className="flex items-start">
                            <RadioGroupItem
                              value="express"
                              id="express"
                              className="mt-1 border-[#333] text-[#D4AF37]"
                            />
                            <Label htmlFor="express" className="ml-3 cursor-pointer flex-grow">
                              <div className="flex justify-between">
                                <div>
                                  <p className="font-medium">Express Shipping</p>
                                  <p className="text-sm text-beige">Delivery in 1-2 business days</p>
                                </div>
                                <div className="text-right">
                                  <span>$19.99</span>
                                </div>
                              </div>
                            </Label>
                          </div>
                        </div>

                        <div
                          className={`border ${
                            shippingMethod === "same-day" ? "border-[#D4AF37]" : "border-[#333]"
                          } p-4 cursor-pointer hover:border-[#D4AF37] transition-colors`}
                        >
                          <div className="flex items-start">
                            <RadioGroupItem
                              value="same-day"
                              id="same-day"
                              className="mt-1 border-[#333] text-[#D4AF37]"
                            />
                            <Label htmlFor="same-day" className="ml-3 cursor-pointer flex-grow">
                              <div className="flex justify-between">
                                <div>
                                  <p className="font-medium">Same-Day Delivery</p>
                                  <p className="text-sm text-beige">Delivery within 3-4 hours (select areas only)</p>
                                </div>
                                <div className="text-right">
                                  <span>$29.99</span>
                                </div>
                              </div>
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-4">Preferred Delivery Time</h3>
                      <RadioGroup value={deliveryTime} onValueChange={setDeliveryTime} className="space-y-4">
                        <div
                          className={`border ${
                            deliveryTime === "anytime" ? "border-[#D4AF37]" : "border-[#333]"
                          } p-4 cursor-pointer hover:border-[#D4AF37] transition-colors`}
                        >
                          <div className="flex items-center">
                            <RadioGroupItem value="anytime" id="anytime" className="border-[#333] text-[#D4AF37]" />
                            <Label htmlFor="anytime" className="ml-3 cursor-pointer">
                              <span className="font-medium">Anytime (9am - 9pm)</span>
                            </Label>
                          </div>
                        </div>

                        <div
                          className={`border ${
                            deliveryTime === "morning" ? "border-[#D4AF37]" : "border-[#333]"
                          } p-4 cursor-pointer hover:border-[#D4AF37] transition-colors`}
                        >
                          <div className="flex items-center">
                            <RadioGroupItem value="morning" id="morning" className="border-[#333] text-[#D4AF37]" />
                            <Label htmlFor="morning" className="ml-3 cursor-pointer">
                              <span className="font-medium">Morning (9am - 12pm)</span>
                            </Label>
                          </div>
                        </div>

                        <div
                          className={`border ${
                            deliveryTime === "afternoon" ? "border-[#D4AF37]" : "border-[#333]"
                          } p-4 cursor-pointer hover:border-[#D4AF37] transition-colors`}
                        >
                          <div className="flex items-center">
                            <RadioGroupItem value="afternoon" id="afternoon" className="border-[#333] text-[#D4AF37]" />
                            <Label htmlFor="afternoon" className="ml-3 cursor-pointer">
                              <span className="font-medium">Afternoon (12pm - 5pm)</span>
                            </Label>
                          </div>
                        </div>

                        <div
                          className={`border ${
                            deliveryTime === "evening" ? "border-[#D4AF37]" : "border-[#333]"
                          } p-4 cursor-pointer hover:border-[#D4AF37] transition-colors`}
                        >
                          <div className="flex items-center">
                            <RadioGroupItem value="evening" id="evening" className="border-[#333] text-[#D4AF37]" />
                            <Label htmlFor="evening" className="ml-3 cursor-pointer">
                              <span className="font-medium">Evening (5pm - 9pm)</span>
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-4">Contact Preference</h3>
                      <RadioGroup value={contactPreference} onValueChange={setContactPreference} className="space-y-4">
                        <div
                          className={`border ${
                            contactPreference === "text" ? "border-[#D4AF37]" : "border-[#333]"
                          } p-4 cursor-pointer hover:border-[#D4AF37] transition-colors`}
                        >
                          <div className="flex items-center">
                            <RadioGroupItem value="text" id="text" className="border-[#333] text-[#D4AF37]" />
                            <Label htmlFor="text" className="ml-3 cursor-pointer">
                              <span className="font-medium">Text me when my order is out for delivery</span>
                            </Label>
                          </div>
                        </div>

                        <div
                          className={`border ${
                            contactPreference === "call" ? "border-[#D4AF37]" : "border-[#333]"
                          } p-4 cursor-pointer hover:border-[#D4AF37] transition-colors`}
                        >
                          <div className="flex items-center">
                            <RadioGroupItem value="call" id="call" className="border-[#333] text-[#D4AF37]" />
                            <Label htmlFor="call" className="ml-3 cursor-pointer">
                              <span className="font-medium">Call me when my order is out for delivery</span>
                            </Label>
                          </div>
                        </div>

                        <div
                          className={`border ${
                            contactPreference === "none" ? "border-[#D4AF37]" : "border-[#333]"
                          } p-4 cursor-pointer hover:border-[#D4AF37] transition-colors`}
                        >
                          <div className="flex items-center">
                            <RadioGroupItem value="none" id="none" className="border-[#333] text-[#D4AF37]" />
                            <Label htmlFor="none" className="ml-3 cursor-pointer">
                              <span className="font-medium">No notification needed</span>
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="mb-8">
                      <Label htmlFor="deliveryInstructions" className="text-beige mb-2 block">
                        Delivery Instructions (optional)
                      </Label>
                      <Textarea
                        id="deliveryInstructions"
                        value={deliveryInstructions}
                        onChange={(e) => setDeliveryInstructions(e.target.value)}
                        placeholder="Add any special delivery instructions or gate codes"
                        className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none min-h-[100px]"
                      />
                    </div>

                    <div className="mb-8 p-4 border border-[#D4AF37] bg-[#D4AF37]/10">
                      <div className="flex items-start mb-4">
                        <AlertCircle className="text-[#D4AF37] mr-3 mt-0.5 flex-shrink-0" size={20} />
                        <p className="text-sm text-beige">
                          <span className="font-medium text-[#D4AF37] block mb-1">Age Verification Required</span>
                          All deliveries require age verification (21+) with a valid government-issued ID at the time of
                          delivery. The person accepting the delivery must be the same person who placed the order.
                        </p>
                      </div>

                      <div className="flex items-center">
                        <Checkbox
                          id="terms"
                          checked={agreeToTerms}
                          onCheckedChange={setAgreeToTerms}
                          className="border-[#D4AF37] text-[#D4AF37] data-[state=checked]:bg-[#D4AF37] data-[state=checked]:text-black"
                        />
                        <label htmlFor="terms" className="ml-3 text-sm text-beige cursor-pointer">
                          I confirm I am 21+ years of age and agree to the{" "}
                          <Link href="/terms-conditions" className="text-[#D4AF37] underline">
                            Terms of Service
                          </Link>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        onClick={() => setStep(1)}
                        variant="outline"
                        className="border-[#333] text-white hover:bg-[#222] hover:text-white"
                      >
                        <ArrowLeft className="mr-2" size={16} />
                        Back to Shipping
                      </Button>

                      <Button type="submit" className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
                        Continue to Payment <ChevronRight className="ml-2" size={16} />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <motion.div
                  key="payment"
                  className="bg-[#111] border border-[#333]"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-6 border-b border-[#333]">
                    <h2 className="text-xl font-bold flex items-center">
                      <CreditCard className="mr-2 text-[#D4AF37]" size={20} />
                      Payment Method
                    </h2>
                  </div>

                  <div className="p-6">
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4 mb-8">
                      <div
                        className={`border ${
                          paymentMethod === "credit-card" ? "border-[#D4AF37]" : "border-[#333]"
                        } p-4 cursor-pointer hover:border-[#D4AF37] transition-colors`}
                      >
                        <div className="flex items-center">
                          <RadioGroupItem
                            value="credit-card"
                            id="credit-card"
                            className="border-[#333] text-[#D4AF37]"
                          />
                          <Label htmlFor="credit-card" className="ml-3 cursor-pointer flex-grow">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Credit / Debit Card</span>
                              <div className="flex space-x-2">
                                <Image src="https://i.imgur.com/5xgHYn4.png" alt="Visa" width={40} height={25} />
                                <Image src="https://i.imgur.com/fPwGYMN.png" alt="Mastercard" width={40} height={25} />
                                <Image src="https://i.imgur.com/0V9z1SL.png" alt="Amex" width={40} height={25} />
                              </div>
                            </div>
                          </Label>
                        </div>
                      </div>

                      <div
                        className={`border ${
                          paymentMethod === "paypal" ? "border-[#D4AF37]" : "border-[#333]"
                        } p-4 cursor-pointer hover:border-[#D4AF37] transition-colors`}
                      >
                        <div className="flex items-center">
                          <RadioGroupItem value="paypal" id="paypal" className="border-[#333] text-[#D4AF37]" />
                          <Label htmlFor="paypal" className="ml-3 cursor-pointer flex-grow">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">PayPal</span>
                              <Image src="https://i.imgur.com/W9lVbRH.png" alt="PayPal" width={80} height={30} />
                            </div>
                          </Label>
                        </div>
                      </div>

                      <div
                        className={`border ${
                          paymentMethod === "cash" ? "border-[#D4AF37]" : "border-[#333]"
                        } p-4 cursor-pointer hover:border-[#D4AF37] transition-colors`}
                      >
                        <div className="flex items-center">
                          <RadioGroupItem value="cash" id="cash" className="border-[#333] text-[#D4AF37]" />
                          <Label htmlFor="cash" className="ml-3 cursor-pointer">
                            <span className="font-medium">Cash on Delivery</span>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>

                    {paymentMethod === "credit-card" && (
                      <motion.div
                        className="space-y-6 mb-8 border border-[#333] p-6 bg-black"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="relative">
                          <Label htmlFor="cardNumber" className="text-beige mb-2 block">
                            Card Number
                          </Label>
                          <div className="relative">
                            <CreditCard
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                              size={18}
                            />
                            <Input
                              id="cardNumber"
                              name="cardNumber"
                              value={cardInfo.cardNumber}
                              onChange={(e) =>
                                handleCardInfoChange({
                                  target: {
                                    name: "cardNumber",
                                    value: formatCardNumber(e.target.value),
                                  },
                                })
                              }
                              placeholder="1234 5678 9012 3456"
                              maxLength={19}
                              className="pl-10 bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="cardName" className="text-beige mb-2 block">
                            Name on Card
                          </Label>
                          <Input
                            id="cardName"
                            name="cardName"
                            value={cardInfo.cardName}
                            onChange={handleCardInfoChange}
                            placeholder="John Doe"
                            className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="expiry" className="text-beige mb-2 block">
                              Expiry Date (MM/YY)
                            </Label>
                            <Input
                              id="expiry"
                              name="expiry"
                              value={cardInfo.expiry}
                              onChange={(e) =>
                                handleCardInfoChange({
                                  target: {
                                    name: "expiry",
                                    value: formatExpiryDate(e.target.value),
                                  },
                                })
                              }
                              placeholder="MM/YY"
                              maxLength={5}
                              className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                            />
                          </div>

                          <div>
                            <Label htmlFor="cvv" className="text-beige mb-2 block">
                              CVV
                            </Label>
                            <Input
                              id="cvv"
                              name="cvv"
                              value={cardInfo.cvv}
                              onChange={handleCardInfoChange}
                              placeholder="123"
                              maxLength={4}
                              className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                            />
                          </div>
                        </div>

                        <div className="flex items-center">
                          <Checkbox
                            id="saveCard"
                            checked={cardInfo.saveCard}
                            onCheckedChange={(checked) =>
                              handleCardInfoChange({
                                target: {
                                  name: "saveCard",
                                  type: "checkbox",
                                  checked,
                                },
                              })
                            }
                            className="border-[#333] text-[#D4AF37] data-[state=checked]:bg-[#D4AF37] data-[state=checked]:text-black"
                          />
                          <label htmlFor="saveCard" className="ml-3 text-sm text-beige cursor-pointer">
                            Save this card for future purchases
                          </label>
                        </div>
                      </motion.div>
                    )}

                    {paymentMethod === "paypal" && (
                      <motion.div
                        className="mb-8 p-6 border border-[#333] bg-black text-center"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-beige mb-4">
                          You will be redirected to PayPal to complete your payment after reviewing your order.
                        </p>
                        <Image
                          src="https://i.imgur.com/W9lVbRH.png"
                          alt="PayPal"
                          width={120}
                          height={45}
                          className="mx-auto"
                        />
                      </motion.div>
                    )}

                    {paymentMethod === "cash" && (
                      <motion.div
                        className="mb-8 p-6 border border-[#333] bg-black"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-start">
                          <Info className="text-[#D4AF37] mr-3 mt-0.5 flex-shrink-0" size={20} />
                          <div>
                            <p className="font-medium text-white mb-2">Cash on Delivery Information</p>
                            <p className="text-sm text-beige mb-2">
                              Please have the exact amount ready at the time of delivery. Our delivery personnel cannot
                              provide change.
                            </p>
                            <p className="text-sm text-beige">
                              Payment must be made before the package is handed over.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="flex items-center mb-8 p-4 border border-[#D4AF37] bg-[#D4AF37]/10">
                      <ShieldCheck size={20} className="text-[#D4AF37] mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-[#D4AF37] mb-1">Secure Payment</p>
                        <p className="text-sm text-beige">
                          Your payment information is encrypted and secure. We use industry-standard security measures
                          to protect your data.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button
                        onClick={() => setStep(2)}
                        variant="outline"
                        className="border-[#333] text-white hover:bg-[#222] hover:text-white"
                      >
                        <ArrowLeft className="mr-2" size={16} />
                        Back to Delivery
                      </Button>

                      <Button
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
                      >
                        {loading ? (
                          <span className="flex items-center">
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
                          <>Place Order</>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-[#111] border border-[#333] p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="max-h-60 overflow-y-auto mb-6 custom-scrollbar">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center mb-4 pb-4 border-b border-[#222] last:border-0 last:pb-0 last:mb-0"
                  >
                    <div className="w-16 h-16 bg-[#222] mr-4 flex-shrink-0 relative">
                      <Image
                        src={item.images[0] || "https://i.imgur.com/8NXiuFN.png"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-grow">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-beige">Qty: {item.quantity}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-beige">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-beige">Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-beige">Sales Tax (9.25%)</span>
                  <span>${salesTax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-beige">Excise Tax (15%)</span>
                  <span>${exciseTax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-beige">Cannabis Tax (12%)</span>
                  <span>${cannabisTax.toFixed(2)}</span>
                </div>

                <div className="border-t border-[#333] pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-[#D4AF37]">${total.toFixed(2)}</span>
                </div>
              </div>

              {step === 3 && (
                <div className="bg-[#D4AF37]/10 border border-[#D4AF37] p-4 text-sm">
                  <p className="font-medium text-[#D4AF37] mb-1">Order Confirmation</p>
                  <p className="text-beige">
                    By clicking "Place Order", you agree to our Terms & Conditions and confirm that you are 21+ years of
                    age.
                  </p>
                </div>
              )}

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-[#333]">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center">
                    <CheckCircle2 className="text-[#D4AF37] mr-3" size={20} />
                    <span className="text-sm text-beige">Premium quality products</span>
                  </div>
                  <div className="flex items-center">
                    <ShieldCheck className="text-[#D4AF37] mr-3" size={20} />
                    <span className="text-sm text-beige">Secure checkout</span>
                  </div>
                  <div className="flex items-center">
                    <Truck className="text-[#D4AF37] mr-3" size={20} />
                    <span className="text-sm text-beige">Free shipping over $100</span>
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
