import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request) {
  try {
    const { email, name } = await request.json()

    console.log("Newsletter subscription request:", { email, name })

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a valid email address",
        },
        { status: 400 },
      )
    }

    // Connect to database
    const { db } = await connectToDatabase()
    console.log("Connected to database successfully")

    // Use direct collection name instead of collections object
    const newsletterCollection = db.collection("newsletter_subscribers")

    // Check if email already exists
    const existingSubscriber = await newsletterCollection.findOne({
      email: email.toLowerCase(),
    })

    if (existingSubscriber) {
      console.log("Email already subscribed:", email)
      return NextResponse.json({
        success: true,
        message: "You're already subscribed to our newsletter!",
        alreadySubscribed: true,
      })
    }

    // Add new subscriber
    const subscriber = {
      email: email.toLowerCase(),
      name: name || "",
      subscribedAt: new Date(),
      status: "active",
      source: "website",
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    }

    const result = await newsletterCollection.insertOne(subscriber)
    console.log("Newsletter subscriber added:", result.insertedId)

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to our newsletter! Thank you for joining us.",
      subscriberId: result.insertedId,
    })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to subscribe to newsletter. Please try again.",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const newsletterCollection = db.collection("newsletter_subscribers")

    const subscribers = await newsletterCollection
      .find({ status: "active" })
      .sort({ subscribedAt: -1 })
      .limit(100)
      .toArray()

    const stats = {
      total: subscribers.length,
      thisMonth: subscribers.filter((sub) => {
        const subDate = new Date(sub.subscribedAt)
        const now = new Date()
        return subDate.getMonth() === now.getMonth() && subDate.getFullYear() === now.getFullYear()
      }).length,
      thisWeek: subscribers.filter((sub) => {
        const subDate = new Date(sub.subscribedAt)
        const now = new Date()
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return subDate >= weekAgo
      }).length,
    }

    return NextResponse.json({
      success: true,
      subscribers,
      stats,
    })
  } catch (error) {
    console.error("Newsletter fetch error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch newsletter data",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
