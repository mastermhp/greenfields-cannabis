"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Filter, Download } from "lucide-react"

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState("30days")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gold-text">Analytics</h1>
          <p className="text-beige mt-2">Track your store's performance and growth</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center bg-[#111] border border-[#333] rounded-lg overflow-hidden">
            <button
              onClick={() => setTimeRange("7days")}
              className={`px-3 py-2 text-sm ${timeRange === "7days" ? "bg-[#D4AF37] text-black" : "text-beige"}`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange("30days")}
              className={`px-3 py-2 text-sm ${timeRange === "30days" ? "bg-[#D4AF37] text-black" : "text-beige"}`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange("90days")}
              className={`px-3 py-2 text-sm ${timeRange === "90days" ? "bg-[#D4AF37] text-black" : "text-beige"}`}
            >
              90 Days
            </button>
            <button
              onClick={() => setTimeRange("year")}
              className={`px-3 py-2 text-sm ${timeRange === "year" ? "bg-[#D4AF37] text-black" : "text-beige"}`}
            >
              Year
            </button>
          </div>
          <Button variant="outline" className="border-[#333] text-beige">
            <Calendar size={16} className="mr-2" />
            Custom Range
          </Button>
          <Button variant="outline" className="border-[#333] text-beige">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
          <Button variant="outline" className="border-[#333] text-beige">
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Sales Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="bg-[#111] border-[#333]">
          <CardHeader>
            <CardTitle className="text-white">Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="h-[300px] relative">
                {/* This would be a chart in a real implementation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-[#222] rounded-lg p-4">
                    <div className="h-full flex items-end justify-between px-4">
                      {Array.from({ length: 12 }).map((_, i) => {
                        const height = Math.random() * 80 + 20
                        return (
                          <div key={i} className="flex flex-col items-center">
                            <div className="w-6 bg-[#D4AF37] rounded-t-sm" style={{ height: `${height}%` }}></div>
                            <span className="text-xs text-beige mt-2">
                              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i]}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Conversion Rate", value: "3.2%", change: "+0.8%", positive: true },
          { title: "Average Order Value", value: "$78.50", change: "+$4.20", positive: true },
          { title: "Cart Abandonment", value: "24.8%", change: "-2.1%", positive: true },
          { title: "Return Rate", value: "5.7%", change: "+0.3%", positive: false },
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-[#111] border-[#333]">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-beige text-sm">{metric.title}</p>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                    <div className={`text-sm ${metric.positive ? "text-green-400" : "text-red-400"}`}>
                      {metric.change}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Traffic Sources & Product Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-[#111] border-[#333]">
            <CardHeader>
              <CardTitle className="text-white">Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[200px] flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { source: "Direct", percentage: 35, value: 4256 },
                    { source: "Organic Search", percentage: 28, value: 3412 },
                    { source: "Social Media", percentage: 22, value: 2678 },
                    { source: "Referral", percentage: 10, value: 1215 },
                    { source: "Email", percentage: 5, value: 609 },
                  ].map((source) => (
                    <div key={source.source} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-beige">{source.source}</span>
                        <span className="text-white">{source.percentage}%</span>
                      </div>
                      <div className="h-2 bg-[#222] rounded-full overflow-hidden">
                        <div className="h-full bg-[#D4AF37]" style={{ width: `${source.percentage}%` }}></div>
                      </div>
                      <div className="text-xs text-beige">{source.value.toLocaleString()} visits</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-[#111] border-[#333]">
            <CardHeader>
              <CardTitle className="text-white">Product Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[200px] flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { category: "Indica", percentage: 40, revenue: 36450 },
                    { category: "Sativa", percentage: 30, revenue: 27340 },
                    { category: "Hybrid", percentage: 20, revenue: 18220 },
                    { category: "CBD", percentage: 10, revenue: 9110 },
                  ].map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-beige">{category.category}</span>
                        <span className="text-white">${category.revenue.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-[#222] rounded-full overflow-hidden">
                        <div className="h-full bg-[#D4AF37]" style={{ width: `${category.percentage}%` }}></div>
                      </div>
                      <div className="text-xs text-beige">{category.percentage}% of total revenue</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Customer Demographics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="bg-[#111] border-[#333]">
          <CardHeader>
            <CardTitle className="text-white">Customer Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Age Distribution */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Age Distribution</h3>
                  <div className="space-y-3">
                    {[
                      { age: "21-25", percentage: 15 },
                      { age: "26-35", percentage: 40 },
                      { age: "36-45", percentage: 25 },
                      { age: "46-55", percentage: 12 },
                      { age: "56+", percentage: 8 },
                    ].map((age) => (
                      <div key={age.age} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-beige">{age.age}</span>
                          <span className="text-white">{age.percentage}%</span>
                        </div>
                        <div className="h-2 bg-[#222] rounded-full overflow-hidden">
                          <div className="h-full bg-[#D4AF37]" style={{ width: `${age.percentage}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gender Distribution */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Gender Distribution</h3>
                  <div className="h-[150px] relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full border-8 border-[#D4AF37] relative">
                        <div
                          className="absolute top-0 left-0 w-32 h-32 rounded-full border-8 border-[#555]"
                          style={{
                            clipPath: "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)",
                          }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-sm">58% / 42%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center space-x-6">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-[#D4AF37] rounded-full mr-2"></div>
                      <span className="text-beige text-sm">Male (58%)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-[#555] rounded-full mr-2"></div>
                      <span className="text-beige text-sm">Female (42%)</span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Top Locations</h3>
                  <div className="space-y-3">
                    {[
                      { location: "California", percentage: 32 },
                      { location: "Colorado", percentage: 18 },
                      { location: "Washington", percentage: 14 },
                      { location: "Oregon", percentage: 12 },
                      { location: "Nevada", percentage: 8 },
                      { location: "Other", percentage: 16 },
                    ].map((location) => (
                      <div key={location.location} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-beige">{location.location}</span>
                          <span className="text-white">{location.percentage}%</span>
                        </div>
                        <div className="h-2 bg-[#222] rounded-full overflow-hidden">
                          <div className="h-full bg-[#D4AF37]" style={{ width: `${location.percentage}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default AnalyticsPage
