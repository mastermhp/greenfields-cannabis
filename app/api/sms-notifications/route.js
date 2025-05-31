import { NextResponse } from "next/server"
import { SMSNotificationOperations } from "@/lib/database-operations"

export async function POST(request) {
  try {
    const body = await request.json()
    const { phone, message, orderId } = body

    if (!phone || !message) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone number and message are required",
        },
        { status: 400 },
      )
    }

    const result = await SMSNotificationOperations.sendSMS(phone, message, orderId)

    return NextResponse.json({
      success: true,
      data: result,
      message: "SMS sent successfully",
    })
  } catch (error) {
    console.error("SMS Notification Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send SMS",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")

    let notifications
    if (orderId) {
      notifications = await SMSNotificationOperations.getNotificationsByOrderId(orderId)
    } else {
      notifications = await SMSNotificationOperations.getAllNotifications()
    }

    return NextResponse.json({
      success: true,
      data: notifications,
    })
  } catch (error) {
    console.error("Get SMS Notifications Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch notifications",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
