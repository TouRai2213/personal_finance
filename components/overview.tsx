"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from "recharts"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

const defaultData = [
  {
    name: "Jan",
    "Total Balance": 12580,
    "Total Return": 4395,
    "Daily Return": 2860,
  },
  {
    name: "Feb",
    "Total Balance": 13200,
    "Total Return": 4650,
    "Daily Return": 3100,
  },
  {
    name: "Mar",
    "Total Balance": 12900,
    "Total Return": 4200,
    "Daily Return": 2750,
  },
  {
    name: "Apr",
    "Total Balance": 14100,
    "Total Return": 5200,
    "Daily Return": 3400,
  },
  {
    name: "May",
    "Total Balance": 13800,
    "Total Return": 4800,
    "Daily Return": 3200,
  },
  {
    name: "Jun",
    "Total Balance": 15200,
    "Total Return": 5800,
    "Daily Return": 3900,
  },
]


const timePeriods = [
  { label: "1D", value: "1D" },
  { label: "1W", value: "1W" },
  { label: "1M", value: "30D" },
  { label: "3M", value: "90D" },
  { label: "6M", value: "6M" },
  { label: "YTD", value: "YTD" },
  { label: "1Y", value: "1Y" },
  { label: "2Y", value: "2Y" },
]

interface OverviewProps {
  selectedStock?: string | null
}

export function Overview({ selectedStock }: OverviewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("6M")
  const [stockData, setStockData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPrice, setCurrentPrice] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch historical data from server
  const fetchStockHistory = async (symbol: string, period: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/stock/${symbol}/history?period=${period}`)
      if (response.ok) {
        const data = await response.json()
        setStockData(data.history || [])
        setCurrentPrice(data.currentPrice || 0)
      }
    } catch (error) {
      console.error('Error fetching stock history:', error)
      setStockData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedStock && selectedStock.length > 0) {
      // selectedStock is now the symbol directly
      fetchStockHistory(selectedStock, selectedPeriod)
    }
  }, [selectedStock, selectedPeriod])

  if (selectedStock && selectedStock.length > 0) {
    const data = stockData
    const firstPrice = data[0]?.price || 0
    const lastPrice = data[data.length - 1]?.price || currentPrice
    const isPositive = lastPrice >= firstPrice
    const lineColor = isPositive ? "#22c55e" : "#ef4444"
    const changePercent = firstPrice > 0 ? (((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2) : "0.00"

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold">${lastPrice.toFixed(2)}</div>
            <div className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {isPositive ? "+" : ""}
              {changePercent}% ({selectedPeriod})
            </div>
          </div>
        </div>

        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {timePeriods.map((period) => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? "default" : "ghost"}
              size="sm"
              className={`text-xs px-3 py-1 ${
                selectedPeriod === period.value ? "bg-white shadow-sm text-gray-900" : "hover:bg-gray-200 text-gray-600"
              }`}
              onClick={() => setSelectedPeriod(period.value)}
            >
              {period.label}
            </Button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={300}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-sm text-gray-600">Loading chart data...</div>
            </div>
          ) : data.length > 0 ? (
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e0e0e0"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
                interval={data.length > 50 ? Math.floor(data.length / 8) : data.length > 20 ? 4 : 0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
                domain={["dataMin - 5", "dataMax + 5"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "12px",
                }}
                formatter={(value: any) => [`$${value.toFixed(2)}`, "Price"]}
              />
              <Line
                dataKey="price"
                stroke={lineColor}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: lineColor }}
              />
            </LineChart>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-sm text-gray-600">No data available</div>
            </div>
          )}
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
        <BarChart data={defaultData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Total Balance" fill="#3b82f6" />
        <Bar dataKey="Total Return" fill="#22c55e" />
        <Bar dataKey="Daily Return" fill="#f59e0b" />
      </BarChart>
    </ResponsiveContainer>
  )
}
