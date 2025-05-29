"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, X } from "lucide-react"
import { useCategories } from "@/hooks/use-products"

const ProductFilters = ({ onFilterChange }) => {
  const { categories, loading: categoriesLoading } = useCategories()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [localPriceRange, setLocalPriceRange] = useState([0, 200])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEffects, setSelectedEffects] = useState([])
  const [selectedPotency, setSelectedPotency] = useState([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const effects = [
    { id: "relaxation", name: "Relaxation" },
    { id: "energy", name: "Energy" },
    { id: "creativity", name: "Creativity" },
    { id: "focus", name: "Focus" },
    { id: "sleep", name: "Sleep" },
    { id: "euphoria", name: "Euphoria" },
  ]

  const potencyLevels = [
    { id: "low", name: "Low (0-15%)", range: [0, 15] },
    { id: "medium", name: "Medium (15-25%)", range: [15, 25] },
    { id: "high", name: "High (25%+)", range: [25, 100] },
  ]

  // Apply filters when any filter changes
  useEffect(() => {
    const filters = {
      category: selectedCategory === "all" ? "" : selectedCategory,
      search: searchTerm,
      minPrice: localPriceRange[0],
      maxPrice: localPriceRange[1],
      effects: selectedEffects,
      potency: selectedPotency,
    }
    onFilterChange(filters)
  }, [selectedCategory, searchTerm, localPriceRange, selectedEffects, selectedPotency, onFilterChange])

  const handleEffectChange = (effectId, checked) => {
    if (checked) {
      setSelectedEffects((prev) => [...prev, effectId])
    } else {
      setSelectedEffects((prev) => prev.filter((id) => id !== effectId))
    }
  }

  const handlePotencyChange = (potencyId, checked) => {
    if (checked) {
      setSelectedPotency((prev) => [...prev, potencyId])
    } else {
      setSelectedPotency((prev) => prev.filter((id) => id !== potencyId))
    }
  }

  const clearAllFilters = () => {
    setSelectedCategory("all")
    setLocalPriceRange([0, 200])
    setSearchTerm("")
    setSelectedEffects([])
    setSelectedPotency([])
  }

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (searchTerm ? 1 : 0) +
    (localPriceRange[0] > 0 || localPriceRange[1] < 200 ? 1 : 0) +
    selectedEffects.length +
    selectedPotency.length

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-6">
        <Button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          variant="outline"
          className="w-full bg-[#111] border-[#333] text-white hover:bg-[#222]"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </Button>
      </div>

      {/* Filter Panel */}
      <div
        className={`${isFilterOpen ? "block" : "hidden"} lg:block bg-[#111] border border-[#333] rounded-lg p-6 space-y-8`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Filters</h3>
          {activeFiltersCount > 0 && (
            <Button
              onClick={clearAllFilters}
              variant="ghost"
              size="sm"
              className="text-[#D4AF37] hover:text-white hover:bg-[#222]"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="space-y-3">
          <Label className="text-white font-medium">Search Products</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#222] border-[#333] text-white placeholder-gray-400 focus:border-[#D4AF37]"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <Label className="text-white font-medium">Categories</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="category-all"
                checked={selectedCategory === "all"}
                onCheckedChange={() => setSelectedCategory("all")}
                className="border-[#333] data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
              />
              <Label htmlFor="category-all" className="text-gray-300 cursor-pointer hover:text-white">
                All Products
              </Label>
            </div>

            {categoriesLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-6 bg-[#333] rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              categories?.map((category) => (
                <div key={category._id || category.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`category-${category._id || category.id}`}
                    checked={selectedCategory === (category._id || category.id)}
                    onCheckedChange={() => setSelectedCategory(category._id || category.id)}
                    className="border-[#333] data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
                  />
                  <Label
                    htmlFor={`category-${category._id || category.id}`}
                    className="text-gray-300 cursor-pointer hover:text-white"
                  >
                    {category.name}
                  </Label>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-4">
          <Label className="text-white font-medium">Price Range</Label>
          <div className="px-2">
            <div className="flex items-center justify-between mb-4">
              <div className="w-[45%]">
                <Label htmlFor="min-price" className="text-xs text-gray-400 mb-1 block">
                  Min
                </Label>
                <Input
                  id="min-price"
                  type="number"
                  min={0}
                  max={localPriceRange[1]}
                  value={localPriceRange[0]}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value) || 0
                    setLocalPriceRange([Math.min(value, localPriceRange[1]), localPriceRange[1]])
                  }}
                  className="bg-[#222] border-[#333] text-white h-9"
                />
              </div>
              <div className="text-gray-500">-</div>
              <div className="w-[45%]">
                <Label htmlFor="max-price" className="text-xs text-gray-400 mb-1 block">
                  Max
                </Label>
                <Input
                  id="max-price"
                  type="number"
                  min={localPriceRange[0]}
                  max={200}
                  value={localPriceRange[1]}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value) || 0
                    setLocalPriceRange([localPriceRange[0], Math.max(value, localPriceRange[0])])
                  }}
                  className="bg-[#222] border-[#333] text-white h-9"
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">${localPriceRange[0]}</span>
              <span className="text-gray-300">${localPriceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Effects */}
        <div className="space-y-4">
          <Label className="text-white font-medium">Effects</Label>
          <div className="grid grid-cols-2 gap-3">
            {effects.map((effect) => (
              <div key={effect.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`effect-${effect.id}`}
                  checked={selectedEffects.includes(effect.id)}
                  onCheckedChange={(checked) => handleEffectChange(effect.id, checked)}
                  className="border-[#333] data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
                />
                <Label
                  htmlFor={`effect-${effect.id}`}
                  className="text-gray-300 cursor-pointer hover:text-white text-sm"
                >
                  {effect.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* THC Potency */}
        <div className="space-y-4">
          <Label className="text-white font-medium">THC Potency</Label>
          <div className="space-y-3">
            {potencyLevels.map((level) => (
              <div key={level.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`potency-${level.id}`}
                  checked={selectedPotency.includes(level.id)}
                  onCheckedChange={(checked) => handlePotencyChange(level.id, checked)}
                  className="border-[#333] data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
                />
                <Label htmlFor={`potency-${level.id}`} className="text-gray-300 cursor-pointer hover:text-white">
                  {level.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <div className="pt-4 border-t border-[#333]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                {activeFiltersCount} filter{activeFiltersCount !== 1 ? "s" : ""} active
              </span>
              <Button
                onClick={() => setIsFilterOpen(false)}
                variant="ghost"
                size="sm"
                className="lg:hidden text-[#D4AF37] hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ProductFilters
