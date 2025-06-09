"use client"

import { useState, useRef, useEffect } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, TrendingUp, Award, Shield, Truck } from "lucide-react"
import ProductCard from "@/components/products/product-card"
import TestimonialSlider from "@/components/sliders/testimonial-slider"
import CategorySlider from "@/components/sliders/category-slider"
import NewsletterForm from "@/components/forms/newsletter-form"
import { Button } from "@/components/ui/button"
import { useProducts } from "@/hooks/use-products"
import { categories } from "@/lib/data"
import { useCategories } from "@/hooks/use-categories"

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [content, setContent] = useState({
    hero: {
      title: "GREENFIELDS",
      subtitle: "Premium Quality Cannabis Products for Connoisseurs",
      backgroundImage: "/greenfieldsbg.jpeg",
      ctaText: "Shop Now",
      ctaSecondaryText: "Learn More",
    },
    benefits: {
      title: "Why Choose Greenfields",
      subtitle: "Experience the difference with our premium cannabis products",
      backgroundImage: "",
      items: [
        {
          title: "Premium Quality",
          description: "Sourced from the finest growers with strict quality control",
          icon: "TrendingUp",
        },
        {
          title: "Award Winning",
          description: "Multiple cannabis cup winner for our exclusive strains",
          icon: "Award",
        },
        {
          title: "Lab Tested",
          description: "All products are rigorously tested for purity and potency",
          icon: "Shield",
        },
        {
          title: "Fast Delivery",
          description: "Discreet packaging with fast and reliable shipping",
          icon: "Truck",
        },
      ],
    },
    newsletter: {
      title: "Join Our Community",
      subtitle: "Subscribe to our newsletter for exclusive offers, new product alerts, and cannabis education",
      backgroundImage: "/community.jpg",
    },
  })
  const [loading, setLoading] = useState(true)
   const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 300])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  // Fetch content on component mount
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch("/api/content-management?page=home")
        const data = await response.json()
        if (data.success && data.data) {
          setContent((prev) => ({ ...prev, ...data.data }))
        }
      } catch (error) {
        console.error("Error fetching home content:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [])

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true)
        const response = await fetch("/api/categories")
        const data = await response.json()
        if (data.success && data.data) {
          setCategories(data.data)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setCategoriesLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // Get featured products, fallback to recent products if no featured ones exist
  const { products: featuredProducts, loading: productsLoading } = useProducts({
    category: activeCategory === "all" ? undefined : activeCategory,
    limit: 8,
  })

  // If no products from the hook, we'll show a fallback
  const displayProducts = featuredProducts?.length > 0 ? featuredProducts : []

  // Icon mapping for benefits
  const iconMap = {
    TrendingUp,
    Award,
    Shield,
    Truck,
  }

  return (
    <>
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0 z-0" style={{ y, opacity }}>
          <Image
            src={content.hero?.backgroundImage || "/greenfieldsbg.jpeg"}
            alt="Premium Cannabis"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>

        {/* <div className="container mx-auto px-4 z-10 text-center">
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 gold-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {content.hero?.title || "GREENFIELDS"}
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl mb-8 text-beige max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {content.hero?.subtitle || "Premium Quality Cannabis Products for Connoisseurs"}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              asChild
              className="bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] hover:bg-[#B8860B] text-black text-lg py-6 px-8 rounded-none"
            >
              <Link href="/products">
                {content.hero?.ctaText || "Shop Now"} <ChevronRight className="ml-2" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 text-lg py-6 px-8 rounded-none"
            >
              <Link href="/about">{content.hero?.ctaSecondaryText || "Learn More"}</Link>
            </Button>
          </motion.div>
        </div> */}

        <motion.div
          className="absolute bottom-10 left-0 right-0 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <div className="animate-bounce">
            <ChevronRight size={30} className="rotate-90 mx-auto text-[#D4AF37]" />
          </div>
        </motion.div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 bg-gradient-to-b from-black to-[#111]">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 gold-text">Explore Our Categories</h2>
            <p className="text-beige max-w-2xl mx-auto">Discover our wide range of premium cannabis products</p>
          </motion.div>

          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#111] border border-[#333] rounded-lg animate-pulse">
                  <div className="h-48 bg-[#333] rounded-t-lg mb-4"></div>
                  <div className="p-4">
                    <div className="h-6 bg-[#333] rounded mb-2"></div>
                    <div className="h-4 bg-[#333] rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <CategorySlider categories={categories} />
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-[#111]">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 gold-text">Featured Products</h2>
            <p className="text-beige max-w-2xl mx-auto">Explore our selection of premium cannabis products</p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              className={
                activeCategory === "all"
                  ? "bg-[#D4AF37] text-white hover:text-[#D4AF37] hover:border-2 hover:border-[#D4AF37] cursor-pointer transition-all duration-1000"
                  : "border-2 border-[#D4AF37] text-[#D4AF37]"
              }
              onClick={() => setActiveCategory("all")}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                className={
                  activeCategory === category.id
                    ? "bg-[#D4AF37] text-black "
                    : "border-2 border-[#D4AF37] text-[#D4AF37] hover:text-white hover:border-2 hover:border-white cursor-pointer transition-all duration-1000"
                }
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-[#111] border border-[#333] rounded-lg p-6 animate-pulse">
                  <div className="aspect-square bg-[#333] rounded mb-4"></div>
                  <div className="h-4 bg-[#333] rounded mb-2"></div>
                  <div className="h-4 bg-[#333] rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : displayProducts.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ staggerChildren: 0.1 }}
            >
              <AnimatePresence>
                {displayProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <p className="text-beige text-lg mb-4">No products available in this category</p>
            </div>
          )}

          <div className="text-center mt-16">
            <Button
              asChild
              className="bg-[#D4AF37] text-black text-lg py-6 px-10 rounded-none hover:text-[#D4AF37] hover:bg-black hover:border-2 hover:border-[#D4AF37] cursor-pointer transition-all duration-1000"
            >
              <Link href="/products">
                View All Products <ChevronRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-black relative">
        {content.benefits?.backgroundImage && (
          <div className="absolute inset-0 opacity-10">
            <Image
              src={content.benefits.backgroundImage || "/placeholder.svg"}
              alt="Benefits Background"
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 gold-text">
              {content.benefits?.title || "Why Choose Greenfields"}
            </h2>
            <p className="text-beige max-w-2xl mx-auto">
              {content.benefits?.subtitle || "Experience the difference with our premium cannabis products"}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.benefits?.items?.map((benefit, index) => {
              const IconComponent = iconMap[benefit.icon] || TrendingUp
              return (
                <motion.div
                  key={index}
                  className="bg-[#111] p-8 border border-[#333] hover:border-[#D4AF37] transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10, boxShadow: "0 10px 30px rgba(212, 175, 55, 0.2)" }}
                >
                  <IconComponent size={48} className="text-[#D4AF37] mb-4" />
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-beige">{benefit.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-black to-[#111]">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 gold-text">What Our Customers Say</h2>
            <p className="text-beige max-w-2xl mx-auto">
              Hear from our satisfied customers about their experience with Greenfields
            </p>
          </motion.div>

          <TestimonialSlider />
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-[#111] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src={content.newsletter?.backgroundImage || "/community.jpg"}
            alt="Background Pattern"
            fill
            className="object-cover"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto bg-black/50 p-10 border border-[#333]">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 gold-text">
                {content.newsletter?.title || "Join Our Community"}
              </h2>
              <p className="text-beige max-w-2xl mx-auto">
                {content.newsletter?.subtitle ||
                  "Subscribe to our newsletter for exclusive offers, new product alerts, and cannabis education"}
              </p>
            </motion.div>

            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  )
}
