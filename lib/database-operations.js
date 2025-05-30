import { connectToDatabase, collections } from "./mongodb.js"
import { ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

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

      console.log("Inserting product into database:", product.name)

      const result = await db.collection(collections.products).insertOne(product)

      console.log("Product inserted with ID:", result.insertedId)

      return { ...product, _id: result.insertedId }
    } catch (error) {
      console.error("Error creating product:", error)
      throw new Error(`Failed to create product: ${error.message}`)
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

      console.log("Database query for products:", query)
      const products = await db.collection(collections.products).find(query).sort({ createdAt: -1 }).toArray()
      console.log(`Found ${products.length} products in database`)

      return products
    } catch (error) {
      console.error("Error fetching products:", error)
      throw new Error(`Failed to fetch products: ${error.message}`)
    }
  }

  static async getProductById(id) {
    try {
      const { db } = await connectToDatabase()
      console.log("Looking for product with ID:", id)

      if (!id) {
        throw new Error("Product ID is required")
      }

      // Try multiple ways to find the product
      let product = null

      // First try with the id field
      product = await db.collection(collections.products).findOne({ id })

      if (!product) {
        // Try with _id field if it's a valid ObjectId
        try {
          if (ObjectId.isValid(id)) {
            product = await db.collection(collections.products).findOne({ _id: new ObjectId(id) })
          }
        } catch (e) {
          console.log("Failed to search by _id:", e.message)
        }
      }

      console.log("Found product:", product ? "Yes" : "No")
      return product
    } catch (error) {
      console.error("Error fetching product by ID:", error)
      throw new Error(`Failed to fetch product: ${error.message}`)
    }
  }

  static async updateProduct(id, updates) {
    try {
      const { db } = await connectToDatabase()
      console.log("Updating product with ID:", id)

      if (!id) {
        throw new Error("Product ID is required")
      }

      const updateData = {
        ...updates,
        updatedAt: new Date(),
      }

      // Try to update by id field first
      let result = await db.collection(collections.products).updateOne({ id }, { $set: updateData })

      // If no match found and id looks like ObjectId, try with _id field
      if (result.matchedCount === 0 && ObjectId.isValid(id)) {
        try {
          result = await db.collection(collections.products).updateOne({ _id: new ObjectId(id) }, { $set: updateData })
        } catch (e) {
          console.log("Failed to update by _id:", e.message)
        }
      }

      if (result.matchedCount === 0) {
        throw new Error("Product not found")
      }

      console.log("Product updated successfully, fetching updated product")
      return await this.getProductById(id)
    } catch (error) {
      console.error("Error updating product:", error)
      throw new Error(`Failed to update product: ${error.message}`)
    }
  }

  static async deleteProduct(id) {
    try {
      const { db } = await connectToDatabase()
      console.log("Attempting to delete product with ID:", id)

      if (!id) {
        throw new Error("Product ID is required")
      }

      // First check if product exists
      const product = await this.getProductById(id)
      if (!product) {
        console.log("Product not found for deletion")
        throw new Error("Product not found")
      }

      console.log("Product found, proceeding with deletion:", product.name)

      // Try to delete by id field first
      let result = await db.collection(collections.products).deleteOne({ id })

      // If no match found and id looks like ObjectId, try with _id field
      if (result.deletedCount === 0 && ObjectId.isValid(id)) {
        try {
          result = await db.collection(collections.products).deleteOne({ _id: new ObjectId(id) })
        } catch (e) {
          console.log("Failed to delete by _id:", e.message)
        }
      }

      console.log("Delete result:", result.deletedCount > 0 ? "Success" : "Failed")

      if (result.deletedCount === 0) {
        throw new Error("Failed to delete product from database")
      }

      return true
    } catch (error) {
      console.error("Error deleting product:", error)
      throw new Error(`Failed to delete product: ${error.message}`)
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

      // Try to update by id field first
      let result = await db.collection(collections.products).updateOne(
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

      // If no match found and id looks like ObjectId, try with _id field
      if (result.matchedCount === 0 && ObjectId.isValid(id)) {
        try {
          result = await db.collection(collections.products).updateOne(
            { _id: new ObjectId(id) },
            {
              $set: {
                stock: newStock,
                inStock: newStock > 0,
                updatedAt: new Date(),
              },
              $inc: { sales: quantity },
            },
          )
        } catch (e) {
          console.log("Failed to update stock by _id:", e.message)
        }
      }

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
      // Try both id field and _id field for compatibility
      let user = await db.collection(collections.users).findOne({ id })

      if (!user) {
        // Try with _id if id field doesn't work
        try {
          user = await db.collection(collections.users).findOne({ _id: new ObjectId(id) })
        } catch (e) {
          // If ObjectId conversion fails, user doesn't exist
          return null
        }
      }

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

      // Try to update by id field first
      let result = await db.collection(collections.users).updateOne({ id }, updateOperation)

      // If no match found, try with _id field
      if (result.matchedCount === 0) {
        try {
          result = await db.collection(collections.users).updateOne({ _id: new ObjectId(id) }, updateOperation)
        } catch (e) {
          // If ObjectId conversion fails, user doesn't exist
          throw new Error("User not found")
        }
      }

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
        console.log(`User not found for loyalty points update: ${userId}`)
        return { points: 0, tier: "bronze" } // Return default values if user not found
      }

      let newPoints
      if (operation === "add") {
        newPoints = (user.loyaltyPoints || 0) + points
      } else if (operation === "subtract") {
        newPoints = Math.max(0, (user.loyaltyPoints || 0) - points)
      } else {
        newPoints = points
      }

      // Determine loyalty tier based on total spent
      let newTier = "bronze"
      const totalSpent = user.totalSpent || 0
      if (totalSpent >= 10000) newTier = "platinum"
      else if (totalSpent >= 5000) newTier = "gold"
      else if (totalSpent >= 1000) newTier = "silver"

      // Try to update by id field first
      let result = await db.collection(collections.users).updateOne(
        { id: userId },
        {
          $set: {
            loyaltyPoints: newPoints,
            loyaltyTier: newTier,
            updatedAt: new Date(),
          },
        },
      )

      // If no match found, try with _id field
      if (result.matchedCount === 0) {
        try {
          result = await db.collection(collections.users).updateOne(
            { _id: new ObjectId(userId) },
            {
              $set: {
                loyaltyPoints: newPoints,
                loyaltyTier: newTier,
                updatedAt: new Date(),
              },
            },
          )
        } catch (e) {
          // If ObjectId conversion fails, return default values
          console.log(`Failed to update loyalty points for user: ${userId}`)
          return { points: 0, tier: "bronze" }
        }
      }

      return { points: newPoints, tier: newTier }
    } catch (error) {
      console.error("Error updating loyalty points:", error)
      return { points: 0, tier: "bronze" } // Return default values on error
    }
  }
}

// Settings Operations
export class SettingsOperations {
  static async getGeneralSettings() {
    try {
      const { db } = await connectToDatabase()
      let settings = await db.collection(collections.settings).findOne({ type: "general" })

      if (!settings) {
        // Create default general settings
        settings = {
          type: "general",
          storeName: "Greenfields Cannabis",
          storeDescription: "Premium Quality Cannabis Products for Connoisseurs",
          storeEmail: "info@greenfields.com",
          storePhone: "+1 (555) 123-4567",
          storeAddress: "123 Cannabis Street, Green Valley, CA 90210",
          currency: "USD",
          timezone: "America/Los_Angeles",
          taxRate: 8.5,
          ageVerificationRequired: true,
          maintenanceMode: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        await db.collection(collections.settings).insertOne(settings)
      }

      return settings
    } catch (error) {
      console.error("Error fetching general settings:", error)
      throw error
    }
  }

  static async updateGeneralSettings(updates) {
    try {
      const { db } = await connectToDatabase()

      const updateData = {
        ...updates,
        type: "general",
        updatedAt: new Date(),
      }

      const result = await db
        .collection(collections.settings)
        .updateOne({ type: "general" }, { $set: updateData }, { upsert: true })

      return await this.getGeneralSettings()
    } catch (error) {
      console.error("Error updating general settings:", error)
      throw error
    }
  }

  static async getShippingSettings() {
    try {
      const { db } = await connectToDatabase()
      let settings = await db.collection(collections.settings).findOne({ type: "shipping" })

      if (!settings) {
        // Create default shipping settings
        settings = {
          type: "shipping",
          freeShippingThreshold: 100,
          standardShippingCost: 9.99,
          expressShippingCost: 19.99,
          sameDayShippingCost: 29.99,
          standardDeliveryDays: "3-5",
          expressDeliveryDays: "1-2",
          sameDayDeliveryHours: "3-4",
          shippingZones: ["California", "Nevada", "Oregon", "Washington"],
          packagingFee: 0,
          handlingFee: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        await db.collection(collections.settings).insertOne(settings)
      }

      return settings
    } catch (error) {
      console.error("Error fetching shipping settings:", error)
      throw error
    }
  }

  static async updateShippingSettings(updates) {
    try {
      const { db } = await connectToDatabase()

      const updateData = {
        ...updates,
        type: "shipping",
        updatedAt: new Date(),
      }

      const result = await db
        .collection(collections.settings)
        .updateOne({ type: "shipping" }, { $set: updateData }, { upsert: true })

      return await this.getShippingSettings()
    } catch (error) {
      console.error("Error updating shipping settings:", error)
      throw error
    }
  }

  static async getPaymentSettings() {
    try {
      const { db } = await connectToDatabase()
      let settings = await db.collection(collections.settings).findOne({ type: "payment" })

      if (!settings) {
        // Create default payment settings
        settings = {
          type: "payment",
          stripeEnabled: true,
          paypalEnabled: true,
          cashOnDeliveryEnabled: false,
          cryptoEnabled: false,
          minimumOrderAmount: 25,
          maximumOrderAmount: 5000,
          processingFee: 2.9,
          refundPolicy: "30 days",
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        await db.collection(collections.settings).insertOne(settings)
      }

      return settings
    } catch (error) {
      console.error("Error fetching payment settings:", error)
      throw error
    }
  }

  static async updatePaymentSettings(updates) {
    try {
      const { db } = await connectToDatabase()

      const updateData = {
        ...updates,
        type: "payment",
        updatedAt: new Date(),
      }

      const result = await db
        .collection(collections.settings)
        .updateOne({ type: "payment" }, { $set: updateData }, { upsert: true })

      return await this.getPaymentSettings()
    } catch (error) {
      console.error("Error updating payment settings:", error)
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

      // Update user's total orders and spent (only if customer ID exists)
      if (order.customer && order.customer.id) {
        try {
          console.log(`Updating user stats for customer ID: ${order.customer.id}`)

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
          console.log(`Awarding ${pointsEarned} loyalty points to user ${order.customer.id}`)

          await UserOperations.updateLoyaltyPoints(order.customer.id, pointsEarned, "add")
        } catch (userError) {
          console.error("Error updating user stats, but order was created:", userError)
          // Don't throw error here - order was successfully created
        }
      } else {
        console.log("No customer ID provided, skipping user stats update")
      }

      // Update product stock
      try {
        for (const item of order.items) {
          if (item.productId) {
            await ProductOperations.updateProductStock(item.productId, item.quantity)
          }
        }
      } catch (stockError) {
        console.error("Error updating product stock, but order was created:", stockError)
        // Don't throw error here - order was successfully created
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

    // Check if admin user exists
    const adminExists = await db.collection(collections.users).findOne({ email: "admin@greenfields.com" })

    if (!adminExists) {
      // Create admin user
      const hashedPassword = await bcrypt.hash("admin123", 12)

      await db.collection(collections.users).insertOne({
        id: new ObjectId().toString(),
        name: "Admin User",
        email: "admin@greenfields.com",
        password: hashedPassword,
        role: "admin",
        isAdmin: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      console.log("Admin user created successfully")
    }

    // Check if categories exist
    const categoriesCount = await db.collection(collections.categories).countDocuments()
    if (categoriesCount === 0) {
      const categories = [
        {
          id: new ObjectId().toString(),
          name: "Flower",
          slug: "flower",
          description: "Premium cannabis flower products",
          image: "/placeholder.svg?height=200&width=200",
          createdAt: new Date(),
        },
        {
          id: new ObjectId().toString(),
          name: "Edibles",
          slug: "edibles",
          description: "Cannabis-infused edible products",
          image: "/placeholder.svg?height=200&width=200",
          createdAt: new Date(),
        },
        {
          id: new ObjectId().toString(),
          name: "Concentrates",
          slug: "concentrates",
          description: "High-potency cannabis concentrates",
          image: "/placeholder.svg?height=200&width=200",
          createdAt: new Date(),
        },
        {
          id: new ObjectId().toString(),
          name: "Vapes",
          slug: "vapes",
          description: "Vaporizer cartridges and devices",
          image: "/placeholder.svg?height=200&width=200",
          createdAt: new Date(),
        },
      ]

      await db.collection(collections.categories).insertMany(categories)
      console.log("Categories created successfully")
    }

    console.log("Database initialization completed")
    return { success: true }
  } catch (error) {
    console.error("Database initialization error:", error)
    return { success: false, error: error.message }
  }
}
