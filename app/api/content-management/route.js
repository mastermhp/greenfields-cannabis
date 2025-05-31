import { NextResponse } from "next/server"
import { ContentManagementOperations } from "@/lib/database-operations"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page")
    const section = searchParams.get("section")

    let content
    if (page && section) {
      content = await ContentManagementOperations.getPageSection(page, section)
    } else if (page) {
      content = await ContentManagementOperations.getPageContent(page)
    } else {
      content = await ContentManagementOperations.getAllContent()
    }

    return NextResponse.json({
      success: true,
      data: content,
    })
  } catch (error) {
    console.error("Content Management API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch content",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const { page, section, content } = body

    if (!page || !section || !content) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: page, section, and content",
        },
        { status: 400 },
      )
    }

    const updatedContent = await ContentManagementOperations.updatePageContent(page, section, content)

    return NextResponse.json({
      success: true,
      data: updatedContent,
      message: "Content updated successfully",
    })
  } catch (error) {
    console.error("Update Content Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update content",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
