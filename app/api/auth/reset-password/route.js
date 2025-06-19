import { NextResponse } from "next/server"
import { connectToDatabase, collections } from "@/lib/mongodb"
import { PasswordHash } from "@/lib/auth"

export async function POST(request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Token and password are required",
        },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 6 characters long",
        },
        { status: 400 },
      )
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Find user with valid reset token
    const user = await db.collection(collections.users).findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired reset token",
        },
        { status: 400 },
      )
    }

    // Hash new password
    const hashedPassword = await PasswordHash.hash(password)

    // Update user password and remove reset token
    await db.collection(collections.users).updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
        },
        $unset: {
          resetToken: "",
          resetTokenExpiry: "",
        },
      },
    )

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset password",
      },
      { status: 500 },
    )
  }
}
