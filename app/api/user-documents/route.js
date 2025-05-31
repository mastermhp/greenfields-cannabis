import { NextResponse } from "next/server"
import { UserDocumentOperations } from "@/lib/database-operations"

export async function POST(request) {
  try {
    // This would typically handle file upload to a storage service like Cloudinary
    // For now, we'll simulate the upload and store the metadata

    const formData = await request.formData()
    const file = formData.get("file")
    const userId = formData.get("userId")
    const documentType = formData.get("documentType")

    if (!file || !userId || !documentType) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // In a real implementation, you would upload the file to a storage service
    // and get back a URL. For now, we'll create a placeholder URL
    const documentUrl = `https://storage.example.com/${userId}/${documentType}/${Date.now()}-${file.name}`

    // Store document metadata in database
    const documentData = {
      userId,
      documentType,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      url: documentUrl,
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

export async function GET(request) {
  try {
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
