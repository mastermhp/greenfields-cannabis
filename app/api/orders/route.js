import { NextResponse } from "next/server"
import { OrderOperations } from "@/lib/database-operations"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const userId = searchParams.get("userId")

    const filters = {}

    if (status && status !== "all") {
      filters.status = status
    }

    if (search) {
      filters.search = search
    }

    let orders

    if (userId) {
      orders = await OrderOperations.getUserOrders(userId)
    } else {
      orders = await OrderOperations.getAllOrders(filters)
    }

    return NextResponse.json({
      success: true,
      data: orders,
      count: orders.length,
    })
  } catch (error) {
    console.error("Orders API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["customer", "items", "total", "shippingAddress"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 },
        )
      }
    }

    // Create order
    const order = await OrderOperations.createOrder({
      ...body,
      total: Number.parseFloat(body.total),
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    })

    return NextResponse.json(
      {
        success: true,
        data: order,
        message: "Order created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create Order Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create order",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
