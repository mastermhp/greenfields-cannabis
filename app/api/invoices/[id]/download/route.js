import { NextResponse } from "next/server"
import { InvoiceOperations } from "@/lib/database-operations"
import { verifyAuth } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    console.log("Starting invoice download request")

    const authResult = await verifyAuth(request)
    console.log("Auth result:", authResult)

    if (!authResult.auth) {
      console.log("Authentication failed:", authResult.error)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    console.log(`Downloading invoice with ID: ${id}`)

    const invoice = await InvoiceOperations.getInvoiceById(id)

    if (!invoice) {
      console.log("Invoice not found")
      return NextResponse.json(
        {
          success: false,
          error: "Invoice not found",
        },
        { status: 404 },
      )
    }

    console.log("Invoice found:", invoice.invoiceNumber)
    console.log("User ID from auth:", authResult.auth.userId)
    console.log("Customer ID from invoice:", invoice.customerInfo?.id)

    // Check if user can access this invoice
    if (authResult.auth.role !== "admin" && invoice.customerInfo?.id !== authResult.auth.userId) {
      console.log("Access denied - user cannot access this invoice")
      console.log("User role:", authResult.auth.role)
      console.log("User ID:", authResult.auth.userId)
      console.log("Invoice customer ID:", invoice.customerInfo?.id)
      return NextResponse.json(
        {
          success: false,
          error: "Access denied",
        },
        { status: 403 },
      )
    }

    console.log("Generating PDF for invoice:", invoice.invoiceNumber)

    // Check if generateInvoicePDF method exists
    if (!InvoiceOperations.generateInvoicePDF) {
      console.log("PDF generation method not available, creating simple PDF response")

      // Create a simple PDF response if the method doesn't exist
      const pdfContent = `
        Invoice #${invoice.invoiceNumber}
        Order ID: ${invoice.orderId}
        Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}
        Total: $${invoice.totals?.total?.toFixed(2) || "0.00"}
        
        Customer: ${invoice.customerInfo?.name || "N/A"}
        Email: ${invoice.customerInfo?.email || "N/A"}
        
        Items:
        ${invoice.items?.map((item) => `- ${item.name} x${item.quantity} - $${item.price?.toFixed(2) || "0.00"}`).join("\n") || "No items"}
        
        Subtotal: $${invoice.totals?.subtotal?.toFixed(2) || "0.00"}
        Tax: $${invoice.totals?.tax?.toFixed(2) || "0.00"}
        Total: $${invoice.totals?.total?.toFixed(2) || "0.00"}
      `

      return new NextResponse(pdfContent, {
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.txt"`,
          "Cache-Control": "no-cache",
        },
      })
    }

    // Generate PDF buffer
    const pdfBuffer = await InvoiceOperations.generateInvoicePDF(invoice)
    console.log("PDF generated successfully")

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
