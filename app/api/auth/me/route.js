import { NextResponse } from "next/server"
import { UserOperations } from "@/lib/database-operations"
import jwt from "jsonwebtoken"

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No access token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Verify access token
    let tokenPayload
    try {
      tokenPayload = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      console.error("Token verification failed:", error)
      return NextResponse.json({ error: "Invalid access token" }, { status: 401 })
    }

    // Get user
    const user = await UserOperations.getUserById(tokenPayload.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
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
