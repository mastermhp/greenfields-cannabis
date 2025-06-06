import { NextResponse } from "next/server"
import { ProductOperations } from "@/lib/database-operations"
import { initializeDatabase } from "@/lib/database-operations"
import { AuthToken } from "@/lib/auth"

// Initialize database on first request
let initialized = false

async function ensureInitialized() {
  if (!initialized) {
    await initializeDatabase()
    initialized = true
  }
}

// Verify admin authentication using our custom AuthToken class
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

    console.log("Token found, verifying with custom AuthToken...")
    const decoded = await AuthToken.verify(token)
    console.log("Token decoded:", decoded ? { userId: decoded.userId, isAdmin: decoded.isAdmin } : "null")

    if (!decoded) {
      console.log("Token verification failed")
      return { error: "Invalid or expired authentication token", status: 401 }
    }

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
      product: product,
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

    console.log("Authentication successful, proceeding with product update")

    const body = await request.json()
    console.log("Updating product with data:", JSON.stringify(body, null, 2))

    // Validate required fields for new weight-based pricing structure
    const requiredFields = ["name", "description", "category"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 },
        )
      }
    }

    // Validate weight pricing or traditional pricing
    if (body.weightPricing && Array.isArray(body.weightPricing) && body.weightPricing.length > 0) {
      // Validate weight-based pricing
      for (let i = 0; i < body.weightPricing.length; i++) {
        const weightOption = body.weightPricing[i]

        if (
          !weightOption.weight ||
          isNaN(Number.parseFloat(weightOption.weight)) ||
          Number.parseFloat(weightOption.weight) <= 0
        ) {
          return NextResponse.json(
            {
              success: false,
              error: `Weight pricing option ${i + 1}: Weight must be a valid positive number`,
            },
            { status: 400 },
          )
        }

        if (
          !weightOption.price ||
          isNaN(Number.parseFloat(weightOption.price)) ||
          Number.parseFloat(weightOption.price) <= 0
        ) {
          return NextResponse.json(
            {
              success: false,
              error: `Weight pricing option ${i + 1}: Price must be a valid positive number`,
            },
            { status: 400 },
          )
        }

        if (!weightOption.unit) {
          return NextResponse.json(
            {
              success: false,
              error: `Weight pricing option ${i + 1}: Unit is required`,
            },
            { status: 400 },
          )
        }
      }
    } else if (body.price) {
      // Validate traditional pricing
      if (isNaN(Number.parseFloat(body.price)) || Number.parseFloat(body.price) <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Price must be a valid positive number",
          },
          { status: 400 },
        )
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Either weightPricing array or price field is required",
        },
        { status: 400 },
      )
    }

    // Validate stock
    if (body.stock !== undefined && (isNaN(Number.parseInt(body.stock)) || Number.parseInt(body.stock) < 0)) {
      return NextResponse.json(
        {
          success: false,
          error: "Stock must be a valid non-negative number",
        },
        { status: 400 },
      )
    }

    // Process product data for new structure
    const productData = {
      name: body.name.trim(),
      description: body.description.trim(),
      fullDescription: body.fullDescription?.trim() || body.description.trim(),
      category: body.category,
      thcContent: body.thcContent || 0,
      cbdContent: body.cbdContent || 0,
      origin: body.origin || "",
      effects: body.effects || [],
      inStock: body.inStock !== undefined ? body.inStock : true,
      featured: body.featured || false,
      images: body.images || ["/placeholder.svg?height=400&width=400"],
      cloudinaryIds: body.cloudinaryIds || [],
      tags: body.tags || [],
      strain: body.strain || "",
      genetics: body.genetics || "",
      updatedAt: new Date(),
    }

    // Handle weight-based pricing or traditional pricing
    if (body.weightPricing && Array.isArray(body.weightPricing) && body.weightPricing.length > 0) {
      // New weight-based pricing structure
      productData.weightPricing = body.weightPricing.map((option) => ({
        weight: Number.parseFloat(option.weight),
        unit: option.unit,
        price: Number.parseFloat(option.price),
        stock: option.stock || Number.parseInt(body.stock) || 0, // Use individual stock or fallback to general stock
      }))

      // Set base price from the first weight option or provided basePrice
      productData.basePrice = body.basePrice ? Number.parseFloat(body.basePrice) : productData.weightPricing[0].price

      // Calculate total stock from all weight options
      productData.stock = productData.weightPricing.reduce((total, option) => total + (option.stock || 0), 0)

      // Set inStock based on total stock
      productData.inStock = productData.stock > 0
    } else {
      // Traditional pricing structure (backward compatibility)
      productData.price = Number.parseFloat(body.price)
      productData.basePrice = productData.price
      productData.stock = Number.parseInt(body.stock) || 0
      productData.inStock = productData.stock > 0

      // Clear weight pricing if switching back to traditional pricing
      productData.weightPricing = []
    }

    // Handle discount percentage
    if (body.discountPercentage !== undefined) {
      const discount = Number.parseInt(body.discountPercentage)
      productData.discountPercentage = isNaN(discount) ? 0 : Math.max(0, Math.min(100, discount))
    }

    console.log("Processed product data:", JSON.stringify(productData, null, 2))

    const updatedProduct = await ProductOperations.updateProduct(id, productData)

    if (!updatedProduct) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update product - product not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
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

    console.log("Authentication successful, proceeding with product deletion")

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
