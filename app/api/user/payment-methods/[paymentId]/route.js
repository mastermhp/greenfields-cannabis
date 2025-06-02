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

    const body = await request.json()
    const { type, cardNumber, nameOnCard, expMonth, expYear, default: isDefault } = body

    const updateData = {
      type: type?.toLowerCase(),
      nameOnCard: nameOnCard?.trim(),
      expMonth,
      expYear,
      default: isDefault || false,
      updatedAt: new Date(),
    }

    // Only update card number if provided (not masked)
    if (cardNumber && !cardNumber.startsWith("*")) {
      updateData.last4 = cardNumber.slice(-4)
    }

    const result = await UserOperations.updateUserPaymentMethod(auth.userId, paymentId, updateData)

    return NextResponse.json({
      success: true,
      data: result,
      message: "Payment method updated successfully",
    })
  } catch (error) {
    console.error("Update payment method error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { paymentId } = await params

    // Verify authentication
    const { auth, error: authError } = await verifyAuth(request)
    if (authError || !auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const result = await UserOperations.deleteUserPaymentMethod(auth.userId, paymentId)

    return NextResponse.json({
      success: true,
      data: result,
      message: "Payment method deleted successfully",
    })
  } catch (error) {
    console.error("Delete payment method error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
