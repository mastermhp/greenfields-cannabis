"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, Save, X, Package, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"

const CategoriesPage = () => {
  const { accessToken } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Categories Page: Loading categories...")

      const response = await fetch("/api/categories")
      console.log("Categories Page: Response status:", response.status)

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Categories Page: API Response:", data)

      if (data.success) {
        // Handle the data.data format from the API
        const categoriesData = data.data || []
        console.log("Categories Page: Categories data:", categoriesData)

        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData)
          console.log("Categories Page: Set categories:", categoriesData.length, "items")

          toast({
            title: "Categories Loaded",
            description: `Successfully loaded ${categoriesData.length} categories`,
          })
        } else {
          console.error("Categories Page: Categories data is not an array:", categoriesData)
          setCategories([])
          toast({
            title: "Warning",
            description: "Received invalid categories data format",
            variant: "destructive",
          })
        }
      } else {
        throw new Error(data.error || "Failed to load categories")
      }
    } catch (error) {
      console.error("Categories Page: Failed to load categories:", error)
      setError(error.message)
      setCategories([]) // Ensure categories is always an array
      toast({
        title: "Error Loading Categories",
        description: `Failed to load categories: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check file type
    if (!file.type.match(/image\/(jpeg|jpg|png|webp|gif)/i)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPEG, PNG, WEBP, GIF)",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)

    toast({
      title: "Image Selected",
      description: "Image ready for upload",
    })
  }

  const uploadImage = async () => {
    if (!imageFile) return null

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("file", imageFile)
      formData.append("folder", "categories")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to upload image")
      }

      toast({
        title: "Image Uploaded",
        description: "Image uploaded successfully",
      })

      return data.url
    } catch (error) {
      console.error("Image upload error:", error)
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      })
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("Categories Page: Submitting form...")

    try {
      // Check if user is authenticated
      if (!accessToken) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to manage categories. Please refresh the page and try again.",
          variant: "destructive",
        })
        return
      }

      // Validation
      if (!formData.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Category name is required",
          variant: "destructive",
        })
        return
      }

      // First upload image if there's a new one
      let imageUrl = formData.image

      if (imageFile) {
        console.log("Categories Page: Uploading image...")
        imageUrl = await uploadImage()
        if (!imageUrl) {
          toast({
            title: "Upload Error",
            description: "Failed to upload image. Please try again.",
            variant: "destructive",
          })
          return
        }
        console.log("Categories Page: Image uploaded:", imageUrl)
      }

      const url = editingId ? `/api/categories/${editingId}` : "/api/categories"
      const method = editingId ? "PUT" : "POST"

      const categoryData = {
        ...formData,
        image: imageUrl,
      }

      const headers = {
        "Content-Type": "application/json",
      }

      // Only add Authorization header if we have a valid token
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`
      }

      console.log("Categories Page: Making request with headers:", headers)
      console.log("Categories Page: Sending request:", { url, method, categoryData })

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(categoryData),
      })

      console.log("Categories Page: Response status:", response.status)
      const data = await response.json()
      console.log("Categories Page: Response data:", data)

      if (data.success) {
        toast({
          title: editingId ? "Category Updated" : "Category Created",
          description: editingId
            ? `Category "${formData.name}" updated successfully`
            : `Category "${formData.name}" created successfully`,
        })
        loadCategories()
        resetForm()
      } else {
        throw new Error(data.error || "Operation failed")
      }
    } catch (error) {
      console.error("Categories Page: Submit error:", error)
      toast({
        title: editingId ? "Update Failed" : "Creation Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
    })
    setImagePreview(category.image || "")
    setEditingId(category.id || category._id)
    setShowAddForm(true)

    toast({
      title: "Edit Mode",
      description: `Editing category "${category.name}"`,
    })
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    console.log("Categories Page: Deleting category:", id)

    try {
      // Check if user is authenticated
      if (!accessToken) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to delete categories.",
          variant: "destructive",
        })
        return
      }

      const headers = {}
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`
      }

      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers,
      })

      console.log("Categories Page: Delete response status:", response.status)
      const data = await response.json()
      console.log("Categories Page: Delete response data:", data)

      if (data.success) {
        toast({
          title: "Category Deleted",
          description: "Category deleted successfully",
        })
        loadCategories()
      } else {
        throw new Error(data.error || "Failed to delete category")
      }
    } catch (error) {
      console.error("Categories Page: Delete error:", error)
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({ name: "", description: "", image: "" })
    setImageFile(null)
    setImagePreview("")
    setEditingId(null)
    setShowAddForm(false)

    toast({
      title: "Form Reset",
      description: "Form has been reset",
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-[#333] rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-[#333] rounded w-64 mt-2 animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#111] border border-[#333] rounded-lg p-6 animate-pulse">
              <div className="h-32 bg-[#333] rounded mb-4"></div>
              <div className="h-6 bg-[#333] rounded mb-2"></div>
              <div className="h-4 bg-[#333] rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gold-text">Categories Management</h1>
          <p className="text-beige mt-2">Manage your product categories</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-2 hover:border-[#D4AF37] hover:cursor-pointer transition-all duration-500 hover:text-[#D4AF37] text-black"
        >
          <Plus size={16} className="mr-2" />
          Add Category
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-900 text-red-500 p-4 rounded-md mb-4">
          <h3 className="font-semibold mb-1">Error Loading Categories</h3>
          <p>{error}</p>
          <Button
            onClick={loadCategories}
            variant="outline"
            size="sm"
            className="mt-2 border-red-900 text-red-500 hover:bg-red-900/10"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="bg-[#111] border-[#333]">
            <CardHeader>
              <CardTitle className="text-white">{editingId ? "Edit Category" : "Add New Category"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-beige mb-2">Category Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter category name"
                      className="bg-black border-[#333] focus:border-[#D4AF37]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-beige mb-2">Category Image</label>
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center justify-center w-full h-10 px-4 py-2 bg-black border border-[#333] rounded-md cursor-pointer hover:border-[#D4AF37] transition-colors">
                          <Upload size={16} className="mr-2 text-beige" />
                          <span className="text-beige">Choose Image</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                      </div>

                      {imagePreview && (
                        <div className="relative mt-2 w-full h-44 bg-[#222] rounded-md overflow-hidden">
                          <Image
                            src={imagePreview || "/placeholder.svg"}
                            alt="Category preview"
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview("")
                              setImageFile(null)
                              if (editingId) {
                                setFormData((prev) => ({ ...prev, image: "" }))
                              }
                              toast({
                                title: "Image Removed",
                                description: "Image has been removed",
                              })
                            }}
                            className="absolute top-2 right-2 bg-black/70 p-1 rounded-full"
                          >
                            <X size={16} className="text-red-500" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-red-600">Image Size should be square shape like: 1024 x 1024</p>
                  </div>
                </div>
                <div>
                  <label className="block text-beige mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter category description"
                    className="bg-black border-[#333] focus:border-[#D4AF37]"
                    rows={3}
                  />
                </div>
                <div className="flex space-x-3">
                  <Button type="submit" className="bg-[#D4AF37] hover:bg-[#B8860B] text-black" disabled={uploading}>
                    {uploading ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        {editingId ? "Update" : "Create"} Category
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} className="border-[#333]">
                    <X size={16} className="mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(categories) && categories.length > 0 ? (
          categories.map((category, index) => (
            <motion.div
              key={category?.id || category?._id || `category-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-[#111] border-[#333] hover:border-[#D4AF37]/50 transition-colors">
                <CardContent className="p-6">
                  <div className="aspect-video bg-[#222] rounded-lg mb-4 overflow-hidden">
                    {category?.image ? (
                      <Image
                        src={category.image || "/placeholder.svg"}
                        alt={category.name || "Category"}
                        width={300}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={48} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{category?.name || "Unnamed Category"}</h3>
                  <p className="text-beige text-sm mb-4 line-clamp-2">{category?.description || "No description"}</p>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEdit(category)}
                      variant="outline"
                      size="sm"
                      className="border-[#333] flex-1 bg-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-2 hover:border-[#D4AF37] hover:cursor-pointer transition-all duration-500 hover:text-[#D4AF37]"
                    >
                      <Edit size={16} className="mr-2" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(category.id || category._id)}
                      variant="outline"
                      size="sm"
                      className="border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Categories Found</h3>
            <p className="text-beige mb-4">Get started by creating your first category.</p>
            <Button onClick={() => setShowAddForm(true)} className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
              <Plus size={16} className="mr-2" />
              Add Your First Category
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoriesPage
