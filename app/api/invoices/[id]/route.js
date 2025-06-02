import { NextResponse } from "next/server"
import { InvoiceOperations } from "@/lib/database-operations"
import { verifyAuth } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    // Try JWT authentication first
    const authResult = await verifyAuth(request)
    let isAuthenticated = false
    let isAdmin = false
    let userId = null

    if (authResult.auth) {
      isAuthenticated = true
      isAdmin = authResult.auth.role === "admin" || authResult.auth.isAdmin
      userId = authResult.auth.userId
    } else {
      // Fallback to cookie-based admin authentication
      const adminToken = request.cookies.get("admin-token")?.value
      if (adminToken && (adminToken === process.env.ADMIN_TOKEN || adminToken === "admin-authenticated")) {
        isAuthenticated = true
        isAdmin = true
      }
    }

    if (!isAuthenticated) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const { id } = await params
    console.log(`Fetching invoice with ID: ${id}`)

    const invoice = await InvoiceOperations.getInvoiceById(id)

    if (!invoice) {
      return NextResponse.json(
        {
          success: false,
          error: "Invoice not found",
        },
        { status: 404 },
      )
    }

    // Check if user can access this invoice
    if (!isAdmin && invoice.customerInfo?.id !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied",
        },
        { status: 403 },
      )
    }

    return NextResponse.json({
      success: true,
      data: invoice,
    })
  } catch (error) {
    console.error("Get Invoice Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch invoice",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request, { params }) {
  try {
    // Try JWT authentication first
    const authResult = await verifyAuth(request)
    let isAuthenticated = false
    let isAdmin = false

    if (authResult.auth) {
      isAuthenticated = true
      isAdmin = authResult.auth.role === "admin" || authResult.auth.isAdmin
    } else {
      // Fallback to cookie-based admin authentication
      const adminToken = request.cookies.get("admin-token")?.value
      if (adminToken && (adminToken === process.env.ADMIN_TOKEN || adminToken === "admin-authenticated")) {
        isAuthenticated = true
        isAdmin = true
      }
    }

    if (!isAuthenticated || !isAdmin) {
      return NextResponse.json({ success: false, error: "Admin authentication required" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    console.log(`Updating invoice ${id} with:`, body)

    const updatedInvoice = await InvoiceOperations.updateInvoice(id, body)

    return NextResponse.json({
      success: true,
      data: updatedInvoice,
      message: "Invoice updated successfully",
    })
  } catch (error) {
    console.error("Update Invoice Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update invoice",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    // Try JWT authentication first
    const authResult = await verifyAuth(request)
    let isAuthenticated = false
    let isAdmin = false

    if (authResult.auth) {
      isAuthenticated = true
      isAdmin = authResult.auth.role === "admin" || authResult.auth.isAdmin
    } else {
      // Fallback to cookie-based admin authentication
      const adminToken = request.cookies.get("admin-token")?.value
      if (adminToken && (adminToken === process.env.ADMIN_TOKEN || adminToken === "admin-authenticated")) {
        isAuthenticated = true
        isAdmin = true
      }
    }

    if (!isAuthenticated || !isAdmin) {
      return NextResponse.json({ success: false, error: "Admin authentication required" }, { status: 401 })
    }

    const { id } = await params
    console.log(`Deleting invoice with ID: ${id}`)

    const result = await InvoiceOperations.deleteInvoice(id)

    return NextResponse.json({
      success: true,
      data: result,
      message: "Invoice deleted successfully",
    })
  } catch (error) {
    console.error("Delete Invoice Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete invoice",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
