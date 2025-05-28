import { NextResponse } from "next/server"
import { UserOperations } from "@/lib/database-operations"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request) {
  try {
    const { email, password, rememberMe } = await request.json()

    console.log("Login attempt for:", email)

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 },
      )
    }

    // Find user by email
    const user = await UserOperations.getUserByEmail(email.toLowerCase())
    console.log("User found:", user ? "Yes" : "No")

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "Your account has been deactivated. Please contact support.",
        },
        { status: 403 },
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    console.log("Password valid:", isValidPassword)

    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    // Update user last login
    await UserOperations.updateUser(user.id, {
      lastLogin: new Date(),
      loginAttempts: 0,
    })

    // Generate JWT tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin || user.role === "admin",
    }

    const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: rememberMe ? "7d" : "1h",
    })

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        type: "refresh",
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: rememberMe ? "30d" : "7d",
      },
    )

    // Remove password from response
    const { password: _, ...userResponse } = user

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Login successful!",
      user: userResponse,
      accessToken,
    })

    // Set HTTP-only cookies
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60,
      path: "/",
    })

    response.cookies.set("accessToken", accessToken, {
      httpOnly: false, // Allow JavaScript access for API calls
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: rememberMe ? 7 * 24 * 60 * 60 : 60 * 60,
      path: "/",
    })

    console.log("Login successful for:", email)

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong. Please try again.",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
