import { NextResponse } from "next/server"
import { AnalyticsOperations } from "@/lib/database-operations"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "dashboard"
    const timeRange = searchParams.get("timeRange") || "30days"

    let data
    switch (type) {
      case "dashboard":
        data = await AnalyticsOperations.getDashboardStats()
        break
      case "sales":
        data = await AnalyticsOperations.getSalesData(timeRange)
        break
      case "topProducts":
        data = await AnalyticsOperations.getTopProducts(10)
        break
      case "categories":
        data = await AnalyticsOperations.getCategoryStats()
        break
      default:
        data = await AnalyticsOperations.getDashboardStats()
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Analytics API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch analytics data",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
