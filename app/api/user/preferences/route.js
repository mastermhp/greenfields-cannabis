import { NextResponse } from "next/server"
import { UserOperations } from "@/lib/database-operations"
import { verifyAuth } from "@/lib/auth"

export async function PUT(request) {
  try {
    // Verify authentication
    const { auth, error: authError } = await verifyAuth(request)
    if (authError || !auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { orderUpdates, promotions, news } = body

    const preferences = {
      orderUpdates: orderUpdates !== undefined ? orderUpdates : true,
      promotions: promotions !== undefined ? promotions : true,
      news: news !== undefined ? news : true,
    }

    const result = await UserOperations.updateUserPreferences(auth.userId, preferences)

    return NextResponse.json({
      success: true,
      data: result,
      message: "Preferences updated successfully",
    })
  } catch (error) {
    console.error("Update preferences error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
