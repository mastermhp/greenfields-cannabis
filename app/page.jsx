"use client"

import { useState, useRef } from "react"
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

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all")
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 300])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  // Get featured products, fallback to recent products if no featured ones exist
  const { products: featuredProducts, loading } = useProducts({
    category: activeCategory === "all" ? undefined : activeCategory,
    limit: 8,
  })

  // If no products from the hook, we'll show a fallback
  const displayProducts = featuredProducts?.length > 0 ? featuredProducts : []

  return (
    <>
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0 z-0" style={{ y, opacity }}>
          <Image src="/greenfieldsbg.jpeg" alt="Premium Cannabis" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>

        <div className="container mx-auto px-4 z-10 text-center">
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 gold-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* GREENFIELDS */}
          </motion.h1>

          {/* <motion.p
            className="text-xl md:text-2xl pt-[400px] mb-8 text-beige max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Premium Quality Cannabis Products for Connoisseurs
          </motion.p> */}

          {/* <motion.div
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
                Shop Now <ChevronRight className="ml-2" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 text-lg py-6 px-8 rounded-none"
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </motion.div> */}
        </div>

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
            <p className="text-beige max-w-2xl mx-auto">
              Discover our wide range of premium cannabis products
            </p>
          </motion.div>

          <CategorySlider categories={categories} />
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
              className={activeCategory === "all" ? "bg-[#D4AF37] text-white hover:text-[#D4AF37] hover:border-2 hover:border-[#D4AF37] cursor-pointer transition-all duration-1000" : "border-2 border-[#D4AF37] text-[#D4AF37]"}
              onClick={() => setActiveCategory("all")}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                className={
                  activeCategory === category.id ? "bg-[#D4AF37] text-black " : "border-2 border-[#D4AF37] text-[#D4AF37] hover:text-white hover:border-2 hover:border-white cursor-pointer transition-all duration-1000"
                }
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {loading ? (
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
              {/* <Button asChild className="bg-[#D4AF37] hover:bg-black text-black hover:text-[#D4AF37] hover:border-2 hover:border-[#D4AF37] cursor-pointer transition-all duration-1000">
                <Link href="/products">View All Products</Link>
              </Button> */}
            </div>
          )}

          <div className="text-center mt-16">
            <Button asChild className="bg-[#D4AF37] text-black text-lg py-6 px-10 rounded-none hover:text-[#D4AF37] hover:bg-black hover:border-2 hover:border-[#D4AF37] cursor-pointer transition-all duration-1000">
              <Link href="/products">
                View All Products <ChevronRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 gold-text">Why Choose Greenfields</h2>
            <p className="text-beige max-w-2xl mx-auto">Experience the difference with our premium cannabis products</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Premium Quality",
                description: "Sourced from the finest growers with strict quality control",
              },
              {
                icon: Award,
                title: "Award Winning",
                description: "Multiple cannabis cup winner for our exclusive strains",
              },
              {
                icon: Shield,
                title: "Lab Tested",
                description: "All products are rigorously tested for purity and potency",
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                description: "Discreet packaging with fast and reliable shipping",
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-[#111] p-8 border border-[#333] hover:border-[#D4AF37] transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, boxShadow: "0 10px 30px rgba(212, 175, 55, 0.2)" }}
              >
                <benefit.icon size={48} className="text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-beige">{benefit.description}</p>
              </motion.div>
            ))}
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
          <Image src="/community.jpg" alt="Background Pattern" fill className="object-cover" />
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4 gold-text">Join Our Community</h2>
              <p className="text-beige max-w-2xl mx-auto">
                Subscribe to our newsletter for exclusive offers, new product alerts, and cannabis education
              </p>
            </motion.div>

            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  )
}
