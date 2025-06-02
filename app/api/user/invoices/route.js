import { NextResponse } from "next/server"
import { InvoiceOperations } from "@/lib/database-operations"
import { verifyAuth } from "@/lib/auth"

export async function GET(request) {
  try {
    console.log("GET /api/user/invoices - Starting request")

    const authResult = await verifyAuth(request)
    console.log("Auth result:", authResult)

    if (!authResult.auth) {
      console.log("Authentication failed:", authResult.error)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const userId = authResult.auth.userId || authResult.auth.id
    console.log(`Fetching invoices for user: ${userId}`)

    if (!userId) {
      console.log("No user ID found in token")
      return NextResponse.json({ success: false, error: "Invalid user token" }, { status: 401 })
    }

    const invoices = await InvoiceOperations.getUserInvoices(userId)
    console.log(`Found ${invoices.length} invoices for user`)

    return NextResponse.json({
      success: true,
      data: invoices,
    })
  } catch (error) {
    console.error("Get User Invoices Error:", error)
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
