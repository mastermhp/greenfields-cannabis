import { NextResponse } from "next/server"
import { UserOperations } from "@/lib/database-operations"
import { verifyAuth } from "@/lib/auth"

export async function GET(request) {
  try {
    console.log("GET /api/user/profile - Checking auth")

    // Verify authentication
    const { auth, error: authError } = await verifyAuth(request)

    console.log("Auth result:", auth ? "Authenticated" : "Not authenticated", authError || "")

    if (authError || !auth) {
      console.log("Unauthorized access to profile")
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    console.log("Fetching profile for user:", auth.userId)
    const user = await UserOperations.getUserById(auth.userId)

    if (!user) {
      console.log("User not found:", auth.userId)
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Remove sensitive data
    const { password, ...userProfile } = user
    console.log("Profile fetched successfully")

    return NextResponse.json({
      success: true,
      data: userProfile,
    })
  } catch (error) {
    console.error("Get user profile error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    // Verify authentication
    const { auth, error: authError } = await verifyAuth(request)
    if (authError || !auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, bio, profilePicture, profilePictureId } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ success: false, error: "Name and email are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    // Check if email is already taken by another user
    const existingUser = await UserOperations.getUserByEmail(email)
    if (existingUser && existingUser.id !== auth.userId) {
      return NextResponse.json({ success: false, error: "Email is already taken" }, { status: 409 })
    }

    // Update user profile
    const updateData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || "",
      bio: bio?.trim() || "",
      profilePicture: profilePicture || "",
      profilePictureId: profilePictureId || "",
      updatedAt: new Date(),
    }

    const updatedUser = await UserOperations.updateUser(auth.userId, updateData)

    // Remove sensitive data
    const { password, ...userProfile } = updatedUser

    return NextResponse.json({
      success: true,
      data: userProfile,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Update user profile error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
