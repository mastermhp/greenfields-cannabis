// Custom authentication utilities without external dependencies

export class PasswordHash {
  static async hash(password) {
    // Generate a random salt
    const salt = crypto.getRandomValues(new Uint8Array(32))

    // Convert password to ArrayBuffer
    const encoder = new TextEncoder()
    const passwordBuffer = encoder.encode(password)

    // Import key for PBKDF2
    const keyMaterial = await crypto.subtle.importKey("raw", passwordBuffer, { name: "PBKDF2" }, false, ["deriveBits"])

    // Derive key using PBKDF2
    const derivedKey = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      256,
    )

    // Combine salt and derived key
    const hashArray = new Uint8Array(salt.length + derivedKey.byteLength)
    hashArray.set(salt)
    hashArray.set(new Uint8Array(derivedKey), salt.length)

    // Convert to base64
    return btoa(String.fromCharCode(...hashArray))
  }

  static async verify(password, hash) {
    try {
      // Decode the hash
      const hashArray = new Uint8Array(
        atob(hash)
          .split("")
          .map((c) => c.charCodeAt(0)),
      )

      // Extract salt (first 32 bytes)
      const salt = hashArray.slice(0, 32)
      const storedKey = hashArray.slice(32)

      // Convert password to ArrayBuffer
      const encoder = new TextEncoder()
      const passwordBuffer = encoder.encode(password)

      // Import key for PBKDF2
      const keyMaterial = await crypto.subtle.importKey("raw", passwordBuffer, { name: "PBKDF2" }, false, [
        "deriveBits",
      ])

      // Derive key using same parameters
      const derivedKey = await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt: salt,
          iterations: 100000,
          hash: "SHA-256",
        },
        keyMaterial,
        256,
      )

      // Compare keys
      const derivedKeyArray = new Uint8Array(derivedKey)

      // Constant-time comparison
      if (derivedKeyArray.length !== storedKey.length) {
        return false
      }

      let result = 0
      for (let i = 0; i < derivedKeyArray.length; i++) {
        result |= derivedKeyArray[i] ^ storedKey[i]
      }

      return result === 0
    } catch (error) {
      console.error("Password verification error:", error)
      return false
    }
  }
}

export class AuthToken {
  static secretKey =
    process.env.JWT_SECRET || process.env.AUTH_SECRET_KEY || "your-super-secret-key-change-in-production"

  static async create(payload, expiresIn = "1h") {
    const now = Math.floor(Date.now() / 1000)
    let exp

    if (typeof expiresIn === "string") {
      const unit = expiresIn.slice(-1)
      const value = Number.parseInt(expiresIn.slice(0, -1))

      switch (unit) {
        case "h":
          exp = now + value * 60 * 60
          break
        case "d":
          exp = now + value * 24 * 60 * 60
          break
        case "m":
          exp = now + value * 60
          break
        default:
          exp = now + 3600 // 1 hour default
      }
    } else {
      exp = now + expiresIn
    }

    const header = {
      alg: "HS256",
      typ: "JWT",
    }

    const tokenPayload = {
      ...payload,
      iat: now,
      exp: exp,
      jti: crypto.randomUUID(),
    }

    try {
      // Use base64url encoding for JWT
      const encodedHeader = this.base64UrlEncode(JSON.stringify(header))
      const encodedPayload = this.base64UrlEncode(JSON.stringify(tokenPayload))
      const data = `${encodedHeader}.${encodedPayload}`

      // Create HMAC signature using Web Crypto API
      const signature = await this.createHMAC(data, this.secretKey)
      const encodedSignature = this.base64UrlEncode(signature)

      return `${data}.${encodedSignature}`
    } catch (error) {
      console.error("Token creation error:", error)
      throw new Error("Failed to create authentication token")
    }
  }

  static async verify(token) {
    try {
      console.log("Verifying token with AuthToken.verify")

      if (!token || typeof token !== "string") {
        console.log("Invalid token format")
        return null
      }

      const parts = token.split(".")
      if (parts.length !== 3) {
        console.log("Token does not have 3 parts")
        return null
      }

      const [encodedHeader, encodedPayload, encodedSignature] = parts
      const data = `${encodedHeader}.${encodedPayload}`

      // Verify signature
      const expectedSignature = await this.createHMAC(data, this.secretKey)
      const expectedEncodedSignature = this.base64UrlEncode(expectedSignature)

      if (encodedSignature !== expectedEncodedSignature) {
        console.log("Signature verification failed")
        console.log("Expected:", expectedEncodedSignature.substring(0, 20))
        console.log("Received:", encodedSignature.substring(0, 20))
        return null
      }

      // Decode payload
      const payload = JSON.parse(this.base64UrlDecode(encodedPayload))

      // Check expiration
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < now) {
        console.log("Token expired")
        return null
      }

      console.log("Token verified successfully:", { userId: payload.userId, email: payload.email })
      return payload
    } catch (error) {
      console.error("Token verification error:", error)
      return null
    }
  }

  // Base64 URL encoding (JWT standard)
  static base64UrlEncode(str) {
    if (typeof str === "string") {
      return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
    } else {
      // For ArrayBuffer/Uint8Array
      const bytes = new Uint8Array(str)
      const binary = String.fromCharCode(...bytes)
      return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
    }
  }

  // Base64 URL decoding
  static base64UrlDecode(str) {
    // Add padding if needed
    const padded = str + "===".slice((str.length + 3) % 4)
    const base64 = padded.replace(/-/g, "+").replace(/_/g, "/")
    return atob(base64)
  }

  // HMAC using Web Crypto API
  static async createHMAC(data, key) {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(key)
    const messageData = encoder.encode(data)

    const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData)
    return signature
  }
}

export class Validator {
  static email(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  }

  static password(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return passwordRegex.test(password)
  }

  static name(name) {
    return name && name.trim().length >= 2 && name.trim().length <= 50
  }

  static sanitizeInput(input) {
    if (typeof input !== "string") return ""
    return input.trim().replace(/[<>]/g, "")
  }
}

export class RateLimiter {
  static attempts = new Map()
  static blocked = new Map()

  static isBlocked(identifier) {
    const blockData = this.blocked.get(identifier)
    if (!blockData) return false

    if (Date.now() > blockData.expiresAt) {
      this.blocked.delete(identifier)
      return false
    }

    return true
  }

  static recordAttempt(identifier, success) {
    if (success) {
      this.attempts.delete(identifier)
      this.blocked.delete(identifier)
      return
    }

    const now = Date.now()
    const attemptData = this.attempts.get(identifier) || { count: 0, firstAttempt: now }

    attemptData.count++
    attemptData.lastAttempt = now

    this.attempts.set(identifier, attemptData)

    // Block after 5 failed attempts
    if (attemptData.count >= 5) {
      const blockDuration = Math.min(attemptData.count * 60000, 3600000) // Max 1 hour
      this.blocked.set(identifier, {
        expiresAt: now + blockDuration,
      })
    }
  }

  static getRemainingAttempts(identifier) {
    const attemptData = this.attempts.get(identifier)
    if (!attemptData) return 5
    return Math.max(0, 5 - attemptData.count)
  }
}

export class SessionManager {
  static sessions = new Map()

  static createSession(userId, userAgent, ipAddress) {
    const sessionId = crypto.randomUUID()
    const session = {
      id: sessionId,
      userId,
      userAgent,
      ipAddress,
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true,
    }

    this.sessions.set(sessionId, session)
    return sessionId
  }

  static getSession(sessionId) {
    return this.sessions.get(sessionId)
  }

  static updateActivity(sessionId) {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.lastActivity = new Date()
      this.sessions.set(sessionId, session)
    }
  }

  static revokeSession(sessionId) {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.isActive = false
      this.sessions.set(sessionId, session)
    }
  }

  static revokeAllUserSessions(userId) {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        session.isActive = false
        this.sessions.set(sessionId, session)
      }
    }
  }
}

export class CSRFProtection {
  static tokens = new Map()

  static generateToken(sessionId) {
    const token = crypto.randomUUID()
    this.tokens.set(token, {
      sessionId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
    })
    return token
  }

  static validateToken(token, sessionId) {
    const tokenData = this.tokens.get(token)
    if (!tokenData) return false

    if (Date.now() > tokenData.expiresAt) {
      this.tokens.delete(token)
      return false
    }

    return tokenData.sessionId === sessionId
  }
}

// Enhanced auth verification function
export async function verifyAuth(request) {
  try {
    console.log("Verifying auth for request:", request.url)

    // Get token from authorization header
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization")
    console.log("Auth header present:", !!authHeader)
    console.log("Auth header value:", authHeader ? authHeader.substring(0, 20) + "..." : "none")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No valid auth header found")
      return { auth: null, error: "No authentication token provided" }
    }

    const token = authHeader.replace("Bearer ", "").trim()
    console.log("Token extracted, length:", token.length)
    console.log("Token preview:", token ? token.substring(0, 20) + "..." + token.substring(token.length - 10) : "empty")

    // Validate token format
    if (!token || token.length < 10) {
      console.log("Invalid token format")
      return { auth: null, error: "Invalid token format" }
    }

    // Check if token has proper JWT structure (3 parts separated by dots)
    const tokenParts = token.split(".")
    if (tokenParts.length !== 3) {
      console.log("Token does not have 3 parts, parts count:", tokenParts.length)
      return { auth: null, error: "Invalid token structure" }
    }

    // Use our custom AuthToken class
    const decoded = await AuthToken.verify(token)

    if (!decoded) {
      console.log("Token verification failed")
      return { auth: null, error: "Invalid or expired token" }
    }

    console.log("Token verified successfully for user:", decoded.userId || decoded.id)

    // Ensure we have a userId field
    if (!decoded.userId && decoded.id) {
      decoded.userId = decoded.id
    }

    return { auth: decoded, error: null }
  } catch (error) {
    console.error("Auth verification error:", error.message)
    return { auth: null, error: "Authentication failed" }
  }
}
