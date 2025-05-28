import { NextResponse } from "next/server"
import { OrderOperations } from "@/lib/database-operations"

export async function POST(request) {
  try {
    const body = await request.json()
    const { orderNumber, email } = body

    if (!orderNumber || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "Order number and email are required",
        },
        { status: 400 },
      )
    }

    // Find order by order number and customer email
    const order = await OrderOperations.getOrderByNumberAndEmail(orderNumber, email)

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found. Please check your order number and email address.",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error("Track Order Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to track order",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
