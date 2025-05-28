import { NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { AuthToken, SessionManager } from "@/lib/auth"

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization")
    const sessionId = request.cookies.get("sessionId")?.value

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No access token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Verify access token
    let tokenPayload
    try {
      tokenPayload = AuthToken.verify(token)
    } catch (error) {
      return NextResponse.json({ error: "Invalid access token" }, { status: 401 })
    }

    // Verify session
    if (sessionId) {
      const session = SessionManager.getSession(sessionId)
      if (!session || session.userId !== tokenPayload.userId) {
        return NextResponse.json({ error: "Invalid session" }, { status: 401 })
      }
    }

    // Get user
    const user = await Database.getUserById(tokenPayload.userId)
    if (!user || !user.isActive) {
      return NextResponse.json({ error: "User not found or inactive" }, { status: 401 })
    }

    // Remove password from response
    const { password: _, ...userResponse } = user

    return NextResponse.json({
      success: true,
      user: userResponse,
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
