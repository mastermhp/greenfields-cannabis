import { NextResponse } from "next/server"
import { OrderOperations } from "@/lib/database-operations"

export async function GET(request, { params }) {
  try {
    const { id } = params
    const order = await OrderOperations.getOrderById(id)

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error("Get Order Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch order",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()

    console.log(`Updating order ${id} with data:`, body)

    const updatedOrder = await OrderOperations.updateOrderStatus(id, body.status, body.trackingNumber)

    console.log("Order updated successfully:", updatedOrder)

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: "Order updated successfully",
    })
  } catch (error) {
    console.error("Update Order Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update order",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
