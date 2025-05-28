import { NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { AuthToken, SessionManager } from "@/lib/auth"

export async function POST(request) {
  try {
    const refreshToken = request.cookies.get("refreshToken")?.value
    const sessionId = request.cookies.get("sessionId")?.value

    if (!refreshToken || !sessionId) {
      return NextResponse.json({ error: "No refresh token provided" }, { status: 401 })
    }

    // Verify refresh token
    let tokenPayload
    try {
      tokenPayload = AuthToken.verify(refreshToken)
    } catch (error) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
    }

    // Check if token is in database and not revoked
    const storedToken = await Database.getRefreshToken(refreshToken)
    if (!storedToken || storedToken.isRevoked) {
      return NextResponse.json({ error: "Refresh token revoked" }, { status: 401 })
    }

    // Verify session
    const session = SessionManager.getSession(sessionId)
    if (!session || session.userId !== tokenPayload.userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Get user
    const user = await Database.getUserById(tokenPayload.userId)
    if (!user || !user.isActive) {
      return NextResponse.json({ error: "User not found or inactive" }, { status: 401 })
    }

    // Generate new access token
    const newAccessToken = AuthToken.create(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId,
      },
      "1h",
    )

    // Remove password from response
    const { password: _, ...userResponse } = user

    return NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      user: userResponse,
    })
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
