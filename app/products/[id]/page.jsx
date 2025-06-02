"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Star, Minus, Plus, ShoppingCart, Heart, Share2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RelatedProducts from "@/components/products/related-products"
import ProductReviews from "@/components/products/product-reviews"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/hooks/use-cart"

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Fetch the product from the API using the ID from the URL
        const response = await fetch(`/api/products/${params.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log("Product API response:", data)

        if (data.success && data.product) {
          setProduct(data.product)
        } else {
          console.error("Product not found or API error:", data.error || "Unknown error")
          router.push("/products")
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        router.push("/products")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id, router])

  const handleAddToCart = () => {
    addToCart(product, quantity)
    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.name} added to your cart`,
    })
  }

  const handleQuantityChange = (value) => {
    if (value < 1) return
    if (value > 10) return
    setQuantity(value)
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite
        ? `${product.name} removed from your favorites`
        : `${product.name} added to your favorites`,
    })
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold gold-text">Loading Product</h2>
          <p className="text-beige">Please wait while we fetch the product details</p>
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="bg-black min-h-screen">
      <div className="container mx-auto px-4 py-40">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/products" className="flex items-center text-beige hover:text-[#D4AF37] transition-colors">
            <ChevronLeft size={20} className="mr-1" />
            Back to Products
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="relative aspect-square overflow-hidden bg-[#111] mb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <Image
                    src={
                      product.images && product.images[selectedImage]
                        ? product.images[selectedImage]
                        : "/placeholder.svg?height=600&width=600"
                    }
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {product.images &&
                product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square bg-[#111] overflow-hidden border-2 ${selectedImage === index ? "border-[#D4AF37]" : "border-transparent"} transition-all hover:opacity-80`}
                  >
                    <Image
                      src={image || "/placeholder.svg?height=150&width=150"}
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center mb-2">
              <span className="text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 text-sm font-medium">{product.category}</span>
              {product.inStock ? (
                <span className="ml-4 text-green-500 text-sm">In Stock</span>
              ) : (
                <span className="ml-4 text-red-500 text-sm">Out of Stock</span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>

            <div className="flex items-center mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < product.rating ? "text-[#D4AF37] fill-[#D4AF37]" : "text-gray-400"}
                  />
                ))}
              </div>
              <span className="ml-2 text-beige">({product.reviewCount || 0} reviews)</span>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-[#D4AF37]">${product.price.toFixed(2)}</span>
              {product.oldPrice && (
                <span className="ml-3 text-xl text-gray-400 line-through">${product.oldPrice.toFixed(2)}</span>
              )}
            </div>

            <p className="text-beige mb-8">{product.description}</p>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-2">THC Content</h3>
              <div className="flex items-center">
                <div className="w-full bg-[#222] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#D4AF37]/50 to-[#D4AF37] h-full rounded-full"
                    style={{ width: `${(product.thcContent || 0) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-4 text-[#D4AF37] font-medium">{((product.thcContent || 0) * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Quantity</h3>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="border-[#333] text-white hover:bg-[#222] hover:text-white"
                >
                  <Minus size={18} />
                </Button>
                <span className="mx-6 text-xl font-medium w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 10}
                  className="border-[#333] text-white hover:bg-[#222] hover:text-white"
                >
                  <Plus size={18} />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
            className=" bg-[#D4AF37] hover:bg-[#B8860B]/10 text-black hover:text-[#D4AF37] hover:border-2 hover:border-[#D4AF37] cursor-pointer transition-all duration-1000"
              >
                <ShoppingCart className="mr-2" size={20} />
                Add to Cart
              </Button>

              <Button
                onClick={toggleFavorite}
                variant="outline"
                className={`border-[#333] hover:border-[#D4AF37] hover:cursor-pointer rounded-none ${isFavorite ? "text-[#D4AF37]" : "text-white"}`}
              >
                <Heart className={`${isFavorite ? "fill-[#D4AF37]" : ""}`} size={20} />
              </Button>

              <Button variant="outline" className="border-[#333] hover:border-[#D4AF37] text-white rounded-none">
                <Share2 size={20} />
              </Button>
            </div>

            <div className="flex items-center text-sm text-beige">
              <Info size={16} className="mr-2 text-[#D4AF37]" />
              Age verification required at delivery. Must be 21+ to purchase.
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description">
            <TabsList className="w-full border-b border-[#333] bg-transparent">
              <TabsTrigger
                value="description"
                className="text-lg py-4 rounded-none data-[state=active]:text-[#D4AF37] data-[state=active]:border-b-2 data-[state=active]:border-[#D4AF37] hover:cursor-pointer"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="text-lg py-4 rounded-none data-[state=active]:text-[#D4AF37] data-[state=active]:border-b-2 data-[state=active]:border-[#D4AF37] hover:cursor-pointer"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="text-lg py-4 rounded-none data-[state=active]:text-[#D4AF37] data-[state=active]:border-b-2 data-[state=active]:border-[#D4AF37] hover:cursor-pointer"
              >
                Reviews ({product.reviewCount || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="pt-8">
              <div className="prose prose-lg max-w-none text-beige">
                <p className="mb-4">{product.fullDescription || product.description}</p>
                <p className="mb-4">
                  Our premium cannabis products are carefully cultivated to ensure the highest quality and potency. Each
                  product undergoes rigorous testing to guarantee purity and consistency.
                </p>
                <p>Experience the difference with Greenfields - where quality meets luxury.</p>
              </div>
            </TabsContent>

            <TabsContent value="details" className="pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4 gold-text">Product Specifications</h3>
                  <ul className="space-y-3 text-beige">
                    <li className="flex justify-between border-b border-[#333] pb-2">
                      <span>Category:</span>
                      <span className="font-medium">{product.category}</span>
                    </li>
                    <li className="flex justify-between border-b border-[#333] pb-2">
                      <span>THC Content:</span>
                      <span className="font-medium">{((product.thcContent || 0) * 100).toFixed(0)}%</span>
                    </li>
                    <li className="flex justify-between border-b border-[#333] pb-2">
                      <span>CBD Content:</span>
                      <span className="font-medium">{((product.cbdContent || 0) * 100).toFixed(1)}%</span>
                    </li>
                    <li className="flex justify-between border-b border-[#333] pb-2">
                      <span>Weight:</span>
                      <span className="font-medium">{product.weight || 0}g</span>
                    </li>
                    <li className="flex justify-between border-b border-[#333] pb-2">
                      <span>Origin:</span>
                      <span className="font-medium">{product.origin || "California, USA"}</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4 gold-text">Effects</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {product.effects?.map((effect, index) => (
                      <div key={index} className="bg-[#111] p-4 border border-[#333]">
                        <div className="font-medium mb-2">{effect.name}</div>
                        <div className="w-full bg-[#222] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#D4AF37] h-full rounded-full"
                            style={{ width: `${effect.level * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                    {(!product.effects || product.effects.length === 0) && (
                      <div className="col-span-2 text-center py-4 text-beige">
                        No effects data available for this product
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="pt-8">
              <ProductReviews productId={product._id || product.id} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-8 gold-text">You May Also Like</h2>
          <RelatedProducts currentProductId={product._id || product.id} category={product.category} />
        </div>
      </div>
    </div>
  )
}
