import { NextResponse } from "next/server"
import { OrderOperations } from "@/lib/database-operations"
import { verifyAuth } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    const { userId } = await params

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    // Verify authentication
    const { auth, error: authError } = await verifyAuth(request)
    if (authError || !auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Check if the authenticated user is requesting their own orders or is an admin
    if (auth.userId !== userId && auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const orders = await OrderOperations.getUserOrders(userId)

    return NextResponse.json({
      success: true,
      data: orders || [],
    })
  } catch (error) {
    console.error("Get user orders error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
