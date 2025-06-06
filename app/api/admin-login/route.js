import { NextResponse } from "next/server"
import { AuthToken, PasswordHash, RateLimiter, Validator } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { initializeDatabase } from "@/lib/database-operations"
import bcrypt from "bcryptjs"

// Initialize database on first request
let initialized = false

async function ensureInitialized() {
  if (!initialized) {
    await initializeDatabase()
    initialized = true
  }
}

export async function POST(request) {
  try {
    console.log("Admin login attempt started")

    await ensureInitialized()

    const { email, password } = await request.json()

    // Get client IP for rate limiting
    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const identifier = `admin-login:${clientIP}:${email}`

    // Check rate limiting
    if (RateLimiter.isBlocked(identifier)) {
      console.log("Rate limit exceeded for:", identifier)
      return NextResponse.json(
        {
          success: false,
          error: "Too many failed attempts. Please try again later.",
        },
        { status: 429 },
      )
    }

    // Validate input
    if (!email || !password) {
      RateLimiter.recordAttempt(identifier, false)
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 },
      )
    }

    if (!Validator.email(email)) {
      RateLimiter.recordAttempt(identifier, false)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email format",
        },
        { status: 400 },
      )
    }

    console.log("Attempting to connect to database...")
    const { db } = await connectToDatabase()

    // Find admin user
    console.log("Looking for admin user with email:", email)
    const adminUser = await db.collection("users").findOne({
      email: email.toLowerCase(),
      role: "admin",
    })

    if (!adminUser) {
      console.log("Admin user not found")
      RateLimiter.recordAttempt(identifier, false)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid admin credentials",
        },
        { status: 401 },
      )
    }

    console.log("Admin user found, verifying password...")
    console.log("Stored password type:", typeof adminUser.password)
    console.log("Stored password length:", adminUser.password?.length)
    console.log("Input password:", password)

    // Verify password with multiple methods
    let passwordValid = false

    if (adminUser.password) {
      // Method 1: Try bcrypt verification (for properly hashed passwords)
      try {
        console.log("Trying bcrypt verification...")
        passwordValid = await bcrypt.compare(password, adminUser.password)
        console.log("Bcrypt verification result:", passwordValid)
      } catch (bcryptError) {
        console.log("Bcrypt verification failed:", bcryptError.message)
      }

      // Method 2: Try our custom PasswordHash verification
      if (!passwordValid) {
        try {
          console.log("Trying custom PasswordHash verification...")
          passwordValid = await PasswordHash.verify(password, adminUser.password)
          console.log("Custom PasswordHash verification result:", passwordValid)
        } catch (customError) {
          console.log("Custom PasswordHash verification failed:", customError.message)
        }
      }

      // Method 3: Direct comparison (for plain text passwords in development)
      if (!passwordValid) {
        console.log("Trying direct password comparison...")
        passwordValid = password === adminUser.password
        console.log("Direct comparison result:", passwordValid)
      }
    }

    if (!passwordValid) {
      console.log("All password verification methods failed")
      RateLimiter.recordAttempt(identifier, false)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid admin credentials",
        },
        { status: 401 },
      )
    }

    console.log("Password verified successfully")

    // Create JWT token with our custom AuthToken class
    const tokenPayload = {
      userId: adminUser._id.toString(),
      email: adminUser.email,
      role: adminUser.role,
      isAdmin: true,
    }

    const accessToken = await AuthToken.create(tokenPayload, "1h")
    const refreshToken = await AuthToken.create(tokenPayload, "7d")

    console.log("Tokens created successfully")

    // Record successful attempt
    RateLimiter.recordAttempt(identifier, true)

    // Update last login
    await db.collection("users").updateOne(
      { _id: adminUser._id },
      {
        $set: {
          lastLogin: new Date(),
          lastLoginIP: clientIP,
        },
      },
    )

    // Set HTTP-only cookie for refresh token
    const response = NextResponse.json({
      success: true,
      message: "Admin login successful",
      accessToken,
      user: {
        id: adminUser._id.toString(),
        email: adminUser.email,
        role: adminUser.role,
        isAdmin: true,
      },
    })

    // Set secure cookies
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    response.cookies.set("accessToken", accessToken, {
      httpOnly: false, // Allow JavaScript access for API calls
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    })

    console.log("Admin login successful for:", email)
    return response
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
