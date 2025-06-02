import { NextResponse } from "next/server"
import { UserOperations } from "@/lib/database-operations"
import { verifyAuth } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function PUT(request) {
  try {
    // Verify authentication
    const { auth, error: authError } = await verifyAuth(request)
    if (authError || !auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: "Current and new passwords are required" }, { status: 400 })
    }

    // Validate new password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must contain uppercase, lowercase, number, and special character",
        },
        { status: 400 },
      )
    }

    // Get current user
    const user = await UserOperations.getUserById(auth.userId)
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ success: false, error: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    const result = await UserOperations.updateUser(auth.userId, {
      password: hashedNewPassword,
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
