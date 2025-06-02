import { NextResponse } from "next/server"
import { InvoiceOperations } from "@/lib/database-operations"
import { verifyAuth } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    console.log(`Downloading invoice with ID: ${id}`)

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
    if (authResult.user.role !== "admin" && invoice.customerInfo.id !== authResult.user.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied",
        },
        { status: 403 },
      )
    }

    // Generate PDF buffer
    const pdfBuffer = await InvoiceOperations.generateInvoicePDF(invoice)

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Download Invoice Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to download invoice",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
