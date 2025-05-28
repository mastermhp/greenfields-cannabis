import { NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { SessionManager, CSRFProtection } from "@/lib/auth"

export async function POST(request) {
  try {
    const sessionId = request.cookies.get("sessionId")?.value
    const refreshToken = request.cookies.get("refreshToken")?.value

    if (sessionId) {
      // Destroy session
      SessionManager.destroySession(sessionId)

      // Delete CSRF token
      CSRFProtection.deleteToken(sessionId)
    }

    if (refreshToken) {
      // Revoke refresh token
      await Database.revokeRefreshToken(refreshToken)
    }

    // Clear cookies
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })

    response.cookies.delete("refreshToken")
    response.cookies.delete("sessionId")

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
