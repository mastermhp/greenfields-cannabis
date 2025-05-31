"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

const CategorySlider = ({ categories }) => {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const containerRef = useRef(null)

  const checkScrollability = () => {
    const container = containerRef.current
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0)
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10)
    }
  }

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener("scroll", checkScrollability)
      // Initial check
      checkScrollability()

      // Check on window resize
      window.addEventListener("resize", checkScrollability)

      return () => {
        container.removeEventListener("scroll", checkScrollability)
        window.removeEventListener("resize", checkScrollability)
      }
    }
  }, [])

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -300, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 300, behavior: "smooth" })
    }
  }

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/70 hover:bg-[#D4AF37] text-white hover:text-black w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-1000 cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/70 hover:bg-[#D4AF37] text-white hover:text-black w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-1000 cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight size={24} />
        </button>
      )}

      <div
        ref={containerRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-6 px-4 py-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            className="flex-shrink-0 snap-center w-[280px]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link href={`/products?category=${category.id}`}>
              <div className="bg-[#111] border border-[#333] hover:border-[#D4AF37] overflow-hidden group transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-1000 cursor-pointer duration-300"></div>
                </div>

                <div className="p-4 text-center">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-[#D4AF37] transition-colors duration-1000 cursor-pointer">
                    {category.name}
                  </h3>
                  <p className="text-beige text-sm">{category.description}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default CategorySlider
