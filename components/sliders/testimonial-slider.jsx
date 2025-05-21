"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react"
import { testimonials } from "@/lib/data"

const TestimonialSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1) // 1 for right, -1 for left

  // Auto-advance testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext()
    }, 6000)

    return () => clearInterval(interval)
  }, [currentIndex])

  const handlePrev = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
  }

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 200 : -200,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? -200 : 200,
      opacity: 0,
    }),
  }

  return (
    <div className="relative">
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10">
        <button
          onClick={handlePrev}
          className="bg-black/50 hover:bg-[#D4AF37] text-white hover:text-black w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          aria-label="Previous testimonial"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10">
        <button
          onClick={handleNext}
          className="bg-black/50 hover:bg-[#D4AF37] text-white hover:text-black w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          aria-label="Next testimonial"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="overflow-hidden relative h-[400px] md:h-[300px]">
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="bg-[#111] border border-[#333] p-8 max-w-3xl mx-auto relative">
              <Quote className="absolute top-4 left-4 text-[#D4AF37]/20" size={40} />

              <div className="flex flex-col md:flex-row items-center">
                <div className="mb-6 md:mb-0 md:mr-8">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#D4AF37] mx-auto">
                    <Image
                      src={testimonials[currentIndex].avatar || "/placeholder.svg"}
                      alt={testimonials[currentIndex].name}
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  </div>

                  <div className="text-center mt-4">
                    <div className="font-medium">{testimonials[currentIndex].name}</div>
                    <div className="text-sm text-beige">{testimonials[currentIndex].location}</div>
                    <div className="flex justify-center mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            i < testimonials[currentIndex].rating ? "text-[#D4AF37] fill-[#D4AF37]" : "text-gray-400"
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-beige italic relative z-10">"{testimonials[currentIndex].text}"</p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center mt-6 space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1)
              setCurrentIndex(index)
            }}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex ? "bg-[#D4AF37]" : "bg-[#333]"
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default TestimonialSlider
