import { NextResponse } from "next/server"
import { connectToDatabase, collections } from "@/lib/mongodb"
import { verifyAuth } from "@/lib/auth"

export async function GET(request) {
  try {
    // Connect to the database
    const { db } = await connectToDatabase()

    // Fetch all categories
    const categories = await db.collection(collections.categories).find({}).toArray()

    // Transform to the format expected by the frontend
    const formattedCategories = categories.map((category) => ({
      value: category.slug || category._id.toString(),
      label: category.name,
    }))

    return NextResponse.json({
      success: true,
      categories: formattedCategories,
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
      },
      { status: 500 },
    )
  }
}

export async function POST(request) {
  try {
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

    // Insert new category
    const result = await db.collection(collections.categories).insertOne({
      name: data.name,
      slug,
      description: data.description || "",
      image: data.image || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      categoryId: result.insertedId,
      message: "Category created successfully",
    })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create category",
      },
      { status: 500 },
    )
  }
}
