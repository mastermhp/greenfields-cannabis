"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const ProductFilters = ({ categories, selectedCategory, setSelectedCategory, priceRange, setPriceRange }) => {
  const [localPriceRange, setLocalPriceRange] = useState(priceRange)
  const [effects, setEffects] = useState({
    relaxation: false,
    energy: false,
    creativity: false,
    focus: false,
    sleep: false,
  })
  const [potency, setPotency] = useState({
    low: false,
    medium: false,
    high: false,
  })

  // Update local price range when prop changes
  useEffect(() => {
    setLocalPriceRange(priceRange)
  }, [priceRange])

  // Handle price range change
  const handlePriceChange = (value) => {
    setLocalPriceRange(value)
  }

  // Apply price range when slider interaction ends
  const handlePriceChangeEnd = () => {
    setPriceRange(localPriceRange)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-[#111] p-6 border border-[#333] mb-8">
      {/* Categories */}
      <div>
        <h3 className="text-lg font-medium mb-4">Categories</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <Checkbox
              id="category-all"
              checked={selectedCategory === "all"}
              onCheckedChange={() => setSelectedCategory("all")}
              className="border-[#333] data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
            />
            <Label htmlFor="category-all" className="ml-2 text-beige cursor-pointer">
              All Products
            </Label>
          </div>

          {categories.map((category) => (
            <div key={category.id} className="flex items-center">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategory === category.id}
                onCheckedChange={() => setSelectedCategory(category.id)}
                className="border-[#333] data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
              />
              <Label htmlFor={`category-${category.id}`} className="ml-2 text-beige cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-lg font-medium mb-4">Price Range</h3>
        <div className="px-2">
          <Slider
            value={localPriceRange}
            min={0}
            max={200}
            step={1}
            onValueChange={handlePriceChange}
            onValueCommit={handlePriceChangeEnd}
            className="mb-6"
          />

          <div className="flex items-center justify-between">
            <span className="text-beige">${localPriceRange[0]}</span>
            <span className="text-beige">${localPriceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Effects & Potency */}
      <div className="space-y-6">
        {/* Effects */}
        <div>
          <h3 className="text-lg font-medium mb-4">Effects</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(effects).map(([key, value]) => (
              <div key={key} className="flex items-center">
                <Checkbox
                  id={`effect-${key}`}
                  checked={value}
                  onCheckedChange={(checked) => setEffects((prev) => ({ ...prev, [key]: checked }))}
                  className="border-[#333] data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
                />
                <Label htmlFor={`effect-${key}`} className="ml-2 text-beige capitalize cursor-pointer">
                  {key}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Potency */}
        <div>
          <h3 className="text-lg font-medium mb-4">THC Potency</h3>
          <div className="space-y-3">
            {Object.entries(potency).map(([key, value]) => (
              <div key={key} className="flex items-center">
                <Checkbox
                  id={`potency-${key}`}
                  checked={value}
                  onCheckedChange={(checked) => setPotency((prev) => ({ ...prev, [key]: checked }))}
                  className="border-[#333] data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
                />
                <Label htmlFor={`potency-${key}`} className="ml-2 text-beige capitalize cursor-pointer">
                  {key} {key === "low" ? "(0-15%)" : key === "medium" ? "(15-25%)" : "(25%+)"}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductFilters
