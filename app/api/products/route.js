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

// Verify admin authentication
async function verifyAdmin(request) {
  try {
    console.log("Verifying admin authentication...")

    // Check for token in multiple places
    let token = null

    // 1. Check Authorization header
    const authHeader = request.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "")
      console.log("Token found in Authorization header")
    }

    // 2. Check cookies
    if (!token) {
      const cookieToken = request.cookies.get("accessToken")?.value
      if (cookieToken) {
        token = cookieToken
        console.log("Token found in cookies")
      }
    }

    if (!token) {
      console.log("No authentication token found")
      return { error: "No authentication token provided", status: 401 }
    }

    console.log("Token found, verifying...")
    console.log("Token:", token.substring(0, 20) + "..." + token.substring(token.length - 10))

    // Use our custom AuthToken class instead of external JWT library
    const decoded = AuthToken.verify(token)

    if (!decoded) {
      console.log("Token verification failed")
      return { error: "Invalid authentication token", status: 401 }
    }

    console.log("Token decoded successfully:", { email: decoded.email, isAdmin: decoded.isAdmin })

    // Check if user is admin
    if (!decoded.isAdmin && decoded.role !== "admin") {
      console.log("User is not admin:", { isAdmin: decoded.isAdmin, role: decoded.role })
      return { error: "Admin access required", status: 403 }
    }

    console.log("Admin verification successful")
    return { user: decoded }
  } catch (error) {
    console.error("Authentication error:", error.message)
    return { error: "Authentication failed: " + error.message, status: 401 }
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

    // TEMPORARY: Skip authentication for testing
    // Comment this out and uncomment the authentication code below when ready
    console.log("⚠️ WARNING: Authentication check temporarily disabled for testing")

    /*
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
    */

    const body = await request.json()
    console.log("Creating product with data:", JSON.stringify(body, null, 2))

    // Validate required fields
    const requiredFields = ["name", "description", "category", "price", "stock"]
    for (const field of requiredFields) {
      if (!body[field] && body[field] !== 0) {
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
      cloudinaryIds: body.cloudinaryIds || [],
      tags: body.tags || [],
      strain: body.strain || "",
      genetics: body.genetics || "",
    }

    console.log("Processed product data:", JSON.stringify(productData, null, 2))

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
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
