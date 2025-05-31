import { NextResponse } from "next/server"
import { SMSSettingsOperations } from "@/lib/database-operations"

export async function GET(request) {
  try {
    const settings = await SMSSettingsOperations.getSMSSettings()

    return NextResponse.json({
      success: true,
      data: settings,
    })
  } catch (error) {
    console.error("Get SMS Settings Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch SMS settings",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()

    const updatedSettings = await SMSSettingsOperations.updateSMSSettings(body)

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: "SMS settings updated successfully",
    })
  } catch (error) {
    console.error("Update SMS Settings Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update SMS settings",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
