"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import {
  Search,
  FileText,
  Calendar,
  DollarSign,
  Eye,
  EyeOff,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
} from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

const formatSafeDate = (dateValue) => {
  if (!dateValue) return "N/A"

  try {
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) return "Invalid Date"
    return format(date, "MMM dd, yyyy")
  } catch (error) {
    console.error("Date formatting error:", error)
    return "Invalid Date"
  }
}

export default function UserInvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedInvoice, setExpandedInvoice] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const { user, getToken } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchInvoices()
    }
  }, [user])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const token = getToken()

      const response = await fetch(`/api/user/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch invoices")
      }

      const data = await response.json()
      if (data.success) {
        setInvoices(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching invoices:", error)
      toast({
        title: "Error",
        description: "Failed to load invoices",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleInvoiceDetails = (invoiceId) => {
    setExpandedInvoice(expandedInvoice === invoiceId ? null : invoiceId)
  }

  const handleBack = () => {
    // Try to go back in history first, if no history go to account page
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push("/account")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.orderId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-40">
        <Card>
          <CardContent className="p-8 text-center">
            <p>Please log in to view your invoices.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-40">
      {/* Back Button and Header */}
      <div className="mb-8">
        <Button
          onClick={handleBack}
          variant="ghost"
          className="mb-4 p-0 h-auto font-normal text-gray-200 hover:text-[#D4AF37] hover:cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back 
        </Button>
        <h1 className="text-3xl font-bold mb-2">My Invoices</h1>
        <p className="text-gray-600">View detailed information about your purchase invoices</p>
      </div>

      {/* Search */}
      <Card className="mb-6 bg-[#D4AF37]/40 border-2 border-[#D4AF37]/80">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 " />
            <Input
              placeholder="Search by invoice number or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No invoices found</h3>
            <p className="text-gray-600">
              {searchTerm ? "No invoices match your search criteria." : "You don't have any invoices yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice._id} className="hover:shadow-md transition-shadow bg-[#D4AF37]/10 border-2 border-[#D4AF37]/80">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Invoice #{invoice.invoiceNumber}</h3>
                    <p className="text-sm text-gray-600">Order #{invoice.orderId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Invoice Date</p>
                      <p className="font-medium">{formatSafeDate(invoice.invoiceDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Due Date</p>
                      <p className="font-medium">{formatSafeDate(invoice.dueDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-medium">${invoice.totals?.total?.toFixed(2) || "0.00"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {invoice.items?.length || 0} item{(invoice.items?.length || 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Button onClick={() => toggleInvoiceDetails(invoice._id)} variant="outline" size="sm" className="bg-[#D4AF37]/10 border-2 border-[#D4AF37]/80 text-[#D4AF37] hover:border-white hover:cursor-pointer transition-all duration-500">
                    {expandedInvoice === invoice._id ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </>
                    )}
                  </Button>
                </div>

                {/* Expanded Invoice Details */}
                {expandedInvoice === invoice._id && (
                  <div className="mt-6 border-t pt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Customer Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Customer Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{invoice.customerInfo?.name || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{invoice.customerInfo?.email || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{invoice.customerInfo?.phone || "N/A"}</span>
                          </div>
                          {invoice.shippingAddress && (
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                              <div>
                                <p className="font-medium">Shipping Address:</p>
                                <p className="text-sm text-gray-600">
                                  {invoice.shippingAddress.street}
                                  <br />
                                  {invoice.shippingAddress.city}, {invoice.shippingAddress.state}{" "}
                                  {invoice.shippingAddress.zipCode}
                                </p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Invoice Summary */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Invoice Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>${invoice.totals?.subtotal?.toFixed(2) || "0.00"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax:</span>
                            <span>${invoice.totals?.tax?.toFixed(2) || "0.00"}</span>
                          </div>
                          {invoice.totals?.shipping && (
                            <div className="flex justify-between">
                              <span>Shipping:</span>
                              <span>${invoice.totals.shipping.toFixed(2)}</span>
                            </div>
                          )}
                          {invoice.totals?.discount && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount:</span>
                              <span>-${invoice.totals.discount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="border-t pt-2">
                            <div className="flex justify-between font-bold text-lg">
                              <span>Total:</span>
                              <span>${invoice.totals?.total?.toFixed(2) || "0.00"}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Items List */}
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Package className="h-5 w-5" />
                          Items ({invoice.items?.length || 0})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {invoice.items?.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-medium">{item.name}</h4>
                                <p className="text-sm text-gray-600">{item.description || "No description"}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                  <span>Quantity: {item.quantity}</span>
                                  <span>Unit Price: ${item.price?.toFixed(2) || "0.00"}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">${(item.quantity * (item.price || 0)).toFixed(2)}</p>
                              </div>
                            </div>
                          )) || <p className="text-gray-500 text-center py-4">No items found</p>}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Payment Information */}
                    {invoice.paymentInfo && (
                      <Card className="mt-6">
                        <CardHeader>
                          <CardTitle className="text-lg">Payment Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Payment Method:</p>
                              <p className="font-medium">{invoice.paymentInfo.method || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Transaction ID:</p>
                              <p className="font-medium">{invoice.paymentInfo.transactionId || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Payment Date:</p>
                              <p className="font-medium">{formatSafeDate(invoice.paymentInfo.date)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Payment Status:</p>
                              <Badge className={getStatusColor(invoice.paymentInfo.status || invoice.status)}>
                                {invoice.paymentInfo.status || invoice.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
