"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/hooks/use-cart"

const ProductCard = ({ product }) => {
  const { toast } = useToast()
  const { addToCart } = useCart()
  const [isFavorite, setIsFavorite] = useState(false)

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

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    addToCart(product, 1)

    toast({
      title: "Added to cart",
      description: `${product.name} added to your cart`,
    })
  }

  return (
    <motion.div
      className="product-card bg-[#111] border border-[#333] hover:border-[#D4AF37] overflow-hidden"
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/products/${product._id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.images[0] || "/placeholder.svg?height=400&width=400"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-110"
          />

          {product.oldPrice && (
            <div className="absolute top-4 left-4 bg-[#D4AF37] text-black text-xs font-bold px-2 py-1">SALE</div>
          )}

          <button
            className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full ${
              isFavorite ? "bg-[#D4AF37]/20 text-[#D4AF37]" : "bg-black/50 text-white"
            }`}
            onClick={toggleFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart size={16} className={isFavorite ? "fill-[#D4AF37]" : ""} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center mb-2">
            <span className="text-xs text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1">{product.category}</span>
            {!product.inStock && <span className="ml-2 text-xs text-red-500">Out of Stock</span>}
          </div>

          <h3 className="text-lg font-medium mb-1 truncate">{product.name}</h3>

          <div className="flex items-center mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.floor(product.rating) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-gray-400"}
                />
              ))}
            </div>
            <span className="ml-2 text-xs text-beige">({product.reviewCount})</span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-lg font-bold text-[#D4AF37]">${product.price.toFixed(2)}</span>
              {product.oldPrice && (
                <span className="ml-2 text-sm text-gray-400 line-through">${product.oldPrice.toFixed(2)}</span>
              )}
            </div>

            <div className="text-xs text-beige">{product.weight}g</div>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="w-full bg-[#D4AF37] hover:bg-[#B8860B]/10 text-black hover:text-[#D4AF37] hover:border-2 hover:border-[#D4AF37] cursor-pointer transition-all duration-1000"
          >
            <ShoppingCart size={16} className="mr-2" />
            Add to Cart
          </Button>
        </div>
      </Link>
    </motion.div>
  )
}

export default ProductCard
