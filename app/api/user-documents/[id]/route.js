import { NextResponse } from "next/server"
import { UserDocumentOperations } from "@/lib/database-operations"
import { verifyAuth } from "@/lib/auth"

export async function DELETE(request, { params }) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (authResult.error) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json({ success: false, error: "Document ID is required" }, { status: 400 })
    }

    // Get document first to check if it exists
    const document = await UserDocumentOperations.getDocumentById(id)
    if (!document) {
      return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 })
    }

    // Delete the document
    const deleted = await UserDocumentOperations.deleteDocument(id)

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Failed to delete document" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json({ success: false, error: "Failed to delete document" }, { status: 500 })
  }
}

export async function GET(request, { params }) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (authResult.error) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json({ success: false, error: "Document ID is required" }, { status: 400 })
    }

    const document = await UserDocumentOperations.getDocumentById(id)

    if (!document) {
      return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: document,
    })
  } catch (error) {
    console.error("Error fetching document:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch document" }, { status: 500 })
  }
}
