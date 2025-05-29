"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ProductCard from "@/components/products/product-card"
import ProductFilters from "@/components/products/product-filters"
import { useProducts } from "@/hooks/use-products"
import { Button } from "@/components/ui/button"
import { Grid, List } from "lucide-react"

export default function ProductsPage() {
  const [filters, setFilters] = useState({
    category: "",
    search: "",
    minPrice: 0,
    maxPrice: 200,
    effects: [],
    potency: [],
  })
  const [viewMode, setViewMode] = useState("grid")
  const [sortBy, setSortBy] = useState("name")

  // Use real database data with filters
  const { products, loading } = useProducts({
    ...filters,
    sort: sortBy,
  })

  // Memoize the filter change handler to prevent infinite loops
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters)
  }, [])

  if (loading) {
    return (
      <div className="bg-black min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 gold-text mt-20">Our Products</h1>
            <p className="text-beige max-w-2xl mx-auto">
              Discover our premium selection of cannabis products, carefully curated for quality and potency
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/4">
              <div className="bg-[#111] border border-[#333] rounded-lg p-6 animate-pulse">
                <div className="space-y-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-4 bg-[#333] rounded"></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:w-3/4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-[#111] border border-[#333] rounded-lg p-6 animate-pulse">
                    <div className="aspect-square bg-[#333] rounded mb-4"></div>
                    <div className="h-4 bg-[#333] rounded mb-2"></div>
                    <div className="h-4 bg-[#333] rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 gold-text mt-20">Our Products</h1>
          <p className="text-beige max-w-2xl mx-auto">
            Discover our premium selection of cannabis products, carefully curated for quality and potency
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <ProductFilters onFilterChange={handleFilterChange} />
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            {/* Toolbar */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-beige">
                Showing {products.length} product{products.length !== 1 ? "s" : ""}
              </p>

              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#111] border border-[#333] text-white px-3 py-2 rounded-lg focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex border border-[#333] rounded-lg overflow-hidden">
                  <Button
                    onClick={() => setViewMode("grid")}
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    className={`rounded-none ${viewMode === "grid" ? "bg-[#D4AF37] text-black" : "bg-[#111] text-white hover:bg-[#222]"}`}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => setViewMode("list")}
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    className={`rounded-none ${viewMode === "list" ? "bg-[#D4AF37] text-black" : "bg-[#111] text-white hover:bg-[#222]"}`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Display */}
            <motion.div
              className={`${
                viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              <AnimatePresence>
                {products.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ProductCard product={product} viewMode={viewMode} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {products.length === 0 && (
              <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-2xl font-bold text-white mb-4">No products found</h3>
                <p className="text-beige mb-6">Try adjusting your filters to see more products</p>
                <Button
                  onClick={() =>
                    setFilters({
                      category: "",
                      search: "",
                      minPrice: 0,
                      maxPrice: 200,
                      effects: [],
                      potency: [],
                    })
                  }
                  className="bg-[#D4AF37] text-black hover:bg-[#B8941F]"
                >
                  Clear All Filters
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
