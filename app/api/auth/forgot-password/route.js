import { NextResponse } from "next/server"
import { connectToDatabase, collections } from "@/lib/mongodb"
import crypto from "crypto"

export async function POST(request) {
  try {
    const { email } = await request.json()

    console.log("Password reset request for:", email)

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a valid email address",
        },
        { status: 400 },
      )
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Find user by email (case insensitive)
    const user = await db.collection(collections.users).findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    })

    console.log("User found:", user ? "Yes" : "No")

    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, we've sent a password reset link.",
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Save reset token to user
    await db.collection(collections.users).updateOne(
      { _id: user._id },
      {
        $set: {
          resetToken,
          resetTokenExpiry,
          resetTokenCreated: new Date(),
        },
      },
    )

    console.log("Reset token generated and saved for user:", user.email)

    // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`

    return NextResponse.json({
      success: true,
      message: "Password reset link generated successfully.",
      resetLink, // Send back to client for EmailJS
      // Remove this in production - only for testing
      ...(process.env.NODE_ENV === "development" && {
        debug: {
          userFound: true,
          resetToken,
          resetLink,
        },
      }),
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process password reset request",
      },
      { status: 500 },
    )
  }
}
