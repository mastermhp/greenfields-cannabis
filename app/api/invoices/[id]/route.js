import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { verifyAuth } from "@/lib/auth"

export async function PUT(request, { params }) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (authResult.error || !authResult.auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const user = authResult.auth
    if (user.role !== "admin" && !user.isAdmin) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    // Await params before accessing properties
    const resolvedParams = await params
    const id = resolvedParams.id

    const body = await request.json()
    const { status, notes, dueDate } = body

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid invoice ID" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Get the invoice first to find the associated order
    console.log("Looking for invoice with ID:", id)
    let invoice = await db.collection("invoices").findOne({ _id: new ObjectId(id) })
    console.log("Found invoice:", invoice ? "Yes" : "No")

    if (!invoice) {
      // Try to find by string ID field if _id doesn't work
      const invoiceByStringId = await db.collection("invoices").findOne({ id: id })
      console.log("Found invoice by string ID:", invoiceByStringId ? "Yes" : "No")

      if (!invoiceByStringId) {
        return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 })
      }

      // Use the found invoice
      invoice = invoiceByStringId
    }

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

    // Update the invoice - try both _id and id fields
    let result
    try {
      result = await db.collection("invoices").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

      if (result.matchedCount === 0) {
        // Try with string ID
        result = await db.collection("invoices").updateOne({ id: id }, { $set: updateData })
      }
    } catch (error) {
      console.error("Error with ObjectId, trying string ID:", error)
      result = await db.collection("invoices").updateOne({ id: id }, { $set: updateData })
    }

    console.log("Update result:", result)

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
    const authResult = await verifyAuth(request)
    if (authResult.error || !authResult.auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const user = authResult.auth
    if (user.role !== "admin" && !user.isAdmin) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    // Await params before accessing properties
    const resolvedParams = await params
    const id = resolvedParams.id

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
