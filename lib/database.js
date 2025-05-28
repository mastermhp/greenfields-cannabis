// In-memory database simulation (replace with your actual database)
export class Database {
  static users = new Map()
  static refreshTokens = new Map()
  static loginAttempts = new Map()

  // User operations
  static async createUser(userData) {
    const userId = crypto.randomUUID()
    const user = {
      id: userId,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      emailVerified: false,
      loginAttempts: 0,
      lastLogin: null,
    }

    this.users.set(userId, user)
    return user
  }

  static async getUserById(id) {
    return this.users.get(id) || null
  }

  static async getUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user
      }
    }
    return null
  }

  static async updateUser(id, updates) {
    const user = this.users.get(id)
    if (!user) return null

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    }

    this.users.set(id, updatedUser)
    return updatedUser
  }

  static async deleteUser(id) {
    return this.users.delete(id)
  }

  // Refresh token operations
  static async storeRefreshToken(userId, token, expiresAt) {
    const tokenData = {
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
      isRevoked: false,
    }

    this.refreshTokens.set(token, tokenData)
    return tokenData
  }

  static async getRefreshToken(token) {
    return this.refreshTokens.get(token) || null
  }

  static async revokeRefreshToken(token) {
    const tokenData = this.refreshTokens.get(token)
    if (tokenData) {
      tokenData.isRevoked = true
      this.refreshTokens.set(token, tokenData)
    }
    return tokenData
  }

  static async revokeAllUserRefreshTokens(userId) {
    for (const [token, tokenData] of this.refreshTokens.entries()) {
      if (tokenData.userId === userId) {
        tokenData.isRevoked = true
        this.refreshTokens.set(token, tokenData)
      }
    }
  }

  // Initialize with admin user
  static async initialize() {
    const { PasswordHash } = await import("./auth.js")

    // Create admin user if not exists
    const adminEmail = "admin@greenfields.com"
    const existingAdmin = await this.getUserByEmail(adminEmail)

    if (!existingAdmin) {
      const hashedPassword = await PasswordHash.hash("admin123")
      await this.createUser({
        name: "Admin User",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        isAdmin: true,
        emailVerified: true,
      })
    }
  }
}

// Initialize database
Database.initialize()
