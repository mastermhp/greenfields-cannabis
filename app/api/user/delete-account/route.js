import { NextResponse } from "next/server"
import { UserOperations } from "@/lib/database-operations"
import { verifyAuth } from "@/lib/auth"
import { cloudinary } from "@/lib/cloudinary"

export async function DELETE(request) {
  try {
    // Verify authentication
    const { auth, error: authError } = await verifyAuth(request)
    if (authError || !auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Get user data before deletion
    const user = await UserOperations.getUserById(auth.userId)
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Delete profile picture from Cloudinary if exists
    if (user.profilePictureId) {
      try {
        await cloudinary.uploader.destroy(user.profilePictureId)
      } catch (cloudinaryError) {
        console.error("Error deleting profile picture from Cloudinary:", cloudinaryError)
        // Continue with account deletion even if Cloudinary deletion fails
      }
    }

    // Delete all user-related data
    await UserOperations.deleteUserAccount(auth.userId)

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    })
  } catch (error) {
    console.error("Delete account error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
