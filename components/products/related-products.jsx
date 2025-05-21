"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import ProductCard from "@/components/products/product-card"
import { allProducts } from "@/lib/data"

const RelatedProducts = ({ currentProductId, category }) => {
  const [relatedProducts, setRelatedProducts] = useState([])

  useEffect(() => {
    // Filter products by category and exclude current product
    const filtered = allProducts
      .filter((product) => product.category === category && product.id !== currentProductId)
      .slice(0, 4) // Limit to 4 products

    setRelatedProducts(filtered)
  }, [currentProductId, category])

  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {relatedProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default RelatedProducts
