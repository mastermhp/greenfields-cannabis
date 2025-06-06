"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Plus,
  Filter,
  Trash2,
  Edit,
  AlertTriangle,
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

const AdminProducts = () => {
  const router = useRouter()
  const { toast } = useToast()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const { accessToken } = useAuth()

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        if (response.ok) {
          const data = await response.json()
          setCategories([{ id: "all", name: "All Categories" }, ...data.categories])
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      }
    }

    fetchCategories()
  }, [])

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products")
        if (!response.ok) {
          throw new Error(`Error fetching products: ${response.status}`)
        }
        const data = await response.json()
        setProducts(data.products || [])
      } catch (error) {
        console.error("Failed to fetch products:", error)
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [toast])

  // Helper function to get category name
  const getCategoryName = (product) => {
    // First check if product already has categoryName
    if (product.categoryName) {
      return product.categoryName
    }

    // If not, try to look it up from categories
    if (!product.category) return "Uncategorized"

    const category = categories.find(
      (cat) =>
        cat.id === product.category ||
        cat._id === product.category ||
        cat._id?.toString() === product.category ||
        cat.value === product.category ||
        cat.name?.toLowerCase() === product.category?.toLowerCase(),
    )

    if (category) return category.name

    // If category looks like an ObjectId, it's probably a category we don't have in our list
    if (typeof product.category === "string" && product.category.length === 24) {
      return "Unknown Category"
    }

    // Otherwise just return the category value
    return product.category
  }

  // Helper function to format price display for weight-based pricing
  const formatPriceDisplay = (product) => {
    if (product.weightPricing && product.weightPricing.length > 0) {
      // Sort by weight to show the lowest price first
      const sortedPricing = [...product.weightPricing].sort((a, b) => a.weight - b.weight)
      const lowestPrice = sortedPricing[0]
      const highestPrice = sortedPricing[sortedPricing.length - 1]

      if (sortedPricing.length === 1) {
        return `$${lowestPrice.price.toFixed(2)}/${lowestPrice.unit}`
      } else {
        return `$${lowestPrice.price.toFixed(2)} - $${highestPrice.price.toFixed(2)}`
      }
    } else if (product.price && !isNaN(product.price)) {
      return `$${Number(product.price).toFixed(2)}`
    } else {
      return "Price not set"
    }
  }

  // Helper function to get stock display
  const getStockDisplay = (product) => {
    if (product.weightPricing && product.weightPricing.length > 0) {
      const totalStock = product.weightPricing.reduce((sum, wp) => sum + (wp.stock || 0), 0)
      return totalStock
    }
    return product.stock || 0
  }

  // Helper function to check if product is in stock
  const isProductInStock = (product) => {
    if (product.weightPricing && product.weightPricing.length > 0) {
      return product.weightPricing.some((wp) => (wp.stock || 0) > 0)
    }
    return (product.stock || 0) > 0
  }

  // Filter products based on search query and category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, selectedCategory])

  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    setDeleteLoading(true)
    try {
      console.log("Deleting product with ID:", productId)
      console.log("Using access token:", accessToken)

      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      })

      console.log("Delete response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Delete API Error Response:", errorText)
        throw new Error(`Failed to delete product: ${errorText}`)
      }

      // Remove the product from the state
      setProducts((prevProducts) => prevProducts.filter((p) => p._id !== productId && p.id !== productId))

      toast({
        title: "Product Deleted",
        description: "The product has been successfully deleted.",
      })
    } catch (error) {
      console.error("Delete product error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  // Open delete confirmation dialog
  const confirmDelete = (product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gold-text">Products</h1>
          <p className="text-beige mt-2">Manage your store products</p>
        </div>
        <Button
          onClick={() => router.push("/admin/products/new")}
          className="bg-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-2 hover:border-[#D4AF37] hover:cursor-pointer transition-all duration-500 hover:text-[#D4AF37] text-black"
        >
          <Plus size={16} className="mr-2" />
          Add New Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-[#111] border-[#333]">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search products..."
                className="pl-10 bg-black border-[#333] focus:border-[#D4AF37]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                className="pl-10 pr-8 py-2 bg-black border border-[#333] rounded-md text-white focus:border-[#D4AF37] appearance-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id || category._id} value={category.id || category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="bg-[#111] border-[#333]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#333]">
                <th className="text-left p-4 text-beige">
                  <div className="flex items-center">
                    Product
                    <ArrowUpDown size={14} className="ml-2 text-gray-400" />
                  </div>
                </th>
                <th className="text-left p-4 text-beige">Category</th>
                <th className="text-left p-4 text-beige">Price Range</th>
                <th className="text-left p-4 text-beige">Stock</th>
                <th className="text-left p-4 text-beige">Status</th>
                <th className="text-right p-4 text-beige">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-beige">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Loading products...
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-beige">
                    No products found. Try adjusting your filters or add a new product.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id || product.id} className="border-b border-[#333] hover:bg-[#1a1a1a]">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded bg-[#222] mr-3 overflow-hidden">
                          <img
                            src={product.images?.[0] || "/placeholder.svg?height=40&width=40"}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="text-white font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-beige capitalize">{getCategoryName(product)}</td>
                    <td className="p-4 text-beige">{formatPriceDisplay(product)}</td>
                    <td className="p-4 text-beige">{getStockDisplay(product)}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          isProductInStock(product) ? "bg-green-900/20 text-green-400" : "bg-red-900/20 text-red-400"
                        }`}
                      >
                        {isProductInStock(product) ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:cursor-pointer">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#222] border-[#333]">
                          <DropdownMenuItem
                            className="text-white cursor-pointer hover:bg-[#333]"
                            onClick={() => router.push(`/admin/products/${product._id || product.id}/edit`)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-500 cursor-pointer hover:bg-[#333] hover:text-red-500"
                            onClick={() => confirmDelete(product)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#111] border-[#333] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-beige">
              Are you sure you want to delete <span className="font-semibold text-white">{productToDelete?.name}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-transparent border-[#333] text-white hover:bg-[#222] hover:text-white"
              disabled={deleteLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => handleDeleteProduct(productToDelete?._id || productToDelete?.id)}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default AdminProducts
