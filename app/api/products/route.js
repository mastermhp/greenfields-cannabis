import { NextResponse } from "next/server"
import { ProductOperations } from "@/lib/database-operations"
import { initializeDatabase } from "@/lib/database-operations"
import { AuthToken } from "@/lib/auth"
import { connectToDatabase, collections } from "@/lib/mongodb"

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

    // Use our custom AuthToken class with await
    const decoded = await AuthToken.verify(token)

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

    // Fetch all categories to map IDs to names
    const { db } = await connectToDatabase()
    const categories = await db.collection(collections.categories).find({}).toArray()

    // Add category names to products that don't already have them
    const productsWithCategoryNames = products.map((product) => {
      // If product already has categoryName, use it
      if (product.categoryName) {
        return product
      }

      // Otherwise, look up the category name
      if (product.category) {
        const category = categories.find(
          (cat) =>
            cat.id === product.category ||
            cat._id?.toString() === product.category ||
            cat._id === product.category ||
            cat.value === product.category ||
            cat.name?.toLowerCase() === product.category?.toLowerCase(),
        )
        if (category) {
          return {
            ...product,
            categoryName: category.name,
          }
        }
      }
      return {
        ...product,
        categoryName: product.category || "Uncategorized",
      }
    })

    console.log("API: Returning products:", productsWithCategoryNames.length)

    return NextResponse.json({
      success: true,
      products: productsWithCategoryNames,
      total: productsWithCategoryNames.length,
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

    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.description || !data.category) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // Validate weight pricing
    if (!data.weightPricing || !Array.isArray(data.weightPricing) || data.weightPricing.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one weight-price option is required",
        },
        { status: 400 },
      )
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Create product object with new structure
    const product = {
      name: data.name,
      description: data.description,
      fullDescription: data.fullDescription || "",
      category: data.category,
      categoryName: data.categoryName || data.category, // Store both ID and name
      weightPricing: data.weightPricing,
      basePrice: Number.parseFloat(data.weightPricing[0].price) || 0,
      discountPercentage: Number.parseInt(data.discountPercentage) || 0,
      thcContent: Number.parseFloat(data.thcContent) || 0,
      cbdContent: Number.parseFloat(data.cbdContent) || 0,
      origin: data.origin || "",
      effects: data.effects || [],
      inStock: data.inStock !== undefined ? data.inStock : true,
      featured: data.featured || false,
      images: data.images || [],
      cloudinaryIds: data.cloudinaryIds || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Calculate sale price if discount is applied
    if (product.discountPercentage > 0) {
      product.salePrice = product.basePrice * (1 - product.discountPercentage / 100)
    }

    console.log("Creating product with category:", product.category, "categoryName:", product.categoryName)

    // Insert product into database
    const result = await db.collection("products").insertOne(product)

    return NextResponse.json(
      {
        success: true,
        productId: result.insertedId,
        message: "Product created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating product:", error)
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
