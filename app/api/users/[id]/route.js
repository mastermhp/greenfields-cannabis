import { NextResponse } from "next/server"
import { UserOperations } from "@/lib/database-operations"
import jwt from "jsonwebtoken"

export async function PATCH(request, { params }) {
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

    const { id } = params
    const body = await request.json()

    // Update user
    const updatedUser = await UserOperations.updateUser(id, body)

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      )
    }

    // Remove password from response
    const { password, ...sanitizedUser } = updatedUser

    return NextResponse.json({
      success: true,
      data: sanitizedUser,
      message: "User updated successfully",
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request, { params }) {
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

    const { id } = params

    // Delete user
    const deletedUser = await UserOperations.deleteUser(id)

    if (!deletedUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
