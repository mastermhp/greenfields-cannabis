import { NextResponse } from "next/server"
import { UserOperations } from "@/lib/database-operations"
import { verifyAuth } from "@/lib/auth"

export async function PUT(request, { params }) {
  try {
    const { paymentId } = await params

    // Verify authentication
    const { auth, error: authError } = await verifyAuth(request)
    if (authError || !auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const result = await UserOperations.setDefaultPaymentMethod(auth.userId, paymentId)

    return NextResponse.json({
      success: true,
      data: result,
      message: "Default payment method updated successfully",
    })
  } catch (error) {
    console.error("Set default payment method error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
