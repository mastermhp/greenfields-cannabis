import { NextResponse } from "next/server"
import { UserOperations } from "@/lib/database-operations"
import jwt from "jsonwebtoken"

export async function POST(request) {
  try {
    const refreshToken = request.cookies.get("refreshToken")?.value

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token provided" }, { status: 401 })
    }

    // Verify refresh token
    let tokenPayload
    try {
      tokenPayload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    } catch (error) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
    }

    // Get user
    const user = await UserOperations.getUserById(tokenPayload.userId)
    if (!user || !user.isActive) {
      return NextResponse.json({ error: "User not found or inactive" }, { status: 401 })
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin || user.role === "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    )

    // Remove password from response
    const { password: _, ...userResponse } = user

    const response = NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      user: userResponse,
    })

    // Update access token cookie
    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
