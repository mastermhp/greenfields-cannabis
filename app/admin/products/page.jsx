"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Plus, Search, Edit, Trash2, Eye, MoreHorizontal, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useProducts } from "@/hooks/use-products"

const AdminProducts = () => {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Memoize the options to prevent infinite re-renders
  const productOptions = useMemo(
    () => ({
      search: searchQuery || undefined,
      category: selectedCategory === "all" ? undefined : selectedCategory,
    }),
    [searchQuery, selectedCategory],
  )

  // Use real database data
  const { products, loading, deleteProduct, refetch } = useProducts(productOptions)

  const handleDeleteProduct = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        console.log("Attempting to delete product:", productId)
        await deleteProduct(productId)
        // Optionally refetch to ensure consistency
        await refetch()
      } catch (error) {
        console.error("Failed to delete product:", error)
      }
    }
  }

  const getStatusBadge = (status, stock) => {
    if (status === "out_of_stock" || stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    }
    if (stock < 10) {
      return (
        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
          Low Stock
        </Badge>
      )
    }
    return (
      <Badge variant="default" className="bg-green-500/20 text-green-400">
        In Stock
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-[#333] rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-[#333] rounded w-64 mt-2 animate-pulse"></div>
          </div>
          <div className="h-10 bg-[#333] rounded w-32 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#111] border border-[#333] rounded-lg p-6 animate-pulse">
              <div className="h-32 bg-[#333] rounded mb-4"></div>
              <div className="h-6 bg-[#333] rounded mb-2"></div>
              <div className="h-4 bg-[#333] rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gold-text">Products Management</h1>
          <p className="text-beige mt-2">Manage your product inventory and details</p>
        </div>
        <Button asChild className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
          <Link href="/admin/products/new">
            <Plus size={16} className="mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[#111] border-[#333]">
          <CardContent className="p-6 text-center">
            <p className="text-beige text-sm">Total Products</p>
            <p className="text-3xl font-bold text-blue-400 mt-2">{products.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#111] border-[#333]">
          <CardContent className="p-6 text-center">
            <p className="text-beige text-sm">In Stock</p>
            <p className="text-3xl font-bold text-green-400 mt-2">
              {products.filter((p) => (p.stock || 0) > 0).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#111] border-[#333]">
          <CardContent className="p-6 text-center">
            <p className="text-beige text-sm">Low Stock</p>
            <p className="text-3xl font-bold text-yellow-400 mt-2">
              {products.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) < 10).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#111] border-[#333]">
          <CardContent className="p-6 text-center">
            <p className="text-beige text-sm">Out of Stock</p>
            <p className="text-3xl font-bold text-red-400 mt-2">
              {products.filter((p) => (p.stock || 0) === 0).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#111] border-[#333]">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black border-[#333] focus:border-[#D4AF37]"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-black border border-[#333] rounded-md text-white focus:border-[#D4AF37]"
            >
              <option value="all">All Categories</option>
              <option value="flower">Flower</option>
              <option value="pre-rolls">Pre-Rolls</option>
              <option value="edibles">Edibles</option>
              <option value="concentrates">Concentrates</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product._id || product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-[#111] border-[#333] hover:border-[#D4AF37]/50 transition-colors">
              <CardContent className="p-6">
                <div className="relative mb-4">
                  <Image
                    src={product.images?.[0] || "/placeholder.svg?height=200&width=300"}
                    alt={product.name || "Product"}
                    width={200}
                    height={150}
                    className="w-full h-32 object-cover rounded-lg bg-[#222]"
                  />
                  <div className="absolute top-2 right-2">{getStatusBadge(product.status, product.stock)}</div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-white text-lg">{product.name || "Unnamed Product"}</h3>
                    <p className="text-beige text-sm capitalize">{product.category || "Uncategorized"}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#D4AF37] font-bold text-xl">${(product.price || 0).toFixed(2)}</span>
                    <span className="text-beige text-sm">Stock: {product.stock || 0}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-[#222] p-2 rounded">
                      <span className="text-beige">THC: </span>
                      <span className="text-white">{((product.thcContent || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="bg-[#222] p-2 rounded">
                      <span className="text-beige">CBD: </span>
                      <span className="text-white">{((product.cbdContent || 0) * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-beige text-sm">
                      {product.featured ? "Featured" : "Regular"} • {product.rating || 0} ⭐
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#111] border-[#333]">
                        <DropdownMenuItem asChild>
                          <Link href={`/products/${product._id || product.id}`} className="flex items-center">
                            <Eye size={16} className="mr-2" />
                            View Product
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/admin/products/${product._id || product.id}/edit`}
                            className="flex items-center"
                          >
                            <Edit size={16} className="mr-2" />
                            Edit Product
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteProduct(product._id || product.id, product.name)}
                          className="text-red-400 focus:text-red-400"
                        >
                          <Trash2 size={16} className="mr-2" />
                          Delete Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {products.length === 0 && (
        <Card className="bg-[#111] border-[#333]">
          <CardContent className="p-12 text-center">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
            <p className="text-beige mb-6">Try adjusting your search or filter criteria</p>
            <Button asChild className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
              <Link href="/admin/products/new">
                <Plus size={16} className="mr-2" />
                Add Your First Product
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AdminProducts
