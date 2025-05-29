"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, ShoppingCart, Lock, User } from "lucide-react"
import { motion } from "framer-motion"

export default function CheckoutPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { cartItems, cartTotal, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Store the current path to redirect back after login
      localStorage.setItem("redirectAfterLogin", "/checkout")
      router.push("/login")
    }
  }, [isAuthenticated, authLoading, router])

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37] mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login required message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <Card className="bg-[#111] border-[#333]">
            <CardContent className="p-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-[#D4AF37]" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Login Required</h1>
                <p className="text-gray-400">You must be logged in and age-verified to proceed with checkout.</p>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-black"
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push("/register")}
                  className="w-full border-[#333] text-white hover:bg-[#333]"
                >
                  Create Account
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-6">
                We require account verification to comply with age restrictions and provide secure transactions.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Rest of the checkout component logic remains the same...
  // [Keep all existing checkout form and payment processing code]
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Information */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    type="text"
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    type="text"
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup defaultValue="card" className="flex flex-col space-y-1" onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card">Credit Card</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="paypal" id="paypal" />
              <Label htmlFor="paypal">PayPal</Label>
            </div>
          </RadioGroup>

          <Separator className="my-4" />

          {paymentMethod === "card" && (
            <div className="grid gap-4">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input type="text" id="cardNumber" placeholder="XXXX-XXXX-XXXX-XXXX" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input type="text" id="expiry" placeholder="MM/YY" />
                </div>
                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input type="text" id="cvc" placeholder="CVC" />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "paypal" && (
            <div className="text-center">
              <p>You will be redirected to PayPal to complete your payment.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Subtotal:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Shipping:</span>
            <span>Free</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between items-center">
            <span className="font-bold">Total:</span>
            <span className="text-xl font-bold">${cartTotal.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full mt-6 bg-[#D4AF37] hover:bg-[#B8860B] text-black"
        onClick={() => {
          setLoading(true)
          setTimeout(() => {
            setLoading(false)
            clearCart()
            router.push("/success")
          }, 2000)
        }}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Place Order
          </>
        )}
      </Button>
    </div>
  )
}
