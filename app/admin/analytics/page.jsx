"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Loader2, DollarSign, ShoppingBag, Users, Package } from "lucide-react"

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30days")
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
  })
  const [salesData, setSalesData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [categoryStats, setCategoryStats] = useState([])

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)

        // Fetch dashboard stats
        const statsRes = await fetch("/api/analytics?type=dashboard")
        if (statsRes.ok) {
          const data = await statsRes.json()
          if (data.success) {
            setStats(data.data)
          }
        }

        // Fetch sales data based on time range
        const salesRes = await fetch(`/api/analytics?type=sales&timeRange=${timeRange}`)
        if (salesRes.ok) {
          const data = await salesRes.json()
          if (data.success) {
            // Format data for chart
            const formattedData = data.data.map((item) => ({
              date: `${item._id.month}/${item._id.day}`,
              revenue: item.revenue,
              orders: item.orders,
            }))
            setSalesData(formattedData)
          }
        }

        // Fetch top products
        const productsRes = await fetch("/api/analytics?type=topProducts")
        if (productsRes.ok) {
          const data = await productsRes.json()
          if (data.success) {
            setTopProducts(data.data)
          }
        }

        // Fetch category stats
        const categoryRes = await fetch("/api/analytics?type=categories")
        if (categoryRes.ok) {
          const data = await categoryRes.json()
          if (data.success) {
            setCategoryStats(data.data)
          }
        }
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading analytics...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Lifetime revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>
            <div className="flex items-center space-x-4">
              <span>Time Range:</span>
              <Tabs value={timeRange} onValueChange={setTimeRange}>
                <TabsList>
                  <TabsTrigger value="7days">7 Days</TabsTrigger>
                  <TabsTrigger value="30days">30 Days</TabsTrigger>
                  <TabsTrigger value="90days">90 Days</TabsTrigger>
                  <TabsTrigger value="year">Year</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="revenue" name="Revenue ($)" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No sales data available for this period</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Products & Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best selling products by sales volume</CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.slice(0, 5).map((product, index) => (
                  <div key={product.id || product._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-6 text-muted-foreground">{index + 1}.</span>
                      <span className="font-medium">{product.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-muted-foreground">${product.price.toFixed(2)}</span>
                      <span className="text-sm font-medium">{product.sales} sold</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No product data available</p>
            )}
          </CardContent>
        </Card>

        {/* Category Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>Sales by product category</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryStats.length > 0 ? (
              <div className="space-y-4">
                {categoryStats.map((category) => (
                  <div key={category._id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{category._id}</span>
                      <span className="text-sm font-medium">${category.totalRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{category.totalProducts} products</span>
                      <span>Avg. ${category.averagePrice.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No category data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
