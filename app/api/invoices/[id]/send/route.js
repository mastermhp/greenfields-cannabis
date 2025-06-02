import { NextResponse } from "next/server"
import { InvoiceOperations } from "@/lib/database-operations"
import { verifyAuth } from "@/lib/auth"

export async function POST(request, { params }) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success || authResult.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { email, message } = body

    console.log(`Sending invoice ${id} to email: ${email}`)

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

    // Here you would integrate with an email service like SendGrid, Nodemailer, etc.
    // For now, we'll simulate sending the email
    const emailResult = await InvoiceOperations.sendInvoiceEmail(invoice, email, message)

    return NextResponse.json({
      success: true,
      data: emailResult,
      message: "Invoice sent successfully",
    })
  } catch (error) {
    console.error("Send Invoice Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send invoice",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
