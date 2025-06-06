"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Star, ShoppingCart, Heart, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"

export default function ProductCard({ product, viewMode = "grid" }) {
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [isFavorite, setIsFavorite] = useState(false)

  // Helper function to get the price display for weight-based pricing
  const getPriceDisplay = () => {
    if (product.weightPricing && product.weightPricing.length > 0) {
      // Sort by weight to show the lowest price first
      const sortedPricing = [...product.weightPricing].sort((a, b) => a.weight - b.weight)
      const lowestPrice = sortedPricing[0]
      const highestPrice = sortedPricing[sortedPricing.length - 1]

      // Apply discount if available
      const discountMultiplier = 1 - (product.discountPercentage || 0) / 100
      const lowestDiscountedPrice = lowestPrice.price * discountMultiplier
      const highestDiscountedPrice = highestPrice.price * discountMultiplier

      if (sortedPricing.length === 1) {
        return {
          current: `$${lowestDiscountedPrice.toFixed(2)}/${lowestPrice.unit}`,
          original: product.discountPercentage > 0 ? `$${lowestPrice.price.toFixed(2)}` : null,
          range: false,
        }
      } else {
        return {
          current: `$${lowestDiscountedPrice.toFixed(2)} - $${highestDiscountedPrice.toFixed(2)}`,
          original:
            product.discountPercentage > 0
              ? `$${lowestPrice.price.toFixed(2)} - $${highestPrice.price.toFixed(2)}`
              : null,
          range: true,
        }
      }
    } else if (product.price && !isNaN(product.price)) {
      const discountMultiplier = 1 - (product.discountPercentage || 0) / 100
      const discountedPrice = product.price * discountMultiplier

      return {
        current: `$${discountedPrice.toFixed(2)}`,
        original: product.discountPercentage > 0 ? `$${product.price.toFixed(2)}` : null,
        range: false,
      }
    } else {
      return {
        current: "Price not set",
        original: null,
        range: false,
      }
    }
  }

  // Helper function to check if product is in stock
  const isInStock = () => {
    if (product.weightPricing && product.weightPricing.length > 0) {
      return product.weightPricing.some((wp) => (wp.stock || 0) > 0)
    }
    return (product.stock || 0) > 0
  }

  // Helper function to get the lowest priced weight option for adding to cart
  const getDefaultWeightOption = () => {
    if (product.weightPricing && product.weightPricing.length > 0) {
      return [...product.weightPricing].sort((a, b) => a.price - b.price)[0]
    }
    return null
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const defaultWeight = getDefaultWeightOption()
    const cartItem = {
      ...product,
      selectedWeight: defaultWeight,
      price: defaultWeight ? defaultWeight.price : product.price,
      weightInfo: defaultWeight ? `${defaultWeight.weight}${defaultWeight.unit}` : null,
    }

    addToCart(cartItem, 1)
    toast({
      title: "Added to cart",
      description: `${product.name}${defaultWeight ? ` (${defaultWeight.weight}${defaultWeight.unit})` : ""} added to your cart`,
    })
  }

  const toggleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite
        ? `${product.name} removed from your favorites`
        : `${product.name} added to your favorites`,
    })
  }

  const priceInfo = getPriceDisplay()

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#111] border border-[#333] rounded-lg overflow-hidden hover:border-[#D4AF37] transition-all duration-300 group"
      >
        <Link href={`/products/${product._id || product.id}`}>
          <div className="flex">
            <div className="relative w-48 h-48 bg-[#222] overflow-hidden">
              <Image
                src={product.images?.[0] || "/placeholder.svg?height=200&width=200"}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {product.discountPercentage > 0 && (
                <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded">
                  {product.discountPercentage}% OFF
                </div>
              )}
              {!isInStock() && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold">Out of Stock</span>
                </div>
              )}
            </div>

            <div className="flex-1 p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[#D4AF37] text-sm font-medium bg-[#D4AF37]/10 px-2 py-1 rounded">
                    {product.categoryName || product.category || "Uncategorized"}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-2 group-hover:text-[#D4AF37] transition-colors">
                    {product.name}
                  </h3>
                </div>
                <Button
                  onClick={toggleFavorite}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-[#D4AF37]"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? "fill-[#D4AF37] text-[#D4AF37]" : ""}`} />
                </Button>
              </div>

              <div className="flex items-center mb-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < (product.rating || 0) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-gray-400"}
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-400 text-sm">({product.reviewCount || 0})</span>
              </div>

              <p className="text-gray-300 text-sm mb-4 line-clamp-2">{product.description}</p>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-[#D4AF37]">{priceInfo.current}</span>
                  {priceInfo.original && <span className="ml-2 text-gray-400 line-through">{priceInfo.original}</span>}
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={!isInStock()}
                  className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#111] border border-[#333] rounded-lg overflow-hidden hover:border-[#D4AF37] transition-all duration-300 group"
    >
      <Link href={`/products/${product._id || product.id}`}>
        <div className="relative aspect-square bg-[#222] overflow-hidden">
          <Image
            src={product.images?.[0] || "/placeholder.svg?height=300&width=300"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded">
              {product.discountPercentage}% OFF
            </div>
          )}
          {!isInStock() && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold">Out of Stock</span>
            </div>
          )}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              onClick={toggleFavorite}
              variant="ghost"
              size="sm"
              className="bg-black/50 text-white hover:text-[#D4AF37] backdrop-blur-sm"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-[#D4AF37] text-[#D4AF37]" : ""}`} />
            </Button>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[#D4AF37] text-xs font-medium bg-[#D4AF37]/10 px-2 py-1 rounded">
            {product.categoryName || product.category || "Uncategorized"}
          </span>
          <div className="flex items-center">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < (product.rating || 0) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-gray-400"}
                />
              ))}
            </div>
            <span className="ml-1 text-gray-400 text-xs">({product.reviewCount || 0})</span>
          </div>
        </div>

        <Link href={`/products/${product._id || product.id}`}>
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xl font-bold text-[#D4AF37]">{priceInfo.current}</span>
            {priceInfo.original && <div className="text-gray-400 line-through text-sm">{priceInfo.original}</div>}
          </div>
          {product.thcContent && (
            <div className="text-right">
              <div className="text-xs text-gray-400">THC</div>
              <div className="text-sm font-medium text-[#D4AF37]">{((product.thcContent || 0) * 100).toFixed(0)}%</div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleAddToCart}
            disabled={!isInStock()}
            className="flex-1 bg-[#D4AF37] hover:bg-[#B8860B] text-black"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
          <Link href={`/products/${product._id || product.id}`}>
            <Button variant="outline" size="icon" className="border-[#333] text-white hover:border-[#D4AF37]">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
