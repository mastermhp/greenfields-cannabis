"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, ChevronDown, Search } from "lucide-react"
import ProductCard from "@/components/products/product-card"
import ProductFilters from "@/components/products/product-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { allProducts, categories } from "@/lib/data"

export default function ProductsPage() {
  const [products, setProducts] = useState(allProducts)
  const [filteredProducts, setFilteredProducts] = useState(allProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 200])
  const [sortBy, setSortBy] = useState("featured")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let result = [...allProducts]

    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((product) => product.category === selectedCategory)
    }

    // Filter by price range
    result = result.filter((product) => product.price >= priceRange[0] && product.price <= priceRange[1])

    // Sort products
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    setFilteredProducts(result)
  }, [searchQuery, selectedCategory, priceRange, sortBy])

  return (
    <div className="bg-black min-h-screen py-40">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 gold-text">Our Products</h1>
          <p className="text-beige max-w-2xl mx-auto">
            Explore our premium selection of cannabis products, carefully curated for quality and potency
          </p>
        </motion.div>

        {/* Search and Filter Controls */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#111] border-[#333] focus:border-[#D4AF37] rounded-none h-12"
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="bg-[#111] border border-[#333] hover:border-[#D4AF37] text-white rounded-none h-12"
              >
                <Filter size={20} className="mr-2" />
                Filters
              </Button>

              <div className="relative flex-grow md:flex-grow-0 min-w-[200px]">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full h-12 bg-[#111] border border-[#333] text-white px-4 pr-10 appearance-none focus:border-[#D4AF37] rounded-none"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
                <ChevronDown
                  size={20}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <ProductFilters
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Count */}
        <div className="mb-8 text-beige">
          Showing {filteredProducts.length} of {allProducts.length} products
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-[#111] border border-[#222] p-4 h-[400px] animate-pulse">
                <div className="bg-[#222] h-[200px] mb-4"></div>
                <div className="bg-[#222] h-6 w-3/4 mb-2"></div>
                <div className="bg-[#222] h-4 w-1/2 mb-4"></div>
                <div className="bg-[#222] h-10 w-full mt-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="text-2xl font-bold mb-4">No products found</h3>
                <p className="text-beige mb-8">Try adjusting your filters or search query</p>
                <Button
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                    setPriceRange([0, 200])
                    setSortBy("featured")
                  }}
                  className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.05 }}
              >
                <AnimatePresence>
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
