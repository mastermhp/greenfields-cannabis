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

    const paymentMethods = await UserOperations.getUserPaymentMethods(auth.userId)

    return NextResponse.json({
      success: true,
      data: paymentMethods || [],
    })
  } catch (error) {
    console.error("Get payment methods error:", error)
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
    const { type, cardNumber, nameOnCard, expMonth, expYear, cvv, default: isDefault } = body

    // Validate required fields
    if (!type || !cardNumber || !nameOnCard || !expMonth || !expYear || !cvv) {
      return NextResponse.json({ success: false, error: "All payment method fields are required" }, { status: 400 })
    }

    // Extract last 4 digits
    const last4 = cardNumber.slice(-4)

    const paymentData = {
      userId: auth.userId,
      type: type.toLowerCase(),
      last4,
      nameOnCard: nameOnCard.trim(),
      expMonth,
      expYear,
      default: isDefault || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await UserOperations.addUserPaymentMethod(paymentData)

    return NextResponse.json({
      success: true,
      data: result,
      message: "Payment method added successfully",
    })
  } catch (error) {
    console.error("Add payment method error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
