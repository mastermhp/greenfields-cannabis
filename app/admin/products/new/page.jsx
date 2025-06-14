"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Save,
  Loader2,
  ImageIcon,
  Package,
  DollarSign,
  Tag,
  FileText,
  Weight,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

const AddProduct = () => {
  const router = useRouter()
  const { toast } = useToast()
  const { accessToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [showCannabisDetails, setShowCannabisDetails] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    fullDescription: "",
    category: "",
    weightPricing: [{ weight: "", unit: "g", price: "", stock: "" }],
    discountPercentage: "",
    thcContent: "",
    cbdContent: "",
    effects: [
      { name: "Relaxation", level: 0 },
      { name: "Energy", level: 0 },
      { name: "Creativity", level: 0 },
      { name: "Focus", level: 0 },
    ],
    inStock: true,
    featured: false,
    images: [],
    tags: [],
    specifications: [],
  })

  const [newTag, setNewTag] = useState("")
  const [newSpec, setNewSpec] = useState({ key: "", value: "" })

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        // Fallback categories
        setCategories([
          { _id: "flower", name: "Flower" },
          { _id: "pre-rolls", name: "Pre-Rolls" },
          { _id: "edibles", name: "Edibles" },
          { _id: "concentrates", name: "Concentrates" },
          { _id: "accessories", name: "Accessories" },
        ])
      }
    }

    fetchCategories()
  }, [])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleEffectChange = (index, level) => {
    const newEffects = [...formData.effects]
    newEffects[index].level = level / 100
    setFormData((prev) => ({
      ...prev,
      effects: newEffects,
    }))
  }

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return

    setUploadingImages(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("folder", "products")

        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Failed to upload image")
        }

        const data = await response.json()
        return {
          id: Date.now() + Math.random(),
          url: data.url,
          public_id: data.public_id,
        }
      })

      const uploadedImages = await Promise.all(uploadPromises)
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
      }))

      toast({
        title: "Images Uploaded",
        description: `${uploadedImages.length} image(s) uploaded successfully`,
      })
    } catch (error) {
      console.error("Error uploading images:", error)
      toast({
        title: "Upload Error",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (index) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }))
  }

  const addSpecification = () => {
    if (newSpec.key.trim() && newSpec.value.trim()) {
      setFormData((prev) => ({
        ...prev,
        specifications: [...prev.specifications, { ...newSpec }],
      }))
      setNewSpec({ key: "", value: "" })
    }
  }

  const removeSpecification = (index) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }))
  }

  const addWeightPricing = () => {
    setFormData((prev) => ({
      ...prev,
      weightPricing: [...prev.weightPricing, { weight: "", unit: "g", price: "", stock: "" }],
    }))
  }

  const updateWeightPricing = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      weightPricing: prev.weightPricing.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  const removeWeightPricing = (index) => {
    if (formData.weightPricing.length > 1) {
      setFormData((prev) => ({
        ...prev,
        weightPricing: prev.weightPricing.filter((_, i) => i !== index),
      }))
    } else {
      toast({
        title: "Error",
        description: "At least one weight option is required",
        variant: "destructive",
      })
    }
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive",
      })
      return false
    }

    if (!formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Product description is required",
        variant: "destructive",
      })
      return false
    }

    if (!formData.category) {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive",
      })
      return false
    }

    if (formData.weightPricing.some((item) => !item.weight || !item.price || !item.stock)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all weight, price, and stock fields",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        fullDescription: formData.fullDescription.trim(),
        category: formData.category,
        weightPricing: formData.weightPricing.map((item) => ({
          weight: Number.parseFloat(item.weight),
          unit: item.unit,
          price: Number.parseFloat(item.price),
          stock: Number.parseInt(item.stock),
        })),
        basePrice: formData.weightPricing[0]?.price || "0",
        discountPercentage: formData.discountPercentage ? Number.parseInt(formData.discountPercentage) : 0,
        thcContent: formData.thcContent ? Number.parseFloat(formData.thcContent) / 100 : 0,
        cbdContent: formData.cbdContent ? Number.parseFloat(formData.cbdContent) / 100 : 0,
        effects: formData.effects,
        inStock: formData.inStock,
        featured: formData.featured,
        images:
          formData.images.length > 0
            ? formData.images.map((img) => img.url)
            : ["/placeholder.svg?height=400&width=400"],
        cloudinaryIds: formData.images.length > 0 ? formData.images.map((img) => img.public_id).filter((id) => id) : [],
        tags: formData.tags,
        specifications: formData.specifications,
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(productData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Product Added",
          description: "Product has been created successfully",
        })
        router.push("/admin/products")
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create product",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating product:", error)
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="border-[#333] hover:bg-[#222]">
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold gold-text">Add New Product</h1>
          <p className="text-beige mt-2">Create a new product for your store</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Product Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="bg-[#111] border-[#333]">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Package size={20} className="mr-2 text-[#D4AF37]" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-beige">Product Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter product name"
                    className="bg-black border-[#333] focus:border-[#D4AF37] text-white"
                    required
                  />
                </div>

                <div>
                  <Label className="text-beige">Short Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Brief product description"
                    className="bg-black border-[#333] focus:border-[#D4AF37] text-white"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label className="text-beige">Full Description</Label>
                  <Textarea
                    value={formData.fullDescription}
                    onChange={(e) => handleInputChange("fullDescription", e.target.value)}
                    placeholder="Detailed product description"
                    className="bg-black border-[#333] focus:border-[#D4AF37] text-white"
                    rows={5}
                  />
                </div>

                <div>
                  <Label className="text-beige">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger className="bg-black border-[#333] focus:border-[#D4AF37] text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#222] border-[#333]">
                      {categories.map((category) => (
                        <SelectItem
                          key={category._id || category.id}
                          value={category._id || category.id}
                          className="text-white hover:bg-[#333]"
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Weight-Based Pricing & Stock */}
            <Card className="bg-[#111] border-[#333]">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <DollarSign size={20} className="mr-2 text-green-500" />
                  Weight-Based Pricing & Stock
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-beige mb-2 flex justify-between items-center">
                    <span>Weight Options with Individual Stock *</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-[#333] h-8"
                      onClick={addWeightPricing}
                    >
                      <Plus size={14} className="mr-1" /> Add Weight Option
                    </Button>
                  </Label>

                  {formData.weightPricing.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 mb-3 p-3 bg-black border border-[#333] rounded">
                      <div className="col-span-2">
                        <Label className="text-xs text-beige">Weight</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Weight"
                          value={item.weight}
                          onChange={(e) => updateWeightPricing(index, "weight", e.target.value)}
                          className="bg-[#111] border-[#333] focus:border-[#D4AF37] text-sm"
                        />
                      </div>

                      <div className="col-span-2">
                        <Label className="text-xs text-beige">Unit</Label>
                        <Select value={item.unit} onValueChange={(value) => updateWeightPricing(index, "unit", value)}>
                          <SelectTrigger className="bg-[#111] border-[#333] text-white text-sm h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#222] border-[#333]">
                            <SelectItem value="g" className="text-white">
                              g
                            </SelectItem>
                            <SelectItem value="oz" className="text-white">
                              oz
                            </SelectItem>
                            <SelectItem value="mg" className="text-white">
                              mg
                            </SelectItem>
                            <SelectItem value="kg" className="text-white">
                              kg
                            </SelectItem>
                            <SelectItem value="lb" className="text-white">
                              lb
                            </SelectItem>
                            <SelectItem value="pcs" className="text-white">
                              pcs
                            </SelectItem>
                            <SelectItem value="items" className="text-white">
                              items
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-3">
                        <Label className="text-xs text-beige">Price ($)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Price"
                            value={item.price}
                            onChange={(e) => updateWeightPricing(index, "price", e.target.value)}
                            className="bg-[#111] border-[#333] focus:border-[#D4AF37] pl-7 text-sm"
                          />
                        </div>
                      </div>

                      <div className="col-span-3">
                        <Label className="text-xs text-beige">Stock Qty</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Stock"
                          value={item.stock}
                          onChange={(e) => updateWeightPricing(index, "stock", e.target.value)}
                          className="bg-[#111] border-[#333] focus:border-[#D4AF37] text-sm"
                        />
                      </div>

                      <div className="col-span-2">
                        <Label className="text-xs text-beige opacity-0">Remove</Label>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="w-full h-10"
                          onClick={() => removeWeightPricing(index)}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <Label htmlFor="discountPercentage" className="text-beige">
                    Discount Percentage (%)
                  </Label>
                  <Input
                    id="discountPercentage"
                    name="discountPercentage"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={formData.discountPercentage}
                    onChange={(e) => handleInputChange("discountPercentage", e.target.value)}
                    placeholder="0"
                    className="bg-black border-[#333] focus:border-[#D4AF37] mt-1"
                  />
                  <p className="text-xs text-gray-400 mt-1">Enter percentage value (e.g. 10 for 10% off)</p>
                </div>

                {/* Total Stock Display */}
                <div className="bg-[#222] p-3 rounded border border-[#333]">
                  <Label className="text-beige text-sm">Total Stock Summary</Label>
                  <div className="mt-2 space-y-1">
                    {formData.weightPricing.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-300">
                          {item.weight}
                          {item.unit}:
                        </span>
                        <span className="text-[#D4AF37]">{item.stock || 0} units</span>
                      </div>
                    ))}
                    <div className="border-t border-[#333] pt-1 mt-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-white">Total Stock:</span>
                        <span className="text-[#D4AF37]">
                          {formData.weightPricing.reduce(
                            (total, item) => total + (Number.parseInt(item.stock) || 0),
                            0,
                          )}{" "}
                          units
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cannabis Details */}
            <Card className="bg-[#111] border-[#333]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-white">
                    <Weight size={20} className="mr-2 text-green-500" />
                    Cannabis Details
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCannabisDetails(!showCannabisDetails)}
                    className="border-[#333] hover:bg-[#222]"
                  >
                    {showCannabisDetails ? (
                      <>
                        <EyeOff size={16} className="mr-2" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye size={16} className="mr-2" />
                        Show
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              {showCannabisDetails && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="thcContent" className="text-beige">
                        THC Content (%)
                      </Label>
                      <Input
                        id="thcContent"
                        name="thcContent"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.thcContent}
                        onChange={(e) => handleInputChange("thcContent", e.target.value)}
                        placeholder="0.0"
                        className="bg-black border-[#333] focus:border-[#D4AF37] mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cbdContent" className="text-beige">
                        CBD Content (%)
                      </Label>
                      <Input
                        id="cbdContent"
                        name="cbdContent"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.cbdContent}
                        onChange={(e) => handleInputChange("cbdContent", e.target.value)}
                        placeholder="0.0"
                        className="bg-black border-[#333] focus:border-[#D4AF37] mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-beige mb-4 block">Effects</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.effects.map((effect, index) => (
                        <div key={effect.name} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-white">{effect.name}</span>
                            <span className="text-[#D4AF37]">{Math.round(effect.level * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={effect.level * 100}
                            onChange={(e) => handleEffectChange(index, Number.parseInt(e.target.value))}
                            className="w-full h-2 bg-[#333] rounded-lg appearance-none cursor-pointer slider"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Images */}
            <Card className="bg-[#111] border-[#333]">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <ImageIcon size={20} className="mr-2 text-blue-500" />
                  Product Images
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-[#333] rounded-lg p-6 text-center">
                  <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-beige mb-4">Upload product images</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                    id="image-upload"
                    disabled={uploadingImages}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-[#333]"
                    onClick={() => document.getElementById("image-upload").click()}
                    disabled={uploadingImages}
                  >
                    {uploadingImages ? (
                      <span className="flex items-center">
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Uploading...
                      </span>
                    ) : (
                      "Choose Files"
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  <strong>Note:</strong> For best results, upload square images (1:1 ratio) with dimensions of at least
                  800x800 pixels. Maximum file size: 5MB per image. Supported formats: JPG, PNG, WebP.
                </p>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {formData.images.map((image, index) => (
                      <div key={image.id || index} className="relative">
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt="Product"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 w-6 h-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="bg-[#111] border-[#333]">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Tag size={20} className="mr-2 text-purple-500" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    className="bg-black border-[#333] focus:border-[#D4AF37] text-white"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" onClick={addTag} className="border-[#333] hover:bg-[#222]">
                    <Plus size={16} />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="bg-[#222] px-3 py-1 rounded-full flex items-center gap-2">
                      <span className="text-white text-sm">{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card className="bg-[#111] border-[#333]">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <FileText size={20} className="mr-2 text-orange-500" />
                  Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    value={newSpec.key}
                    onChange={(e) => setNewSpec((prev) => ({ ...prev, key: e.target.value }))}
                    placeholder="Specification name"
                    className="bg-black border-[#333] focus:border-[#D4AF37] text-white"
                  />
                  <div className="flex gap-2">
                    <Input
                      value={newSpec.value}
                      onChange={(e) => setNewSpec((prev) => ({ ...prev, value: e.target.value }))}
                      placeholder="Specification value"
                      className="bg-black border-[#333] focus:border-[#D4AF37] text-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addSpecification}
                      className="border-[#333] hover:bg-[#222]"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {formData.specifications.map((spec, index) => (
                    <div key={index} className="bg-[#222] p-3 rounded flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{spec.key}</p>
                        <p className="text-beige text-sm">{spec.value}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Product Settings */}
            <Card className="bg-[#111] border-[#333]">
              <CardHeader>
                <CardTitle className="text-white">Product Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-beige">In Stock</Label>
                  <Switch
                    checked={formData.inStock}
                    onCheckedChange={(checked) => handleInputChange("inStock", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-beige">Featured Product</Label>
                  <Switch
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleInputChange("featured", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-semibold py-3"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Adding Product...
                </>
              ) : (
                <>
                  <Save size={20} className="mr-2" />
                  Add Product
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AddProduct
