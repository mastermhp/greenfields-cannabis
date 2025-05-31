import { NextResponse } from "next/server"
import { InvoiceOperations } from "@/lib/database-operations"

export async function GET(request, { params }) {
  try {
    const { id } = params
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

    // Generate PDF buffer
    const pdfBuffer = await InvoiceOperations.generateInvoicePDF(invoice)

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
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
