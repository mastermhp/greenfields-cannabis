import { NextResponse } from "next/server"
import { ProductOperations } from "@/lib/database-operations"
import { initializeDatabase } from "@/lib/database-operations"
import jwt from "jsonwebtoken"

// Initialize database on first request
let initialized = false

async function ensureInitialized() {
  if (!initialized) {
    await initializeDatabase()
    initialized = true
  }
}

// Verify admin authentication
async function verifyAdmin(request) {
  try {
    // Get token from cookies or authorization header
    const token =
      request.cookies.get("accessToken")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.headers.get("Authorization")?.replace("Bearer ", "")

    console.log("Auth token found:", !!token)

    if (!token) {
      console.log("No authentication token provided")
      return { error: "No authentication token provided", status: 401 }
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log("Token decoded:", { userId: decoded.userId, isAdmin: decoded.isAdmin })

    if (!decoded.isAdmin) {
      console.log("User is not admin")
      return { error: "Admin access required", status: 403 }
    }

    return { user: decoded }
  } catch (error) {
    console.log("Token verification failed:", error.message)
    return { error: "Invalid authentication token", status: 401 }
  }
}

export async function GET(request, { params }) {
  try {
    await ensureInitialized()

    // Await params in Next.js 15
    const { id } = await params
    console.log("GET /api/products/[id] - Fetching product with ID:", id)

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 })
    }

    const product = await ProductOperations.getProductById(id)

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    await ensureInitialized()

    // Await params in Next.js 15
    const { id } = await params
    console.log("PUT /api/products/[id] - Updating product with ID:", id)

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 })
    }

    // Verify admin authentication
    const authResult = await verifyAdmin(request)
    if (authResult.error) {
      console.log("Authentication failed:", authResult.error)
      return NextResponse.json(
        {
          success: false,
          error: authResult.error,
        },
        { status: authResult.status },
      )
    }

    const body = await request.json()
    console.log("Updating product with data:", JSON.stringify(body, null, 2))

    // Validate required fields
    const requiredFields = ["name", "description", "category", "price", "stock"]
    for (const field of requiredFields) {
      if (!body[field] && body[field] !== 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 },
        )
      }
    }

    // Validate numeric fields
    if (isNaN(Number.parseFloat(body.price)) || Number.parseFloat(body.price) <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Price must be a valid positive number",
        },
        { status: 400 },
      )
    }

    if (isNaN(Number.parseInt(body.stock)) || Number.parseInt(body.stock) < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Stock must be a valid non-negative number",
        },
        { status: 400 },
      )
    }

    // Process product data
    const productData = {
      name: body.name.trim(),
      description: body.description.trim(),
      fullDescription: body.fullDescription?.trim() || body.description.trim(),
      category: body.category,
      price: Number.parseFloat(body.price),
      oldPrice: body.oldPrice ? Number.parseFloat(body.oldPrice) : null,
      stock: Number.parseInt(body.stock),
      thcContent: body.thcContent ? Number.parseFloat(body.thcContent) / 100 : 0,
      cbdContent: body.cbdContent ? Number.parseFloat(body.cbdContent) / 100 : 0,
      weight: body.weight ? Number.parseFloat(body.weight) : 0,
      origin: body.origin || "",
      effects: body.effects || [],
      inStock: Number.parseInt(body.stock) > 0,
      featured: body.featured || false,
      images: body.images || ["/placeholder.svg?height=400&width=400"],
      tags: body.tags || [],
      strain: body.strain || "",
      genetics: body.genetics || "",
      updatedAt: new Date(),
    }

    console.log("Processed product data:", JSON.stringify(productData, null, 2))

    const updatedProduct = await ProductOperations.updateProduct(id, productData)

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: "Product updated successfully",
    })
  } catch (error) {
    console.error("Update Product Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update product",
        message: error.message,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    await ensureInitialized()

    // Await params in Next.js 15
    const { id } = await params
    console.log("DELETE /api/products/[id] - Deleting product with ID:", id)

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 })
    }

    // Verify admin authentication
    const authResult = await verifyAdmin(request)
    if (authResult.error) {
      console.log("Authentication failed:", authResult.error)
      return NextResponse.json(
        {
          success: false,
          error: authResult.error,
        },
        { status: authResult.status },
      )
    }

    console.log("Admin authenticated, proceeding with deletion")

    // Check if product exists before attempting to delete
    const product = await ProductOperations.getProductById(id)
    if (!product) {
      console.log("Product not found:", id)
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    console.log("Product found, attempting deletion:", product.name)

    const deleted = await ProductOperations.deleteProduct(id)

    if (!deleted) {
      console.log("Failed to delete product:", id)
      return NextResponse.json({ success: false, error: "Failed to delete product" }, { status: 500 })
    }

    console.log("Product deleted successfully:", id)

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("Delete Product Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete product",
        message: error.message,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
