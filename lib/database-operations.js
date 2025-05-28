import { connectToDatabase, collections } from "./mongodb.js"
import { ObjectId } from "mongodb"

// Product Operations
export class ProductOperations {
  static async createProduct(productData) {
    try {
      const { db } = await connectToDatabase()

      const product = {
        ...productData,
        id: new ObjectId().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        rating: 0,
        reviewCount: 0,
        sales: 0,
        views: 0,
      }

      console.log("Inserting product into database:", product)

      const result = await db.collection(collections.products).insertOne(product)

      console.log("Product inserted with ID:", result.insertedId)

      return { ...product, _id: result.insertedId }
    } catch (error) {
      console.error("Error creating product:", error)
      throw error
    }
  }

  static async getAllProducts(filters = {}) {
    try {
      const { db } = await connectToDatabase()

      const query = {}

      if (filters.category && filters.category !== "all") {
        query.category = filters.category
      }

      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: "i" } },
          { description: { $regex: filters.search, $options: "i" } },
          { category: { $regex: filters.search, $options: "i" } },
        ]
      }

      if (filters.inStock) {
        query.stock = { $gt: 0 }
      }

      if (filters.priceRange) {
        query.price = {
          $gte: filters.priceRange.min || 0,
          $lte: filters.priceRange.max || 999999,
        }
      }

      const products = await db.collection(collections.products).find(query).sort({ createdAt: -1 }).toArray()

      return products
    } catch (error) {
      console.error("Error fetching products:", error)
      throw error
    }
  }

  static async getProductById(id) {
    try {
      const { db } = await connectToDatabase()
      const product = await db.collection(collections.products).findOne({ id })
      return product
    } catch (error) {
      console.error("Error fetching product by ID:", error)
      throw error
    }
  }

  static async updateProduct(id, updates) {
    try {
      const { db } = await connectToDatabase()

      const updateData = {
        ...updates,
        updatedAt: new Date(),
      }

      const result = await db.collection(collections.products).updateOne({ id }, { $set: updateData })

      if (result.matchedCount === 0) {
        throw new Error("Product not found")
      }

      return await this.getProductById(id)
    } catch (error) {
      console.error("Error updating product:", error)
      throw error
    }
  }

  static async deleteProduct(id) {
    try {
      const { db } = await connectToDatabase()

      const product = await this.getProductById(id)
      if (!product) {
        throw new Error("Product not found")
      }

      const result = await db.collection(collections.products).deleteOne({ id })
      return result.deletedCount > 0
    } catch (error) {
      console.error("Error deleting product:", error)
      throw error
    }
  }

  static async getFeaturedProducts() {
    try {
      const { db } = await connectToDatabase()

      // First try to get products marked as featured
      let products = await db
        .collection(collections.products)
        .find({ featured: true, inStock: true })
        .sort({ sales: -1 })
        .limit(8)
        .toArray()

      console.log("Database: Featured products found:", products.length)

      // If no featured products, get top selling products
      if (products.length === 0) {
        console.log("Database: No featured products, getting top selling")
        products = await db
          .collection(collections.products)
          .find({ inStock: true })
          .sort({ sales: -1 })
          .limit(8)
          .toArray()
      }

      // If still no products, get any products
      if (products.length === 0) {
        console.log("Database: No top selling, getting any products")
        products = await db.collection(collections.products).find({}).sort({ createdAt: -1 }).limit(8).toArray()
      }

      return products
    } catch (error) {
      console.error("Error fetching featured products:", error)
      throw error
    }
  }

  static async getRelatedProducts(productId, category, limit = 4) {
    try {
      const { db } = await connectToDatabase()
      const products = await db
        .collection(collections.products)
        .find({
          id: { $ne: productId },
          category,
          inStock: true,
        })
        .sort({ sales: -1 })
        .limit(limit)
        .toArray()

      return products
    } catch (error) {
      console.error("Error fetching related products:", error)
      throw error
    }
  }

  static async updateProductStock(id, quantity) {
    try {
      const { db } = await connectToDatabase()

      const product = await this.getProductById(id)
      if (!product) {
        throw new Error("Product not found")
      }

      const newStock = Math.max(0, product.stock - quantity)

      await db.collection(collections.products).updateOne(
        { id },
        {
          $set: {
            stock: newStock,
            inStock: newStock > 0,
            updatedAt: new Date(),
          },
          $inc: { sales: quantity },
        },
      )

      return newStock
    } catch (error) {
      console.error("Error updating product stock:", error)
      throw error
    }
  }
}

// User Operations
export class UserOperations {
  static async createUser(userData) {
    try {
      const { db } = await connectToDatabase()

      const user = {
        ...userData,
        id: new ObjectId().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        emailVerified: false,
        loginAttempts: 0,
        lastLogin: null,
        loyaltyPoints: userData.role === "admin" ? 0 : 100, // Welcome bonus
        loyaltyTier: userData.role === "admin" ? "none" : "bronze",
        totalOrders: 0,
        totalSpent: 0,
      }

      console.log("Creating user:", user)

      const result = await db.collection(collections.users).insertOne(user)

      console.log("User created with ID:", result.insertedId)

      return { ...user, _id: result.insertedId }
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  }

  static async getUserByEmail(email) {
    try {
      const { db } = await connectToDatabase()
      const user = await db.collection(collections.users).findOne({
        email: email.toLowerCase(),
      })
      return user
    } catch (error) {
      console.error("Error fetching user by email:", error)
      throw error
    }
  }

  static async getUserById(id) {
    try {
      const { db } = await connectToDatabase()
      const user = await db.collection(collections.users).findOne({ id })
      return user
    } catch (error) {
      console.error("Error fetching user by ID:", error)
      throw error
    }
  }

  static async updateUser(id, updates) {
    try {
      const { db } = await connectToDatabase()

      // Check if updates contains MongoDB operators
      const hasOperators = Object.keys(updates).some((key) => key.startsWith("$"))

      let updateOperation
      if (hasOperators) {
        // If updates already contains operators, use it directly
        updateOperation = updates
      } else {
        // Otherwise, wrap in $set and add updatedAt
        updateOperation = {
          $set: {
            ...updates,
            updatedAt: new Date(),
          },
        }
      }

      const result = await db.collection(collections.users).updateOne({ id }, updateOperation)

      if (result.matchedCount === 0) {
        throw new Error("User not found")
      }

      return await this.getUserById(id)
    } catch (error) {
      console.error("Error updating user:", error)
      throw error
    }
  }

  static async getAllUsers(filters = {}) {
    try {
      const { db } = await connectToDatabase()

      const query = {}

      if (filters.status && filters.status !== "all") {
        query.status = filters.status
      }

      if (filters.role && filters.role !== "all") {
        query.role = filters.role
      }

      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: "i" } },
          { email: { $regex: filters.search, $options: "i" } },
        ]
      }

      const users = await db.collection(collections.users).find(query).sort({ createdAt: -1 }).toArray()

      return users
    } catch (error) {
      console.error("Error fetching users:", error)
      throw error
    }
  }

  static async updateLoyaltyPoints(userId, points, operation = "add") {
    try {
      const { db } = await connectToDatabase()

      const user = await this.getUserById(userId)
      if (!user) {
        throw new Error("User not found")
      }

      let newPoints
      if (operation === "add") {
        newPoints = user.loyaltyPoints + points
      } else if (operation === "subtract") {
        newPoints = Math.max(0, user.loyaltyPoints - points)
      } else {
        newPoints = points
      }

      // Determine loyalty tier based on total spent
      let newTier = "bronze"
      if (user.totalSpent >= 10000) newTier = "platinum"
      else if (user.totalSpent >= 5000) newTier = "gold"
      else if (user.totalSpent >= 1000) newTier = "silver"

      await db.collection(collections.users).updateOne(
        { id: userId },
        {
          $set: {
            loyaltyPoints: newPoints,
            loyaltyTier: newTier,
            updatedAt: new Date(),
          },
        },
      )

      return { points: newPoints, tier: newTier }
    } catch (error) {
      console.error("Error updating loyalty points:", error)
      throw error
    }
  }
}

// Loyalty Operations
export class LoyaltyOperations {
  static async getLoyaltySettings() {
    try {
      const { db } = await connectToDatabase()
      let settings = await db.collection(collections.loyaltySettings).findOne({ type: "main" })

      if (!settings) {
        // Create default settings
        settings = {
          type: "main",
          enabled: true,
          pointsPerDollar: 10,
          minimumRedeemPoints: 500,
          pointsExpiration: 90,
          welcomeBonus: 100,
          referralBonus: 200,
          birthdayBonus: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        await db.collection(collections.loyaltySettings).insertOne(settings)
      }

      return settings
    } catch (error) {
      console.error("Error fetching loyalty settings:", error)
      throw error
    }
  }

  static async updateLoyaltySettings(updates) {
    try {
      const { db } = await connectToDatabase()

      const updateData = {
        ...updates,
        updatedAt: new Date(),
      }

      const result = await db
        .collection(collections.loyaltySettings)
        .updateOne({ type: "main" }, { $set: updateData }, { upsert: true })

      return await this.getLoyaltySettings()
    } catch (error) {
      console.error("Error updating loyalty settings:", error)
      throw error
    }
  }

  static async getLoyaltyTiers() {
    try {
      const { db } = await connectToDatabase()
      let tiers = await db.collection(collections.loyaltyTiers).find({}).sort({ threshold: 1 }).toArray()

      if (tiers.length === 0) {
        // Create default tiers
        const defaultTiers = [
          { name: "Bronze", threshold: 0, discount: 5, freeShipping: false, birthdayBonus: true },
          { name: "Silver", threshold: 1000, discount: 10, freeShipping: true, birthdayBonus: true },
          { name: "Gold", threshold: 5000, discount: 15, freeShipping: true, birthdayBonus: true },
          { name: "Platinum", threshold: 10000, discount: 20, freeShipping: true, birthdayBonus: true },
        ]

        for (const tier of defaultTiers) {
          tier.id = new ObjectId().toString()
          tier.createdAt = new Date()
          tier.updatedAt = new Date()
        }

        await db.collection(collections.loyaltyTiers).insertMany(defaultTiers)
        tiers = defaultTiers
      }

      return tiers
    } catch (error) {
      console.error("Error fetching loyalty tiers:", error)
      throw error
    }
  }

  static async updateLoyaltyTiers(tiers) {
    try {
      const { db } = await connectToDatabase()

      // Delete existing tiers
      await db.collection(collections.loyaltyTiers).deleteMany({})

      // Insert updated tiers
      const tiersToInsert = tiers.map((tier) => ({
        ...tier,
        id: tier.id || new ObjectId().toString(),
        updatedAt: new Date(),
        createdAt: tier.createdAt || new Date(),
      }))

      await db.collection(collections.loyaltyTiers).insertMany(tiersToInsert)

      return tiersToInsert
    } catch (error) {
      console.error("Error updating loyalty tiers:", error)
      throw error
    }
  }
}

// Order Operations
export class OrderOperations {
  static async createOrder(orderData) {
    try {
      const { db } = await connectToDatabase()

      const order = {
        ...orderData,
        id: `GF${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "pending",
        paymentStatus: "pending",
      }

      const result = await db.collection(collections.orders).insertOne(order)

      // Update user's total orders and spent
      if (order.customer.id) {
        await UserOperations.updateUser(order.customer.id, {
          $inc: {
            totalOrders: 1,
            totalSpent: order.total,
          },
          $set: {
            updatedAt: new Date(),
          },
        })

        // Add loyalty points (10 points per dollar)
        const pointsEarned = Math.floor(order.total * 10)
        await UserOperations.updateLoyaltyPoints(order.customer.id, pointsEarned, "add")
      }

      // Update product stock
      for (const item of order.items) {
        await ProductOperations.updateProductStock(item.productId, item.quantity)
      }

      return { ...order, _id: result.insertedId }
    } catch (error) {
      console.error("Error creating order:", error)
      throw error
    }
  }

  static async getAllOrders(filters = {}) {
    try {
      const { db } = await connectToDatabase()

      const query = {}

      if (filters.status && filters.status !== "all") {
        query.status = filters.status
      }

      if (filters.search) {
        query.$or = [
          { id: { $regex: filters.search, $options: "i" } },
          { "customer.name": { $regex: filters.search, $options: "i" } },
          { "customer.email": { $regex: filters.search, $options: "i" } },
        ]
      }

      const orders = await db.collection(collections.orders).find(query).sort({ createdAt: -1 }).toArray()

      return orders
    } catch (error) {
      console.error("Error fetching orders:", error)
      throw error
    }
  }

  static async getOrderById(id) {
    try {
      const { db } = await connectToDatabase()
      const order = await db.collection(collections.orders).findOne({ id })
      return order
    } catch (error) {
      console.error("Error fetching order by ID:", error)
      throw error
    }
  }

  static async updateOrderStatus(id, status, trackingNumber = null) {
    try {
      const { db } = await connectToDatabase()

      const updateData = {
        status,
        updatedAt: new Date(),
      }

      if (trackingNumber) {
        updateData.trackingNumber = trackingNumber
      }

      const result = await db.collection(collections.orders).updateOne({ id }, { $set: updateData })

      if (result.matchedCount === 0) {
        throw new Error("Order not found")
      }

      return await this.getOrderById(id)
    } catch (error) {
      console.error("Error updating order status:", error)
      throw error
    }
  }

  static async getOrderByNumberAndEmail(orderNumber, email) {
    try {
      const { db } = await connectToDatabase()
      const order = await db.collection(collections.orders).findOne({
        id: orderNumber,
        "customer.email": email.toLowerCase(),
      })
      return order
    } catch (error) {
      console.error("Error fetching order by number and email:", error)
      throw error
    }
  }

  static async getUserOrders(userId) {
    try {
      const { db } = await connectToDatabase()
      const orders = await db
        .collection(collections.orders)
        .find({ "customer.id": userId })
        .sort({ createdAt: -1 })
        .toArray()

      return orders
    } catch (error) {
      console.error("Error fetching user orders:", error)
      throw error
    }
  }
}

// Analytics Operations
export class AnalyticsOperations {
  static async getDashboardStats() {
    try {
      const { db } = await connectToDatabase()

      const [totalProducts, totalUsers, totalOrders, totalRevenue] = await Promise.all([
        db.collection(collections.products).countDocuments(),
        db.collection(collections.users).countDocuments({ role: "customer" }),
        db.collection(collections.orders).countDocuments(),
        db
          .collection(collections.orders)
          .aggregate([
            { $match: { status: { $ne: "cancelled" } } },
            { $group: { _id: null, total: { $sum: "$total" } } },
          ])
          .toArray(),
      ])

      return {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      throw error
    }
  }

  static async getSalesData(timeRange = "30days") {
    try {
      const { db } = await connectToDatabase()

      const startDate = new Date()
      switch (timeRange) {
        case "7days":
          startDate.setDate(startDate.getDate() - 7)
          break
        case "30days":
          startDate.setDate(startDate.getDate() - 30)
          break
        case "90days":
          startDate.setDate(startDate.getDate() - 90)
          break
        case "year":
          startDate.setFullYear(startDate.getFullYear() - 1)
          break
      }

      const salesData = await db
        .collection(collections.orders)
        .aggregate([
          {
            $match: {
              createdAt: { $gte: startDate },
              status: { $ne: "cancelled" },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" },
              },
              revenue: { $sum: "$total" },
              orders: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        ])
        .toArray()

      return salesData
    } catch (error) {
      console.error("Error fetching sales data:", error)
      throw error
    }
  }

  static async getTopProducts(limit = 10) {
    try {
      const { db } = await connectToDatabase()

      const topProducts = await db.collection(collections.products).find({}).sort({ sales: -1 }).limit(limit).toArray()

      return topProducts
    } catch (error) {
      console.error("Error fetching top products:", error)
      throw error
    }
  }

  static async getCategoryStats() {
    try {
      const { db } = await connectToDatabase()

      const categoryStats = await db
        .collection(collections.products)
        .aggregate([
          {
            $group: {
              _id: "$category",
              totalProducts: { $sum: 1 },
              totalRevenue: { $sum: { $multiply: ["$price", "$sales"] } },
              averagePrice: { $avg: "$price" },
            },
          },
          { $sort: { totalRevenue: -1 } },
        ])
        .toArray()

      return categoryStats
    } catch (error) {
      console.error("Error fetching category stats:", error)
      throw error
    }
  }
}

// Initialize database with existing data
export async function initializeDatabase() {
  try {
    const { db } = await connectToDatabase()

    // Check if products already exist
    const existingProducts = await db.collection(collections.products).countDocuments()

    if (existingProducts === 0) {
      // Import existing data from your current data file
      const { allProducts, categories } = await import("./data.js")

      // Transform and insert products
      const productsToInsert = allProducts.map((product, index) => ({
        ...product,
        id: product.id || new ObjectId().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        images: product.images || ["/placeholder.svg?height=400&width=400"],
        rating: product.rating || 4.5,
        reviewCount: product.reviewCount || Math.floor(Math.random() * 100) + 10,
        sales: product.sales || Math.floor(Math.random() * 500) + 50,
        views: 0,
        featured: index < 8, // Mark first 8 products as featured
        inStock: product.inStock !== false,
        stock: product.stock || Math.floor(Math.random() * 50) + 10,
      }))

      await db.collection(collections.products).insertMany(productsToInsert)
      console.log("✅ Products initialized in database")

      // Insert categories
      const categoriesToInsert = categories.map((category) => ({
        ...category,
        id: category.id || new ObjectId().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      await db.collection(collections.categories).insertMany(categoriesToInsert)
      console.log("✅ Categories initialized in database")
    }

    // Create admin user if not exists
    const adminExists = await db.collection(collections.users).findOne({
      email: "admin@greenfields.com",
    })

    if (!adminExists) {
      const bcrypt = await import("bcryptjs")
      const hashedPassword = await bcrypt.hash("admin123", 12)

      await UserOperations.createUser({
        name: "Admin User",
        email: "admin@greenfields.com",
        password: hashedPassword,
        role: "admin",
        isAdmin: true,
        emailVerified: true,
        status: "active",
      })

      console.log("✅ Admin user created")
    }

    console.log("✅ Database initialization complete")
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
  }
}
