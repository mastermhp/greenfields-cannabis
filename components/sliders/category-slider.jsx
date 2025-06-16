"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Package, Pause, Play } from "lucide-react"

const CategorySlider = ({ categories }) => {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  const containerRef = useRef(null)
  const animationRef = useRef(null)
  const lastTimeRef = useRef(0)
  const scrollSpeedRef = useRef(0.5) // pixels per frame

  // Duplicate categories for infinite scroll
  const duplicatedCategories = [...categories, ...categories, ...categories]

  const checkScrollability = useCallback(() => {
    const container = containerRef.current
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)

      // Calculate scroll progress
      const maxScroll = scrollWidth - clientWidth
      const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0
      setScrollProgress(progress)
    }
  }, [])

  // Smooth auto-scroll using requestAnimationFrame
  const animate = useCallback(
    (currentTime) => {
      if (!lastTimeRef.current) lastTimeRef.current = currentTime

      const container = containerRef.current
      if (container && isAutoScrolling && !isPaused) {
        const deltaTime = currentTime - lastTimeRef.current

        if (deltaTime >= 16) {
          // ~60fps
          const { scrollLeft, scrollWidth, clientWidth } = container
          const maxScroll = scrollWidth - clientWidth
          const singleSetWidth = scrollWidth / 3 // Since we have 3 sets of categories

          // Reset scroll position when we've scrolled through one complete set
          if (scrollLeft >= singleSetWidth) {
            container.scrollLeft = scrollLeft - singleSetWidth
          } else {
            container.scrollLeft += scrollSpeedRef.current
          }

          checkScrollability()
          lastTimeRef.current = currentTime
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    },
    [isAutoScrolling, isPaused, checkScrollability],
  )

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener("scroll", checkScrollability)
      window.addEventListener("resize", checkScrollability)

      // Initial check
      checkScrollability()

      return () => {
        container.removeEventListener("scroll", checkScrollability)
        window.removeEventListener("resize", checkScrollability)
      }
    }
  }, [checkScrollability])

  const handleMouseEnter = () => {
    setIsPaused(true)
  }

  const handleMouseLeave = () => {
    setIsPaused(false)
  }

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -320, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 320, behavior: "smooth" })
    }
  }

  const toggleAutoScroll = () => {
    setIsAutoScrolling(!isAutoScrolling)
  }

  return (
    <div className="relative group">
      {/* Gradient overlays for smooth edges */}
      <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-black via-black/80 to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-black via-black/80 to-transparent z-20 pointer-events-none" />

      {/* Navigation buttons */}
      <AnimatePresence>
        {canScrollLeft && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={scrollLeft}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-gradient-to-r from-black/90 to-black/70 hover:from-[#D4AF37] hover:to-[#B8860B] text-white hover:text-black w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg hover:shadow-[#D4AF37]/50 backdrop-blur-sm border border-white/10 hover:border-[#D4AF37]/50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {canScrollRight && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={scrollRight}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-gradient-to-l from-black/90 to-black/70 hover:from-[#D4AF37] hover:to-[#B8860B] text-white hover:text-black w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg hover:shadow-[#D4AF37]/50 backdrop-blur-sm border border-white/10 hover:border-[#D4AF37]/50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Scroll right"
          >
            <ChevronRight size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Auto-scroll control */}
      <motion.button
        onClick={toggleAutoScroll}
        className="absolute top-4 right-4 z-30 bg-black/70 hover:bg-[#D4AF37]/20 text-white hover:text-[#D4AF37] w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-[#D4AF37]/50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isAutoScrolling ? "Pause auto-scroll" : "Resume auto-scroll"}
      >
        {isAutoScrolling ? <Pause size={16} /> : <Play size={16} />}
      </motion.button>

      {/* Progress indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
          <motion.div
            className="h-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] rounded-full"
            style={{ width: `${scrollProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main slider container */}
      <div
        ref={containerRef}
        className="flex overflow-x-auto scrollbar-hide gap-6 px-8 py-6"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          scrollBehavior: "auto",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {duplicatedCategories.map((category, index) => (
          <motion.div
            key={`${category.id}-${index}`}
            className="flex-shrink-0 w-[300px]"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.6,
              delay: (index % categories.length) * 0.1,
              ease: "easeOut",
            }}
          >
            <Link href={`/products?category=${category.id}`}>
              <motion.div
                className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#333] hover:border-[#D4AF37] overflow-hidden group transition-all duration-500 rounded-xl shadow-xl hover:shadow-2xl hover:shadow-[#D4AF37]/20"
                whileHover={{
                  y: -8,
                  transition: { duration: 0.3, ease: "easeOut" },
                }}
              >
                <div className="relative h-56 overflow-hidden">
                  {category?.image ? (
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name || "Category"}
                      width={300}
                      height={224}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a]">
                      <Package
                        size={64}
                        className="text-gray-400 group-hover:text-[#D4AF37] transition-colors duration-500"
                      />
                    </div>
                  )}

                  {/* Overlay with gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/60 transition-all duration-500" />

                  {/* Shimmer effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>

                  {/* Category badge */}
                  <div className="absolute top-4 left-4 bg-[#D4AF37]/90 text-black px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                    Premium
                  </div>
                </div>

                <div className="p-6 text-center relative">
                  <motion.h3
                    className="text-2xl font-bold mb-3 group-hover:text-[#D4AF37] transition-colors duration-500 font-primary"
                    whileHover={{ scale: 1.05 }}
                  >
                    {category.name}
                  </motion.h3>
                  <p className="text-gray-300 text-sm leading-relaxed group-hover:text-white transition-colors duration-500">
                    {category.description}
                  </p>

                  {/* Decorative line */}
                  <div className="mt-4 w-0 group-hover:w-16 h-0.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] mx-auto transition-all duration-500" />
                </div>

                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_20px_rgba(212,175,55,0.1)]" />
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Status indicator */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 right-4 bg-black/80 text-[#D4AF37] px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-[#D4AF37]/30"
          >
            Hover to explore
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CategorySlider
