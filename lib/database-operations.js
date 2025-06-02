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
        profilePicture: "",
        profilePictureId: "",
        bio: "",
        phone: "",
        preferences: {
          orderUpdates: true,
          promotions: true,
          news: true,
        },
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

  // Wishlist Operations
  static async getUserWishlist(userId) {
    try {
      const { db } = await connectToDatabase()

      const wishlistItems = await db.collection(collections.wishlist).find({ userId }).sort({ createdAt: -1 }).toArray()

      // Get product details for each wishlist item
      const productIds = wishlistItems.map((item) => item.productId)
      const products = await db
        .collection(collections.products)
        .find({ id: { $in: productIds } })
        .toArray()

      // Combine wishlist items with product details
      const wishlistWithProducts = wishlistItems
        .map((item) => {
          const product = products.find((p) => p.id === item.productId)
          return product ? { ...product, wishlistId: item.id } : null
        })
        .filter((item) => item !== null) // Remove items where product no longer exists

      return wishlistWithProducts
    } catch (error) {
      console.error("Error fetching user wishlist:", error)
      throw error
    }
  }

  static async addToWishlist(userId, productId) {
    try {
      const { db } = await connectToDatabase()

      // Check if item already exists in wishlist
      const existingItem = await db.collection(collections.wishlist).findOne({ userId, productId })

      if (existingItem) {
        throw new Error("Product already in wishlist")
      }

      const wishlistItem = {
        id: new ObjectId().toString(),
        userId,
        productId,
        createdAt: new Date(),
      }

      const result = await db.collection(collections.wishlist).insertOne(wishlistItem)

      return { ...wishlistItem, _id: result.insertedId }
    } catch (error) {
      console.error("Error adding to wishlist:", error)
      throw error
    }
  }

  static async removeFromWishlist(userId, productId) {
    try {
      const { db } = await connectToDatabase()

      const result = await db.collection(collections.wishlist).deleteOne({ userId, productId })

      return result.deletedCount > 0
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      throw error
    }
  }

  static async isInWishlist(userId, productId) {
    try {
      const { db } = await connectToDatabase()

      const item = await db.collection(collections.wishlist).findOne({ userId, productId })

      return !!item
    } catch (error) {
      console.error("Error checking wishlist:", error)
      return false
    }
  }

  // Address Operations
  static async getUserAddresses(userId) {
    try {
      const { db } = await connectToDatabase()

      const addresses = await db
        .collection(collections.addresses)
        .find({ userId })
        .sort({ default: -1, createdAt: -1 })
        .toArray()

      return addresses
    } catch (error) {
      console.error("Error fetching user addresses:", error)
      throw error
    }
  }

  static async addUserAddress(addressData) {
    try {
      const { db } = await connectToDatabase()

      // If this is set as default, unset other default addresses
      if (addressData.default) {
        await db
          .collection(collections.addresses)
          .updateMany({ userId: addressData.userId }, { $set: { default: false } })
      }

      const address = {
        ...addressData,
        id: new ObjectId().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await db.collection(collections.addresses).insertOne(address)

      return { ...address, _id: result.insertedId }
    } catch (error) {
      console.error("Error adding address:", error)
      throw error
    }
  }

  static async updateUserAddress(userId, addressId, updates) {
    try {
      const { db } = await connectToDatabase()

      // If this is set as default, unset other default addresses
      if (updates.default) {
        await db
          .collection(collections.addresses)
          .updateMany({ userId, id: { $ne: addressId } }, { $set: { default: false } })
      }

      const updateData = {
        ...updates,
        updatedAt: new Date(),
      }

      const result = await db
        .collection(collections.addresses)
        .updateOne({ userId, id: addressId }, { $set: updateData })

      if (result.matchedCount === 0) {
        throw new Error("Address not found")
      }

      return await this.getAddressById(userId, addressId)
    } catch (error) {
      console.error("Error updating address:", error)
      throw error
    }
  }

  static async deleteUserAddress(userId, addressId) {
    try {
      const { db } = await connectToDatabase()

      const result = await db.collection(collections.addresses).deleteOne({ userId, id: addressId })

      return result.deletedCount > 0
    } catch (error) {
      console.error("Error deleting address:", error)
      throw error
    }
  }

  static async getAddressById(userId, addressId) {
    try {
      const { db } = await connectToDatabase()

      const address = await db.collection(collections.addresses).findOne({ userId, id: addressId })

      return address
    } catch (error) {
      console.error("Error fetching address:", error)
      throw error
    }
  }

  static async setDefaultAddress(userId, addressId) {
    try {
      const { db } = await connectToDatabase()

      // Unset all default addresses for user
      await db.collection(collections.addresses).updateMany({ userId }, { $set: { default: false } })

      // Set the specified address as default
      const result = await db
        .collection(collections.addresses)
        .updateOne({ userId, id: addressId }, { $set: { default: true, updatedAt: new Date() } })

      return result.matchedCount > 0
    } catch (error) {
      console.error("Error setting default address:", error)
      throw error
    }
  }

  // Payment Method Operations
  static async getUserPaymentMethods(userId) {
    try {
      const { db } = await connectToDatabase()

      const paymentMethods = await db
        .collection(collections.paymentMethods)
        .find({ userId })
        .sort({ default: -1, createdAt: -1 })
        .toArray()

      return paymentMethods
    } catch (error) {
      console.error("Error fetching user payment methods:", error)
      throw error
    }
  }

  static async addUserPaymentMethod(paymentData) {
    try {
      const { db } = await connectToDatabase()

      // If this is set as default, unset other default payment methods
      if (paymentData.default) {
        await db
          .collection(collections.paymentMethods)
          .updateMany({ userId: paymentData.userId }, { $set: { default: false } })
      }

      const paymentMethod = {
        ...paymentData,
        id: new ObjectId().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await db.collection(collections.paymentMethods).insertOne(paymentMethod)

      return { ...paymentMethod, _id: result.insertedId }
    } catch (error) {
      console.error("Error adding payment method:", error)
      throw error
    }
  }

  static async updateUserPaymentMethod(userId, paymentMethodId, updates) {
    try {
      const { db } = await connectToDatabase()

      // If this is set as default, unset other default payment methods
      if (updates.default) {
        await db
          .collection(collections.paymentMethods)
          .updateMany({ userId, id: { $ne: paymentMethodId } }, { $set: { default: false } })
      }

      const updateData = {
        ...updates,
        updatedAt: new Date(),
      }

      const result = await db
        .collection(collections.paymentMethods)
        .updateOne({ userId, id: paymentMethodId }, { $set: updateData })

      if (result.matchedCount === 0) {
        throw new Error("Payment method not found")
      }

      return await this.getPaymentMethodById(userId, paymentMethodId)
    } catch (error) {
      console.error("Error updating payment method:", error)
      throw error
    }
  }

  static async deleteUserPaymentMethod(userId, paymentMethodId) {
    try {
      const { db } = await connectToDatabase()

      const result = await db.collection(collections.paymentMethods).deleteOne({ userId, id: paymentMethodId })

      return result.deletedCount > 0
    } catch (error) {
      console.error("Error deleting payment method:", error)
      throw error
    }
  }

  static async getPaymentMethodById(userId, paymentMethodId) {
    try {
      const { db } = await connectToDatabase()

      const paymentMethod = await db.collection(collections.paymentMethods).findOne({ userId, id: paymentMethodId })

      return paymentMethod
    } catch (error) {
      console.error("Error fetching payment method:", error)
      throw error
    }
  }

  static async setDefaultPaymentMethod(userId, paymentMethodId) {
    try {
      const { db } = await connectToDatabase()

      // Unset all default payment methods for user
      await db.collection(collections.paymentMethods).updateMany({ userId }, { $set: { default: false } })

      // Set the specified payment method as default
      const result = await db
        .collection(collections.paymentMethods)
        .updateOne({ userId, id: paymentMethodId }, { $set: { default: true, updatedAt: new Date() } })

      return result.matchedCount > 0
    } catch (error) {
      console.error("Error setting default payment method:", error)
      throw error
    }
  }

  // Loyalty Operations
  static async getUserLoyalty(userId) {
    try {
      const { db } = await connectToDatabase()

      const user = await this.getUserById(userId)
      if (!user) {
        return {
          tier: "bronze",
          points: 0,
          nextTier: "silver",
          pointsToNextTier: 500,
          totalSpent: 0,
          ordersCount: 0,
        }
      }

      const totalSpent = user.totalSpent || 0
      const points = user.loyaltyPoints || 0
      const ordersCount = user.totalOrders || 0

      // Determine tier and next tier
      let tier = "bronze"
      let nextTier = "silver"
      let pointsToNextTier = 500

      if (totalSpent >= 2000) {
        tier = "platinum"
        nextTier = "platinum"
        pointsToNextTier = 0
      } else if (totalSpent >= 1000) {
        tier = "gold"
        nextTier = "platinum"
        pointsToNextTier = Math.max(0, 2000 - totalSpent)
      } else if (totalSpent >= 500) {
        tier = "silver"
        nextTier = "gold"
        pointsToNextTier = Math.max(0, 1000 - totalSpent)
      }

      return {
        tier,
        points,
        nextTier,
        pointsToNextTier,
        totalSpent,
        ordersCount,
      }
    } catch (error) {
      console.error("Error fetching user loyalty:", error)
      throw error
    }
  }

  // Preferences Operations
  static async updateUserPreferences(userId, preferences) {
    try {
      const { db } = await connectToDatabase()

      const result = await db.collection(collections.users).updateOne(
        { id: userId },
        {
          $set: {
            preferences,
            updatedAt: new Date(),
          },
        },
      )

      if (result.matchedCount === 0) {
        throw new Error("User not found")
      }

      return await this.getUserById(userId)
    } catch (error) {
      console.error("Error updating user preferences:", error)
      throw error
    }
  }

  // Account Deletion
  static async deleteUserAccount(userId) {
    try {
      const { db } = await connectToDatabase()

      // Delete from all collections
      await Promise.all([
        db.collection(collections.users).deleteOne({ id: userId }),
        db.collection(collections.wishlist).deleteMany({ userId }),
        db.collection(collections.addresses).deleteMany({ userId }),
        db.collection(collections.paymentMethods).deleteMany({ userId }),
      ])

      return { success: true }
    } catch (error) {
      console.error("Error deleting user account:", error)
      throw error
    }
  }
}

// Wishlist Operations
export class WishlistOperations {
  static async getUserWishlist(userId) {
    try {
      return await UserOperations.getUserWishlist(userId)
    } catch (error) {
      console.error("Error fetching user wishlist:", error)
      throw error
    }
  }

  static async addToWishlist(userId, productId) {
    try {
      return await UserOperations.addToWishlist(userId, productId)
    } catch (error) {
      console.error("Error adding to wishlist:", error)
      throw error
    }
  }

  static async removeFromWishlist(userId, productId) {
    try {
      return await UserOperations.removeFromWishlist(userId, productId)
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      throw error
    }
  }

  static async isInWishlist(userId, productId) {
    try {
      return await UserOperations.isInWishlist(userId, productId)
    } catch (error) {
      console.error("Error checking wishlist:", error)
      return false
    }
  }
}

// Address Operations
export class AddressOperations {
  static async getUserAddresses(userId) {
    try {
      return await UserOperations.getUserAddresses(userId)
    } catch (error) {
      console.error("Error fetching user addresses:", error)
      throw error
    }
  }

  static async addAddress(addressData) {
    try {
      return await UserOperations.addUserAddress(addressData)
    } catch (error) {
      console.error("Error adding address:", error)
      throw error
    }
  }

  static async updateAddress(userId, addressId, updates) {
    try {
      return await UserOperations.updateUserAddress(userId, addressId, updates)
    } catch (error) {
      console.error("Error updating address:", error)
      throw error
    }
  }

  static async deleteAddress(userId, addressId) {
    try {
      return await UserOperations.deleteUserAddress(userId, addressId)
    } catch (error) {
      console.error("Error deleting address:", error)
      throw error
    }
  }

  static async getAddressById(userId, addressId) {
    try {
      return await UserOperations.getAddressById(userId, addressId)
    } catch (error) {
      console.error("Error fetching address:", error)
      throw error
    }
  }

  static async setDefaultAddress(userId, addressId) {
    try {
      return await UserOperations.setDefaultAddress(userId, addressId)
    } catch (error) {
      console.error("Error setting default address:", error)
      throw error
    }
  }
}

// Payment Method Operations
export class PaymentMethodOperations {
  static async getUserPaymentMethods(userId) {
    try {
      return await UserOperations.getUserPaymentMethods(userId)
    } catch (error) {
      console.error("Error fetching user payment methods:", error)
      throw error
    }
  }

  static async addPaymentMethod(paymentData) {
    try {
      return await UserOperations.addUserPaymentMethod(paymentData)
    } catch (error) {
      console.error("Error adding payment method:", error)
      throw error
    }
  }

  static async updatePaymentMethod(userId, paymentMethodId, updates) {
    try {
      return await UserOperations.updateUserPaymentMethod(userId, paymentMethodId, updates)
    } catch (error) {
      console.error("Error updating payment method:", error)
      throw error
    }
  }

  static async deletePaymentMethod(userId, paymentMethodId) {
    try {
      return await UserOperations.deleteUserPaymentMethod(userId, paymentMethodId)
    } catch (error) {
      console.error("Error deleting payment method:", error)
      throw error
    }
  }

  static async getPaymentMethodById(userId, paymentMethodId) {
    try {
      return await UserOperations.getPaymentMethodById(userId, paymentMethodId)
    } catch (error) {
      console.error("Error fetching payment method:", error)
      throw error
    }
  }

  static async setDefaultPaymentMethod(userId, paymentMethodId) {
    try {
      return await UserOperations.setDefaultPaymentMethod(userId, paymentMethodId)
    } catch (error) {
      console.error("Error setting default payment method:", error)
      throw error
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

  static async updateOrder(id, updateData) {
    try {
      const { db } = await connectToDatabase()

      const result = await db
        .collection(collections.orders)
        .updateOne({ id }, { $set: { ...updateData, updatedAt: new Date() } })

      if (result.matchedCount === 0) {
        throw new Error("Order not found")
      }

      return await this.getOrderById(id)
    } catch (error) {
      console.error("Error updating order:", error)
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

// User Document Operations
export class UserDocumentOperations {
  static async uploadDocument(documentData) {
    try {
      const { db } = await connectToDatabase()

      const document = {
        ...documentData,
        id: new ObjectId().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        verified: false,
      }

      const result = await db.collection(collections.userDocuments).insertOne(document)

      return { ...document, _id: result.insertedId }
    } catch (error) {
      console.error("Error uploading document:", error)
      throw error
    }
  }

  static async getUserDocuments(userId, documentType = null) {
    try {
      const { db } = await connectToDatabase()

      const query = { userId }
      if (documentType) {
        query.documentType = documentType
      }

      const documents = await db.collection(collections.userDocuments).find(query).sort({ createdAt: -1 }).toArray()

      return documents
    } catch (error) {
      console.error("Error fetching user documents:", error)
      throw error
    }
  }

  static async verifyDocument(documentId, verified = true) {
    try {
      const { db } = await connectToDatabase()

      const result = await db.collection(collections.userDocuments).updateOne(
        { id: documentId },
        {
          $set: {
            verified,
            verifiedAt: verified ? new Date() : null,
            updatedAt: new Date(),
          },
        },
      )

      return result.matchedCount > 0
    } catch (error) {
      console.error("Error verifying document:", error)
      throw error
    }
  }
}

// Content Management Operations
export class ContentManagementOperations {
  static async getPageContent(page) {
    try {
      const { db } = await connectToDatabase()

      const content = await db.collection(collections.contentManagement).findOne({ page })

      return content?.content || {}
    } catch (error) {
      console.error("Error fetching page content:", error)
      throw error
    }
  }

  static async getPageSection(page, section) {
    try {
      const { db } = await connectToDatabase()

      const content = await db.collection(collections.contentManagement).findOne({ page, section })

      return content?.content || {}
    } catch (error) {
      console.error("Error fetching page section:", error)
      throw error
    }
  }

  static async updatePageContent(page, section, content) {
    try {
      const { db } = await connectToDatabase()

      const updateData = {
        page,
        section,
        content,
        updatedAt: new Date(),
      }

      const result = await db
        .collection(collections.contentManagement)
        .updateOne({ page, section }, { $set: updateData }, { upsert: true })

      return updateData
    } catch (error) {
      console.error("Error updating page content:", error)
      throw error
    }
  }

  static async getAllContent() {
    try {
      const { db } = await connectToDatabase()

      const content = await db.collection(collections.contentManagement).find({}).toArray()

      return content
    } catch (error) {
      console.error("Error fetching all content:", error)
      throw error
    }
  }
}

// Invoice Operations
export class InvoiceOperations {
  static async generateInvoice(invoiceData) {
    try {
      const { db } = await connectToDatabase()

      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

      const invoice = {
        ...invoiceData,
        id: new ObjectId().toString(),
        invoiceNumber,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      console.log("Creating invoice:", invoice.invoiceNumber)

      const result = await db.collection(collections.invoices).insertOne(invoice)

      console.log("Invoice created successfully with ID:", result.insertedId)

      return { ...invoice, _id: result.insertedId }
    } catch (error) {
      console.error("Error generating invoice:", error)
      throw error
    }
  }

  static async getInvoiceById(id) {
    try {
      const { db } = await connectToDatabase()

      const invoice = await db.collection(collections.invoices).findOne({ id })

      return invoice
    } catch (error) {
      console.error("Error fetching invoice by ID:", error)
      throw error
    }
  }

  static async getInvoiceByOrderId(orderId) {
    try {
      const { db } = await connectToDatabase()

      const invoice = await db.collection(collections.invoices).findOne({ orderId })

      return invoice
    } catch (error) {
      console.error("Error fetching invoice by order ID:", error)
      throw error
    }
  }

  static async getUserInvoices(userId) {
    try {
      const { db } = await connectToDatabase()

      const invoices = await db
        .collection(collections.invoices)
        .find({ "customerInfo.id": userId })
        .sort({ createdAt: -1 })
        .toArray()

      return invoices
    } catch (error) {
      console.error("Error fetching user invoices:", error)
      throw error
    }
  }

  static async getAllInvoices(filters = {}) {
    try {
      const { db } = await connectToDatabase()

      const query = {}

      if (filters.status && filters.status !== "all") {
        query.status = filters.status
      }

      if (filters.search) {
        query.$or = [
          { invoiceNumber: { $regex: filters.search, $options: "i" } },
          { orderId: { $regex: filters.search, $options: "i" } },
          { "customerInfo.name": { $regex: filters.search, $options: "i" } },
          { "customerInfo.email": { $regex: filters.search, $options: "i" } },
        ]
      }

      const invoices = await db.collection(collections.invoices).find(query).sort({ createdAt: -1 }).toArray()

      return invoices
    } catch (error) {
      console.error("Error fetching all invoices:", error)
      throw error
    }
  }

  static async updateInvoice(id, updates) {
    try {
      const { db } = await connectToDatabase()

      const updateData = {
        ...updates,
        updatedAt: new Date(),
      }

      const result = await db.collection(collections.invoices).updateOne({ id }, { $set: updateData })

      if (result.matchedCount === 0) {
        throw new Error("Invoice not found")
      }

      return await this.getInvoiceById(id)
    } catch (error) {
      console.error("Error updating invoice:", error)
      throw error
    }
  }

  static async deleteInvoice(id) {
    try {
      const { db } = await connectToDatabase()

      const result = await db.collection(collections.invoices).deleteOne({ id })

      if (result.deletedCount === 0) {
        throw new Error("Invoice not found")
      }

      return { success: true }
    } catch (error) {
      console.error("Error deleting invoice:", error)
      throw error
    }
  }

  static async generateInvoicePDF(invoice) {
    // This would integrate with a PDF generation library like jsPDF or Puppeteer
    // For now, returning a simple text-based PDF content
    try {
      const pdfContent = `
INVOICE

Invoice Number: ${invoice.invoiceNumber}
Order ID: ${invoice.orderId}
Date: ${new Date(invoice.createdAt).toLocaleDateString()}
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}

BILL TO:
${invoice.customerInfo.name}
${invoice.customerInfo.email}
${invoice.shippingAddress.street}
${invoice.shippingAddress.city}, ${invoice.shippingAddress.state} ${invoice.shippingAddress.zip}

ITEMS:
${invoice.items.map((item) => `${item.name} x ${item.quantity} - $${item.total.toFixed(2)}`).join("\n")}

TOTALS:
Subtotal: $${invoice.totals.subtotal.toFixed(2)}
Tax: $${invoice.totals.tax.toFixed(2)}
Shipping: $${invoice.totals.shipping.toFixed(2)}
Total: $${invoice.totals.total.toFixed(2)}

Thank you for your business!
Greenfields Cannabis
      `

      return Buffer.from(pdfContent, "utf8")
    } catch (error) {
      console.error("Error generating PDF:", error)
      throw error
    }
  }

  static async sendInvoiceEmail(invoice, email, message) {
    // This would integrate with an email service like SendGrid, Nodemailer, etc.
    // For now, we'll simulate sending the email
    try {
      console.log(`Simulating email send to: ${email}`)
      console.log(`Invoice: ${invoice.invoiceNumber}`)
      console.log(`Message: ${message}`)

      // In a real implementation, you would:
      // 1. Generate the PDF
      // 2. Create email with PDF attachment
      // 3. Send via email service
      // 4. Return success/failure status

      return {
        success: true,
        emailId: `email_${Date.now()}`,
        sentAt: new Date(),
        recipient: email,
      }
    } catch (error) {
      console.error("Error sending invoice email:", error)
      throw error
    }
  }
}

// SMS Notification Operations
export class SMSNotificationOperations {
  static async sendSMS(phone, message, orderId = null) {
    try {
      const { db } = await connectToDatabase()

      // Here you would integrate with Twilio or another SMS service
      // For now, we'll simulate the SMS sending

      const notification = {
        id: new ObjectId().toString(),
        phone,
        message,
        orderId,
        status: "delivered", // In real implementation, this would be based on SMS service response
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await db.collection(collections.smsNotifications).insertOne(notification)

      return { ...notification, _id: result.insertedId }
    } catch (error) {
      console.error("Error sending SMS:", error)
      throw error
    }
  }

  static async getNotificationsByOrderId(orderId) {
    try {
      const { db } = await connectToDatabase()

      const notifications = await db
        .collection(collections.smsNotifications)
        .find({ orderId })
        .sort({ createdAt: -1 })
        .toArray()

      return notifications
    } catch (error) {
      console.error("Error fetching notifications by order ID:", error)
      throw error
    }
  }

  static async getAllNotifications() {
    try {
      const { db } = await connectToDatabase()

      const notifications = await db.collection(collections.smsNotifications).find({}).sort({ createdAt: -1 }).toArray()

      return notifications
    } catch (error) {
      console.error("Error fetching all notifications:", error)
      throw error
    }
  }
}

// SMS Settings Operations
export class SMSSettingsOperations {
  static async getSMSSettings() {
    try {
      const { db } = await connectToDatabase()

      let settings = await db.collection(collections.smsSettings).findOne({ type: "main" })

      if (!settings) {
        // Create default settings
        settings = {
          type: "main",
          enabled: true,
          orderConfirmationEnabled: true,
          shippingUpdateEnabled: true,
          deliveryNotificationEnabled: true,
          customMessageTemplate:
            "Thank you for your order! Your order #{orderId} has been confirmed and will be processed shortly.",
          twilioAccountSid: "",
          twilioAuthToken: "",
          twilioPhoneNumber: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        await db.collection(collections.smsSettings).insertOne(settings)
      }

      return settings
    } catch (error) {
      console.error("Error fetching SMS settings:", error)
      throw error
    }
  }

  static async updateSMSSettings(updates) {
    try {
      const { db } = await connectToDatabase()

      const updateData = {
        ...updates,
        type: "main",
        updatedAt: new Date(),
      }

      const result = await db
        .collection(collections.smsSettings)
        .updateOne({ type: "main" }, { $set: updateData }, { upsert: true })

      return await this.getSMSSettings()
    } catch (error) {
      console.error("Error updating SMS settings:", error)
      throw error
    }
  }
}
