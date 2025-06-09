import { NextResponse } from "next/server"
import { UserOperations } from "@/lib/database-operations"
import { verifyAuth } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (authResult.error) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    const user = await UserOperations.getUserById(id)

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Remove sensitive information
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (authResult.error) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 })
    }

    const { id } = params
    const updateData = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await UserOperations.getUserById(id)
    if (!existingUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Update user
    const updatedUser = await UserOperations.updateUser(id, updateData)

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 })
    }

    // Remove sensitive information
    const { password, ...userWithoutPassword } = updatedUser

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      message: "User updated successfully",
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (authResult.error) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await UserOperations.getUserById(id)
    if (!existingUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Delete user account
    const result = await UserOperations.deleteUserAccount(id)

    if (!result.success) {
      return NextResponse.json({ success: false, error: "Failed to delete user" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ success: false, error: "Failed to delete user" }, { status: 500 })
  }
}
