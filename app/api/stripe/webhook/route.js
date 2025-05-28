import { NextResponse } from "next/server"
import Stripe from "stripe"
import { OrderOperations } from "@/lib/database-operations"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request) {
  try {
    const body = await request.text()
    const sig = request.headers.get("stripe-signature")

    let event

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message)
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object
        console.log("PaymentIntent was successful:", paymentIntent.id)

        // Update order status to paid
        if (paymentIntent.metadata.orderId) {
          try {
            await OrderOperations.updateOrderStatus(paymentIntent.metadata.orderId, "processing")
            console.log(`Order ${paymentIntent.metadata.orderId} marked as paid`)
          } catch (error) {
            console.error("Error updating order status:", error)
          }
        }
        break

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object
        console.log("PaymentIntent failed:", failedPayment.id)

        // Update order status to failed
        if (failedPayment.metadata.orderId) {
          try {
            await OrderOperations.updateOrderStatus(failedPayment.metadata.orderId, "cancelled")
            console.log(`Order ${failedPayment.metadata.orderId} marked as cancelled`)
          } catch (error) {
            console.error("Error updating order status:", error)
          }
        }
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
