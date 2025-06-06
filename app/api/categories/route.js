import { NextResponse } from "next/server"
import { connectToDatabase, collections } from "@/lib/mongodb"
import { verifyAuth } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request) {
  try {
    console.log("Categories API: Fetching categories from database...")

    // Connect to the database
    const { db } = await connectToDatabase()

    // Fetch all categories
    const categories = await db.collection(collections.categories).find({}).toArray()
    console.log("Categories API: Raw categories from DB:", categories)

    // Transform categories to ensure consistent format
    const formattedCategories = categories.map((category) => {
      const categoryData = {
        id: category.id || category._id.toString(),
        _id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        image: category.image || "/placeholder.svg?height=200&width=200",
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      }
      console.log("Categories API: Formatted category:", categoryData)
      return categoryData
    })

    console.log("Categories API: Final formatted categories:", formattedCategories)

    // Return both formats for compatibility
    const response = {
      success: true,
      data: formattedCategories, // For the categories management page
      categories: formattedCategories.map((cat) => ({
        // For the product forms
        id: cat.id,
        value: cat.slug || cat.id,
        label: cat.name,
        name: cat.name,
      })),
    }

    console.log("Categories API: Final response:", response)
    return NextResponse.json(response)
  } catch (error) {
    console.error("Categories API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
        data: [],
        categories: [],
      },
      { status: 500 },
    )
  }
}

export async function POST(request) {
  try {
    console.log("Categories API: Creating new category...")

    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.isAuthenticated || !authResult.user.isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      )
    }

    // Get request body
    const data = await request.json()
    console.log("Categories API: Received data:", data)

    if (!data.name) {
      return NextResponse.json(
        {
          success: false,
          error: "Category name is required",
        },
        { status: 400 },
      )
    }

    // Connect to the database
    const { db } = await connectToDatabase()

    // Create slug from name
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    console.log("Categories API: Generated slug:", slug)

    // Check if category with this slug already exists
    const existingCategory = await db.collection(collections.categories).findOne({ slug })
    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "A category with this name already exists",
        },
        { status: 400 },
      )
    }

    // Create category with proper ID
    const categoryId = new ObjectId().toString()
    const newCategory = {
      id: categoryId,
      name: data.name,
      slug,
      description: data.description || "",
      image: data.image || "/placeholder.svg?height=200&width=200",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log("Categories API: Creating category:", newCategory)

    // Insert new category
    const result = await db.collection(collections.categories).insertOne(newCategory)
    console.log("Categories API: Insert result:", result)

    return NextResponse.json({
      success: true,
      data: { ...newCategory, _id: result.insertedId },
      categoryId: result.insertedId,
      message: "Category created successfully",
    })
  } catch (error) {
    console.error("Categories API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create category",
      },
      { status: 500 },
    )
  }
}
