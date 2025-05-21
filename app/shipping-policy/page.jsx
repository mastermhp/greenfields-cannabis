"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Truck, Clock, Shield, AlertTriangle, HelpCircle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ShippingPolicyPage() {
  return (
    <div className="bg-black min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/placeholder.svg?height=800&width=1920"
            alt="Shipping Policy"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>

        <div className="container mx-auto px-4 z-10 text-center">
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 gold-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Shipping Policy
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl mb-8 text-beige max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Everything you need to know about our shipping methods, delivery times, and policies
          </motion.p>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-20 bg-gradient-to-b from-black to-[#111]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Shipping Methods */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center mb-6">
                <Truck className="text-[#D4AF37] mr-4" size={32} />
                <h2 className="text-3xl font-bold gold-text">Shipping Methods</h2>
              </div>

              <div className="bg-[#111] border border-[#333] p-8 mb-8">
                <h3 className="text-xl font-semibold mb-4">Standard Shipping</h3>
                <p className="text-beige mb-4">
                  Our standard shipping option delivers your premium cannabis products within 3-5 business days. All
                  orders are processed within 24-48 hours after payment confirmation.
                </p>
                <ul className="list-disc list-inside text-beige space-y-2 mb-4">
                  <li>Delivery Time: 3-5 business days</li>
                  <li>Cost: $9.99 for orders under $100</li>
                  <li>Free shipping on orders over $100</li>
                  <li>Tracking provided via email</li>
                </ul>
              </div>

              <div className="bg-[#111] border border-[#333] p-8 mb-8">
                <h3 className="text-xl font-semibold mb-4">Express Shipping</h3>
                <p className="text-beige mb-4">
                  Need your premium cannabis products faster? Our express shipping option ensures delivery within 1-2
                  business days for most locations.
                </p>
                <ul className="list-disc list-inside text-beige space-y-2 mb-4">
                  <li>Delivery Time: 1-2 business days</li>
                  <li>Cost: $19.99 flat rate</li>
                  <li>Order cutoff time: 2:00 PM PST for same-day processing</li>
                  <li>Real-time tracking provided</li>
                </ul>
              </div>

              <div className="bg-[#111] border border-[#333] p-8">
                <h3 className="text-xl font-semibold mb-4">Same-Day Delivery</h3>
                <p className="text-beige mb-4">
                  Available in select areas, our same-day delivery service brings your premium cannabis products to your
                  doorstep within hours.
                </p>
                <ul className="list-disc list-inside text-beige space-y-2 mb-4">
                  <li>Delivery Time: Within 3-4 hours</li>
                  <li>Cost: $29.99 flat rate</li>
                  <li>Available in select metropolitan areas only</li>
                  <li>Order cutoff time: 4:00 PM local time</li>
                  <li>Real-time tracking with delivery updates</li>
                </ul>
                <p className="text-beige">
                  Check eligibility for same-day delivery by entering your zip code during checkout.
                </p>
              </div>
            </motion.div>

            {/* Delivery Information */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center mb-6">
                <Clock className="text-[#D4AF37] mr-4" size={32} />
                <h2 className="text-3xl font-bold gold-text">Delivery Information</h2>
              </div>

              <div className="bg-[#111] border border-[#333] p-8">
                <h3 className="text-xl font-semibold mb-4">Delivery Process</h3>
                <p className="text-beige mb-4">
                  All deliveries require an adult signature (21+ years) upon receipt. Please ensure someone is available
                  to receive the package and provide valid ID verification.
                </p>

                <h4 className="text-lg font-medium mb-2 mt-6">Tracking Your Order</h4>
                <p className="text-beige mb-4">
                  Once your order ships, you'll receive a confirmation email with tracking information. You can also
                  track your order by visiting our{" "}
                  <Link href="/track-order" className="text-[#D4AF37] hover:underline">
                    Order Tracking
                  </Link>{" "}
                  page.
                </p>

                <h4 className="text-lg font-medium mb-2 mt-6">Delivery Areas</h4>
                <p className="text-beige mb-4">
                  We currently ship to all states where cannabis products are legal. Please note that we cannot ship to
                  P.O. boxes or international addresses.
                </p>

                <div className="bg-[#D4AF37]/10 border border-[#D4AF37] p-4 mt-6">
                  <div className="flex items-start">
                    <AlertTriangle className="text-[#D4AF37] mr-3 mt-1 flex-shrink-0" size={20} />
                    <p className="text-beige">
                      Due to legal restrictions, we cannot ship cannabis products to states where recreational or
                      medical cannabis is not legalized. Please check your local laws before placing an order.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Packaging & Discretion */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center mb-6">
                <Shield className="text-[#D4AF37] mr-4" size={32} />
                <h2 className="text-3xl font-bold gold-text">Packaging & Discretion</h2>
              </div>

              <div className="bg-[#111] border border-[#333] p-8">
                <h3 className="text-xl font-semibold mb-4">Discreet Packaging</h3>
                <p className="text-beige mb-4">
                  We understand the importance of privacy. All Greenfields products are shipped in plain, unmarked
                  packaging with no indication of the contents inside. Your privacy is our priority.
                </p>

                <h4 className="text-lg font-medium mb-2 mt-6">Secure Packaging</h4>
                <p className="text-beige mb-4">
                  Our products are carefully packaged to ensure they arrive in perfect condition. We use child-resistant
                  containers, vacuum-sealed bags, and protective materials to maintain product freshness and prevent
                  damage during transit.
                </p>

                <h4 className="text-lg font-medium mb-2 mt-6">Eco-Friendly Approach</h4>
                <p className="text-beige mb-4">
                  Greenfields is committed to sustainability. Our packaging materials are recyclable or biodegradable
                  wherever possible, minimizing our environmental impact while maintaining product quality and
                  discretion.
                </p>
              </div>
            </motion.div>

            {/* Returns & Refunds */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center mb-6">
                <HelpCircle className="text-[#D4AF37] mr-4" size={32} />
                <h2 className="text-3xl font-bold gold-text">Returns & Refunds</h2>
              </div>

              <div className="bg-[#111] border border-[#333] p-8">
                <h3 className="text-xl font-semibold mb-4">Return Policy</h3>
                <p className="text-beige mb-4">
                  Due to the nature of our products, we cannot accept returns of opened cannabis items. However, if you
                  receive damaged, defective, or incorrect products, please contact our customer service team within 48
                  hours of delivery.
                </p>

                <h4 className="text-lg font-medium mb-2 mt-6">Refund Process</h4>
                <p className="text-beige mb-4">
                  If your return is approved, we will issue a refund to your original payment method. Processing time
                  for refunds is typically 5-7 business days, depending on your financial institution.
                </p>

                <h4 className="text-lg font-medium mb-2 mt-6">Damaged or Missing Items</h4>
                <p className="text-beige mb-4">
                  If your package arrives damaged or items are missing, please take photos of the package and contact
                  our customer service team immediately. We'll work quickly to resolve the issue and ensure your
                  satisfaction.
                </p>

                <div className="bg-[#111] border border-[#D4AF37] p-6 mt-6">
                  <h4 className="text-lg font-semibold mb-2 gold-text">Contact Customer Service</h4>
                  <p className="text-beige mb-4">
                    For any questions or concerns about your order or our shipping policies, our customer service team
                    is here to help.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
                      <Link href="/contact">
                        Contact Us <ChevronRight className="ml-2" size={16} />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10">
                      <Link href="/faqs">View FAQs</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
