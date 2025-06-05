"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Loader2, Eye, Search, FileText, DollarSign, User, Mail, Edit, Trash, RefreshCw, Clock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"

export default function InvoicesPage() {
  const { accessToken, getToken } = useAuth()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [filteredInvoices, setFilteredInvoices] = useState([])

  // Dialog states
  const [viewDialog, setViewDialog] = useState(false)
  const [editDialog, setEditDialog] = useState(false)
  const [emailDialog, setEmailDialog] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  // Form states
  const [emailForm, setEmailForm] = useState({
    email: "",
    message: "",
  })
  const [editForm, setEditForm] = useState({
    status: "",
    notes: "",
    dueDate: "",
  })

  useEffect(() => {
    if (accessToken) {
      fetchInvoices()
    }
  }, [accessToken])

  useEffect(() => {
    // Filter invoices based on search term and status
    let filtered = invoices

    if (statusFilter !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.customerInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.orderId?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredInvoices(filtered)
  }, [invoices, searchTerm, statusFilter])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const token = getToken()
      console.log("Fetching invoices with token:", token?.substring(0, 10) + "...")

      const headers = {
        "Content-Type": "application/json",
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch("/api/invoices", {
        headers,
        credentials: "include",
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Authentication Error",
            description: "Please log in again to access invoices.",
            variant: "destructive",
          })
          return
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log("Invoices response:", data)

      if (data.success) {
        setInvoices(data.data || [])
      } else {
        throw new Error(data.error || "Failed to fetch invoices")
      }
    } catch (error) {
      console.error("Error fetching invoices:", error)
      toast({
        title: "Error",
        description: "Failed to load invoices. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadInvoice = async (invoiceId) => {
    try {
      const headers = {}
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`
      }

      const response = await fetch(`/api/invoices/${invoiceId}/download`, {
        headers,
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to download invoice")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `invoice-${invoiceId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: "Invoice downloaded successfully",
      })
    } catch (error) {
      console.error("Error downloading invoice:", error)
      toast({
        title: "Error",
        description: "Failed to download invoice. Please try again.",
        variant: "destructive",
      })
    }
  }

  const viewInvoice = (invoice) => {
    setSelectedInvoice(invoice)
    setViewDialog(true)
  }

  const editInvoice = (invoice) => {
    setSelectedInvoice(invoice)
    setEditForm({
      status: invoice.status || "pending",
      notes: invoice.notes || "",
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split("T")[0] : "",
    })
    setEditDialog(true)
  }

  const saveInvoiceChanges = async () => {
    try {
      const token = getToken()
      console.log("Updating invoice with token:", token?.substring(0, 10) + "...")

      const headers = {
        "Content-Type": "application/json",
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`/api/invoices/${selectedInvoice.id}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({
          status: editForm.status,
          notes: editForm.notes,
          dueDate: editForm.dueDate ? new Date(editForm.dueDate) : null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Invoice updated successfully",
        })
        setEditDialog(false)
        fetchInvoices() // Refresh the list
      } else {
        throw new Error(data.message || "Failed to update invoice")
      }
    } catch (error) {
      console.error("Error updating invoice:", error)
      toast({
        title: "Error",
        description: "Failed to update invoice. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openEmailDialog = (invoice) => {
    setSelectedInvoice(invoice)
    setEmailForm({
      email: invoice.customerInfo?.email || "",
      message: `Dear ${invoice.customerInfo?.name || "Customer"},\n\nPlease find attached your invoice ${invoice.invoiceNumber} for order ${invoice.orderId}.\n\nThank you for your business!\n\nBest regards,\nGreenfields Cannabis Team`,
    })
    setEmailDialog(true)
  }

  const sendInvoiceEmail = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
      }
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`
      }

      const response = await fetch(`/api/invoices/${selectedInvoice.id}/send`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(emailForm),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Invoice sent successfully",
        })
        setEmailDialog(false)
      } else {
        throw new Error(data.message || "Failed to send invoice")
      }
    } catch (error) {
      console.error("Error sending invoice:", error)
      toast({
        title: "Error",
        description: "Failed to send invoice. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteInvoice = async (invoiceId) => {
    if (!confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      return
    }

    try {
      const token = getToken()

      const headers = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Invoice deleted successfully",
        })
        fetchInvoices() // Refresh the list
      } else {
        throw new Error(data.message || "Failed to delete invoice")
      }
    } catch (error) {
      console.error("Error deleting invoice:", error)
      toast({
        title: "Error",
        description: "Failed to delete invoice. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-500/20 text-green-400"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400"
      case "overdue":
        return "bg-red-500/20 text-red-400"
      case "cancelled":
        return "bg-gray-500/20 text-gray-400"
      default:
        return "bg-blue-500/20 text-blue-400"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading invoices...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gold-text">Invoice Management</h1>
          <p className="text-beige mt-2">Manage and track customer invoices</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={fetchInvoices}
            className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[#111] border-[#333]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-beige text-sm font-medium">Total Invoices</p>
                <p className="text-2xl font-bold text-white">{invoices.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111] border-[#333]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-beige text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-white">
                  ${invoices.reduce((sum, inv) => sum + (inv.totals?.total || 0), 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111] border-[#333]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-beige text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-white">
                  {invoices.filter((inv) => inv.status === "pending").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111] border-[#333]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-beige text-sm font-medium">Paid</p>
                <p className="text-2xl font-bold text-white">
                  {invoices.filter((inv) => inv.status === "paid").length}
                </p>
              </div>
              <User className="h-8 w-8 text-[#D4AF37]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-[#111] border-[#333]">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search invoices by number, customer, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#222] border-[#444] text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-[#222] border-[#444] text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-[#222] border-[#444] text-white">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="bg-[#111] border-[#333]">
        <CardHeader>
          <CardTitle className="text-white">All Invoices ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">
                {invoices.length === 0
                  ? "No invoices found. Invoices will appear here when orders are placed."
                  : "No invoices match your search criteria."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#333]">
                    <th className="text-left py-3 px-4 text-gray-300">Invoice #</th>
                    <th className="text-left py-3 px-4 text-gray-300">Order ID</th>
                    <th className="text-left py-3 px-4 text-gray-300">Customer</th>
                    <th className="text-left py-3 px-4 text-gray-300">Date</th>
                    <th className="text-left py-3 px-4 text-gray-300">Due Date</th>
                    <th className="text-left py-3 px-4 text-gray-300">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-300">Status</th>
                    <th className="text-left py-3 px-4 text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-[#333] hover:bg-[#222]">
                      <td className="py-3 px-4">
                        <span className="font-medium text-white">{invoice.invoiceNumber}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-beige">{invoice.orderId}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-white font-medium">{invoice.customerInfo?.name || "N/A"}</p>
                          <p className="text-sm text-beige">{invoice.customerInfo?.email || "N/A"}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-beige">{new Date(invoice.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-beige">
                          {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-[#D4AF37]">
                          ${invoice.totals?.total?.toFixed(2) || "0.00"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(invoice.status)}>{invoice.status || "pending"}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewInvoice(invoice)}
                            className="border-[#333]"
                            title="View Invoice"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editInvoice(invoice)}
                            className="border-[#333]"
                            title="Edit Invoice"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {/* <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadInvoice(invoice.id)}
                            className="border-[#333]"
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEmailDialog(invoice)}
                            className="border-[#333]"
                            title="Send Email"
                          >
                            <Mail className="h-4 w-4" />
                          </Button> */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteInvoice(invoice.id)}
                            className="border-red-500 text-red-500 hover:bg-red-500/10"
                            title="Delete Invoice"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Invoice Dialog */}
      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="bg-[#111] border border-[#333] text-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details - {selectedInvoice?.invoiceNumber}</DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Invoice Information</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-beige">Invoice #:</span> {selectedInvoice.invoiceNumber}
                    </p>
                    <p>
                      <span className="text-beige">Order ID:</span> {selectedInvoice.orderId}
                    </p>
                    <p>
                      <span className="text-beige">Date:</span>{" "}
                      {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="text-beige">Due Date:</span>{" "}
                      {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : "N/A"}
                    </p>
                    <p>
                      <span className="text-beige">Status:</span>
                      <Badge className={`ml-2 ${getStatusColor(selectedInvoice.status)}`}>
                        {selectedInvoice.status}
                      </Badge>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-beige">Name:</span> {selectedInvoice.customerInfo?.name}
                    </p>
                    <p>
                      <span className="text-beige">Email:</span> {selectedInvoice.customerInfo?.email}
                    </p>
                    <p>
                      <span className="text-beige">Phone:</span> {selectedInvoice.customerInfo?.phone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <div className="text-sm text-beige">
                    <p>{selectedInvoice.shippingAddress?.street}</p>
                    <p>
                      {selectedInvoice.shippingAddress?.city}, {selectedInvoice.shippingAddress?.state}{" "}
                      {selectedInvoice.shippingAddress?.zip}
                    </p>
                    <p>{selectedInvoice.shippingAddress?.country}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Billing Address</h3>
                  <div className="text-sm text-beige">
                    <p>{selectedInvoice.billingAddress?.street || selectedInvoice.shippingAddress?.street}</p>
                    <p>
                      {selectedInvoice.billingAddress?.city || selectedInvoice.shippingAddress?.city},{" "}
                      {selectedInvoice.billingAddress?.state || selectedInvoice.shippingAddress?.state}{" "}
                      {selectedInvoice.billingAddress?.zip || selectedInvoice.shippingAddress?.zip}
                    </p>
                    <p>{selectedInvoice.billingAddress?.country || selectedInvoice.shippingAddress?.country}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                <div className="border border-[#333] rounded">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#333] bg-[#222]">
                        <th className="text-left p-3">Item</th>
                        <th className="text-right p-3">Qty</th>
                        <th className="text-right p-3">Price</th>
                        <th className="text-right p-3">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items?.map((item, index) => (
                        <tr key={index} className="border-b border-[#333]">
                          <td className="p-3">{item.name}</td>
                          <td className="p-3 text-right">{item.quantity}</td>
                          <td className="p-3 text-right">${item.price?.toFixed(2)}</td>
                          <td className="p-3 text-right">${item.total?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-beige">Subtotal:</span>
                    <span>${selectedInvoice.totals?.subtotal?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-beige">Tax:</span>
                    <span>${selectedInvoice.totals?.tax?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-beige">Shipping:</span>
                    <span>${selectedInvoice.totals?.shipping?.toFixed(2) || "0.00"}</span>
                  </div>
                  {selectedInvoice.totals?.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-beige">Discount:</span>
                      <span>-${selectedInvoice.totals?.discount?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t border-[#333] pt-2">
                    <span>Total:</span>
                    <span className="text-[#D4AF37]">${selectedInvoice.totals?.total?.toFixed(2) || "0.00"}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-beige text-sm">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="bg-[#111] border border-[#333] text-white">
          <DialogHeader>
            <DialogTitle>Edit Invoice - {selectedInvoice?.invoiceNumber}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                <SelectTrigger className="bg-[#222] border-[#333] text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-[#222] border-[#333] text-white">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={editForm.dueDate}
                onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                className="bg-[#222] border-[#333] text-white"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="bg-[#222] border-[#333] text-white"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveInvoiceChanges} className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Invoice Dialog */}
      <Dialog open={emailDialog} onOpenChange={setEmailDialog}>
        <DialogContent className="bg-[#111] border border-[#333] text-white">
          <DialogHeader>
            <DialogTitle>Send Invoice - {selectedInvoice?.invoiceNumber}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={emailForm.email}
                onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                className="bg-[#222] border-[#333] text-white"
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={emailForm.message}
                onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                className="bg-[#222] border-[#333] text-white"
                rows={6}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEmailDialog(false)}>
                Cancel
              </Button>
              <Button onClick={sendInvoiceEmail} className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
                <Mail className="h-4 w-4 mr-2" />
                Send Invoice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
