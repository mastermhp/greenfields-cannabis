"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Loader2, Download, Eye, Search, FileText, DollarSign, Calendar, User, Filter } from "lucide-react"

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredInvoices, setFilteredInvoices] = useState([])

  useEffect(() => {
    fetchInvoices()
  }, [])

  useEffect(() => {
    // Filter invoices based on search term
    const filtered = invoices.filter(
      (invoice) =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.orderId.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredInvoices(filtered)
  }, [invoices, searchTerm])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/invoices")
      const data = await response.json()

      if (data.success) {
        setInvoices(data.data || [])
      } else {
        throw new Error(data.message || "Failed to fetch invoices")
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
      const response = await fetch(`/api/invoices/${invoiceId}/download`)

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

  const generateInvoiceForOrder = async (orderId) => {
    try {
      // This would typically fetch order details and generate invoice
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          // Add other required fields based on order data
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Invoice generated successfully",
        })
        fetchInvoices() // Refresh the list
      } else {
        throw new Error(data.message || "Failed to generate invoice")
      }
    } catch (error) {
      console.error("Error generating invoice:", error)
      toast({
        title: "Error",
        description: "Failed to generate invoice. Please try again.",
        variant: "destructive",
      })
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
          <p className="text-beige mt-2">Manage and download customer invoices</p>
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
                <p className="text-beige text-sm font-medium">This Month</p>
                <p className="text-2xl font-bold text-white">
                  {
                    invoices.filter((inv) => {
                      const invoiceDate = new Date(inv.createdAt)
                      const now = new Date()
                      return (
                        invoiceDate.getMonth() === now.getMonth() && invoiceDate.getFullYear() === now.getFullYear()
                      )
                    }).length
                  }
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111] border-[#333]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-beige text-sm font-medium">Unique Customers</p>
                <p className="text-2xl font-bold text-white">
                  {new Set(invoices.map((inv) => inv.customerInfo?.email)).size}
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
            <Button variant="outline" className="border-[#333]">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="bg-[#111] border-[#333]">
        <CardHeader>
          <CardTitle className="text-white">All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No invoices found</p>
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
                          <p className="text-white font-medium">{invoice.customerInfo?.name}</p>
                          <p className="text-sm text-beige">{invoice.customerInfo?.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-beige">{new Date(invoice.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-[#D4AF37]">
                          ${invoice.totals?.total?.toFixed(2) || "0.00"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={invoice.status === "paid" ? "default" : "secondary"}
                          className={invoice.status === "paid" ? "bg-green-500" : "bg-yellow-500"}
                        >
                          {invoice.status || "pending"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadInvoice(invoice.id)}
                            className="border-[#333]"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-[#333]">
                            <Eye className="h-4 w-4" />
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
    </div>
  )
}
