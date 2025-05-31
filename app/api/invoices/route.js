import { NextResponse } from "next/server"
import { InvoiceOperations } from "@/lib/database-operations"

export async function POST(request) {
  try {
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

    const invoice = await InvoiceOperations.generateInvoice(body)

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
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")
    const userId = searchParams.get("userId")

    if (orderId) {
      const invoice = await InvoiceOperations.getInvoiceByOrderId(orderId)
      return NextResponse.json({
        success: true,
        data: invoice,
      })
    }

    if (userId) {
      const invoices = await InvoiceOperations.getUserInvoices(userId)
      return NextResponse.json({
        success: true,
        data: invoices,
      })
    }

    const invoices = await InvoiceOperations.getAllInvoices()
    return NextResponse.json({
      success: true,
      data: invoices,
    })
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
