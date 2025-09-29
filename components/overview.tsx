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
  ReferenceDot,
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
  stockData?: {
    buyPrice?: number
    buyDate?: string
    sellPrice?: number
    sellDate?: string
  }
}

export function Overview({ selectedStock, stockData: stockTransactionData }: OverviewProps) {
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

  // Helper function to check if a date falls within the chart data range
  const isDateInRange = (dateStr: string) => {
    if (!dateStr || stockData.length === 0) return false
    const targetDate = new Date(dateStr)
    const firstDataDate = new Date(stockData[0]?.date)
    const lastDataDate = new Date(stockData[stockData.length - 1]?.date)
    return targetDate >= firstDataDate && targetDate <= lastDataDate
  }

  // Find the closest data point to a transaction date
  const findClosestDataPoint = (dateStr: string) => {
    if (!dateStr || stockData.length === 0) return null
    const targetDate = new Date(dateStr)
    let closest = stockData[0]
    let minDiff = Math.abs(new Date(closest.date).getTime() - targetDate.getTime())

    for (const point of stockData) {
      const diff = Math.abs(new Date(point.date).getTime() - targetDate.getTime())
      if (diff < minDiff) {
        minDiff = diff
        closest = point
      }
    }
    return closest
  }

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

        {/* Transaction points legend */}
        {(stockTransactionData?.buyDate || stockTransactionData?.sellDate) && (
          <div className="flex gap-4 text-xs text-muted-foreground">
            {stockTransactionData?.buyDate && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
                <span>Buy: ${stockTransactionData.buyPrice?.toFixed(2)} ({stockTransactionData.buyDate})</span>
              </div>
            )}
            {stockTransactionData?.sellDate && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white"></div>
                <span>Sell: ${stockTransactionData.sellPrice?.toFixed(2)} ({stockTransactionData.sellDate})</span>
              </div>
            )}
          </div>
        )}

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

              {/* Buy point */}
              {stockTransactionData?.buyDate && stockTransactionData?.buyPrice && isDateInRange(stockTransactionData.buyDate) && (
                <ReferenceDot
                  x={findClosestDataPoint(stockTransactionData.buyDate)?.name}
                  y={stockTransactionData.buyPrice}
                  r={6}
                  fill="#22c55e"
                  stroke="#fff"
                  strokeWidth={2}
                />
              )}

              {/* Sell point */}
              {stockTransactionData?.sellDate && stockTransactionData?.sellPrice && isDateInRange(stockTransactionData.sellDate) && (
                <ReferenceDot
                  x={findClosestDataPoint(stockTransactionData.sellDate)?.name}
                  y={stockTransactionData.sellPrice}
                  r={6}
                  fill="#ef4444"
                  stroke="#fff"
                  strokeWidth={2}
                />
              )}
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
