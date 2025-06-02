"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

const NewProduct = () => {
  const router = useRouter()
  const { toast } = useToast()
  const { accessToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [images, setImages] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    fullDescription: "",
    category: "",
    price: "",
    oldPrice: "",
    stock: "",
    thcContent: "",
    cbdContent: "",
    weight: "",
    origin: "",
    effects: [
      { name: "Relaxation", level: 0 },
      { name: "Energy", level: 0 },
      { name: "Creativity", level: 0 },
      { name: "Focus", level: 0 },
    ],
    inStock: true,
    featured: false,
  })

  const categories = [
    { value: "flower", label: "Flower" },
    { value: "pre-rolls", label: "Pre-Rolls" },
    { value: "edibles", label: "Edibles" },
    { value: "concentrates", label: "Concentrates" },
    { value: "accessories", label: "Accessories" },
    { value: "cansdales", label: "Cansdales" },
    { value: "apparel", label: "Apparel" },
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSwitchChange = (name, checked) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploadingImages(true)

    try {
      // Create an array of promises for each file upload
      const uploadPromises = files.map(async (file) => {
        // Create FormData for the file
        const formData = new FormData()
        formData.append("file", file)
        formData.append("folder", "products")

        // Upload to Cloudinary via our API
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to upload image")
        }

        const data = await response.json()
        return {
          id: Date.now() + Math.random(),
          url: data.url,
          public_id: data.public_id,
        }
      })

      // Wait for all uploads to complete
      const uploadedImages = await Promise.all(uploadPromises)

      // Add the new images to the state
      setImages((prev) => [...prev, ...uploadedImages])

      toast({
        title: "Images Uploaded",
        description: `Successfully uploaded ${uploadedImages.length} image(s)`,
      })
    } catch (error) {
      console.error("Image upload error:", error)
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = async (id) => {
    const imageToRemove = images.find((img) => img.id === id)

    if (imageToRemove && imageToRemove.public_id) {
      try {
        // Delete from Cloudinary via our API
        await fetch("/api/upload", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ public_id: imageToRemove.public_id }),
        })
      } catch (error) {
        console.error("Failed to delete image from Cloudinary:", error)
        // Continue anyway to remove from UI
      }
    }

    setImages(images.filter((img) => img.id !== id))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.category || !formData.price || !formData.stock) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Prepare product data
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        fullDescription: formData.fullDescription.trim(),
        category: formData.category,
        price: formData.price,
        oldPrice: formData.oldPrice || null,
        stock: formData.stock,
        thcContent: formData.thcContent || "0",
        cbdContent: formData.cbdContent || "0",
        weight: formData.weight || "0",
        origin: formData.origin || "",
        effects: formData.effects,
        inStock: formData.inStock,
        featured: formData.featured,
        images: images.length > 0 ? images.map((img) => img.url) : ["/placeholder.svg?height=400&width=400"],
        cloudinaryIds: images.length > 0 ? images.map((img) => img.public_id).filter((id) => id) : [],
      }

      console.log("Submitting product data:", productData)

      // Make API call to create product
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify(productData),
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", response.headers)

      // Check if response is ok and has content
      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error Response:", errorText)

        let errorMessage = "Failed to create product"
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch {
          errorMessage = `Server error (${response.status}): ${errorText}`
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Try to parse JSON response
      let result
      try {
        const responseText = await response.text()
        console.log("Raw response:", responseText)

        if (!responseText) {
          throw new Error("Empty response from server")
        }

        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError)
        toast({
          title: "Error",
          description: "Invalid response from server. Please try again.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      console.log("Parsed API Response:", result)

      if (result.success) {
        toast({
          title: "Product Created",
          description: "Your product has been successfully created.",
        })

        // Redirect to products page
        router.push("/admin/products")
      } else {
        toast({
          title: "Error",
          description: result.error || result.message || "Failed to create product. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Product creation error:", error)
      toast({
        title: "Error",
        description: `Failed to create product: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button asChild variant="outline" size="sm" className="border-[#333]">
          <Link href="/admin/products">
            <ArrowLeft size={16} className="mr-2" />
            Back to Products
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold gold-text">Add New Product</h1>
          <p className="text-beige mt-2">Create a new product for your store</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="bg-[#111] border-[#333]">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-beige">
                  Product Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  className="bg-black border-[#333] focus:border-[#D4AF37] mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-beige">
                  Short Description *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief product description"
                  className="bg-black border-[#333] focus:border-[#D4AF37] mt-1"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="fullDescription" className="text-beige">
                  Full Description
                </Label>
                <Textarea
                  id="fullDescription"
                  name="fullDescription"
                  value={formData.fullDescription}
                  onChange={handleInputChange}
                  placeholder="Detailed product description"
                  className="bg-black border-[#333] focus:border-[#D4AF37] mt-1"
                  rows={5}
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-beige">
                  Category *
                </Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-3 py-2 bg-black border border-[#333] rounded-md text-white focus:border-[#D4AF37]"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card className="bg-[#111] border-[#333]">
            <CardHeader>
              <CardTitle className="text-white">Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="text-beige">
                    Price ($) *
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="bg-black border-[#333] focus:border-[#D4AF37] mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="oldPrice" className="text-beige">
                    Old Price ($) - Optional
                  </Label>
                  <Input
                    id="oldPrice"
                    name="oldPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.oldPrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="bg-black border-[#333] focus:border-[#D4AF37] mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="stock" className="text-beige">
                    Stock Quantity *
                  </Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="bg-black border-[#333] focus:border-[#D4AF37] mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="weight" className="text-beige">
                    Weight (grams)
                  </Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="0.0"
                    className="bg-black border-[#333] focus:border-[#D4AF37] mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cannabis Details */}
          <Card className="bg-[#111] border-[#333]">
            <CardHeader>
              <CardTitle className="text-white">Cannabis Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    placeholder="0.0"
                    className="bg-black border-[#333] focus:border-[#D4AF37] mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="origin" className="text-beige">
                    Origin
                  </Label>
                  <Input
                    id="origin"
                    name="origin"
                    value={formData.origin}
                    onChange={handleInputChange}
                    placeholder="e.g., California, USA"
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
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Product Images */}
          <Card className="bg-[#111] border-[#333]">
            <CardHeader>
              <CardTitle className="text-white">Product Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-[#333] rounded-lg p-6 text-center">
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-beige mb-4">Upload product images</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
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
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Uploading...
                    </span>
                  ) : (
                    "Choose Files"
                  )}
                </Button>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {images.map((image) => (
                    <div key={image.id} className="relative">
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
                        onClick={() => removeImage(image.id)}
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Status */}
          <Card className="bg-[#111] border-[#333]">
            <CardHeader>
              <CardTitle className="text-white">Product Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="inStock" className="text-beige">
                  In Stock
                </Label>
                <Switch
                  id="inStock"
                  checked={formData.inStock}
                  onCheckedChange={(checked) => handleSwitchChange("inStock", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="featured" className="text-beige">
                  Featured Product
                </Label>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleSwitchChange("featured", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="bg-[#111] border-[#333]">
            <CardContent className="p-6">
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={loading || uploadingImages}
                  className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-black"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating Product...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Plus size={16} className="mr-2" />
                      Create Product
                    </span>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-[#333]"
                  onClick={() => router.push("/admin/products")}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}

export default NewProduct
