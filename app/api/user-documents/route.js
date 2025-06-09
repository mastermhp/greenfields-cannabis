import { NextResponse } from "next/server"
import { UserDocumentOperations } from "@/lib/database-operations"
import { verifyAuth } from "@/lib/auth"

export async function GET(request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (authResult.error) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const documentType = searchParams.get("documentType")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    const documents = await UserDocumentOperations.getUserDocuments(userId, documentType)

    return NextResponse.json({
      success: true,
      data: documents,
    })
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch documents" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (authResult.error) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file")
    const userId = formData.get("userId")
    const documentType = formData.get("documentType")

    if (!file || !userId || !documentType) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Convert file to base64 for storage (in a real app, you'd upload to cloud storage)
    const buffer = await file.arrayBuffer()
    const base64String = `data:${file.type};base64,${Buffer.from(buffer).toString("base64")}`

    // Store document metadata in database
    const documentData = {
      userId,
      documentType,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      url: base64String, // In production, this would be a cloud storage URL
    }

    const document = await UserDocumentOperations.uploadDocument(documentData)

    return NextResponse.json({
      success: true,
      data: document,
      message: "Document uploaded successfully",
    })
  } catch (error) {
    console.error("Error uploading document:", error)
    return NextResponse.json({ success: false, error: "Failed to upload document" }, { status: 500 })
  }
}
