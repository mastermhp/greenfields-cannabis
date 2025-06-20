import { NextResponse } from "next/server"
import { UserOperations } from "@/lib/database-operations"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      password,
      confirmPassword,
      role,
      phone,
      street,
      city,
      state,
      zip,
      country,
      status,
      adminCreated,
    } = body

    // Check if this is an admin creating a user
    let isAdminRequest = false
    if (adminCreated) {
      const authHeader = request.headers.get("authorization")
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          {
            success: false,
            error: "Authentication required for admin user creation",
          },
          { status: 401 },
        )
      }

      const token = authHeader.substring(7)
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const adminUser = await UserOperations.getUserById(decoded.userId)

        if (!adminUser || (adminUser.role !== "admin" && !adminUser.isAdmin)) {
          return NextResponse.json(
            {
              success: false,
              error: "Admin privileges required",
            },
            { status: 403 },
          )
        }
        isAdminRequest = true
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid authentication token",
          },
          { status: 401 },
        )
      }
    }

    // Input validation
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, email, and password are required",
        },
        { status: 400 },
      )
    }

    // For non-admin requests, require confirmPassword
    if (!isAdminRequest && !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Password confirmation is required",
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

    // Validate password strength for non-admin requests
    if (!isAdminRequest) {
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
    } else {
      // For admin requests, just check minimum length
      if (password.length < 6) {
        return NextResponse.json(
          {
            success: false,
            error: "Password must be at least 6 characters long",
          },
          { status: 400 },
        )
      }
    }

    // Check password confirmation for non-admin requests
    if (!isAdminRequest && password !== confirmPassword) {
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

    // Generate unique ID
    const userId = uuidv4()

    // Prepare user data
    const userData = {
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || "customer",
      phone: phone || "",
      street: street || "",
      city: city || "",
      state: state || "",
      zip: zip || "",
      country: country || "United States",
      status: status || "active",
      isVerified: adminCreated || false, // Auto-verify admin-created users
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log("Creating user with data:", {
      ...userData,
      password: "[REDACTED]",
    })

    // Create user
    const user = await UserOperations.createUser(userData)

    // Remove password from response
    const { password: _, ...userResponse } = user

    const message = isAdminRequest
      ? `User ${name} has been created successfully by admin`
      : "Account created successfully! You can now log in."

    return NextResponse.json(
      {
        success: true,
        message,
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
