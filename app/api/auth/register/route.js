import { NextResponse } from "next/server"
import { UserOperations } from "@/lib/database-operations"
import bcrypt from "bcryptjs"

export async function POST(request) {
  try {
    const { name, email, password, confirmPassword } = await request.json()

    // Input validation
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "All fields are required",
        },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid email address",
        },
        { status: 400 },
      )
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
        },
        { status: 400 },
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Passwords do not match",
        },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUser = await UserOperations.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email already exists",
        },
        { status: 409 },
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await UserOperations.createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "customer",
      isAdmin: false,
      status: "active",
      loyaltyTier: "bronze",
      loyaltyPoints: 100, // Welcome bonus
    })

    // Remove password from response
    const { password: _, ...userResponse } = user

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully! You can now log in.",
        user: userResponse,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong. Please try again.",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
