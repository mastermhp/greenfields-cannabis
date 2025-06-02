import { NextResponse } from "next/server"
import { InvoiceOperations } from "@/lib/database-operations"
import { verifyAuth } from "@/lib/auth"

export async function POST(request) {
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

    const body = await request.json()

    // Validate required fields
    const requiredFields = ["orderId", "customerInfo", "items", "totals"]
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

    console.log("Generating invoice for order:", body.orderId)

    const invoice = await InvoiceOperations.generateInvoice(body)

    console.log("Invoice generated successfully:", invoice.invoiceNumber)

    return NextResponse.json(
      {
        success: true,
        data: invoice,
        message: "Invoice generated successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Generate Invoice Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate invoice",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET(request) {
  try {
    console.log("GET /api/invoices - Checking authentication")

    // Try JWT authentication first
    const authResult = await verifyAuth(request)
    let isAuthenticated = false
    let isAdmin = false
    let userId = null

    if (authResult.auth) {
      console.log("JWT authentication successful:", authResult.auth)
      isAuthenticated = true
      isAdmin = authResult.auth.role === "admin" || authResult.auth.isAdmin
      userId = authResult.auth.userId
    } else {
      console.log("JWT authentication failed, trying cookie auth")
      // Fallback to cookie-based admin authentication
      const adminToken = request.cookies.get("admin-token")?.value
      console.log("Admin token from cookies:", adminToken)

      if (adminToken && (adminToken === process.env.ADMIN_TOKEN || adminToken === "admin-authenticated")) {
        console.log("Cookie authentication successful")
        isAuthenticated = true
        isAdmin = true
      }
    }

    if (!isAuthenticated) {
      console.log("No valid authentication found")
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")
    const userIdParam = searchParams.get("userId")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    console.log("Fetching invoices with filters:", { orderId, userId: userIdParam, status, search })
    console.log("User is admin:", isAdmin)

    if (orderId) {
      const invoice = await InvoiceOperations.getInvoiceByOrderId(orderId)
      return NextResponse.json({
        success: true,
        data: invoice,
      })
    }

    if (userIdParam) {
      const invoices = await InvoiceOperations.getUserInvoices(userIdParam)
      return NextResponse.json({
        success: true,
        data: invoices,
      })
    }

    if (isAdmin) {
      // Admin can see all invoices
      const filters = {}
      if (status && status !== "all") filters.status = status
      if (search) filters.search = search

      console.log("Fetching all invoices for admin with filters:", filters)
      const invoices = await InvoiceOperations.getAllInvoices(filters)
      console.log("Found invoices:", invoices.length)

      return NextResponse.json({
        success: true,
        data: invoices,
      })
    } else {
      // Regular users can only see their own invoices
      console.log("Fetching user invoices for userId:", userId)
      const invoices = await InvoiceOperations.getUserInvoices(userId)
      return NextResponse.json({
        success: true,
        data: invoices,
      })
    }
  } catch (error) {
    console.error("Get Invoices Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch invoices",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
