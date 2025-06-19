import { NextResponse } from "next/server"
import { connectToDatabase, collections } from "@/lib/mongodb"
import { PasswordHash } from "@/lib/auth"

export async function POST() {
  try {
    console.log("=== DATABASE INITIALIZATION START ===")

    const { db } = await connectToDatabase()
    console.log("Connected to database successfully")

    // Check if admin user already exists
    const existingAdmin = await db.collection(collections.users).findOne({
      email: "admin@greenfields.com",
    })

    if (existingAdmin) {
      console.log("Admin user already exists")
      return NextResponse.json({
        success: true,
        message: "Database already initialized",
        adminExists: true,
      })
    }

    // Create admin user with hashed password
    console.log("Creating admin user...")
    const hashedPassword = await PasswordHash.hash("admin123")
    console.log("Password hashed successfully")

    const adminUser = {
      name: "Admin User",
      email: "admin@greenfields.com",
      password: hashedPassword,
      role: "admin",
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: true,
      preferences: {
        notifications: true,
        marketing: false,
      },
    }

    const result = await db.collection(collections.users).insertOne(adminUser)
    console.log("Admin user created with ID:", result.insertedId)

    // Create some sample categories
    console.log("Creating sample categories...")
    const categories = [
      {
        name: "Flower",
        description: "Premium cannabis flower products",
        slug: "flower",
        isActive: true,
        createdAt: new Date(),
      },
      {
        name: "Edibles",
        description: "Cannabis-infused edible products",
        slug: "edibles",
        isActive: true,
        createdAt: new Date(),
      },
      {
        name: "Concentrates",
        description: "High-potency cannabis concentrates",
        slug: "concentrates",
        isActive: true,
        createdAt: new Date(),
      },
    ]

    await db.collection(collections.categories).insertMany(categories)
    console.log("Sample categories created")

    // Create sample products
    console.log("Creating sample products...")
    const products = [
      {
        name: "Premium OG Kush",
        description: "High-quality OG Kush strain with earthy and pine flavors",
        price: 45.0,
        category: "Flower",
        stock: 100,
        thc: 22.5,
        cbd: 0.8,
        strain: "Indica",
        images: ["/placeholder.svg?height=400&width=400"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        name: "Sour Diesel",
        description: "Energizing sativa strain with diesel and citrus notes",
        price: 50.0,
        category: "Flower",
        stock: 75,
        thc: 24.0,
        cbd: 0.5,
        strain: "Sativa",
        images: ["/placeholder.svg?height=400&width=400"],
        isActive: true,
        createdAt: new Date(),
      },
    ]

    await db.collection(collections.products).insertMany(products)
    console.log("Sample products created")

    console.log("=== DATABASE INITIALIZATION COMPLETE ===")

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      adminCredentials: {
        email: "admin@greenfields.com",
        password: "admin123",
      },
    })
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize database",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
