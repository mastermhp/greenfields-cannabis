import { NextResponse } from "next/server"
import { OrderOperations } from "@/lib/database-operations"
import { verifyAuth } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    console.log("GET /api/orders/[id] - Starting request")

    const authResult = await verifyAuth(request)
    console.log("Auth result:", authResult)

    if (!authResult.auth) {
      console.log("Authentication failed:", authResult.error)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    console.log("Order ID from params:", id)

    if (!id) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 })
    }

    console.log(`Fetching order details for ID: ${id}`)

    const order = await OrderOperations.getOrderById(id)
    console.log("Order found:", order ? "Yes" : "No")

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    // Check if the authenticated user owns this order or is an admin
    const userId = authResult.auth.userId || authResult.auth.id
    const userRole = authResult.auth.role

    console.log("User ID:", userId, "User Role:", userRole)
    console.log("Order customer ID:", order.customer?.id)

    if (userRole !== "admin" && order.customer?.id !== userId) {
      console.log("Access denied - user doesn't own this order")
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 })
    }

    console.log("Order details fetched successfully")

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error("Get order details error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success || authResult.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 })
    }

    console.log(`Updating order ${id} with:`, body)

    const updatedOrder = await OrderOperations.updateOrder(id, body)

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: "Order updated successfully",
    })
  } catch (error) {
    console.error("Update order error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    console.log("PATCH /api/orders/[id] - Starting request")

    const authResult = await verifyAuth(request)
    console.log("Auth result:", authResult)

    if (!authResult.auth) {
      console.log("Authentication failed:", authResult.error)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const userRole = authResult.auth.role
    if (userRole !== "admin") {
      console.log("Access denied - user is not admin")
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    console.log(`PATCH: Updating order ${id} with:`, body)

    if (!id) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 })
    }

    // Update the order using OrderOperations
    const updatedOrder = await OrderOperations.updateOrder(id, body)

    if (!updatedOrder) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    console.log("Order updated successfully")

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: "Order updated successfully",
    })
  } catch (error) {
    console.error("PATCH order error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
