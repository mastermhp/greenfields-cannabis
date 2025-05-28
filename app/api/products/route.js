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
    const token =
      request.cookies.get("accessToken")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return { error: "No authentication token provided", status: 401 }
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (!decoded.isAdmin) {
      return { error: "Admin access required", status: 403 }
    }

    return { user: decoded }
  } catch (error) {
    return { error: "Invalid authentication token", status: 401 }
  }
}

export async function GET(request) {
  try {
    await ensureInitialized()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")
    const limit = Number.parseInt(searchParams.get("limit")) || null

    console.log("API: Fetching products with params:", { category, search, featured, limit })

    const filters = {}

    if (category && category !== "all") {
      filters.category = category
    }

    if (search) {
      filters.search = search
    }

    let products

    if (featured === "true") {
      // Try to get featured products first
      products = await ProductOperations.getFeaturedProducts()
      console.log("API: Featured products found:", products.length)

      // If no featured products and we have a category filter, get products from that category
      if (products.length === 0 && category && category !== "all") {
        console.log("API: No featured products, getting category products")
        const allProducts = await ProductOperations.getAllProducts(filters)
        products = allProducts.slice(0, limit || 8)
      }

      // If still no products, get any products
      if (products.length === 0) {
        console.log("API: No featured or category products, getting any products")
        const allProducts = await ProductOperations.getAllProducts({})
        products = allProducts.slice(0, limit || 8)
      }
    } else {
      products = await ProductOperations.getAllProducts(filters)
    }

    // Apply limit if specified
    if (limit && products.length > limit) {
      products = products.slice(0, limit)
    }

    console.log("API: Returning products:", products.length)

    return NextResponse.json({
      success: true,
      products,
      total: products.length,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    console.log("POST /api/products - Starting product creation")

    await ensureInitialized()

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

    console.log("Authentication successful for user:", authResult.user.email)

    const body = await request.json()
    console.log("Creating product with data:", body)

    // Validate required fields
    const requiredFields = ["name", "description", "category", "price", "stock"]
    for (const field of requiredFields) {
      if (!body[field]) {
        console.log(`Missing required field: ${field}`)
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
      console.log("Invalid price:", body.price)
      return NextResponse.json(
        {
          success: false,
          error: "Price must be a valid positive number",
        },
        { status: 400 },
      )
    }

    if (isNaN(Number.parseInt(body.stock)) || Number.parseInt(body.stock) < 0) {
      console.log("Invalid stock:", body.stock)
      return NextResponse.json(
        {
          success: false,
          error: "Stock must be a valid non-negative number",
        },
        { status: 400 },
      )
    }

    // Create product
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
    }

    console.log("Processed product data:", productData)

    const product = await ProductOperations.createProduct(productData)

    console.log("Product created successfully:", product)

    return NextResponse.json(
      {
        success: true,
        data: product,
        message: "Product created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create Product Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create product",
        message: error.message,
        details: error.stack,
      },
      { status: 500 },
    )
  }
}
