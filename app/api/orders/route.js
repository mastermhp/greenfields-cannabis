import { NextResponse } from "next/server"
import { OrderOperations, InvoiceOperations } from "@/lib/database-operations"
import smsService from "@/lib/sms-service"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const userId = searchParams.get("userId")

    const filters = {}

    if (status && status !== "all") {
      filters.status = status
    }

    if (search) {
      filters.search = search
    }

    let orders

    if (userId) {
      orders = await OrderOperations.getUserOrders(userId)
    } else {
      orders = await OrderOperations.getAllOrders(filters)
    }

    return NextResponse.json({
      success: true,
      data: orders,
      count: orders.length,
    })
  } catch (error) {
    console.error("Orders API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["customer", "items", "total", "shippingAddress"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 },
        )
      }
    }

    // Create order
    const order = await OrderOperations.createOrder({
      ...body,
      total: Number.parseFloat(body.total),
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    })

    console.log("Order created successfully:", order.id)

    // Generate invoice automatically
    try {
      console.log("Generating invoice for order:", order.id)

      const invoiceData = {
        orderId: order.id,
        customerInfo: {
          id: order.customer.id,
          name: order.customer.name,
          email: order.customer.email,
          phone: order.customer.phone || "",
        },
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        totals: {
          subtotal: order.subtotal || order.total,
          tax: order.tax || 0,
          shipping: order.shipping || 0,
          discount: order.discount || 0,
          total: order.total,
        },
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress || order.shippingAddress,
        paymentMethod: order.paymentMethod || "Credit Card",
        orderDate: order.createdAt,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        notes: order.notes || "",
      }

      const invoice = await InvoiceOperations.generateInvoice(invoiceData)
      console.log("Invoice generated successfully:", invoice.invoiceNumber)

      // Add invoice reference to order
      await OrderOperations.updateOrder(order.id, { invoiceId: invoice.id })
    } catch (invoiceError) {
      console.error("Failed to generate invoice, but order was created:", invoiceError)
      // Don't fail the order creation if invoice generation fails
    }

    // Send SMS notification for order confirmation
    try {
      console.log("Attempting to send order confirmation SMS...")
      const smsResult = await smsService.sendOrderConfirmation(order)
      console.log("SMS result:", smsResult)

      if (smsResult.success) {
        console.log(`Order confirmation SMS sent successfully to ${smsResult.to}`)
      } else {
        console.log(`SMS not sent: ${smsResult.reason || smsResult.error}`)
      }
    } catch (smsError) {
      console.error("SMS sending failed, but order was created:", smsError)
      // Don't fail the order creation if SMS fails
    }

    return NextResponse.json(
      {
        success: true,
        data: order,
        message: "Order created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create Order Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create order",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
