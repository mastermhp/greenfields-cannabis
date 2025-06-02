import { NextResponse } from "next/server"
import { UserOperations } from "@/lib/database-operations"
import { verifyAuth } from "@/lib/auth"

export async function GET(request) {
  try {
    console.log("GET /api/user/wishlist - Checking auth")

    // Verify authentication
    const { auth, error: authError } = await verifyAuth(request)

    console.log("Auth result:", auth ? "Authenticated" : "Not authenticated", authError || "")

    if (authError || !auth) {
      console.log("Unauthorized access to wishlist")
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    console.log("Fetching wishlist for user:", auth.userId)
    const wishlist = await UserOperations.getUserWishlist(auth.userId)
    console.log("Wishlist fetched:", wishlist?.length || 0, "items")

    return NextResponse.json({
      success: true,
      data: wishlist || [],
    })
  } catch (error) {
    console.error("Get wishlist error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    // Verify authentication
    const { auth, error: authError } = await verifyAuth(request)
    if (authError || !auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 })
    }

    const result = await UserOperations.addToWishlist(auth.userId, productId)

    return NextResponse.json({
      success: true,
      data: result,
      message: "Product added to wishlist",
    })
  } catch (error) {
    console.error("Add to wishlist error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
