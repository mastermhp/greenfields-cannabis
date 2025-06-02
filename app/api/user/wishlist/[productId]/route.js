import { NextResponse } from "next/server"
import { UserOperations } from "@/lib/database-operations"
import { verifyAuth } from "@/lib/auth"

export async function DELETE(request, { params }) {
  try {
    const { productId } = await params

    // Verify authentication
    const { auth, error: authError } = await verifyAuth(request)
    if (authError || !auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 })
    }

    const result = await UserOperations.removeFromWishlist(auth.userId, productId)

    return NextResponse.json({
      success: true,
      data: result,
      message: "Product removed from wishlist",
    })
  } catch (error) {
    console.error("Remove from wishlist error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
