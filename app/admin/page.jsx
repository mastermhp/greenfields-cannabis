"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Package, Users, ShoppingCart, DollarSign, TrendingUp, TrendingDown, Eye, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: [], // Ensure this is always an array
    userGrowth: 0,
    orderGrowth: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Fetch analytics data
        const analyticsResponse = await fetch("/api/analytics")
        const analyticsData = await analyticsResponse.json()

        // Fetch recent orders
        const ordersResponse = await fetch("/api/orders?limit=5")
        const ordersData = await ordersResponse.json()

        // Fetch top products
        const productsResponse = await fetch("/api/products?limit=5&sort=sales")
        const productsData = await productsResponse.json()

        if (analyticsData.success) {
          setStats({
            totalProducts: analyticsData.data.totalProducts,
            totalUsers: analyticsData.data.totalUsers,
            totalOrders: analyticsData.data.totalOrders,
            totalRevenue: analyticsData.data.totalRevenue,
            recentOrders: ordersData.success ? ordersData.data : [],
            topProducts: productsData.success ? productsData.data || [] : [], // Ensure it's always an array
            userGrowth: analyticsData.data.userGrowth || 12.5,
            orderGrowth: analyticsData.data.orderGrowth || 8.3,
          })
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
      growth: stats.userGrowth,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      growth: stats.orderGrowth,
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-[#D4AF37]",
      bgColor: "bg-[#D4AF37]/10",
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-[#333] rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-[#333] rounded w-64 mt-2 animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#111] border border-[#333] rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-[#333] rounded mb-4"></div>
              <div className="h-8 bg-[#333] rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gold-text">Dashboard Overview</h1>
          <p className="text-beige mt-2">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex space-x-3">
          <Button
            asChild
            className="bg-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-2 hover:border-[#D4AF37] hover:cursor-pointer transition-all duration-500 hover:text-[#D4AF37] text-black"
          >
            <Link href="/admin/products/new">
              <Plus size={16} className="mr-2" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-[#111] border-[#333]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-beige text-sm font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                    {stat.growth && (
                      <div className="flex items-center mt-2">
                        {stat.growth > 0 ? (
                          <TrendingUp size={16} className="text-green-400 mr-1" />
                        ) : (
                          <TrendingDown size={16} className="text-red-400 mr-1" />
                        )}
                        <span className={`text-sm ${stat.growth > 0 ? "text-green-400" : "text-red-400"}`}>
                          {stat.growth > 0 ? "+" : ""}
                          {stat.growth}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon size={24} className={stat.color} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-[#111] border-[#333]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Recent Orders</CardTitle>
              <Button asChild variant="outline" size="sm" className="border-[#333]">
                <Link href="/admin/orders">
                  <Eye size={16} className="mr-2" />
                  View All
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-[#222] rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-white">{order.id}</p>
                          <div className="text-right">
                            <p className="font-medium text-[#D4AF37]">${order.total?.toFixed(2)}</p>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                order.status === "delivered"
                                  ? "bg-green-500/20 text-green-400"
                                  : order.status === "shipped"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : "bg-yellow-500/20 text-yellow-400"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-beige">
                          <div>
                            <span className="font-medium text-white">Customer:</span>
                            <br />
                            {order.customer?.name || "Guest"}
                          </div>
                          <div>
                            <span className="font-medium text-white">Phone:</span>
                            <br />
                            {order.customer?.phone || order.shippingAddress?.phone || "N/A"}
                          </div>
                          <div>
                            <span className="font-medium text-white">Address:</span>
                            <br />
                            {order.shippingAddress ? (
                              <span className="text-xs">
                                {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                                {order.shippingAddress.state} {order.shippingAddress.zip}
                              </span>
                            ) : (
                              "N/A"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-beige text-center py-4">No recent orders</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-[#111] border-[#333]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Top Products</CardTitle>
              <Button asChild variant="outline" size="sm" className="border-[#333]">
                <Link href="/admin/products">
                  <Eye size={16} className="mr-2" />
                  View All
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topProducts && stats.topProducts.length > 0 ? (
                  stats.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-[#222] rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center text-black font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-white">{product.name}</p>
                          <p className="text-sm text-beige">{product.sales || 0} sales</p>
                        </div>
                      </div>
                      <p className="font-medium text-[#D4AF37]">
                        ${((product.price || 0) * (product.sales || 0)).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-beige text-center py-4">No products found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="bg-[#111] border-[#333]">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="border-[#333] h-20 flex-col">
                <Link href="/admin/products/new">
                  <Package size={24} className="mb-2" />
                  Add Product
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-[#333] h-20 flex-col">
                <Link href="/admin/orders">
                  <ShoppingCart size={24} className="mb-2" />
                  View Orders
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-[#333] h-20 flex-col">
                <Link href="/admin/users">
                  <Users size={24} className="mb-2" />
                  Manage Users
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-[#333] h-20 flex-col">
                <Link href="/admin/analytics">
                  <TrendingUp size={24} className="mb-2" />
                  Analytics
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default AdminDashboard
