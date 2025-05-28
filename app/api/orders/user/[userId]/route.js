import { NextResponse } from "next/server"
import { OrderOperations } from "@/lib/database-operations"

export async function GET(request, { params }) {
  try {
    const { userId } = params

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required",
        },
        { status: 400 },
      )
    }

    const orders = await OrderOperations.getUserOrders(userId)

    return NextResponse.json({
      success: true,
      data: orders,
    })
  } catch (error) {
    console.error("Get User Orders Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user orders",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
