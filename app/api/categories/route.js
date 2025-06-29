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

    // Get the authorization header
    const authHeader = request.headers.get("authorization")
    console.log("Categories API: Auth header present:", !!authHeader)

    // Verify authentication
    const authResult = await verifyAuth(request)
    console.log("Categories API: Auth result:", {
      auth: !!authResult.auth,
      error: authResult.error,
      userId: authResult.auth?.id,
    })

    if (!authResult.auth || authResult.error) {
      console.log("Categories API: Authentication failed:", authResult.error)
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized - Please log in as an administrator",
        },
        { status: 401 },
      )
    }

    // Check if user is admin
    const user = authResult.auth
    console.log("Categories API: User role check:", {
      isAdmin: user.isAdmin,
      role: user.role,
      email: user.email,
    })

    if (!user.isAdmin && user.role !== "admin") {
      console.log("Categories API: User is not admin:", user)
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required",
        },
        { status: 403 },
      )
    }

    // Get request body
    const data = await request.json()
    console.log("Categories API: Received data:", { name: data.name, hasImage: !!data.image })

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

    console.log("Categories API: Creating category:", { name: newCategory.name, id: categoryId })

    // Insert new category
    const result = await db.collection(collections.categories).insertOne(newCategory)
    console.log("Categories API: Insert result:", { success: !!result.insertedId })

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
        error: "Failed to create category: " + error.message,
      },
      { status: 500 },
    )
  }
}
