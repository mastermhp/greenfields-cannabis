import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    // Clear cookies
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })

    // Clear all auth-related cookies
    response.cookies.delete("refreshToken")
    response.cookies.delete("sessionId")
    response.cookies.delete("accessToken")

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
