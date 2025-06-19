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
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization")
    console.log("Auth header:", authHeader ? "present" : "missing")

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "").trim()
      console.log("Token found in Authorization header, length:", token.length)
    }

    // 2. Check cookies if no header token
    if (!token) {
      const cookieToken = request.cookies.get("accessToken")?.value
      if (cookieToken) {
        token = cookieToken
        console.log("Token found in cookies, length:", token.length)
      }
    }

    if (!token) {
      console.log("No authentication token found")
      return { error: "No authentication token provided", status: 401 }
    }

    // Validate token structure
    const tokenParts = token.split(".")
    if (tokenParts.length !== 3) {
      console.log("Invalid token structure, parts:", tokenParts.length)
      return { error: "Invalid token format", status: 401 }
    }

    console.log("Token found, verifying...")
    console.log("Token preview:", token.substring(0, 20) + "..." + token.substring(token.length - 10))

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
    console.log("Product data received:", {
      name: data.name,
      category: data.category,
      weightPricing: data.weightPricing,
      hasImages: !!data.images?.length,
    })

    // Validate required fields
    if (!data.name || !data.description || !data.category) {
      console.log("Missing required fields:", {
        name: !!data.name,
        description: !!data.description,
        category: !!data.category,
      })
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, description, and category are required",
        },
        { status: 400 },
      )
    }

    // Validate weight pricing
    if (!data.weightPricing || !Array.isArray(data.weightPricing) || data.weightPricing.length === 0) {
      console.log("Invalid weight pricing:", data.weightPricing)
      return NextResponse.json(
        {
          success: false,
          error: "At least one weight-price option is required",
        },
        { status: 400 },
      )
    }

    // Validate each weight pricing entry
    for (let i = 0; i < data.weightPricing.length; i++) {
      const item = data.weightPricing[i]
      console.log(`Validating weight pricing entry ${i}:`, item)

      // Check for required fields - allow 0 values but not null/undefined/empty strings
      if (
        item.weight === null ||
        item.weight === undefined ||
        item.weight === "" ||
        item.price === null ||
        item.price === undefined ||
        item.price === "" ||
        item.stock === null ||
        item.stock === undefined ||
        item.stock === ""
      ) {
        console.log(`Missing required fields in weight pricing at index ${i}:`, {
          weight: item.weight,
          price: item.price,
          stock: item.stock,
        })
        return NextResponse.json(
          {
            success: false,
            error: `Weight pricing entry ${i + 1} is missing required fields (weight, price, stock)`,
          },
          { status: 400 },
        )
      }

      // Validate numeric values
      const weight = Number.parseFloat(item.weight)
      const price = Number.parseFloat(item.price)
      const stock = Number.parseInt(item.stock)

      if (isNaN(weight) || weight <= 0) {
        console.log(`Invalid weight value at index ${i}:`, item.weight)
        return NextResponse.json(
          {
            success: false,
            error: `Weight pricing entry ${i + 1}: weight must be a positive number`,
          },
          { status: 400 },
        )
      }

      if (isNaN(price) || price <= 0) {
        console.log(`Invalid price value at index ${i}:`, item.price)
        return NextResponse.json(
          {
            success: false,
            error: `Weight pricing entry ${i + 1}: price must be a positive number`,
          },
          { status: 400 },
        )
      }

      if (isNaN(stock) || stock < 0) {
        console.log(`Invalid stock value at index ${i}:`, item.stock)
        return NextResponse.json(
          {
            success: false,
            error: `Weight pricing entry ${i + 1}: stock must be a non-negative number`,
          },
          { status: 400 },
        )
      }

      console.log(`Weight pricing entry ${i} validated successfully:`, {
        weight,
        price,
        stock,
      })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Get category name if not provided
    let categoryName = data.categoryName
    if (!categoryName && data.category) {
      try {
        const category = await db.collection(collections.categories).findOne({
          $or: [{ _id: data.category }, { id: data.category }, { value: data.category }],
        })
        if (category) {
          categoryName = category.name
        }
      } catch (error) {
        console.log("Could not fetch category name:", error.message)
      }
    }

    // Create product object with new structure
    const product = {
      name: data.name.trim(),
      description: data.description.trim(),
      fullDescription: data.fullDescription?.trim() || "",
      category: data.category,
      categoryName: categoryName || data.category,
      weightPricing: data.weightPricing.map((item) => ({
        weight: Number.parseFloat(item.weight),
        unit: item.unit || "g",
        price: Number.parseFloat(item.price),
        stock: Number.parseInt(item.stock),
      })),
      basePrice: Number.parseFloat(data.weightPricing[0].price) || 0,
      discountPercentage: data.discountPercentage ? Number.parseInt(data.discountPercentage) : 0,
      thcContent: data.thcContent ? Number.parseFloat(data.thcContent) / 100 : 0,
      cbdContent: data.cbdContent ? Number.parseFloat(data.cbdContent) / 100 : 0,
      effects: data.effects || [],
      inStock: data.inStock !== undefined ? data.inStock : true,
      featured: data.featured || false,
      images: data.images && data.images.length > 0 ? data.images : ["/placeholder.svg?height=400&width=400"],
      cloudinaryIds: data.cloudinaryIds || [],
      tags: data.tags || [],
      specifications: data.specifications || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Calculate sale price if discount is applied
    if (product.discountPercentage > 0) {
      product.salePrice = product.basePrice * (1 - product.discountPercentage / 100)
    }

    console.log("Creating product:", {
      name: product.name,
      category: product.category,
      categoryName: product.categoryName,
      weightPricingCount: product.weightPricing.length,
      basePrice: product.basePrice,
      imagesCount: product.images.length,
    })

    // Insert product into database
    const result = await db.collection("products").insertOne(product)

    console.log("Product created successfully with ID:", result.insertedId)

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
