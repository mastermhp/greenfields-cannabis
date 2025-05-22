"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Search, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function FAQsPage() {
  const [activeCategory, setActiveCategory] = useState("general")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFaqs, setExpandedFaqs] = useState({})

  const categories = [
    { id: "general", name: "General" },
    { id: "products", name: "Products" },
    { id: "orders", name: "Orders & Shipping" },
    { id: "account", name: "Account & Payment" },
    { id: "legal", name: "Legal" },
  ]

  const faqData = {
    general: [
      {
        question: "What is Greenfields?",
        answer:
          "Greenfields is a premium cannabis company dedicated to providing high-quality cannabis products. We offer a wide range of products including flower, pre-rolls, edibles, concentrates, and more.",
      },
      {
        question: "Are you a licensed cannabis retailer?",
        answer:
          "Yes, Greenfields is fully licensed and compliant with all state and local regulations for cannabis sales. Our license information is available upon request.",
      },
      {
        question: "Do you have physical store locations?",
        answer:
          "Yes, we have flagship stores in major cities across legal states. Visit our Contact page to find the location nearest to you.",
      },
      {
        question: "What makes Greenfields products premium?",
        answer:
          "Our products are crafted with care using only the highest quality cannabis. We maintain strict quality control standards throughout our cultivation, extraction, and manufacturing processes to ensure consistency, potency, and purity.",
      },
    ],
    products: [
      {
        question: "What types of cannabis products do you offer?",
        answer:
          "We offer a comprehensive range of premium cannabis products including flower, pre-rolls, vape cartridges, concentrates, edibles, tinctures, topicals, and accessories.",
      },
      {
        question: "How do you ensure product quality?",
        answer:
          "All Greenfields products undergo rigorous testing by third-party laboratories for potency, purity, and safety. We test for cannabinoid profiles, terpenes, pesticides, heavy metals, microbials, and residual solvents to ensure the highest quality standards.",
      },
      {
        question: "What's the difference between Indica, Sativa, and Hybrid strains?",
        answer:
          "Indica strains typically provide relaxing, body-focused effects, while Sativa strains tend to offer energizing, cerebral effects. Hybrid strains combine characteristics of both. However, individual experiences may vary based on the specific cannabinoid and terpene profiles of each product.",
      },
      {
        question: "How should I store my cannabis products?",
        answer:
          "For optimal freshness and potency, store cannabis products in a cool, dark place in airtight containers. Keep away from direct sunlight and extreme temperatures. Always keep cannabis products out of reach of children and pets.",
      },
    ],
    orders: [
      {
        question: "How do I place an order?",
        answer:
          "You can place an order through our website by browsing our products, adding items to your cart, and proceeding to checkout. You'll need to create an account or log in, verify your age, and complete the payment process.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept major credit cards, debit cards, and cash on delivery (where available). Due to federal banking restrictions, we currently do not accept checks or bank transfers.",
      },
      {
        question: "How can I track my order?",
        answer:
          "Once your order ships, you'll receive a confirmation email with tracking information. You can also track your order by logging into your account or visiting our Order Tracking page.",
      },
      {
        question: "Do you offer free shipping?",
        answer:
          "Yes, we offer free standard shipping on orders over $100. Orders under $100 have a flat shipping fee of $9.99. Express and same-day delivery options are available at additional costs.",
      },
    ],
    account: [
      {
        question: "How do I create an account?",
        answer:
          "You can create an account by clicking the 'Sign Up' button in the top right corner of our website. You'll need to provide your email address, create a password, and verify that you're at least 21 years of age.",
      },
      {
        question: "Is my personal information secure?",
        answer:
          "Yes, we take data security seriously. We use industry-standard encryption and security measures to protect your personal information. Please review our Privacy Policy for more details on how we handle your data.",
      },
      {
        question: "Can I change my delivery address after placing an order?",
        answer:
          "Address changes may be possible if the order hasn't been processed yet. Please contact our customer service team immediately if you need to change your delivery address.",
      },
      {
        question: "How do I reset my password?",
        answer:
          "You can reset your password by clicking the 'Forgot Password' link on the login page. We'll send you an email with instructions to create a new password.",
      },
    ],
    legal: [
      {
        question: "Is cannabis legal in my state?",
        answer:
          "Cannabis legality varies by state and country. It's your responsibility to verify the legal status of cannabis in your jurisdiction before placing an order. We only ship to areas where cannabis is legal.",
      },
      {
        question: "What is your age verification process?",
        answer:
          "We require all customers to verify they are at least 21 years of age or older. During checkout, you'll need to provide a valid government-issued ID, which will be verified before your order is processed.",
      },
      {
        question: "Can I travel with Greenfields products?",
        answer:
          "Traveling with cannabis products, even between legal states, may violate federal law. We recommend consulting local laws and regulations before traveling with any cannabis products.",
      },
      {
        question: "What is your return policy?",
        answer:
          "Due to the nature of our products, we cannot accept returns of opened cannabis items. However, if you receive damaged, defective, or incorrect products, please contact our customer service team within 48 hours of delivery.",
      },
    ],
  }

  const toggleFaq = (category, index) => {
    setExpandedFaqs((prev) => ({
      ...prev,
      [`${category}-${index}`]: !prev[`${category}-${index}`],
    }))
  }

  const filteredFaqs = searchQuery
    ? Object.entries(faqData).flatMap(([category, faqs]) =>
        faqs
          .filter(
            (faq) =>
              faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
          )
          .map((faq) => ({ ...faq, category })),
      )
    : faqData[activeCategory]

  return (
    <div className="bg-black min-h-screen py-40">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/faq.jpeg"
            alt="Frequently Asked Questions"
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
            Frequently Asked Questions
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl mb-8 text-beige max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Find answers to common questions about our premium cannabis products and services
          </motion.p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20 bg-gradient-to-b from-black to-[#111]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search for questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 bg-[#111] border-[#333] focus:border-[#D4AF37] rounded-none h-14 text-lg"
                />
              </div>
            </motion.div>

            {/* Category Tabs */}
            {!searchQuery && (
              <motion.div
                className="mb-12 flex flex-wrap gap-2"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    variant={activeCategory === category.id ? "default" : "outline"}
                    className={
                      activeCategory === category.id
                        ? "bg-[#D4AF37] hover:bg-[#B8860B] text-black"
                        : "border-[#333] hover:border-[#D4AF37] text-white hover:text-[#D4AF37]"
                    }
                  >
                    {category.name}
                  </Button>
                ))}
              </motion.div>
            )}

            {/* FAQ List */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {searchQuery && filteredFaqs.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-2xl font-bold mb-4">No results found</h3>
                  <p className="text-beige mb-6">We couldn't find any FAQs matching your search query.</p>
                  <Button onClick={() => setSearchQuery("")} className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
                    Clear Search
                  </Button>
                </div>
              ) : (
                <>
                  {searchQuery && (
                    <div className="mb-6 text-beige">
                      Found {filteredFaqs.length} results for "{searchQuery}"
                    </div>
                  )}

                  {filteredFaqs.map((faq, index) => {
                    const faqId = searchQuery ? `${faq.category}-${index}` : `${activeCategory}-${index}`
                    const isExpanded = expandedFaqs[faqId] || false

                    return (
                      <div key={faqId} className="border border-[#333] bg-[#111] overflow-hidden">
                        <button
                          className="w-full text-left p-6 flex justify-between items-center"
                          onClick={() => toggleFaq(searchQuery ? faq.category : activeCategory, index)}
                        >
                          <h3 className="text-xl font-medium pr-8">{faq.question}</h3>
                          <div className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                            <ChevronDown size={24} className="text-[#D4AF37]" />
                          </div>
                        </button>

                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="p-6 pt-0 text-beige border-t border-[#333]">
                            <p>{faq.answer}</p>

                            {searchQuery && (
                              <div className="mt-4 text-sm">
                                <span className="text-[#D4AF37]">Category: </span>
                                <span>{categories.find((c) => c.id === faq.category)?.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </motion.div>

            {/* Contact CTA */}
            <motion.div
              className="mt-16 bg-[#111] border border-[#D4AF37] p-8 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-2xl font-bold mb-4 gold-text">Still Have Questions?</h3>
              <p className="text-beige mb-6">
                Can't find the answer you're looking for? Our customer support team is here to help.
              </p>
              <Button asChild className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
                <Link href="/contact">
                  Contact Us <ChevronRight className="ml-2" size={16} />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
