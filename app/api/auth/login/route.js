// Fix the login API to ensure it returns a proper JWT token

import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { UserOperations } from "@/lib/database-operations"
import { cookies } from "next/headers"

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password, rememberMe } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    // Find user by email
    const user = await UserOperations.getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // Create JWT tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role || "customer" },
      process.env.JWT_SECRET,
      { expiresIn: rememberMe ? "7d" : "24h" },
    )

    const refreshToken = jwt.sign(
      { userId: user.id, tokenVersion: user.tokenVersion || 0 },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: "30d" },
    )

    // Set refresh token in HTTP-only cookie
    const cookieStore = cookies()
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    // Update user's last login
    await UserOperations.updateUser(user.id, {
      lastLogin: new Date(),
      loginAttempts: 0,
    })

    // Remove password from response
    const { password: _, ...userResponse } = user

    console.log("Login successful for:", email)
    console.log("Generated access token:", accessToken.substring(0, 20) + "...")

    return NextResponse.json({
      success: true,
      user: userResponse,
      accessToken,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 })
  }
}
