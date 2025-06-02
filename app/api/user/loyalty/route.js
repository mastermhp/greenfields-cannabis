import { NextResponse } from "next/server"
import { UserOperations } from "@/lib/database-operations"
import { verifyAuth } from "@/lib/auth"

export async function GET(request) {
  try {
    // Verify authentication
    const { auth, error: authError } = await verifyAuth(request)
    if (authError || !auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const loyaltyInfo = await UserOperations.getUserLoyalty(auth.userId)

    // Default loyalty info if none exists
    const defaultLoyalty = {
      tier: "bronze",
      points: 0,
      nextTier: "silver",
      pointsToNextTier: 500,
      totalSpent: 0,
      ordersCount: 0,
    }

    return NextResponse.json({
      success: true,
      data: loyaltyInfo || defaultLoyalty,
    })
  } catch (error) {
    console.error("Get loyalty info error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
