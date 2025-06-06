import { NextResponse } from "next/server"
import { UserOperations } from "@/lib/database-operations"
import jwt from "jsonwebtoken"

export async function GET(request) {
  try {
    // Check authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      )
    }

    const token = authHeader.substring(7)
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid token",
        },
        { status: 401 },
      )
    }

    // Check if user is admin
    const user = await UserOperations.getUserById(decoded.userId)
    if (!user || (user.role !== "admin" && !user.isAdmin)) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required",
        },
        { status: 403 },
      )
    }

    // Get all users
    const users = await UserOperations.getAllUsers()

    // Remove passwords from response
    const sanitizedUsers = users.map(({ password, ...user }) => user)

    return NextResponse.json({
      success: true,
      data: sanitizedUsers,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request) {
  try {
    // Check authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      )
    }

    const token = authHeader.substring(7)
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid token",
        },
        { status: 401 },
      )
    }

    // Check if user is admin
    const adminUser = await UserOperations.getUserById(decoded.userId)
    if (!adminUser || (adminUser.role !== "admin" && !adminUser.isAdmin)) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required",
        },
        { status: 403 },
      )
    }

    // Forward to register endpoint with admin flag
    const body = await request.json()
    const registerRequest = new Request(new URL("/api/auth/register", request.url), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("authorization"),
      },
      body: JSON.stringify({
        ...body,
        adminCreated: true,
      }),
    })

    return fetch(registerRequest)
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create user",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
