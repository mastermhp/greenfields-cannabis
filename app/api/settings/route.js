import { NextResponse } from "next/server"
import { SettingsOperations } from "@/lib/database-operations"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "general"

    let settings
    switch (type) {
      case "shipping":
        settings = await SettingsOperations.getShippingSettings()
        break
      case "general":
        settings = await SettingsOperations.getGeneralSettings()
        break
      case "payment":
        settings = await SettingsOperations.getPaymentSettings()
        break
      default:
        settings = await SettingsOperations.getGeneralSettings()
    }

    return NextResponse.json({
      success: true,
      data: settings,
    })
  } catch (error) {
    console.error("Settings API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch settings",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const { type, settings } = body

    if (!type || !settings) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: type and settings",
        },
        { status: 400 },
      )
    }

    let updatedSettings
    switch (type) {
      case "shipping":
        updatedSettings = await SettingsOperations.updateShippingSettings(settings)
        break
      case "general":
        updatedSettings = await SettingsOperations.updateGeneralSettings(settings)
        break
      case "payment":
        updatedSettings = await SettingsOperations.updatePaymentSettings(settings)
        break
      default:
        throw new Error("Invalid settings type")
    }

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: "Settings updated successfully",
    })
  } catch (error) {
    console.error("Update Settings Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update settings",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
