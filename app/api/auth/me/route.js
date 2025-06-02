import { NextResponse } from "next/server"
import { UserOperations } from "@/lib/database-operations"
import jwt from "jsonwebtoken"

export async function GET(request) {
  try {
    console.log("GET /api/auth/me - Checking auth")

    const authHeader = request.headers.get("authorization")
    console.log("Auth header:", authHeader ? "Present" : "Missing")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No valid auth header found")
      return NextResponse.json({ error: "No access token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    console.log("Token extracted:", token.substring(0, 10) + "...")

    // Verify access token
    let tokenPayload
    try {
      tokenPayload = jwt.verify(token, process.env.JWT_SECRET)
      console.log("Token verified successfully:", tokenPayload)
    } catch (error) {
      console.error("Token verification failed:", error.message)
      return NextResponse.json({ error: "Invalid access token" }, { status: 401 })
    }

    // Get user
    console.log("Fetching user with ID:", tokenPayload.userId)
    const user = await UserOperations.getUserById(tokenPayload.userId)

    if (!user) {
      console.log("User not found:", tokenPayload.userId)
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    // Remove password from response
    const { password: _, ...userResponse } = user
    console.log("User fetched successfully")

    return NextResponse.json({
      success: true,
      user: userResponse,
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
