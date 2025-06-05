import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { verifyToken } from "@/lib/auth"

export async function PUT(request, { params }) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { user } = authResult
    if (user.role !== "admin" && !user.isAdmin) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const { status, notes, dueDate } = body

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid invoice ID" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Get the invoice first to find the associated order
    const invoice = await db.collection("invoices").findOne({ _id: new ObjectId(id) })

    if (!invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 })
    }

    // Update the invoice
    const updateData = {
      updatedAt: new Date(),
    }

    if (status !== undefined) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (dueDate !== undefined) updateData.dueDate = dueDate

    const result = await db.collection("invoices").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 })
    }

    // Update the corresponding order's payment status if invoice status changed
    if (status && invoice.orderId) {
      let orderPaymentStatus = "pending"

      switch (status.toLowerCase()) {
        case "paid":
          orderPaymentStatus = "paid"
          break
        case "cancelled":
          orderPaymentStatus = "failed"
          break
        case "overdue":
          orderPaymentStatus = "pending"
          break
        default:
          orderPaymentStatus = "pending"
      }

      // Update the order's payment status
      await db.collection("orders").updateOne(
        { orderId: invoice.orderId },
        {
          $set: {
            paymentStatus: orderPaymentStatus,
            updatedAt: new Date(),
          },
        },
      )

      console.log(`Updated order ${invoice.orderId} payment status to ${orderPaymentStatus}`)
    }

    return NextResponse.json({
      success: true,
      message: "Invoice updated successfully",
    })
  } catch (error) {
    console.error("Error updating invoice:", error)
    return NextResponse.json({ success: false, error: "Failed to update invoice" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { user } = authResult
    if (user.role !== "admin" && !user.isAdmin) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid invoice ID" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const result = await db.collection("invoices").deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Invoice deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting invoice:", error)
    return NextResponse.json({ success: false, error: "Failed to delete invoice" }, { status: 500 })
  }
}
